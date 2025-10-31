import { getDb } from '@/lib/db';
import * as schema from '@/lib/db/schema';

// Solo Edge Runtime en producción
export const runtime = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';

export async function GET() {
  let db;
  if (process.env.NODE_ENV === 'production') {
    // Producción: Cloudflare D1
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const { env } = getRequestContext();
    db = getDb(env.DB);
  } else {
    // Desarrollo: SQLite local (Node.js runtime)
    db = getDb();
  }
  const users = await db.select().from(schema.users);
  return Response.json({ 
    users,
    env: process.env.NODE_ENV,
    runtime: process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs'
  });
}