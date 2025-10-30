// Ejemplo de migración base para Drizzle Kit
import { sql } from 'drizzle-orm';

export const createUsersTable = sql`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client',
  password TEXT NOT NULL
);
`;

export const createProductsTable = sql`
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  promo_price REAL,
  stock INTEGER,
  image_url TEXT,
  category TEXT,
  tags TEXT,
  seo_title TEXT,
  seo_description TEXT,
  brand TEXT,
  physical BOOLEAN,
  mpn TEXT,
  gender TEXT,
  age_range TEXT,
  cost REAL
);
`;

// ...agregar migraciones para carritos, órdenes, variantes, etc.
