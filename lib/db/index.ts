/// <reference types="@cloudflare/workers-types" />

import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// Para desarrollo local con Wrangler
export function getDb(d1Database: D1Database) {
  return drizzle(d1Database, { schema });
}

// Tipos
export type Database = ReturnType<typeof getDb>;
