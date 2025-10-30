// Inicializa la base de datos D1 en desarrollo local y la asigna a globalThis.DB
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// Obtén las credenciales desde el .env
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId = process.env.CLOUDFLARE_D1_ID;
const token = process.env.CLOUDFLARE_D1_TOKEN;

if (accountId && databaseId && token) {
  // Simulación: crea un objeto D1Database compatible (esto depende de tu entorno local)
  // Aquí solo se muestra cómo sería con drizzle()
  // En local, deberías tener una instancia compatible con D1
  // Por ejemplo, podrías usar sqlite3 y adaptar la conexión
  // Si tienes una instancia D1 local, reemplaza el siguiente objeto por la conexión real
  const d1 = {};
  globalThis.DB = drizzle(d1, { schema });
  console.log('Base de datos D1 inicializada en globalThis.DB (drizzle)');
} else {
  console.warn('No se encontraron las variables de entorno para D1 en local');
}
