import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { put, list, get } from '@vercel/blob';

// -----------------------------------------------------------------------------
// Серверный API синхронизации автопарка между устройствами
// -----------------------------------------------------------------------------
// Поддерживает:
// 1. Vercel Blob (Private & Public Blob Stores, BLOB_READ_WRITE_TOKEN)
// 2. Vercel KV / Upstash Redis (KV_REST_API_URL & KV_REST_API_TOKEN)
// 3. Локальный dev-файл (.dev-sync-storage.json)
// -----------------------------------------------------------------------------

interface SyncPayload {
  email: string;
  vehicles: any[];
  serviceLogs: any[];
  updatedAt: number;
}

const DEV_STORAGE_FILE = path.resolve('.dev-sync-storage.json');

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

function writeDevStorage(data: Record<string, SyncPayload>) {
  try {
    fs.writeFileSync(DEV_STORAGE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write dev storage file', e);
  }
}

// Автоматический поиск токена Vercel Blob
function getBlobToken(): string | undefined {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return process.env.BLOB_READ_WRITE_TOKEN;
  }
  // Поиск префиксных токенов (например SERVICEKEEPER_BLOB_READ_WRITE_TOKEN)
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

// Чтение из Vercel Blob с поддержкой Private и Public хранилищ
async function readBlobPayload(blobPath: string, token: string): Promise<SyncPayload | null> {
  // 1. Основной путь: get() с private доступом (современные Blob хранилища приватны по умолчанию)
  try {
    const res = await get(blobPath, {
      access: 'private',
      token,
      useCache: false,
    });
    if (res && res.stream) {
      const text = await new Response(res.stream).text();
      return JSON.parse(text);
    }
    if (res === null) {
      return null;
    }
  } catch (err: any) {
    const msg = err?.message || '';
    if (!msg.includes('404')) {
      console.warn('Private blob get attempt:', msg);
    }
  }

  // 2. Фоллбек: get() с public доступом (если хранилище создано как public)
  try {
    const res = await get(blobPath, {
      access: 'public',
      token,
      useCache: false,
    });
    if (res && res.stream) {
      const text = await new Response(res.stream).text();
      return JSON.parse(text);
    }
    if (res === null) {
      return null;
    }
  } catch {
    // игнорируем ошибку public фоллбека
  }

  // 3. Дополнительный фоллбек через list() с авторизацией Bearer
  try {
    const { blobs } = await list({ prefix: blobPath, limit: 1, token });
    if (blobs && blobs.length > 0) {
      const downloadUrl = blobs[0].downloadUrl || blobs[0].url;
      const res = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch (err: any) {
    console.warn('Blob list fallback failed:', err?.message);
  }

  return null;
}

// Запись в Vercel Blob с поддержкой Private и Public хранилищ
async function writeBlobPayload(blobPath: string, payload: SyncPayload, token: string) {
  const content = JSON.stringify(payload);

  // 1. Попытка сохранения с private доступом (современный Vercel Blob)
  try {
    return await put(blobPath, content, {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      token,
    });
  } catch (err: any) {
    const msg = err?.message || '';
    // Если хранилище настроено как public, переключаемся на public
    if (msg.includes('public') || msg.includes('Cannot use private access on a public store')) {
      return await put(blobPath, content, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json',
        token,
      });
    }
    throw err;
  }
}

// Автоматический поиск KV / Redis REST
function getKvConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return { url, token };

  for (const [key, val] of Object.entries(process.env)) {
    if ((key.includes('KV') || key.includes('REDIS')) && key.endsWith('REST_API_URL') && typeof val === 'string') {
      const tokenKey = key.replace('REST_API_URL', 'REST_API_TOKEN');
      const foundToken = process.env[tokenKey];
      if (foundToken) return { url: val, token: foundToken };
    }
  }
  return null;
}

async function executeKvCommand(command: any[]): Promise<any> {
  const kv = getKvConfig();
  if (!kv) return null;

  const res = await fetch(kv.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${kv.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`KV REST failed with status: ${res.status}`);
  }

  const json = await res.json();
  return json?.result;
}

// GET: Получить актуальное состояние гаража по email
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Некорректный email' }, { status: 400 });
    }

    const blobToken = getBlobToken();
    const kv = getKvConfig();

    // 1. Попытка через Vercel Blob (приоритет)
    if (blobToken) {
      try {
        const blobPath = `fleets/${encodeURIComponent(email)}.json`;
        const blobData = await readBlobPayload(blobPath, blobToken);

        if (blobData) {
          return NextResponse.json({
            configured: true,
            storageType: 'vercel_blob',
            found: true,
            data: blobData,
          });
        }

        return NextResponse.json({
          configured: true,
          storageType: 'vercel_blob',
          found: false,
          data: null,
        });
      } catch (err: any) {
        console.error('Failed to read from Vercel Blob:', err);
        return NextResponse.json({
          configured: true,
          storageType: 'vercel_blob',
          error: err?.message || String(err),
        }, { status: 500 });
      }
    }

    // 2. Попытка через Vercel KV / Upstash Redis
    if (kv) {
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
        console.error('Failed to read from KV:', err);
      }
    }

    // 3. Локальный dev-режим
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

    // 4. Продакшн без хранилища
    const matchingEnvKeys = Object.keys(process.env).filter(
      (k) =>
        k.includes('BLOB') ||
        k.includes('KV') ||
        k.includes('REDIS') ||
        k.includes('UPSTASH') ||
        k.includes('STORAGE') ||
        k.includes('TOKEN') ||
        k.includes('SERVICEKEEPER')
    );

    return NextResponse.json({
      configured: false,
      storageType: 'none',
      found: false,
      matchingEnvKeys,
      message: 'Облачное хранилище (Blob или KV) еще не подключено в панели Vercel.',
      data: null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Ошибка сервера' }, { status: 500 });
  }
}

// POST: Сохранить актуальное состояние гаража
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

    const blobToken = getBlobToken();
    const kv = getKvConfig();

    // 1. Сохранение в Vercel Blob
    if (blobToken) {
      try {
        const blobPath = `fleets/${encodeURIComponent(cleanEmail)}.json`;
        await writeBlobPayload(blobPath, payload, blobToken);

        return NextResponse.json({
          configured: true,
          success: true,
          storageType: 'vercel_blob',
          savedAt: payload.updatedAt,
        });
      } catch (err: any) {
        console.error('Failed to write to Vercel Blob:', err);
        return NextResponse.json({
          configured: true,
          success: false,
          storageType: 'vercel_blob',
          error: err?.message || String(err),
        }, { status: 500 });
      }
    }

    // 2. Сохранение в Vercel KV / Upstash Redis
    if (kv) {
      try {
        const key = `user:fleet:${cleanEmail}`;
        const existingRaw = await executeKvCommand(['GET', key]);

        if (existingRaw) {
          const existing = typeof existingRaw === 'string' ? JSON.parse(existingRaw) : existingRaw;
          if (existing?.updatedAt && existing.updatedAt > payload.updatedAt) {
            return NextResponse.json({
              configured: true,
              conflict: true,
              cloudData: existing,
            });
          }
        }

        await executeKvCommand(['SET', key, JSON.stringify(payload)]);

        return NextResponse.json({
          configured: true,
          success: true,
          storageType: 'vercel_kv',
          savedAt: payload.updatedAt,
        });
      } catch (err: any) {
        console.error('Failed to write to KV:', err);
      }
    }

    // 3. Локальный dev-режим
    if (process.env.NODE_ENV !== 'production') {
      const devStorage = readDevStorage();
      devStorage[cleanEmail] = payload;
      writeDevStorage(devStorage);

      return NextResponse.json({
        configured: true,
        success: true,
        storageType: 'local_dev_file',
        savedAt: payload.updatedAt,
      });
    }

    // 4. Продакшн без хранилища
    return NextResponse.json({
      configured: false,
      success: false,
      storageType: 'none',
      message: 'Облачное хранилище не подключено в панели Vercel.',
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Ошибка сервера' }, { status: 500 });
  }
}
