import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

let globalDb: ReturnType<typeof drizzle> | null = null;

declare global {
  var DB: ReturnType<typeof drizzle> | null;
}

export function getDb(d1?: any): ReturnType<typeof drizzle> {
  if (!globalDb) {
    const d1Instance = d1 || {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
      databaseId: process.env.CLOUDFLARE_D1_ID,
      token: process.env.CLOUDFLARE_D1_TOKEN,
    };

    if (!d1Instance.accountId || !d1Instance.databaseId || !d1Instance.token) {
      throw new Error('Faltan variables de entorno para configurar la base de datos.');
    }

    globalDb = drizzle(d1Instance, { schema });
    globalThis.DB = globalDb; // Set in global context
  }
  return globalDb;
}