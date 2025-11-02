# 📦 CATÁLOGO DE PRODUCTOS - GUÍA COMPACTA

## 🎯 OBJETIVO DEL PROYECTO

Aplicación de catálogo de productos con carrito de compras que:
- Importa productos desde CSV TiendaNube (con variantes)
- Permite a clientes navegar y agregar productos al carrito
- Envía notificaciones por email al admin cuando se completa una orden
- Panel admin para gestionar órdenes y productos

---

## 🗂️ STACK TECNOLÓGICO

```
Next:          Next.js 15.5.2
Frontend:      Next.js 15 (App Router) + React 19 + Tailwind CSS
Backend:       Next.js API Routes (Edge Runtime)
Base de datos: Cloudflare D1 (SQLite en la nube, NO local)
ORM:           Drizzle ORM (driver d1 - drizzle-orm/d1)
Autenticación: NextAuth.js v4 (JWT)
Hosting:       Cloudflare Pages (con OpenNext adapter)
Imágenes:      Cloudflare R2 (sincronizadas desde Google Drive)
Emails:        Nodemailer (SMTP) o Resend
```

⚠️ **IMPORTANTE:** 
- **NO usar** `sqlite3` ni `better-sqlite3` (son para DBs locales)
- **SÍ usar** `drizzle-orm/d1` (driver para Cloudflare D1 remoto)
- Todas las API routes deben tener `export const runtime = 'edge'`

---

## 📁 ESTRUCTURA PRINCIPAL

```
proyecto-catalogo/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rutas de autenticación
│   │   ├── login/                # Página de login
│   │   └── register/             # Página de registro
│   ├── (customer)/               # Rutas de clientes
│   │   ├── products/             # Catálogo de productos
│   │   │   └── [slug]/           # Detalle de producto
│   │   └── cart/                 # Carrito de compras
│   ├── admin/                    # Panel de administración
│   │   ├── dashboard/            # Estadísticas generales
│   │   ├── orders/               # Gestión de órdenes
│   │   │   └── [orderId]/        # Detalle de orden
│   │   └── products/             # Gestión de productos
│   │       └── upload/           # Importar CSV
│   └── api/                      # API Routes (Edge Runtime)
│       ├── auth/                 # Endpoints de autenticación
│       ├── products/             # CRUD productos
│       ├── cart/                 # Operaciones del carrito
│       ├── orders/               # Gestión de órdenes
│       ├── email/                # Envío de notificaciones
│       ├── images/               # 🆕 Servir imágenes desde R2
│       │   └── [filename]/       # GET /api/images/producto.jpg
│       └── admin/
│           └── sync-images/      # 🆕 Sincronizar Drive → R2
├── components/                   # Componentes React
│   ├── ui/                       # Componentes base (Button, Input, etc)
│   ├── products/                 # Componentes de productos
│   ├── cart/                     # Componentes del carrito
│   ├── admin/                    # Componentes del admin
│   │   └── SyncImagesButton.tsx  # 🆕 Botón sincronizar imágenes
│   └── layout/                   # Header, Footer, Sidebar
├── lib/                          # Lógica de negocio
│   ├── db/                       # Drizzle ORM (schema, client)
│   ├── auth/                     # Configuración NextAuth
│   ├── services/                 # Servicios (CSV, Email, Drive)
│   │   └── google-drive.ts       # Servicio para consultar Drive
│   └── utils/                    # Utilidades y helpers
├── types/                        # 🆕 TypeScript types
│   └── cloudflare.d.ts           # Tipos para D1 y R2
└── archivos de config            # next.config, wrangler.toml, etc
```

---

## 🗄️ MODELO DE DATOS

### Tablas principales:

**1. users** - Usuarios del sistema
```
id, name, email, phone, password, role (customer/admin), createdAt
```

**2. products** - Productos base
```
id, slug, name, description, categories (JSON), price, promotionalPrice,
stock, sku, brand, imageUrl, showInStore, freeShipping, etc.
```

**3. productVariants** - Variantes de productos
```
id, productId, property1Name, property1Value, property2Name, property2Value,
property3Name, property3Value, price, stock, sku
```
- Ejemplo: Remera → Variantes: Talle S/M/L, Color Rojo/Azul

**4. carts** - Carritos de compras
```
id, userId, status (active/completed/cancelled), createdAt, updatedAt
```

**5. cartItems** - Items dentro del carrito
```
id, cartId, productId, variantId, quantity, price, createdAt
```

**6. orders** - Órdenes completadas
```
id, cartId, userId, status (pending/processing/completed/cancelled),
total, emailSent, completedAt, updatedAt
```

**7. productImages** - Metadatos de imágenes
```
id, productId, googleDriveId, url, isPrimary, cachedAt (INTEGER en segundos)
```
⚠️ **IMPORTANTE:** `cachedAt` debe ser INTEGER (Unix timestamp en segundos)

---

## 🔑 CONCEPTOS CLAVE

### 1. **IMPORTACIÓN CSV (TiendaNube)**

**¿Qué hace?**
- Admin sube un CSV con formato TiendaNube
- Sistema parsea con PapaParse (encoding ANSI, delimiter `;`)
- Agrupa productos con sus variantes
- Inserta en DB
- **🆕 Descarga imágenes desde Google Drive y las sube a R2**

**Formato CSV:**
```
Identificador de URL;Nombre;Categorías;Nombre de propiedad 1;Valor de propiedad 1;Precio;Stock;...
remera-basica;Remera Básica;Remeras;Talle;S;1500.00;10;...
remera-basica;;;Talle;M;1500.00;15;...    <- Misma remera, otra variante
remera-basica;;;Talle;L;1500.00;8;...
```

**Lógica:**
- Primera fila del producto = datos completos
- Siguientes filas = solo slug + propiedades que varían
- Agrupar por `slug` y crear variantes

### 2. **VARIANTES DE PRODUCTOS**

**¿Por qué existen?**
Un mismo producto puede tener diferentes combinaciones:
- Remera → Talle (S/M/L) × Color (Rojo/Azul/Verde)
- Zapatillas → Talle (38/39/40) × Material (Cuero/Tela)

**Implementación:**
- Tabla `products` = producto base
- Tabla `productVariants` = cada combinación específica
- Selector en frontend muestra las opciones disponibles

### 3. **CARRITO PERSISTENTE**

**Flujo:**
1. Cliente agrega producto al carrito
2. Se guarda en DB (no localStorage)
3. Si cierra sesión y vuelve, el carrito persiste
4. Cuando completa orden → carrito status = 'completed'

**Estados del carrito:**
- `active` → Cliente agregando productos
- `completed` → Orden finalizada
- `cancelled` → Cancelado por admin/cliente

### 4. **FLUJO DE ORDEN**

```
1. Cliente agrega productos al carrito (DB)
2. Cliente hace clic en "Completar orden"
3. Backend:
   - Marca carrito como 'completed'
   - Crea registro en tabla 'orders'
   - Calcula total
   - Envía 2 emails:
     a) Al admin (con link a /admin/orders/[id])
     b) Al cliente (confirmación)
4. Admin recibe email, ve orden en panel
5. Admin cambia estado: pending → processing → completed
```

### 5. **NOTIFICACIONES POR EMAIL**

**Configuración SMTP:**
- Usa Gmail, Outlook, SendGrid, Resend, etc.
- Variables de entorno: SMTP_HOST, SMTP_USER, SMTP_PASSWORD

**Emails que se envían:**
1. **Al admin:** Nueva orden con detalles y link directo
2. **Al cliente:** Confirmación de orden recibida

**Servicio (`lib/services/email.ts`):**
```typescript
class EmailService {
  sendOrderNotificationToAdmin(data)  // Email al admin
  sendOrderConfirmationToCustomer(data)  // Email al cliente
}
```

### 6. **🆕 IMÁGENES CON CLOUDFLARE R2**

**Problema resuelto:** Evitar que cada cliente consulte directamente Google Drive

**Solución R2:**
1. Admin sube CSV → Backend descarga imágenes desde Google Drive
2. Backend sube imágenes a R2 (bucket de Cloudflare)
3. URLs en DB apuntan a `/api/images/producto.jpg`
4. Frontend obtiene imágenes desde R2 vía tu propia API
5. **Ventajas:**
   - ✅ 100% gratis (10GB + 1M lecturas/mes)
   - ✅ CDN global de Cloudflare
   - ✅ Cache infinito
   - ✅ Sin dependencia de Google Drive en producción

**Flujo completo:**
```
1. Admin sube CSV
2. Backend consulta Google Drive API (lista de imágenes)
3. Para cada imagen:
   a) Descarga desde Drive
   b) Sube a R2: bucket.put('producto.jpg', buffer)
   c) Actualiza DB: image_url = '/api/images/producto.jpg'
4. Cliente ve producto → Next.js Image optimiza desde R2
5. R2 sirve con cache 1 año (inmutable)
```

**Sincronización manual (opcional):**
- Botón en admin panel: "🔄 Sincronizar Imágenes"
- API route: `/api/admin/sync-images` (POST)
- Re-descarga imágenes desde Drive sin resubir CSV

**Mapeo:**
- Nombre de archivo en Drive = slug del producto
- Ejemplo: `remera-basica.jpg` → producto con slug `remera-basica`

### 7. **AUTENTICACIÓN (NextAuth v4)**

**Conceptos:**
- Strategy: JWT (no database sessions)
- Roles: `customer` y `admin`
- Middleware protege rutas admin

**Providers:**
- Credentials (email + password)
- Bcrypt para hashear contraseñas

**Callbacks:**
```typescript
jwt: Agregar role al token
session: Pasar role a session
```

### 8. **CLOUDFLARE PAGES + D1 + R2**

**D1 = SQLite en la nube de Cloudflare (NO es local)**

**R2 = Object Storage de Cloudflare (como AWS S3)**

**Drizzle ORM:**
- Define schemas en TypeScript
- Genera migraciones SQL
- Type-safe queries
- **Usa driver `drizzle-orm/d1` para Cloudflare D1**

**Acceso a DB y R2 en Edge Runtime:**
```typescript
import { drizzle } from 'drizzle-orm/d1';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  const { env } = getRequestContext();
  const db = drizzle(env.DB);
  const r2 = env.PRODUCT_IMAGES;
  // queries...
}
```

**OpenNext:**
- Adapter que convierte Next.js → Cloudflare Workers
- Compatible con App Router y API Routes

**Comandos importantes:**
```bash
wrangler d1 create catalogo-db               # Crear DB en Cloudflare
wrangler r2 bucket create product-images     # 🆕 Crear bucket R2
npm run db:generate                          # Generar migraciones
wrangler d1 migrations apply catalogo-db --remote  # Aplicar a producción
npm run pages:build                          # Build con OpenNext
npm run pages:deploy                         # Deploy a Cloudflare
```

⚠️ **CRÍTICO:** Usa `--remote` para aplicar migraciones directamente a Cloudflare D1 en producción.

---

## 🚀 ORDEN DE CONSTRUCCIÓN

### **FASE 1: Setup Inicial** (30 min)
1. ✅ Crear proyecto con `create-next-app`
2. ✅ Instalar dependencias:
```bash
npm install drizzle-orm drizzle-kit
npm install @cloudflare/next-on-pages
npm install next-auth@beta bcryptjs
npm install papaparse nodemailer
npm install @types/papaparse @types/nodemailer --save-dev
```
3. ✅ Configurar archivos: `next.config.mjs`, `wrangler.toml`, `drizzle.config.ts`
4. ✅ Crear estructura de carpetas

**wrangler.toml ejemplo:**
```toml
name = "catalogo-productos"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".vercel/output/static"

[[d1_databases]]
binding = "DB"
database_name = "catalogo-db"
database_id = "tu-database-id"

# 🆕 NUEVO: Binding para R2
[[r2_buckets]]
binding = "PRODUCT_IMAGES"
bucket_name = "product-images"
preview_bucket_name = "product-images-preview"
```

### **FASE 2: Base de Datos** (1.5 horas)

#### **2.1 Configurar Drizzle**
1. ✅ Definir schemas en `lib/db/schema.ts` (sintaxis Drizzle ORM compatible con D1)

⚠️ **IMPORTANTE:** En `productImages`, el campo `cachedAt` debe ser:
```typescript
export const productImages = sqliteTable('product_images', {
  // ...
  cached_at: integer('cached_at').notNull(), // ✅ INTEGER (Unix timestamp)
});
```

2. ✅ Crear **`drizzle.config.ts`** (SIMPLE - solo para desarrollo):
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'dev.db'
  }
} satisfies Config;
```

#### **2.2 Setup Híbrido: SQLite (Dev) + D1 (Prod)**

3. ✅ Instalar Better-SQLite3 para desarrollo:
```bash
npm install better-sqlite3 --save-dev
npm install @types/better-sqlite3 --save-dev
```

4. ✅ Crear cliente DB híbrido en `lib/db/index.ts`:
```typescript
import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

let cachedDb: any = null;

export function getDb(d1Instance?: any) {
  // PRODUCCIÓN: Cloudflare D1
  if (d1Instance) {
    return drizzleD1(d1Instance, { schema });
  }
  
  // DESARROLLO: SQLite local (caché para reutilizar conexión)
  if (process.env.NODE_ENV === 'development') {
    if (!cachedDb) {
      const Database = require('better-sqlite3');
      const sqlite = new Database('dev.db');
      cachedDb = drizzleSqlite(sqlite, { schema });
    }
    return cachedDb;
  }
  
  throw new Error('DB no disponible');
}
```

#### **2.3 Crear y aplicar migraciones**

5. ✅ Generar migraciones:
```bash
npx drizzle-kit generate
```

6. ✅ Aplicar a SQLite local (desarrollo):
```bash
$env:NODE_ENV="development"; npx drizzle-kit push
```

7. ✅ Aplicar a Cloudflare D1 (producción):
```bash
npx drizzle-kit generate
wrangler d1 migrations apply catalogo-db --remote
```

#### **2.4 Script de seed para datos de prueba**

8. ✅ Crear `scripts/seed.js`:
```javascript
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database('dev.db');

const hashedPassword = bcrypt.hashSync('admin123', 10);

db.prepare(`
  INSERT INTO users (name, email, phone, password, role, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`).run('Admin', 'admin@example.com', '123456789', hashedPassword, 'admin', Date.now());

console.log('✅ Usuario admin creado: admin@example.com / admin123');
db.close();
```

9. ✅ Ejecutar seed:
```bash
node scripts/seed.js
```

10. ✅ Probar conexión con API route de prueba

⚠️ **IMPORTANTE:** 
- Para desarrollo: Usa `better-sqlite3` + `dev.db` local
- Para producción: Usa `drizzle-orm/d1` + Cloudflare D1
- NO uses `runtime = 'edge'` en desarrollo con Better-SQLite3

### **FASE 3: Autenticación** (1.5 horas)
1. ✅ Configurar NextAuth (`lib/auth/config.ts`)
2. ✅ API route: `app/api/auth/[...nextauth]/route.ts`
   - **Runtime condicional:** `export const runtime = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';`
3. ✅ API route: `app/api/auth/register/route.ts`
   - **Runtime condicional:** `export const runtime = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';`
4. ✅ Patrón para acceso a DB en API routes:
```typescript
export async function POST(request: Request) {
  let db;
  
  if (process.env.NODE_ENV === 'production') {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const { env } = getRequestContext();
    db = getDb(env.DB);
  } else {
    db = getDb(); // SQLite local
  }
  
  // ... tu lógica
}
```
5. ✅ Componentes: LoginForm, RegisterForm
6. ✅ Páginas: `/login`, `/register`
7. ✅ SessionProvider en layout

### **FASE 4: Productos** (2 horas)
1. ✅ Servicio CSV parser (`lib/services/csv-parser.ts`)
2. ✅ API route: `app/api/products/route.ts` (GET)
   - **Runtime condicional:** `export const runtime = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';`
   - Usar patrón de acceso a DB híbrido
3. ✅ API route: `app/api/products/upload/route.ts` (POST)
   - **Runtime condicional:** `export const runtime = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';`
   - Usar patrón de acceso a DB híbrido
   - **🆕 Incluir lógica de sincronización R2**
4. ✅ Componentes: ProductCard, ProductGrid, ProductFilters
5. ✅ Página: `/products` (catálogo)
6. ✅ Página: `/products/[slug]` (detalle)

### **FASE 5: 🆕 Imágenes con R2** (1 hora)

#### **5.1 Crear buckets R2**
```bash
npx wrangler r2 bucket create product-images
npx wrangler r2 bucket create product-images-preview
```

#### **5.2 Crear tipos TypeScript**
1. ✅ Crear `types/cloudflare.d.ts`:
```typescript
declare module '@cloudflare/next-on-pages' {
  export function getRequestContext(): {
    env: {
      DB: D1Database;
      PRODUCT_IMAGES: R2Bucket;
    };
  };
}

interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
  put(key: string, value: ArrayBuffer | Blob, options?: {
    httpMetadata?: { contentType?: string }
  }): Promise<R2Object>;
}

interface R2ObjectBody {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
  etag: string;
}

export {};
```

#### **5.3 API Route para servir imágenes**
2. ✅ Crear `app/api/images/[filename]/route.ts`:
```typescript
export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { env } = getRequestContext();
  const bucket = env.PRODUCT_IMAGES;
  
  const object = await bucket.get(params.filename);
  if (!object) return new Response('Not found', { status: 404 });
  
  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
```

#### **5.4 Actualizar upload/route.ts**
3. ✅ En `app/api/products/upload/route.ts`, después de insertar productos:
```typescript
// Obtener R2 bucket
const r2Bucket = env.PRODUCT_IMAGES;

// Para cada imagen:
const response = await fetch(img.url); // Descargar desde Drive
const arrayBuffer = await response.arrayBuffer();

await r2Bucket.put(filename, arrayBuffer, {
  httpMetadata: { contentType: 'image/jpeg' }
});

// Actualizar DB con URL de R2
await db.update(products).set({ 
  image_url: `/api/images/${filename}` 
});
```

⚠️ **IMPORTANTE:** Usar `Math.floor(Date.now() / 1000)` para `cached_at`

#### **5.5 API Route para sincronización manual (opcional)**
4. ✅ Crear `app/api/admin/sync-images/route.ts`
5. ✅ Crear `components/admin/SyncImagesButton.tsx`

#### **5.6 Actualizar next.config.mjs**
6. ✅ Permitir dominio propio para imágenes:
```javascript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.pages.dev',
      pathname: '/api/images/**',
    }
  ]
}
```

### **FASE 6: Carrito** (2 horas)
1. ✅ API route: `app/api/cart/route.ts` (GET, POST, DELETE)
   - **Incluir:** `export const runtime = 'edge'`
2. ✅ Componentes: CartItem, CartSummary, CartButton
3. ✅ Página: `/cart`

### **FASE 7: Órdenes y Emails** (2 horas)
1. ✅ Servicio Email (`lib/services/email.ts`)
2. ✅ API route: `app/api/cart/complete/route.ts`
   - **Incluir:** `export const runtime = 'edge'`
3. ✅ API route: `app/api/orders/route.ts` (admin)
   - **Incluir:** `export const runtime = 'edge'`
4. ✅ API route: `app/api/orders/[orderId]/route.ts`
   - **Incluir:** `export const runtime = 'edge'`
5. ✅ Componentes: OrderCard, OrderDetail, StatusSelect
6. ✅ Páginas admin: `/admin/orders`, `/admin/orders/[id]`

### **FASE 8: Admin Panel** (1.5 horas)
1. ✅ Layout admin con Sidebar
2. ✅ Dashboard con estadísticas
3. ✅ CSVUploader component
4. ✅ 🆕 SyncImagesButton component
5. ✅ Páginas: `/admin/dashboard`, `/admin/products/upload`

### **FASE 9: UI/UX** (1 hora)
1. ✅ Header, Footer
2. ✅ Componentes UI base (Button, Input, Card, Modal, Loading)
3. ✅ Tailwind styles
4. ✅ Responsive design

### **FASE 10: Deploy** (1 hora)
1. ✅ Configurar variables de entorno en Cloudflare Pages
2. ✅ Build con OpenNext: `npm run pages:build`
3. ✅ Deploy a Cloudflare Pages: `npm run pages:deploy`
4. ✅ Crear usuario admin inicial (script o manualmente)
5. ✅ Probar flujo completo

---

## 📝 VARIABLES DE ENTORNO NECESARIAS

```env
# Cloudflare D1
CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_D1_ID=xxx
CLOUDFLARE_D1_TOKEN=xxx

# NextAuth
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=xxx # Genera con: openssl rand -base64 32

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=xxx # App Password de Gmail
SMTP_FROM=tu-email@gmail.com
ADMIN_EMAIL=admin@tudominio.com

# Google Drive (solo para sincronización inicial)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REFRESH_TOKEN=xxx
GOOGLE_DRIVE_FOLDER_ID=xxx
```

---

## 🎨 COMPONENTES UI BASE

Crear primero estos 5 componentes reutilizables:

1. **Button** → Botones con variantes (primary, secondary, danger)
2. **Input** → Input con label y manejo de errores
3. **Card** → Contenedor con bordes y sombra
4. **Modal** → Overlay con contenido
5. **Loading** → Spinner de carga

---

## 📧 CONFIGURAR EMAIL (Gmail ejemplo)

1. Ir a cuenta de Google → Seguridad
2. Activar "Verificación en dos pasos"
3. Crear "Contraseña de aplicación"
4. Usar esa contraseña en `SMTP_PASSWORD`

---

## ⚠️ PUNTOS CRÍTICOS

### 🚨 **NO HACER:**
1. ❌ NO usar `sqlite3` ni `better-sqlite3` en producción
2. ❌ NO usar `drizzle-orm/better-sqlite3` como driver en producción
3. ❌ NO aplicar migraciones localmente sin `--remote`
4. ❌ NO olvidar `export const runtime = 'edge'` en API routes de producción
5. ❌ NO usar `Date.now()` directamente para `cached_at` (usar `Math.floor(Date.now() / 1000)`)

### ✅ **SÍ HACER:**
1. ✅ Usar `drizzle-orm/d1` como driver (para Cloudflare D1)
2. ✅ Aplicar migraciones con `wrangler d1 migrations apply --remote`
3. ✅ Acceder a DB con `getRequestContext().env.DB` en edge runtime
4. ✅ Incluir `export const runtime = 'edge'` en TODAS las API routes de producción
5. ✅ Configurar bindings `DB` y `PRODUCT_IMAGES` en `wrangler.toml`
6. ✅ Usar `Math.floor(Date.now() / 1000)` para timestamps INTEGER
7. ✅ Crear buckets R2 antes de deploy

### 📌 **Ejemplo de API Route correcto con R2:**
```typescript
import { getRequestContext } from '@cloudflare/next-on-pages';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/lib/db/schema';

export const runtime = 'edge'; // ← CRÍTICO

export async function GET() {
  const { env } = getRequestContext();
  const db = drizzle(env.DB, { schema });
  const r2 = env.PRODUCT_IMAGES; // ← Acceso a R2
  
  const products = await db.select().from(schema.products);
  
  return Response.json({ products });
}
```

---

## 🎯 FUNCIONALIDADES CORE

✅ Importar CSV de TiendaNube con variantes
✅ Catálogo con búsqueda y filtros
✅ Carrito persistente en DB (Cloudflare D1)
✅ Sistema de usuarios (cliente/admin)
✅ Órdenes con cambio de estado
✅ Notificaciones por email (admin + cliente)
✅ 🆕 Imágenes en Cloudflare R2 (sincronizadas desde Google Drive)
✅ Panel admin completo
✅ Responsive design
✅ Deploy en Cloudflare Pages con Edge Runtime