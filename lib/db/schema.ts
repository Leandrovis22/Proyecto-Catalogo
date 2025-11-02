import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Tabla de usuarios
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'customer'] }).notNull().default('customer'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Tabla de productos (se borra y recrea con cada importación CSV)
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull(), // Identificador de URL de TiendaNube
  name: text('name').notNull(),
  category: text('category').notNull(), // "Acero > Acero Blanco > Cadenas"
  price: real('price').notNull(),
  stock: integer('stock').notNull().default(0),
  variantName: text('variant_name'), // Ej: "Material", "Diseño"
  variantValue: text('variant_value'), // Ej: "Acero blanco", "En punta"
  imageUrl: text('image_url'), // /api/images/{slug}.jpg
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Tabla de carritos
export const carts = sqliteTable('carts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['en_proceso', 'pedido_completado'] })
    .notNull()
    .default('en_proceso'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Tabla de items del carrito
export const cartItems = sqliteTable('cart_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cartId: integer('cart_id')
    .notNull()
    .references(() => carts.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id, {
    onDelete: 'set null',
  }), // Puede ser null si producto fue eliminado
  productSnapshot: text('product_snapshot', { mode: 'json' }).$type<{
    slug: string;
    name: string;
    price: number;
    variantName?: string;
    variantValue?: string;
    imageUrl?: string;
  }>().notNull(), // Snapshot del producto al momento de agregarlo
  quantity: integer('quantity').notNull().default(1),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Tabla de órdenes
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  cartSnapshot: text('cart_snapshot', { mode: 'json' }).$type<{
    items: Array<{
      slug: string;
      name: string;
      price: number;
      quantity: number;
      variantName?: string;
      variantValue?: string;
      imageUrl?: string;
    }>;
  }>().notNull(), // Snapshot completo del carrito al crear la orden
  total: real('total').notNull(),
  status: text('status', { enum: ['activa', 'finalizada', 'cancelada'] })
    .notNull()
    .default('activa'),
  finalizedByAdmin: integer('finalized_by_admin', { mode: 'boolean' })
    .notNull()
    .default(false),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Tabla de logs de sincronización de imágenes
export const syncLogs = sqliteTable('sync_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', { enum: ['success', 'error', 'warning'] }).notNull(),
  message: text('message').notNull(),
  details: text('details', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Tipos TypeScript inferidos
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type SyncLog = typeof syncLogs.$inferSelect;
export type NewSyncLog = typeof syncLogs.$inferInsert;
