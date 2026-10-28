import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

// -----------------------------------------------------------------------------
// Серверный API синхронизации автопарка между устройствами
// -----------------------------------------------------------------------------
// Поддерживает:
// 1. Vercel KV / Upstash Redis (в продакшене через KV_REST_API_URL & KV_REST_API_TOKEN)
// 2. Локальное хранилище в dev-режиме (.dev-sync-storage.json) для тестирования
// -----------------------------------------------------------------------------

interface SyncPayload {
  email: string;
  vehicles: any[];
  serviceLogs: any[];
  updatedAt: number;
}

const DEV_STORAGE_FILE = path.resolve('.dev-sync-storage.json');

// Чтение данных из локального dev-файла
function readDevStorage(): Record<string, SyncPayload> {
  try {
    if (fs.existsSync(DEV_STORAGE_FILE)) {
      const raw = fs.readFileSync(DEV_STORAGE_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read dev storage file', e);
  }
  return {};
}

// Запись данных в локальный dev-файл
function writeDevStorage(data: Record<string, SyncPayload>) {
  try {
    fs.writeFileSync(DEV_STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write dev storage file', e);
  }
}

// Вспомогательная функция для обращения к Upstash / Vercel KV REST API
async function executeKvCommand(command: any[]): Promise<any> {
  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!kvUrl || !kvToken) {
    return null;
  }

  const res = await fetch(kvUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${kvToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('KV REST error:', res.status, errText);
    throw new Error(`KV REST command failed: ${res.status}`);
  }

  const json = await res.json();
  return json?.result;
}

// GET: Получить актуальное состояние гаража пользователя по email
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Некорректный email' }, { status: 400 });
    }

    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const isConfigured = Boolean(kvUrl);

    // 1. Попытка чтения из Vercel KV / Upstash Redis
    if (isConfigured) {
      try {
        const key = `user:fleet:${email}`;
        const rawResult = await executeKvCommand(['GET', key]);

        if (rawResult) {
          const parsed = typeof rawResult === 'string' ? JSON.parse(rawResult) : rawResult;
          return NextResponse.json({
            configured: true,
            storageType: 'vercel_kv',
            found: true,
            data: parsed,
          });
        }

        return NextResponse.json({
          configured: true,
          storageType: 'vercel_kv',
          found: false,
          data: null,
        });
      } catch (err: any) {
        console.error('Failed to fetch from Vercel KV:', err);
        return NextResponse.json(
          { configured: true, error: 'Ошибка чтения из облачного хранилища' },
          { status: 500 }
        );
      }
    }

    // 2. Если в dev-режиме (на локальном компьютере)
    if (process.env.NODE_ENV !== 'production') {
      const devStorage = readDevStorage();
      const userFleet = devStorage[email];

      return NextResponse.json({
        configured: true,
        storageType: 'local_dev_file',
        found: Boolean(userFleet),
        data: userFleet || null,
      });
    }

    // 3. В продакшене без подключенного KV
    return NextResponse.json({
      configured: false,
      storageType: 'none',
      found: false,
      message: 'Облачное хранилище Vercel KV еще не подключено в панели Vercel.',
      data: null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

// POST: Сохранить актуальное состояние гаража (Push изменений)
export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Некорректный формат JSON' }, { status: 400 });
    }

    const { email, vehicles, serviceLogs, updatedAt } = body || {};
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return NextResponse.json({ error: 'Некорректный email' }, { status: 400 });
    }

    if (!Array.isArray(vehicles) || !Array.isArray(serviceLogs)) {
      return NextResponse.json({ error: 'Некорректная структура данных автопарка' }, { status: 400 });
    }

    const payload: SyncPayload = {
      email: cleanEmail,
      vehicles,
      serviceLogs,
      updatedAt: typeof updatedAt === 'number' ? updatedAt : Date.now(),
    };

    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const isConfigured = Boolean(kvUrl);

    // 1. Сохранение в Vercel KV / Upstash Redis
    if (isConfigured) {
      try {
        const key = `user:fleet:${cleanEmail}`;

        // Конфликт-резолюшн: проверяем, нет ли в облаке более новой версии
        const existingRaw = await executeKvCommand(['GET', key]);
        if (existingRaw) {
          const existing = typeof existingRaw === 'string' ? JSON.parse(existingRaw) : existingRaw;
          if (existing?.updatedAt && existing.updatedAt > payload.updatedAt) {
            // В облаке более свежие данные (с другого устройства)
            return NextResponse.json({
              configured: true,
              conflict: true,
              message: 'В облаке есть более свежие изменения с другого устройства',
              cloudData: existing,
            });
          }
        }

        // Сохраняем свежие данные
        await executeKvCommand(['SET', key, JSON.stringify(payload)]);

        return NextResponse.json({
          configured: true,
          success: true,
          storageType: 'vercel_kv',
          savedAt: payload.updatedAt,
        });
      } catch (err: any) {
        console.error('Failed to save to Vercel KV:', err);
        return NextResponse.json(
          { configured: true, error: 'Ошибка записи в облачное хранилище' },
          { status: 500 }
        );
      }
    }

    // 2. Если в dev-режиме
    if (process.env.NODE_ENV !== 'production') {
      const devStorage = readDevStorage();
      const existing = devStorage[cleanEmail];

      if (existing?.updatedAt && existing.updatedAt > payload.updatedAt) {
        return NextResponse.json({
          configured: true,
          conflict: true,
          cloudData: existing,
        });
      }

      devStorage[cleanEmail] = payload;
      writeDevStorage(devStorage);

      return NextResponse.json({
        configured: true,
        success: true,
        storageType: 'local_dev_file',
        savedAt: payload.updatedAt,
      });
    }

    // 3. Продакшн без KV
    return NextResponse.json({
      configured: false,
      success: false,
      storageType: 'none',
      message: 'Облачное хранилище Vercel KV не настроено. Данные сохранены только локально в браузере.',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
