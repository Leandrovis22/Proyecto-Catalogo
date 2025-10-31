import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  password: text('password').notNull(),
  role: text('role', { enum: ['customer', 'admin'] }).notNull().default('customer'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  categories: text('categories'), // JSON string
  price: real('price').notNull(),
  promotional_price: real('promotional_price'),
  stock: integer('stock').notNull().default(0),
  sku: text('sku'),
  brand: text('brand'),
  image_url: text('image_url'),
  show_in_store: integer('show_in_store', { mode: 'boolean' }).notNull().default(true),
  free_shipping: integer('free_shipping', { mode: 'boolean' }).notNull().default(false),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const productVariants = sqliteTable('product_variants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  product_id: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  property1_name: text('property1_name'),
  property1_value: text('property1_value'),
  property2_name: text('property2_name'),
  property2_value: text('property2_value'),
  property3_name: text('property3_name'),
  property3_value: text('property3_value'),
  price: real('price').notNull(),
  stock: integer('stock').notNull().default(0),
  sku: text('sku'),
});

export const carts = sqliteTable('carts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['active', 'completed', 'cancelled'] }).notNull().default('active'),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const cartItems = sqliteTable('cart_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cart_id: integer('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
  product_id: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  variant_id: integer('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull().default(1),
  price: real('price').notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cart_id: integer('cart_id').notNull().references(() => carts.id),
  user_id: integer('user_id').notNull().references(() => users.id),
  status: text('status', { enum: ['pending', 'processing', 'completed', 'cancelled'] }).notNull().default('pending'),
  total: real('total').notNull(),
  email_sent: integer('email_sent', { mode: 'boolean' }).notNull().default(false),
  completed_at: integer('completed_at', { mode: 'timestamp' }),
  updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const productImages = sqliteTable('product_images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  product_id: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  google_drive_id: text('google_drive_id'),
  url: text('url').notNull(),
  is_primary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
  cached_at: integer('cached_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
