import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { put } from '@vercel/blob';

// -----------------------------------------------------------------------------
// API сбора обратной связи (баг-репорты и предложения)
// -----------------------------------------------------------------------------
// 1. Сохраняет обращение в Vercel Blob (история всех сообщений)
// 2. Отправляет мгновенное уведомление в Telegram (если настроен бот)
// -----------------------------------------------------------------------------

export interface FeedbackData {
  type: 'bug' | 'feature' | 'other';
  message: string;
  email?: string;
  deviceInfo?: {
    platform?: string;
    userAgent?: string;
    screenSize?: string;
    language?: string;
    url?: string;
  };
  createdAt?: number;
}

const DEV_FEEDBACK_FILE = path.resolve('.dev-feedback-storage.json');

function writeDevFeedback(entry: any) {
  try {
    let items: any[] = [];
    if (fs.existsSync(DEV_FEEDBACK_FILE)) {
      items = JSON.parse(fs.readFileSync(DEV_FEEDBACK_FILE, 'utf8') || '[]');
    }
    items.unshift(entry);
    fs.writeFileSync(DEV_FEEDBACK_FILE, JSON.stringify(items, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write dev feedback', e);
  }
}

function getBlobToken(): string | undefined {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }
  for (const [key, val] of Object.entries(process.env)) {
    if (key.includes('BLOB') && typeof val === 'string' && val.startsWith('vercel_blob_rw_')) {
      return val;
    }
  }
  for (const [key, val] of Object.entries(process.env)) {
    if (key.includes('BLOB') && key.includes('TOKEN') && typeof val === 'string' && val.length > 10) {
      return val;
    }
  }
  return undefined;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function sendTelegramNotification(feedback: FeedbackData): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return false;
  }

  try {
    const typeTitles: Record<string, string> = {
      bug: '🐛 <b>Баг-репорт: ServiceKeeper</b>',
      feature: '💡 <b>Идея / Предложение: ServiceKeeper</b>',
      other: '💬 <b>Отзыв: ServiceKeeper</b>',
    };

    const header = typeTitles[feedback.type] || '📩 <b>Новое обращение: ServiceKeeper</b>';
    const emailStr = feedback.email?.trim() ? `<code>${escapeHtml(feedback.email.trim())}</code>` : '<i>Не указан</i>';
    const cleanMessage = escapeHtml(feedback.message.trim());

    let deviceStr = 'Не определено';
    if (feedback.deviceInfo) {
      const parts = [];
      if (feedback.deviceInfo.platform) parts.push(feedback.deviceInfo.platform);
      if (feedback.deviceInfo.screenSize) parts.push(feedback.deviceInfo.screenSize);
      if (feedback.deviceInfo.language) parts.push(feedback.deviceInfo.language);
      if (parts.length > 0) {
        deviceStr = escapeHtml(parts.join(' • '));
      }
    }

    const dateStr = new Date(feedback.createdAt || Date.now()).toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const text = [
      header,
      '',
      `👤 <b>От:</b> ${emailStr}`,
      `📱 <b>Устройство:</b> ${deviceStr}`,
      `⏰ <b>Время (МСК):</b> ${dateStr}`,
      '',
      '📝 <b>Текст сообщения:</b>',
      cleanMessage,
    ].join('\n');

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('Telegram API response error:', res.status, errText);
      return false;
    }

    return true;
  } catch (err) {
    console.warn('Failed to send Telegram notification:', err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Некорректный формат JSON' }, { status: 400 });
    }

    const { type, message, email, deviceInfo } = body || {};

    if (!message || typeof message !== 'string' || message.trim().length < 3) {
      return NextResponse.json({ error: 'Пожалуйста, напишите сообщение (минимум 3 символа)' }, { status: 400 });
    }

    const validTypes = ['bug', 'feature', 'other'];
    const feedbackType = validTypes.includes(type) ? type : 'other';

    const feedbackPayload: FeedbackData = {
      type: feedbackType as any,
      message: message.trim(),
      email: typeof email === 'string' ? email.trim() : undefined,
      deviceInfo: typeof deviceInfo === 'object' && deviceInfo !== null ? deviceInfo : undefined,
      createdAt: Date.now(),
    };

    let savedToBlob = false;
    let blobPath: string | undefined;

    // 1. Сохранение в Vercel Blob (история всех обращений)
    const blobToken = getBlobToken();
    if (blobToken) {
      try {
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        blobPath = `feedback/${feedbackPayload.createdAt}_${feedbackType}_${randomSuffix}.json`;

        try {
          await put(blobPath, JSON.stringify(feedbackPayload, null, 2), {
            access: 'private',
            addRandomSuffix: false,
            allowOverwrite: true,
            contentType: 'application/json',
            token: blobToken,
          });
          savedToBlob = true;
        } catch (err: any) {
          const msg = err?.message || '';
          if (msg.includes('public') || msg.includes('Cannot use private access on a public store')) {
            await put(blobPath, JSON.stringify(feedbackPayload, null, 2), {
              access: 'public',
              addRandomSuffix: false,
              allowOverwrite: true,
              contentType: 'application/json',
              token: blobToken,
            });
            savedToBlob = true;
          } else {
            throw err;
          }
        }
      } catch (blobErr) {
        console.error('Failed to save feedback to Vercel Blob:', blobErr);
      }
    }

    // Сохранение в dev-файл в локальной разработке
    if (!savedToBlob && process.env.NODE_ENV !== 'production') {
      writeDevFeedback(feedbackPayload);
      savedToBlob = true;
    }

    // 2. Отправка уведомления в Telegram
    const telegramSent = await sendTelegramNotification(feedbackPayload);

    return NextResponse.json({
      success: true,
      savedToBlob,
      blobPath,
      telegramSent,
      telegramConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_TOKEN),
    });
  } catch (e: any) {
    console.error('Feedback submission error:', e);
    return NextResponse.json({ error: e.message || 'Ошибка сервера при отправке' }, { status: 500 });
  }
}
