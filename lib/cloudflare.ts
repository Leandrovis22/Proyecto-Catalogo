/// <reference types="@cloudflare/workers-types" />

import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import Database from 'better-sqlite3';
import * as schema from './db/schema';
import path from 'path';

// Tipos para los bindings de Cloudflare
export interface CloudflareEnv {
  DB: D1Database;
  PRODUCT_IMAGES: R2Bucket;
}

let sqliteDb: ReturnType<typeof drizzleSQLite> | null = null;

// Helper para obtener DB (SQLite en dev, D1 en prod)
export function getDb() {
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Usar SQLite local en desarrollo
    if (!sqliteDb) {
      const dbPath = path.join(process.cwd(), '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject', 'db.sqlite');
      const sqlite = new Database(dbPath);
      sqliteDb = drizzleSQLite(sqlite, { schema });
    }
    return sqliteDb;
  } else {
    // Usar D1 en producción
    const env = getCloudflareContext();
    if (!env?.DB) {
      throw new Error('D1 Database not available in production');
    }
    return drizzleD1(env.DB, { schema });
  }
}

// Helper para obtener el runtime de Cloudflare (solo en producción)
function getCloudflareContext() {
  // @ts-ignore - Cloudflare runtime injection
  return process.env as unknown as CloudflareEnv;
}

// Helper para obtener D1 directo (solo cuando se necesite el D1Database nativo)
export function getD1() {
  const env = getCloudflareContext();
  if (!env?.DB) {
    throw new Error('D1 Database not available. This function should only be called in production.');
  }
  return env.DB;
}

// Helper para obtener R2 (usa producción incluso en desarrollo)
export function getR2() {
  const env = getCloudflareContext();
  if (!env?.PRODUCT_IMAGES) {
    throw new Error('R2 Bucket not available. Make sure CLOUDFLARE_* env vars are set.');
  }
  return env.PRODUCT_IMAGES;
}
