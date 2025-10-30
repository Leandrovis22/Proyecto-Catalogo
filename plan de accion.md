# PROMPT PARA GENERAR PROYECTO COMPLETO

Genera una aplicación web de catálogo de productos con carrito de compras usando Next.js 15 App Router, desplegada en Cloudflare Pages con OpenNext.

---

## 1. INICIALIZACIÓN DEL PROYECTO

```bash
# Crear proyecto Next.js 15
npx create-next-app@latest proyecto-catalogo --typescript --tailwind --app --no-src-dir --import-alias "@/*"

cd proyecto-catalogo

# Instalar dependencias principales
npm install drizzle-orm papaparse next-auth@beta bcryptjs jose googleapis

# Cloudflare y OpenNext (dev dependencies)
npm install --save-dev @opennextjs/cloudflare@latest wrangler@latest drizzle-kit

# TypeScript types (dev dependencies)
npm install --save-dev @types/papaparse @types/bcryptjs @types/node @types/react @types/react-dom @cloudflare/workers-types
```

---

## 2. ESTRUCTURA DE CARPETAS

```
proyecto-catalogo/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (customer)/
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [orderId]/
│   │   │       └── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── upload/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts
│   │   │   ├── register/
│   │   │   │   └── route.ts
│   │   │   └── session/
│   │   │       └── route.ts
│   │   ├── products/
│   │   │   ├── route.ts
│   │   │   ├── [slug]/
│   │   │   │   └── route.ts
│   │   │   └── upload/
│   │   │       └── route.ts
│   │   ├── cart/
│   │   │   ├── route.ts
│   │   │   └── complete/
│   │   │       └── route.ts
│   │   ├── orders/
│   │   │   ├── route.ts
│   │   │   └── [orderId]/
│   │   │       └── route.ts
│   │   ├── whatsapp/
│   │   │   ├── send/
│   │   │   │   └── route.ts
│   │   │   └── webhook/
│   │   │       └── route.ts
│   │   └── google-drive/
│   │       ├── connect/
│   │       │   └── route.ts
│   │       └── images/
│   │           └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Loading.tsx
│   ├── products/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── ProductFilters.tsx
│   │   └── VariantSelector.tsx
│   ├── cart/
│   │   ├── CartItem.tsx
│   │   ├── CartSummary.tsx
│   │   └── CartButton.tsx
│   ├── admin/
│   │   ├── OrderCard.tsx
│   │   ├── OrderDetail.tsx
│   │   ├── CSVUploader.tsx
│   │   └── StatusSelect.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ProtectedRoute.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts (Drizzle client)
│   │   ├── schema.ts (Drizzle schemas)
│   │   └── migrations/ (Drizzle migrations)
│   ├── auth/
│   │   ├── config.ts (NextAuth config)
│   │   └── middleware.ts
│   ├── services/
│   │   ├── csv-parser.ts
│   │   ├── google-drive.ts
│   │   ├── whatsapp.ts
│   │   └── products.ts
│   ├── utils/
│   │   ├── format.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   └── types/
│       ├── product.ts
│       ├── cart.ts
│       ├── order.ts
│       └── user.ts
├── drizzle.config.ts
├── next.config.mjs
├── wrangler.toml
├── .env.local
├── .env.example
└── package.json
```

---

## 3. ARCHIVOS DE CONFIGURACIÓN

### `package.json`
```json
{
  "name": "proyecto-catalogo",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "pages:build": "npx @opennextjs/cloudflare",
    "pages:deploy": "wrangler pages deploy .open-next/worker",
    "pages:dev": "wrangler pages dev .open-next/worker --compatibility-date=2024-01-01 --compatibility-flag=nodejs_compat",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "next": "^15.5.2",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "drizzle-orm": "^0.44.7",
    "next-auth": "^5.0.0-beta.25",
    "bcryptjs": "^2.4.3",
    "jose": "^5.9.6",
    "papaparse": "^5.5.3",
    "googleapis": "^164.1.0"
  },
  "devDependencies": {
    "@opennextjs/cloudflare": "^1.2.2",
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/papaparse": "^5.3.16",
    "@types/bcryptjs": "^2.4.6",
    "@cloudflare/workers-types": "^4.20251014.0",
    "typescript": "^5",
    "tailwindcss": "^4.1.16",
    "postcss": "^8",
    "autoprefixer": "^10",
    "drizzle-kit": "^0.31.6",
    "wrangler": "^3.94.0"
  }
}
```

### `next.config.mjs`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

export default nextConfig;
```

### `wrangler.toml`
```toml
name = "proyecto-catalogo"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "catalogo-db"
database_id = "your-database-id" # Se genera con: wrangler d1 create catalogo-db

[env.production]
[[env.production.d1_databases]]
binding = "DB"
database_name = "catalogo-db"
database_id = "your-production-database-id"
```

### `drizzle.config.ts`
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_D1_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
});
```

### `.env.example`
```env
# Database (Cloudflare D1)
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_D1_ID=your_d1_database_id
CLOUDFLARE_D1_TOKEN=your_d1_token

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_key_here

# WhatsApp Business API (Meta)
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
ADMIN_WHATSAPP_NUMBER=+1234567890

# Google Drive API
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google-drive/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 4. SCHEMA DE BASE DE DATOS (Drizzle ORM)

### `lib/db/schema.ts`
```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// USUARIOS
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  password: text('password').notNull(),
  role: text('role', { enum: ['customer', 'admin'] }).notNull().default('customer'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// PRODUCTOS
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  categories: text('categories'), // JSON array de categorías
  price: real('price').notNull(),
  promotionalPrice: real('promotional_price'),
  weight: real('weight'),
  height: real('height'),
  width: real('width'),
  depth: real('depth'),
  stock: integer('stock').notNull().default(0),
  sku: text('sku'),
  barcode: text('barcode'),
  brand: text('brand'),
  tags: text('tags'), // JSON array
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  showInStore: integer('show_in_store', { mode: 'boolean' }).notNull().default(true),
  freeShipping: integer('free_shipping', { mode: 'boolean' }).notNull().default(false),
  isPhysical: integer('is_physical', { mode: 'boolean' }).notNull().default(true),
  mpn: text('mpn'),
  gender: text('gender'),
  ageRange: text('age_range'),
  cost: real('cost'),
  imageUrl: text('image_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// VARIANTES DE PRODUCTOS
export const productVariants = sqliteTable('product_variants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  property1Name: text('property1_name'),
  property1Value: text('property1_value'),
  property2Name: text('property2_name'),
  property2Value: text('property2_value'),
  property3Name: text('property3_name'),
  property3Value: text('property3_value'),
  price: real('price'),
  stock: integer('stock').notNull().default(0),
  sku: text('sku'),
});

// CARRITOS
export const carts = sqliteTable('carts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['active', 'completed', 'cancelled'] }).notNull().default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ITEMS DEL CARRITO
export const cartItems = sqliteTable('cart_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cartId: integer('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  variantId: integer('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  quantity: integer('quantity').notNull().default(1),
  price: real('price').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ÓRDENES (carritos completados)
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cartId: integer('cart_id').notNull().references(() => carts.id),
  userId: integer('user_id').notNull().references(() => users.id),
  status: text('status', { enum: ['pending', 'processing', 'completed', 'cancelled'] }).notNull().default('pending'),
  total: real('total').notNull(),
  whatsappSent: integer('whatsapp_sent', { mode: 'boolean' }).notNull().default(false),
  completedAt: integer('completed_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// IMÁGENES DE PRODUCTOS (caché de Google Drive)
export const productImages = sqliteTable('product_images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  googleDriveId: text('google_drive_id').notNull(),
  url: text('url').notNull(),
  isPrimary: integer('is_primary', { mode: 'boolean' }).notNull().default(false),
  cachedAt: integer('cached_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Relaciones
export const usersRelations = relations(users, ({ many }) => ({
  carts: many(carts),
  orders: many(orders),
}));

export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
  cartItems: many(cartItems),
  images: many(productImages),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, { fields: [carts.userId], references: [users.id] }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
  variant: one(productVariants, { fields: [cartItems.variantId], references: [productVariants.id] }),
}));
```

---

## 5. CLIENTE DE BASE DE DATOS

### `lib/db/index.ts`
```typescript
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export type Database = ReturnType<typeof getDb>;
```

---

## 6. SERVICIOS PRINCIPALES

### `lib/services/csv-parser.ts`
```typescript
import Papa from 'papaparse';

export interface TiendaNubeCSVRow {
  'Identificador de URL': string;
  'Nombre': string;
  'Categorías': string;
  'Nombre de propiedad 1': string;
  'Valor de propiedad 1': string;
  'Nombre de propiedad 2': string;
  'Valor de propiedad 2': string;
  'Nombre de propiedad 3': string;
  'Valor de propiedad 3': string;
  'Precio': string;
  'Precio promocional': string;
  'Peso (kg)': string;
  'Alto (cm)': string;
  'Ancho (cm)': string;
  'Profundidad (cm)': string;
  'Stock': string;
  'SKU': string;
  'Código de barras': string;
  'Mostrar en tienda': string;
  'Envío sin cargo': string;
  'Descripción': string;
  'Tags': string;
  'Título para SEO': string;
  'Descripción para SEO': string;
  'Marca': string;
  'Producto Físico': string;
  'MPN (Número de pieza del fabricante)': string;
  'Sexo': string;
  'Rango de edad': string;
  'Costo': string;
}

export function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  // Formato: 5.900,00 -> 5900.00
  return parseFloat(priceStr.replace(/\./g, '').replace(',', '.'));
}

export async function parseTiendaNubeCSV(file: File): Promise<TiendaNubeCSVRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<TiendaNubeCSVRow>(file, {
      header: true,
      delimiter: ';',
      encoding: 'ISO-8859-1', // ANSI encoding
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing errors: ${JSON.stringify(results.errors)}`));
        } else {
          resolve(results.data);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

export interface ParsedProduct {
  slug: string;
  name: string;
  description: string;
  categories: string[];
  price: number;
  promotionalPrice?: number;
  weight?: number;
  height?: number;
  width?: number;
  depth?: number;
  stock: number;
  sku: string;
  barcode: string;
  brand: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  showInStore: boolean;
  freeShipping: boolean;
  isPhysical: boolean;
  mpn: string;
  gender: string;
  ageRange: string;
  cost?: number;
  variants: Array<{
    property1Name?: string;
    property1Value?: string;
    property2Name?: string;
    property2Value?: string;
    property3Name?: string;
    property3Value?: string;
    price?: number;
    stock: number;
    sku: string;
  }>;
}

export function groupProductsWithVariants(rows: TiendaNubeCSVRow[]): ParsedProduct[] {
  const productsMap = new Map<string, ParsedProduct>();

  rows.forEach((row) => {
    const slug = row['Identificador de URL'];

    if (!productsMap.has(slug)) {
      // Primera fila del producto (datos completos)
      productsMap.set(slug, {
        slug,
        name: row['Nombre'],
        description: row['Descripción'],
        categories: row['Categorías'] ? row['Categorías'].split(',').map(c => c.trim()) : [],
        price: parsePrice(row['Precio']),
        promotionalPrice: row['Precio promocional'] ? parsePrice(row['Precio promocional']) : undefined,
        weight: row['Peso (kg)'] ? parseFloat(row['Peso (kg)']) : undefined,
        height: row['Alto (cm)'] ? parseFloat(row['Alto (cm)']) : undefined,
        width: row['Ancho (cm)'] ? parseFloat(row['Ancho (cm)']) : undefined,
        depth: row['Profundidad (cm)'] ? parseFloat(row['Profundidad (cm)']) : undefined,
        stock: parseInt(row['Stock']) || 0,
        sku: row['SKU'],
        barcode: row['Código de barras'],
        brand: row['Marca'],
        tags: row['Tags'] ? row['Tags'].split(',').map(t => t.trim()) : [],
        seoTitle: row['Título para SEO'],
        seoDescription: row['Descripción para SEO'],
        showInStore: row['Mostrar en tienda'] === 'SI',
        freeShipping: row['Envío sin cargo'] === 'SI',
        isPhysical: row['Producto Físico'] === 'SI',
        mpn: row['MPN (Número de pieza del fabricante)'],
        gender: row['Sexo'],
        ageRange: row['Rango de edad'],
        cost: row['Costo'] ? parsePrice(row['Costo']) : undefined,
        variants: [],
      });
    }

    // Agregar variante (si tiene propiedades)
    const product = productsMap.get(slug)!;
    if (row['Nombre de propiedad 1'] || row['Nombre de propiedad 2'] || row['Nombre de propiedad 3']) {
      product.variants.push({
        property1Name: row['Nombre de propiedad 1'] || undefined,
        property1Value: row['Valor de propiedad 1'] || undefined,
        property2Name: row['Nombre de propiedad 2'] || undefined,
        property2Value: row['Valor de propiedad 2'] || undefined,
        property3Name: row['Nombre de propiedad 3'] || undefined,
        property3Value: row['Valor de propiedad 3'] || undefined,
        price: row['Precio'] ? parsePrice(row['Precio']) : undefined,
        stock: parseInt(row['Stock']) || 0,
        sku: row['SKU'],
      });
    }
  });

  return Array.from(productsMap.values());
}
```

### `lib/services/google-drive.ts`
```typescript
import { google } from 'googleapis';

export class GoogleDriveService {
  private drive;

  constructor() {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    auth.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });

    this.drive = google.drive({ version: 'v3', auth });
  }

  async listImagesInFolder(folderId: string) {
    try {
      const response = await this.drive.files.list({
        q: `'${folderId}' in parents and mimeType contains 'image/'`,
        fields: 'files(id, name, mimeType, webViewLink, webContentLink)',
        pageSize: 1000,
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error listing files from Google Drive:', error);
      throw error;
    }
  }

  async getPublicImageUrl(fileId: string): Promise<string> {
    try {
      // Hacer el archivo público
      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Retornar URL directa
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    } catch (error) {
      console.error('Error getting public URL:', error);
      throw error;
    }
  }

  async syncProductImages(folderId: string): Promise<Map<string, string>> {
    const files = await this.listImagesInFolder(folderId);
    const imageMap = new Map<string, string>();

    for (const file of files) {
      if (!file.id || !file.name) continue;

      // Extraer slug del nombre del archivo (ej: "producto-123.jpg" -> "producto-123")
      const slug = file.name.replace(/\.[^/.]+$/, '');
      const url = await this.getPublicImageUrl(file.id);
      imageMap.set(slug, url);
    }

    return imageMap;
  }
}
```

### `lib/services/whatsapp.ts`
```typescript
export interface WhatsAppOrderNotification {
  customerName: string;
  customerPhone: string;
  orderId: number;
  orderUrl: string;
  totalItems: number;
  total: number;
}

export class WhatsAppService {
  private phoneNumberId: string;
  private accessToken: string;
  private adminPhone: string;

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID!;
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN!;
    this.adminPhone = process.env.ADMIN_WHATSAPP_NUMBER!;
  }

  async sendOrderNotification(data: WhatsAppOrderNotification): Promise<boolean> {
    const message = `
🛒 *NUEVA ORDEN COMPLETADA* 

👤 Cliente: ${data.customerName}
📱 Teléfono: ${data.customerPhone}

📦 Total de productos: ${data.totalItems}
💰 Total: $${data.total.toFixed(2)}

🔗 Ver orden completa:
${data.orderUrl}
    `.trim();

    try {
      const response = await fetch(
        `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: this.adminPhone.replace(/\+/g, ''),
            type: 'text',
            text: {
              preview_url: true,
              body: message,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('WhatsApp API error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  async verifyWebhook(mode: string, token: string, challenge: string): Promise<string | null> {
    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }

    return null;
  }
}
```

---

## 7. NEXTAUTH CONFIGURACIÓN

### `lib/auth/config.ts`
```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export function getAuthOptions(db: any): NextAuthOptions {
  return {
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email y contraseña requeridos');
          }

          const user = await db.select().from(users).where(eq(users.email, credentials.email)).get();

          if (!user) {
            throw new Error('Usuario no encontrado');
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isValidPassword) {
            throw new Error('Contraseña incorrecta');
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.role = (user as any).role;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          (session.user as any).id = token.id;
          (session.user as any).role = token.role;
        }
        return session;
      },
    },
    pages: {
      signIn: '/login',
      error: '/login',
    },
    session: {
      strategy: 'jwt',
      maxAge: 30 * 24 * 60 * 60, // 30 días
    },
    secret: process.env.NEXTAUTH_SECRET,
  };
}
```

---

## 8. API ROUTES PRINCIPALES

### `app/api/auth/[...nextauth]/route.ts`
```typescript
import NextAuth from 'next-auth';
import { getAuthOptions } from '@/lib/auth/config';

// Este es un hack para obtener D1 en Edge Runtime
// @ts-ignore
const db = globalThis.DB ? getDb(globalThis.DB) : null;

const handler = NextAuth(getAuthOptions(db));

export { handler as GET, handler as POST };
```

### `app/api/auth/register/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // @ts-ignore - Cloudflare D1 binding
    const db = getDb(request.env.DB);

    // Verificar si el usuario ya existe
    const existingUser = await db.select().from(users).where(eq(users.email, email)).get();

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = await db.insert(users).values({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'customer',
      createdAt: new Date(),
    }).returning().get();

    return NextResponse.json(
      { 
        message: 'Usuario registrado exitosamente',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
```

### `app/api/products/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { products, productVariants } from '@/lib/db/schema';
import { eq, like, and } from 'drizzle-orm';

export const runtime = 'edge';

// GET: Obtener productos con filtros
export async function GET(request: NextRequest) {
  try {
    // @ts-ignore
    const db = getDb(request.env.DB);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');

    let query = db.select().from(products).where(eq(products.showInStore, true));

    // Aplicar filtros
    const conditions = [];
    
    if (search) {
      conditions.push(like(products.name, `%${search}%`));
    }

    if (category) {
      conditions.push(like(products.categories, `%${category}%`));
    }

    // TODO: Agregar filtros de precio (requiere conversión)

    const productsList = await query.all();

    // Obtener variantes para cada producto
    const productsWithVariants = await Promise.all(
      productsList.map(async (product) => {
        const variants = await db
          .select()
          .from(productVariants)
          .where(eq(productVariants.productId, product.id))
          .all();

        return {
          ...product,
          variants,
        };
      })
    );

    return NextResponse.json({ products: productsWithVariants });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}
```

### `app/api/products/upload/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { products, productVariants } from '@/lib/db/schema';
import { parseTiendaNubeCSV, groupProductsWithVariants } from '@/lib/services/csv-parser';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth/config';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // @ts-ignore
    const db = getDb(request.env.DB);

    // Verificar autenticación y rol de admin
    const session = await getServerSession(getAuthOptions(db));
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Archivo no proporcionado' }, { status: 400 });
    }

    // Parsear CSV
    const csvData = await parseTiendaNubeCSV(file);
    const parsedProducts = groupProductsWithVariants(csvData);

    let insertedCount = 0;
    let variantsCount = 0;

    // Insertar productos y variantes
    for (const product of parsedProducts) {
      // Insertar producto base
      const insertedProduct = await db.insert(products).values({
        slug: product.slug,
        name: product.name,
        description: product.description,
        categories: JSON.stringify(product.categories),
        price: product.price,
        promotionalPrice: product.promotionalPrice,
        weight: product.weight,
        height: product.height,
        width: product.width,
        depth: product.depth,
        stock: product.stock,
        sku: product.sku,
        barcode: product.barcode,
        brand: product.brand,
        tags: JSON.stringify(product.tags),
        seoTitle: product.seoTitle,
        seoDescription: product.seoDescription,
        showInStore: product.showInStore,
        freeShipping: product.freeShipping,
        isPhysical: product.isPhysical,
        mpn: product.mpn,
        gender: product.gender,
        ageRange: product.ageRange,
        cost: product.cost,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning().get();

      insertedCount++;

      // Insertar variantes si existen
      if (product.variants.length > 0) {
        for (const variant of product.variants) {
          await db.insert(productVariants).values({
            productId: insertedProduct.id,
            property1Name: variant.property1Name,
            property1Value: variant.property1Value,
            property2Name: variant.property2Name,
            property2Value: variant.property2Value,
            property3Name: variant.property3Name,
            property3Value: variant.property3Value,
            price: variant.price,
            stock: variant.stock,
            sku: variant.sku,
          });
          variantsCount++;
        }
      }
    }

    return NextResponse.json({
      message: 'Productos importados exitosamente',
      productsCount: insertedCount,
      variantsCount,
    });
  } catch (error) {
    console.error('Error importando productos:', error);
    return NextResponse.json(
      { error: 'Error al importar productos', details: String(error) },
      { status: 500 }
    );
  }
}
```

### `app/api/cart/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { carts, cartItems, products, productVariants } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth/config';

export const runtime = 'edge';

// GET: Obtener carrito del usuario
export async function GET(request: NextRequest) {
  try {
    // @ts-ignore
    const db = getDb(request.env.DB);
    const session = await getServerSession(getAuthOptions(db));

    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);

    // Buscar o crear carrito activo
    let cart = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, 'active')))
      .get();

    if (!cart) {
      cart = await db.insert(carts).values({
        userId,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning().get();
    }

    // Obtener items del carrito con detalles de productos
    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cart.id))
      .all();

    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const product = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .get();

        let variant = null;
        if (item.variantId) {
          variant = await db
            .select()
            .from(productVariants)
            .where(eq(productVariants.id, item.variantId))
            .get();
        }

        return {
          ...item,
          product,
          variant,
        };
      })
    );

    return NextResponse.json({ cart, items: itemsWithDetails });
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    return NextResponse.json({ error: 'Error al obtener carrito' }, { status: 500 });
  }
}

// POST: Agregar item al carrito
export async function POST(request: NextRequest) {
  try {
    // @ts-ignore
    const db = getDb(request.env.DB);
    const session = await getServerSession(getAuthOptions(db));

    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { productId, variantId, quantity } = await request.json();
    const userId = parseInt((session.user as any).id);

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // Obtener o crear carrito activo
    let cart = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, 'active')))
      .get();

    if (!cart) {
      cart = await db.insert(carts).values({
        userId,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning().get();
    }

    // Obtener precio del producto o variante
    const product = await db.select().from(products).where(eq(products.id, productId)).get();
    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    let price = product.promotionalPrice || product.price;

    if (variantId) {
      const variant = await db.select().from(productVariants).where(eq(productVariants.id, variantId)).get();
      if (variant && variant.price) {
        price = variant.price;
      }
    }

    // Verificar si el item ya existe en el carrito
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, productId),
          variantId ? eq(cartItems.variantId, variantId) : eq(cartItems.variantId, null)
        )
      )
      .get();

    if (existingItem) {
      // Actualizar cantidad
      await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + quantity })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      // Agregar nuevo item
      await db.insert(cartItems).values({
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity,
        price,
        createdAt: new Date(),
      });
    }

    // Actualizar timestamp del carrito
    await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cart.id));

    return NextResponse.json({ message: 'Producto agregado al carrito' });
  } catch (error) {
    console.error('Error agregando al carrito:', error);
    return NextResponse.json({ error: 'Error al agregar al carrito' }, { status: 500 });
  }
}

// DELETE: Eliminar item del carrito
export async function DELETE(request: NextRequest) {
  try {
    // @ts-ignore
    const db = getDb(request.env.DB);
    const session = await getServerSession(getAuthOptions(db));

    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'ID de item requerido' }, { status: 400 });
    }

    await db.delete(cartItems).where(eq(cartItems.id, parseInt(itemId)));

    return NextResponse.json({ message: 'Item eliminado del carrito' });
  } catch (error) {
    console.error('Error eliminando item:', error);
    return NextResponse.json({ error: 'Error al eliminar item' }, { status: 500 });
  }
}
```

### `app/api/cart/complete/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { carts, cartItems, orders, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth/config';
import { WhatsAppService } from '@/lib/services/whatsapp';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // @ts-ignore
    const db = getDb(request.env.DB);
    const session = await getServerSession(getAuthOptions(db));

    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);

    // Obtener carrito activo
    const cart = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, 'active')))
      .get();

    if (!cart) {
      return NextResponse.json({ error: 'Carrito no encontrado' }, { status: 404 });
    }

    // Obtener items del carrito
    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cart.id))
      .all();

    if (items.length === 0) {
      return NextResponse.json({ error: 'Carrito vacío' }, { status: 400 });
    }

    // Calcular total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Crear orden
    const order = await db.insert(orders).values({
      cartId: cart.id,
      userId,
      status: 'pending',
      total,
      whatsappSent: false,
      completedAt: new Date(),
      updatedAt: new Date(),
    }).returning().get();

    // Marcar carrito como completado
    await db.update(carts).set({ status: 'completed', updatedAt: new Date() }).where(eq(carts.id, cart.id));

    // Obtener datos del usuario
    const user = await db.select().from(users).where(eq(users.id, userId)).get();

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Enviar notificación por WhatsApp
    try {
      const whatsappService = new WhatsAppService();
      const orderUrl = `${process.env.NEXTAUTH_URL}/admin/orders/${order.id}`;

      const sent = await whatsappService.sendOrderNotification({
        customerName: user.name,
        customerPhone: user.phone,
        orderId: order.id,
        orderUrl,
        totalItems: items.length,
        total,
      });

      if (sent) {
        await db.update(orders).set({ whatsappSent: true }).where(eq(orders.id, order.id));
      }
    } catch (whatsappError) {
      console.error('Error enviando WhatsApp:', whatsappError);
      // No fallar la orden si falla WhatsApp
    }

    return NextResponse.json({
      message: 'Orden completada exitosamente',
      orderId: order.id,
    });
  } catch (error) {
    console.error('Error completando orden:', error);
    return NextResponse.json({ error: 'Error al completar orden' }, { status: 500 });
  }
}
```

### `app/api/orders/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { orders, carts, users, cartItems, products, productVariants } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth/config';

export const runtime = 'edge';

// GET: Obtener todas las órdenes (Admin)
export async function GET(request: NextRequest) {
  try {
    // @ts-ignore
    const db = getDb(request.env.DB);
    const session = await getServerSession(getAuthOptions(db));

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.completedAt))
      .all();

    // Obtener detalles de cada orden
    const ordersWithDetails = await Promise.all(
      allOrders.map(async (order) => {
        const user = await db.select().from(users).where(eq(users.id, order.userId)).get();
        const cart = await db.select().from(carts).where(eq(carts.id, order.cartId)).get();
        
        const items = await db
          .select()
          .from(cartItems)
          .where(eq(cartItems.cartId, order.cartId))
          .all();

        const itemsWithProducts = await Promise.all(
          items.map(async (item) => {
            const product = await db.select().from(products).where(eq(products.id, item.productId)).get();
            let variant = null;
            if (item.variantId) {
              variant = await db.select().from(productVariants).where(eq(productVariants.id, item.variantId)).get();
            }
            return { ...item, product, variant };
          })
        );

        return {
          ...order,
          user,
          items: itemsWithProducts,
        };
      })
    );

    return NextResponse.json({ orders: ordersWithDetails });
  } catch (error) {
    console.error('Error obteniendo órdenes:', error);
    return NextResponse.json({ error: 'Error al obtener órdenes' }, { status: 500 });
  }
}
```

### `app/api/orders/[orderId]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { orders, carts, users, cartItems, products, productVariants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth/config';

export const runtime = 'edge';

// GET: Obtener detalles de una orden específica
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // @ts-ignore
    const db = getDb(request.env.DB);
    const session = await getServerSession(getAuthOptions(db));

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const orderId = parseInt(params.orderId);
    const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    // Obtener detalles completos
    const user = await db.select().from(users).where(eq(users.id, order.userId)).get();
    const cart = await db.select().from(carts).where(eq(carts.id, order.cartId)).get();
    
    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, order.cartId))
      .all();

    const itemsWithProducts = await Promise.all(
      items.map(async (item) => {
        const product = await db.select().from(products).where(eq(products.id, item.productId)).get();
        let variant = null;
        if (item.variantId) {
          variant = await db.select().from(productVariants).where(eq(productVariants.id, item.variantId)).get();
        }
        return { ...item, product, variant };
      })
    );

    return NextResponse.json({
      order: {
        ...order,
        user,
        items: itemsWithProducts,
      },
    });
  } catch (error) {
    console.error('Error obteniendo orden:', error);
    return NextResponse.json({ error: 'Error al obtener orden' }, { status: 500 });
  }
}

// PATCH: Actualizar estado de la orden
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    // @ts-ignore
    const db = getDb(request.env.DB);
    const session = await getServerSession(getAuthOptions(db));

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { status } = await request.json();
    const orderId = parseInt(params.orderId);

    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
    }

    await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId));

    return NextResponse.json({ message: 'Estado actualizado' });
  } catch (error) {
    console.error('Error actualizando orden:', error);
    return NextResponse.json({ error: 'Error al actualizar orden' }, { status: 500 });
  }
}
```

### `app/api/whatsapp/webhook/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/services/whatsapp';

export const runtime = 'edge';

// GET: Verificación del webhook
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (!mode || !token || !challenge) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
  }

  const whatsappService = new WhatsAppService();
  const verifiedChallenge = await whatsappService.verifyWebhook(mode, token, challenge);

  if (verifiedChallenge) {
    return new NextResponse(verifiedChallenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verificación fallida' }, { status: 403 });
}

// POST: Recibir notificaciones de WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log para debugging (opcional)
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Aquí puedes procesar mensajes entrantes si lo necesitas en el futuro
    
    return NextResponse.json({ message: 'Webhook procesado' }, { status: 200 });
  } catch (error) {
    console.error('Error en webhook:', error);
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}
```

### `app/api/google-drive/images/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { productImages, products } from '@/lib/db/schema';
import { GoogleDriveService } from '@/lib/services/google-drive';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { getAuthOptions } from '@/lib/auth/config';

export const runtime = 'edge';

// POST: Sincronizar imágenes desde Google Drive
export async function POST(request: NextRequest) {
  try {
    // @ts-ignore
    const db = getDb(request.env.DB);
    const session = await getServerSession(getAuthOptions(db));

    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
      return NextResponse.json({ error: 'Folder ID no configurado' }, { status: 500 });
    }

    const driveService = new GoogleDriveService();
    const imageMap = await driveService.syncProductImages(folderId);

    let syncedCount = 0;

    // Actualizar productos con las URLs de las imágenes
    for (const [slug, url] of imageMap.entries()) {
      const product = await db.select().from(products).where(eq(products.slug, slug)).get();

      if (product) {
        // Actualizar URL principal del producto
        await db.update(products).set({ imageUrl: url }).where(eq(products.id, product.id));

        // Guardar en caché de imágenes
        await db.insert(productImages).values({
          productId: product.id,
          googleDriveId: slug,
          url,
          isPrimary: true,
          cachedAt: new Date(),
        });

        syncedCount++;
      }
    }

    return NextResponse.json({
      message: 'Imágenes sincronizadas exitosamente',
      syncedCount,
      totalImages: imageMap.size,
    });
  } catch (error) {
    console.error('Error sincronizando imágenes:', error);
    return NextResponse.json({ error: 'Error al sincronizar imágenes' }, { status: 500 });
  }
}
```

---

## 9. COMPONENTES PRINCIPALES

### `components/products/ProductCard.tsx`
```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: {
    id: number;
    slug: string;
    name: string;
    price: number;
    promotionalPrice?: number;
    imageUrl?: string;
    stock: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const displayPrice = product.promotionalPrice || product.price;
  const hasDiscount = !!product.promotionalPrice;

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-64 bg-gray-200">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Sin imagen
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
              ¡Oferta!
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <span className="text-gray-500 line-through text-sm">
                ${product.price.toFixed(2)}
              </span>
            )}
            <span className="text-xl font-bold text-blue-600">
              ${displayPrice.toFixed(2)}
            </span>
          </div>
          {product.stock === 0 && (
            <span className="text-red-500 text-sm mt-2 block">Sin stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
```

### `components/products/ProductGrid.tsx`
```tsx
'use client';

import ProductCard from './ProductCard';

interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  promotionalPrice?: number;
  imageUrl?: string;
  stock: number;
}

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No se encontraron productos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### `components/cart/CartButton.tsx`
```tsx
'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartButton() {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    fetchCartCount();
  }, []);

  const fetchCartCount = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setItemCount(data.items?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  return (
    <Link href="/cart" className="relative">
      <button className="p-2 hover:bg-gray-100 rounded-full transition">
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>
    </Link>
  );
}
```

### `components/auth/LoginForm.tsx`
```tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales inválidas');
      } else {
        router.push('/products');
        router.refresh();
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
}
```

### `components/auth/RegisterForm.tsx`
```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al registrarse');
      } else {
        router.push('/login?registered=true');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <div>
        <label className="block text-sm font-medium mb-2">Nombre completo</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Teléfono</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
          placeholder="+54 9 11 1234-5678"
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Contraseña</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          minLength={6}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Confirmar contraseña</label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          required
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  );
}
```

---

## 10. PÁGINAS PRINCIPALES

### `app/page.tsx`
```tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Bienvenido a nuestra tienda</h1>
          <p className="text-xl mb-8">Encuentra los mejores productos al mejor precio</p>
          <Link
            href="/products"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Ver Catálogo
          </Link>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegirnos?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="text-xl font-semibold mb-2">Envío Rápido</h3>
              <p className="text-gray-600">Entrega en 24-48 horas</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-2">Pago Seguro</h3>
              <p className="text-gray-600">Múltiples métodos de pago</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-semibold mb-2">Calidad Garantizada</h3>
              <p className="text-gray-600">Productos verificados</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
```

### `app/(auth)/login/page.tsx`
```tsx
import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Iniciar Sesión</h1>
        <LoginForm />
        <p className="text-center mt-4 text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-blue-600 hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### `app/(auth)/register/page.tsx`
```tsx
import RegisterForm from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-6">Crear Cuenta</h1>
        <RegisterForm />
        <p className="text-center mt-4 text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
```

### `app/(customer)/products/page.tsx`
```tsx
import ProductGrid from '@/components/products/ProductGrid';

async function getProducts() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/products`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    throw new Error('Error fetching products');
  }
  
  return res.json();
}

export default async function ProductsPage() {
  const { products } = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Catálogo de Productos</h1>
      
      {/* TODO: Agregar filtros y búsqueda */}
      
      <ProductGrid products={products} />
    </div>
  );
}
```

### `app/(customer)/cart/page.tsx`
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    imageUrl?: string;
  };
  variant?: {
    property1Value?: string;
    property2Value?: string;
    property3Value?: string;
  };
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    // TODO: Implementar actualización de cantidad
  };

  const removeItem = async (itemId: number) => {
    try {
      const res = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setItems(items.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const completeOrder = async () => {
    setCompleting(true);
    try {
      const res = await fetch('/api/cart/complete', {
        method: 'POST',
      });
      
      if (res.ok) {
        const data = await res.json();
        alert('¡Orden completada! Te contactaremos pronto.');
        router.push('/products');
      } else {
        alert('Error al completar la orden');
      }
    } catch (error) {
      console.error('Error completing order:', error);
      alert('Error al completar la orden');
    } finally {
      setCompleting(false);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Cargando...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Tu carrito está vacío</h1>
        <button
          onClick={() => router.push('/products')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Ver Productos
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mi Carrito</h1>
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg p-4 flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0">
                {/* TODO: Agregar imagen */}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.product.name}</h3>
                {item.variant && (
                  <p className="text-sm text-gray-600">
                    {item.variant.property1Value} - {item.variant.property2Value}
                  </p>
                )}
                <p className="text-lg font-bold mt-2">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Eliminar
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Cantidad: {item.quantity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border rounded-lg p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Resumen</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={completeOrder}
            disabled={completing}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {completing ? 'Procesando...' : 'Completar Orden'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### `app/admin/orders/page.tsx`
```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Order {
  id: number;
  status: string;
  total: number;
  completedAt: string;
  user: {
    name: string;
    phone: string;
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Cargando órdenes...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Órdenes</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="block border rounded-lg p-4 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">Orden #{order.id}</h3>
                <p className="text-sm text-gray-600">{order.user.name}</p>
                <p className="text-sm text-gray-600">{order.user.phone}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                <span className={`text-sm px-2 py-1 rounded ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

## 11. COMANDOS PARA DEPLOYMENT

### Inicializar Base de Datos D1
```bash
# Crear base de datos en Cloudflare
wrangler d1 create catalogo-db

# Copiar el database_id al wrangler.toml

# Generar migraciones con Drizzle
npm run db:generate

# Aplicar migraciones a D1
wrangler d1 migrations apply catalogo-db --local  # Para desarrollo local
wrangler d1 migrations apply catalogo-db --remote # Para producción
```

### Build y Deploy
```bash
# Build para Cloudflare Pages con OpenNext
npm run pages:build

# Deploy a Cloudflare Pages
npm run pages:deploy

# O conectar el repositorio Git a Cloudflare Pages Dashboard
```

---

## 12. PASOS POST-DEPLOYMENT

1. **Configurar WhatsApp Business API:**
   - Ir a Meta for Developers
   - Crear app de tipo Business
   - Configurar WhatsApp producto
   - Obtener Phone Number ID y Access Token
   - Configurar webhook: `https://tu-dominio.com/api/whatsapp/webhook`

2. **Configurar Google Drive API:**
   - Crear proyecto en Google Cloud Console
   - Habilitar Google Drive API
   - Crear credenciales OAuth 2.0
   - Obtener refresh token

3. **Variables de entorno en Cloudflare:**
   ```bash
   wrangler secret put NEXTAUTH_SECRET
   wrangler secret put WHATSAPP_ACCESS_TOKEN
   wrangler secret put GOOGLE_CLIENT_SECRET
   # ... etc
   ```

4. **Crear usuario admin inicial:**
   - Registrar usuario desde /register
   - Actualizar manualmente en D1:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'tu@email.com';
   ```

---

## 13. NOTAS IMPORTANTES

- **NextAuth con Cloudflare**: Usar JWT strategy (no database sessions)
- **File uploads**: El CSV se sube desde el cliente, se parsea en el servidor
- **Imágenes**: Se cachean en D1, se actualizan manualmente desde admin
- **Rate limiting**: Implementar en Cloudflare Workers si es necesario
- **CORS**: Configurar en `next.config.mjs` si accedes desde otros dominios

---

## INSTRUCCIONES FINALES PARA LA IA

Por favor genera TODOS los archivos mencionados en este prompt con el código completo y funcional. Asegúrate de:

1. Crear la estructura de carpetas exacta
2. Incluir todos los imports necesarios
3. Manejar errores apropiadamente
4. Usar TypeScript correctamente
5. Implementar responsive design con Tailwind
6. Seguir las mejores prácticas de Next.js 15
7. Configurar correctamente para Cloudflare Pages con OpenNext

NO uses placeholders ni comentarios "TODO" - implementa toda la funcionalidad descrita.