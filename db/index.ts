// Estructura base para Drizzle ORM y migraciones
import { drizzle } from 'drizzle-orm/cloudflare-d1';

export const db = drizzle(process.env.DB_URL!);
