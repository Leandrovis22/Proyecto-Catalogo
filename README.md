# 🛍️ Catálogo de Productos - Next.js + Cloudflare

Sistema completo de catálogo web con carrito de compra, panel de administración y sincronización de imágenes desde Google Drive a Cloudflare R2.

## 🎯 Características

- **Catálogo de productos** con búsqueda y filtros por categoría
- **Carrito persistente** guardado en base de datos
- **Sistema de órdenes** para clientes y administradores
- **Panel de admin** protegido para gestión completa
- **Importación automática** desde CSV de TiendaNube
- **Sincronización de imágenes** Google Drive → Cloudflare R2
- **Stack 100% gratuito** con Cloudflare (D1 + R2 + Pages)

---

## 🏗️ Stack Tecnológico

```
Frontend:  Next.js 15 + React 19 + TailwindCSS
Backend:   Next.js API Routes
Database:  Cloudflare D1 (SQLite)
ORM:       Drizzle ORM
Storage:   Cloudflare R2 (imágenes)
Auth:      NextAuth.js v4
Hosting:   Cloudflare Pages
```

---

## 🚀 Instalación y Configuración

### 1. Clonar e Instalar Dependencias

```bash
git clone <tu-repo>
cd proyecto-catalogo
npm install
```

### 2. Configurar Cloudflare

#### Instalar Wrangler CLI

```bash
npm install -g wrangler
wrangler login
```

#### Crear Base de Datos D1

```bash
# Crear base de datos
wrangler d1 create catalogo-db

# Copiar el database_id que te devuelve y pegarlo en wrangler.toml
```

#### Crear Bucket R2

```bash
wrangler r2 bucket create product-images
```

#### Generar migraciones de DB

```bash
# Primero configura las variables de entorno para Drizzle
export CLOUDFLARE_ACCOUNT_ID="tu_account_id"
export CLOUDFLARE_D1_ID="tu_d1_database_id"  
export CLOUDFLARE_D1_TOKEN="tu_d1_token"

# Genera las migraciones
npx drizzle-kit generate

# Aplica las migraciones
wrangler d1 migrations apply catalogo-db --local   # Para desarrollo
wrangler d1 migrations apply catalogo-db            # Para producción
```

### 3. Configurar Google Drive API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto
3. Activa la API de Google Drive
4. Crea credenciales OAuth 2.0
5. Descarga el archivo de credenciales
6. Genera un refresh token:

```bash
# Usa un script como este o herramienta online
node scripts/generate-google-token.js
```

7. Crea una carpeta en Google Drive para las imágenes
8. Comparte la carpeta como "Público" o con el email de la service account
9. Copia el ID de la carpeta (está en la URL)

### 4. Variables de Entorno

Copia `.env.example` a `.env.local` y completa:

```env
# Google Drive API
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REFRESH_TOKEN=xxx
GOOGLE_DRIVE_FOLDER_ID=xxx

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generado_con_openssl_rand_base64_32

# Cloudflare (para Drizzle)
CLOUDFLARE_ACCOUNT_ID=tu_account_id
CLOUDFLARE_D1_ID=tu_database_id
CLOUDFLARE_D1_TOKEN=tu_api_token

# Email (opcional - para notificaciones)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
ADMIN_EMAIL=admin@example.com

# Admin Default (primera vez)
ADMIN_EMAIL_DEFAULT=admin@example.com
ADMIN_PASSWORD_DEFAULT=admin123
```

### 5. Crear Usuario Administrador

```bash
# Ejecuta este script para crear el primer usuario admin
node scripts/create-admin.js
```

O crea un script `scripts/create-admin.js`:

```javascript
const { hash } = require('bcryptjs');
const { nanoid } = require('nanoid');

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL_DEFAULT;
  const password = process.env.ADMIN_PASSWORD_DEFAULT;
  const passwordHash = await hash(password, 10);
  const id = nanoid();

  console.log(`
INSERT INTO users (id, email, password_hash, role, created_at)
VALUES ('${id}', '${email}', '${passwordHash}', 'admin', ${Math.floor(Date.now() / 1000)});
  `);
}

createAdmin();
```

Luego ejecuta la query en tu DB:

```bash
wrangler d1 execute catalogo-db --local --command="<query>"
```

### 6. Desarrollo Local

```bash
# Desarrollo con Wrangler (recomendado para acceso a D1 y R2)
wrangler pages dev --compatibility-date=2024-01-01 -- npm run dev

# O desarrollo simple (sin bindings de Cloudflare)
npm run dev
```

---

## 📁 Estructura del Proyecto

```
proyecto-catalogo/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/      # NextAuth endpoints
│   │   ├── products/
│   │   │   ├── route.ts             # GET productos (con filtros)
│   │   │   └── upload/route.ts      # POST CSV upload
│   │   ├── admin/
│   │   │   └── sync-images/route.ts # POST sincronizar imágenes
│   │   ├── images/[filename]/       # GET servir imágenes desde R2
│   │   ├── cart/route.ts            # CRUD de carrito
│   │   └── orders/route.ts          # CRUD de órdenes
│   ├── admin/                       # Panel de administración
│   ├── cart/                        # Página de carrito
│   ├── orders/                      # Página de órdenes
│   ├── auth/signin/                 # Página de login
│   ├── layout.tsx                   # Layout principal
│   ├── providers.tsx                # SessionProvider
│   └── page.tsx                     # Catálogo (home)
├── components/
│   └── Navbar.tsx                   # Navegación principal
├── lib/
│   ├── db/
│   │   ├── schema.ts                # Esquema Drizzle
│   │   └── index.ts                 # DB connection
│   ├── auth.ts                      # NextAuth config
│   ├── cloudflare.ts                # Helpers para D1 y R2
│   ├── csv-parser.ts                # Parser de CSV TiendaNube
│   ├── google-drive.ts              # Google Drive API
│   ├── r2.ts                        # R2 helpers
│   └── email.ts                     # Email templates
├── drizzle/migrations/              # Migraciones de DB
├── types/
│   └── next-auth.d.ts               # Tipos de NextAuth
├── .env.local                       # Variables de entorno
├── wrangler.toml                    # Config de Cloudflare
├── drizzle.config.ts                # Config de Drizzle
└── package.json
```

---

## 🔧 Uso

### Como Administrador

1. **Iniciar sesión** con credenciales de admin
2. **Ir al Panel de Admin** (botón en navbar)
3. **Subir CSV de TiendaNube:**
   - Click en "Subir CSV"
   - Seleccionar archivo (formato TiendaNube con delimiter `;`)
   - El sistema automáticamente:
     - Borra productos anteriores
     - Importa nuevos productos
     - Inicia sincronización de imágenes
4. **Sincronizar imágenes manualmente** (opcional):
   - Click en "Sincronizar Imágenes"
   - El sistema compara Drive vs R2
   - Solo transfiere lo que cambió
5. **Gestionar órdenes:**
   - Ver todas las órdenes de todos los clientes
   - Marcar como "Finalizada" (bloquea modificaciones)
   - Cancelar órdenes

### Como Cliente

1. **Navegar catálogo** sin login (ver productos)
2. **Crear cuenta / Iniciar sesión**
3. **Agregar productos al carrito** desde el catálogo (botones +/-)
4. **Ver carrito** y ajustar cantidades
5. **Crear orden** desde el carrito
6. **Ver mis órdenes** en página de órdenes

---

## 📊 Formato CSV de TiendaNube

El CSV debe tener estas columnas (delimiter `;`, encoding ANSI):

```csv
"Identificador de URL";Nombre;Categorías;"Nombre de propiedad 1";"Valor de propiedad 1";Precio;Stock
cadenas-acero;"Cadenas acero gruesas";"Acero > Cadenas";;;5900.00;4
cadenas-acero;;;Material;"Acero dorado";5900.00;2
```

**Notas:**
- Productos con mismo `Identificador de URL` = variantes
- Precios con coma decimal se parsean automáticamente
- Categorías jerárquicas con `>`

---

## 🖼️ Sincronización de Imágenes

### ¿Por qué R2?

Google Drive bloquea después de ~50-100 requests. Con 10 personas visitando el catálogo de 200 productos, se agota rápido.

**Solución:** Sincronizar Drive → R2 una vez, servir desde R2 siempre.

### Flujo Automático

1. Admin sube CSV
2. Backend llama a `/api/admin/sync-images`
3. Sistema:
   - Lista imágenes en Drive
   - Compara con R2 (por hash MD5)
   - Descarga y sube solo las nuevas/modificadas
   - Elimina de R2 las que ya no están en Drive
   - Actualiza URLs en DB

### Nomenclatura

Las imágenes en Drive deben llamarse como el slug del producto:

```
cadenas-acero-gruesas.jpg  → slug: cadenas-acero-gruesas
aros-pasantes-corazones.png → slug: aros-pasantes-corazones
```

---

## 🚀 Deploy en Cloudflare Pages

### 1. Build del proyecto

```bash
npm run build
```

### 2. Deploy

```bash
# Primera vez
wrangler pages deploy .next/server/app

# O conecta tu repo a Cloudflare Pages desde el dashboard
```

### 3. Configurar variables de entorno en producción

En Cloudflare Dashboard → Pages → Settings → Environment Variables, agrega:

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (tu URL de producción)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_DRIVE_FOLDER_ID`
- `SMTP_*` (si usas emails)

### 4. Asignar bindings de D1 y R2

En Cloudflare Dashboard → Pages → Settings → Functions:

- Binding D1: `DB` → `catalogo-db`
- Binding R2: `PRODUCT_IMAGES` → `product-images`

---

## 💰 Costos (Tier Gratuito)

### Cloudflare Free Tier

- **D1:** 5GB + 100,000 lecturas/día ✅
- **R2:** 10GB + 1M lecturas/mes + 1M escrituras/mes ✅  
- **Pages:** Despliegues ilimitados ✅

### Estimación para tu caso (10 personas/día, 200 productos):

- **Lecturas de DB:** ~500/día (muy por debajo del límite)
- **Lecturas de R2:** ~2,000/día = 60,000/mes (muy por debajo de 1M)
- **Storage R2:** ~100MB para 200 imágenes (muy por debajo de 10GB)

**Resultado: $0/mes** 🎉

---

## 📧 Notificaciones por Email

El sistema envía emails al admin en estos casos:

1. ✅ Nueva orden creada
2. ⚠️ Producto en carrito cambió de precio
3. ⚠️ Producto en carrito se quedó sin stock
4. ⚠️ Producto en carrito fue eliminado

Configura las variables `SMTP_*` en `.env.local` para activar.

---

## 🛡️ Seguridad

- **Autenticación:** NextAuth con bcrypt
- **Protección de rutas:** Middleware para admin
- **Validación:** Input validation en todas las APIs
- **CORS:** Configurado para producción
- **Environment vars:** Nunca commitear `.env.local`

---

## 🐛 Troubleshooting

### Error: "D1 Database not available"

Asegúrate de correr con Wrangler:

```bash
wrangler pages dev -- npm run dev
```

### Error: "Failed to list images from Google Drive"

Verifica:
- Credenciales de Google Drive
- Refresh token válido
- Folder ID correcto
- Carpeta compartida públicamente o con service account

### Imágenes no se muestran

1. Verifica que se sincronizaron: Panel Admin → Logs
2. Verifica URLs en DB: deben ser `/api/images/{slug}.jpg`
3. Verifica R2 bucket: `wrangler r2 object list product-images`

---

## 📝 Scripts Útiles

```bash
# Ver logs de D1
wrangler d1 execute catalogo-db --local --command="SELECT * FROM products LIMIT 10"

# Ver contenido de R2
wrangler r2 object list product-images

# Resetear DB (cuidado!)
wrangler d1 execute catalogo-db --local --command="DELETE FROM products"

# Generar nuevo secret para NextAuth
openssl rand -base64 32
```

---

## 🎨 Personalización

### Cambiar colores

Edita `app/globals.css` y `tailwind.config.ts`.

### Agregar campos a productos

1. Modifica `lib/db/schema.ts`
2. Genera migración: `npx drizzle-kit generate`
3. Aplica: `wrangler d1 migrations apply catalogo-db`
4. Actualiza parser CSV en `lib/csv-parser.ts`

---

## 📄 Licencia

MIT

---

**¿Preguntas?** Abre un issue en GitHub.
