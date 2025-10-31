import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

let cachedDb: any = null;

export function getDb(d1Instance?: any) {
  // Producción: Cloudflare D1
  if (d1Instance) {
    return drizzleD1(d1Instance, { schema });
  }
  
  // Desarrollo: SQLite local
  if (process.env.NODE_ENV === 'development') {
    if (!cachedDb) {
      // Solo importar better-sqlite3 en desarrollo
      // @ts-ignore
      const Database = require('better-sqlite3');
      const sqlite = new Database('dev.db');
      cachedDb = drizzleSqlite(sqlite, { schema });
    }
    return cachedDb;
  }
  
  throw new Error('DB no disponible');
}

export type Database = ReturnType<typeof getDb>;
