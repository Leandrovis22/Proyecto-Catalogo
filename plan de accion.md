# 📦 CATÁLOGO DE PRODUCTOS - GUÍA COMPACTA

## 🎯 OBJETIVO DEL PROYECTO

Aplicación de catálogo de productos con carrito de compras que:
- Importa productos desde CSV TiendaNube (con variantes)
- Permite a clientes navegar y agregar productos al carrito
- Envía notificaciones por email al admin cuando se completa una orden
- Panel admin para gestionar órdenes y productos

---

## 🏗️ STACK TECNOLÓGICO

```
Frontend:      Next.js 15 (App Router) + React 19 + Tailwind CSS
Backend:       Next.js API Routes (Edge Runtime)
Base de datos: Cloudflare D1 (SQLite)
ORM:           Drizzle ORM
Autenticación: NextAuth.js v5 (JWT)
Hosting:       Cloudflare Pages (con OpenNext adapter)
Imágenes:      Google Drive API (caché en DB)
Emails:        Nodemailer (SMTP)
```

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
│   └── api/                      # API Routes
│       ├── auth/                 # Endpoints de autenticación
│       ├── products/             # CRUD productos
│       ├── cart/                 # Operaciones del carrito
│       ├── orders/               # Gestión de órdenes
│       ├── email/                # Envío de notificaciones
│       └── google-drive/         # Sincronización de imágenes
├── components/                   # Componentes React
│   ├── ui/                       # Componentes base (Button, Input, etc)
│   ├── products/                 # Componentes de productos
│   ├── cart/                     # Componentes del carrito
│   ├── admin/                    # Componentes del admin
│   └── layout/                   # Header, Footer, Sidebar
├── lib/                          # Lógica de negocio
│   ├── db/                       # Drizzle ORM (schema, client)
│   ├── auth/                     # Configuración NextAuth
│   ├── services/                 # Servicios (CSV, Email, Drive)
│   └── utils/                    # Utilidades y helpers
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

**7. productImages** - Caché de imágenes de Google Drive
```
id, productId, googleDriveId, url, isPrimary, cachedAt
```

---

## 🔑 CONCEPTOS CLAVE

### 1. **IMPORTACIÓN CSV (TiendaNube)**

**¿Qué hace?**
- Admin sube un CSV con formato TiendaNube
- Sistema parsea con PapaParse (encoding ANSI, delimiter `;`)
- Agrupa productos con sus variantes
- Inserta en DB

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
- Usa Gmail, Outlook, SendGrid, etc.
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

### 6. **IMÁGENES CON GOOGLE DRIVE**

**Problema:** No queremos hacer 1000 requests a Drive por cada usuario

**Solución:**
1. Admin sincroniza imágenes desde Google Drive (manualmente o periódico)
2. Sistema descarga URLs de imágenes públicas
3. Guarda URLs en tabla `productImages`
4. Frontend usa las URLs cacheadas

**Mapeo:**
- Nombre de archivo en Drive = slug del producto
- Ejemplo: `remera-basica.jpg` → producto con slug `remera-basica`

### 7. **AUTENTICACIÓN (NextAuth v5)**

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

### 8. **CLOUDFLARE PAGES + D1**

**D1 = SQLite en la nube de Cloudflare**

**Drizzle ORM:**
- Define schemas en TypeScript
- Genera migraciones SQL
- Type-safe queries

**OpenNext:**
- Adapter que convierte Next.js → Cloudflare Workers
- Compatible con App Router y API Routes

**Comandos importantes:**
```bash
wrangler d1 create catalogo-db          # Crear DB
npm run db:generate                      # Generar migraciones
wrangler d1 migrations apply catalogo-db # Aplicar migraciones
npm run pages:build                      # Build con OpenNext
npm run pages:deploy                     # Deploy a Cloudflare
```

---

## 🚀 ORDEN DE CONSTRUCCIÓN

### **FASE 1: Setup Inicial** (30 min)
1. ✅ Crear proyecto con `create-next-app`
2. ✅ Instalar dependencias
3. ✅ Configurar archivos: `next.config.mjs`, `wrangler.toml`, `drizzle.config.ts`
4. ✅ Crear estructura de carpetas

### **FASE 2: Base de Datos** (1 hora)
1. ✅ Definir schemas en `lib/db/schema.ts`
2. ✅ Crear cliente Drizzle en `lib/db/index.ts`
3. ✅ Generar y aplicar migraciones
4. ✅ Probar conexión con D1

### **FASE 3: Autenticación** (1.5 horas)
1. ✅ Configurar NextAuth (`lib/auth/config.ts`)
2. ✅ API route: `app/api/auth/[...nextauth]/route.ts`
3. ✅ API route: `app/api/auth/register/route.ts`
4. ✅ Componentes: LoginForm, RegisterForm
5. ✅ Páginas: `/login`, `/register`
6. ✅ SessionProvider en layout

### **FASE 4: Productos** (2 horas)
1. ✅ Servicio CSV parser (`lib/services/csv-parser.ts`)
2. ✅ API route: `app/api/products/route.ts` (GET)
3. ✅ API route: `app/api/products/upload/route.ts` (POST)
4. ✅ Componentes: ProductCard, ProductGrid, ProductFilters
5. ✅ Página: `/products` (catálogo)
6. ✅ Página: `/products/[slug]` (detalle)

### **FASE 5: Carrito** (2 horas)
1. ✅ API route: `app/api/cart/route.ts` (GET, POST, DELETE)
2. ✅ Componentes: CartItem, CartSummary, CartButton
3. ✅ Página: `/cart`

### **FASE 6: Órdenes y Emails** (2 horas)
1. ✅ Servicio Email (`lib/services/email.ts`)
2. ✅ API route: `app/api/cart/complete/route.ts`
3. ✅ API route: `app/api/orders/route.ts` (admin)
4. ✅ API route: `app/api/orders/[orderId]/route.ts`
5. ✅ Componentes: OrderCard, OrderDetail, StatusSelect
6. ✅ Páginas admin: `/admin/orders`, `/admin/orders/[id]`

### **FASE 7: Google Drive** (1 hora)
1. ✅ Servicio Google Drive (`lib/services/google-drive.ts`)
2. ✅ API route: `app/api/google-drive/images/route.ts`
3. ✅ Configurar OAuth en Google Cloud

### **FASE 8: Admin Panel** (1.5 horas)
1. ✅ Layout admin con Sidebar
2. ✅ Dashboard con estadísticas
3. ✅ CSVUploader component
4. ✅ Páginas: `/admin/dashboard`, `/admin/products/upload`

### **FASE 9: UI/UX** (1 hora)
1. ✅ Header, Footer
2. ✅ Componentes UI base (Button, Input, Card, Modal, Loading)
3. ✅ Tailwind styles
4. ✅ Responsive design

### **FASE 10: Deploy** (1 hora)
1. ✅ Configurar variables de entorno en Cloudflare
2. ✅ Build con OpenNext
3. ✅ Deploy a Cloudflare Pages
4. ✅ Crear usuario admin inicial
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
NEXTAUTH_SECRET=xxx (genera con: openssl rand -base64 32)

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=xxx (App Password de Gmail)
SMTP_FROM=tu-email@gmail.com
ADMIN_EMAIL=admin@tudominio.com

# Google Drive (opcional al inicio)
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

## 🎯 FUNCIONALIDADES CORE

✅ Importar CSV de TiendaNube con variantes
✅ Catálogo con búsqueda y filtros
✅ Carrito persistente en DB
✅ Sistema de usuarios (cliente/admin)
✅ Órdenes con cambio de estado
✅ Notificaciones por email (admin + cliente)
✅ Caché de imágenes de Google Drive
✅ Panel admin completo
✅ Responsive design