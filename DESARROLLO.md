# 🚀 Guía de Desarrollo - Proyecto Catálogo

## 📋 Requisitos Previos

- Node.js 18+
- Cuenta de Cloudflare
- Cuenta de Google Cloud (para Google Drive API)

## 🔧 Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz con:

```env
# Google Drive API
GOOGLE_DRIVE_FOLDER_ID=tu_folder_id_aqui
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_REDIRECT_URI=https://developers.google.com/oauthplayground
GOOGLE_REFRESH_TOKEN=tu_refresh_token

# NextAuth (opcional)
NEXTAUTH_SECRET=genera_un_string_aleatorio_aqui
NEXTAUTH_URL=http://localhost:3000
```

### 3. Crear buckets R2 en Cloudflare

```bash
# Crear bucket de producción
wrangler r2 bucket create product-images

# Crear bucket de preview/desarrollo
wrangler r2 bucket create product-images-preview
```

### 4. Crear y migrar base de datos D1

```bash
# Crear base de datos local
wrangler d1 create catalogo-db

# Aplicar migraciones en local
npm run db:migrate:local

# Aplicar migraciones en remoto (producción)
npm run db:migrate:remote
```

## 🏃 Desarrollo Local

### Opción 1: Usando Wrangler (RECOMENDADO - con R2 real)

```bash
npm run dev
```

Esto ejecuta:
- Wrangler Pages Dev con bindings de D1 y R2
- Next.js dev server
- Acceso a R2 buckets locales/preview
- Puerto: http://localhost:3000

### Opción 2: Solo Next.js (sin R2 - solo para UI)

```bash
npm run next:dev
```

⚠️ **Advertencia**: Esta opción NO tiene acceso a R2, solo para desarrollo de UI.

## 📦 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Desarrollo con Wrangler + R2 + D1 |
| `npm run next:dev` | Solo Next.js (sin bindings) |
| `npm run build` | Build de producción |
| `npm run db:generate` | Generar migraciones desde schema |
| `npm run db:migrate:local` | Aplicar migraciones en D1 local |
| `npm run db:migrate:remote` | Aplicar migraciones en D1 remoto |
| `npm run db:studio` | Abrir Drizzle Studio |
| `npm run pages:build` | Build para Cloudflare Pages |
| `npm run pages:deploy` | Deploy a Cloudflare Pages |

## 🖼️ Flujo de Imágenes

### En Desarrollo y Producción (ambos usan R2):

1. **Upload CSV** → `/api/products/upload`
2. **Descarga imágenes** desde Google Drive
3. **Sube a R2** (bucket: `product-images-preview` en dev, `product-images` en prod)
4. **Guarda URL** en DB: `/api/images/{slug}.jpg`
5. **Frontend muestra** desde `/api/images/[filename]` → R2

### Sincronización Manual

Puedes re-sincronizar imágenes sin subir CSV:

1. Ve a: http://localhost:3000/admin/products/upload
2. Haz clic en "Sincronizar Imágenes"
3. Endpoint: `/api/admin/sync-images`

## 📂 Estructura de Archivos Importante

```
proyecto-catalogo/
├── app/
│   ├── admin/products/upload/page.tsx   # Página de upload
│   └── api/
│       ├── products/upload/route.ts      # Upload CSV + sync images
│       ├── admin/sync-images/route.ts    # Sync manual
│       └── images/[filename]/route.ts    # Serve desde R2
├── components/admin/
│   ├── CSVUploader.tsx                   # Componente upload
│   └── SyncImagesButton.tsx              # Botón sync manual
├── lib/
│   ├── db/
│   │   ├── schema.ts                     # Schema Drizzle
│   │   └── index.ts                      # DB client
│   └── services/
│       └── google-drive.ts               # Google Drive API
├── wrangler.toml                         # Cloudflare config
└── .env                                  # Variables de entorno
```

## 🔐 Configurar Google Drive API

### 1. Crear proyecto en Google Cloud Console

1. Ve a: https://console.cloud.google.com
2. Crea un nuevo proyecto
3. Habilita **Google Drive API**

### 2. Configurar OAuth 2.0

1. Ve a **Credenciales** → **Crear credenciales** → **ID de cliente OAuth**
2. Tipo: **Aplicación web**
3. URIs de redirección autorizadas:
   - `https://developers.google.com/oauthplayground`

### 3. Obtener Refresh Token

1. Ve a: https://developers.google.com/oauthplayground
2. Click en ⚙️ → **Use your own OAuth credentials**
3. Ingresa tu **Client ID** y **Client Secret**
4. En **Step 1**: Busca **Drive API v3** → selecciona:
   - `https://www.googleapis.com/auth/drive.readonly`
5. Click **Authorize APIs**
6. En **Step 2**: Click **Exchange authorization code for tokens**
7. Copia el **Refresh token**

### 4. Obtener Folder ID

1. Abre la carpeta de Google Drive con las imágenes
2. URL será: `https://drive.google.com/drive/folders/XXXXX`
3. El **XXXXX** es tu `GOOGLE_DRIVE_FOLDER_ID`

## 🚀 Deploy a Cloudflare Pages

### 1. Primera vez

```bash
# Build
npm run pages:build

# Deploy
npm run pages:deploy
```

### 2. Configurar variables en Cloudflare Dashboard

1. Ve a: **Cloudflare Dashboard** → **Pages** → **proyecto-catalogo**
2. **Settings** → **Environment variables**
3. Agrega todas las variables de `.env`

### 3. Configurar bindings

Ya están configurados en `wrangler.toml`:
- ✅ D1: `DB` → `catalogo-db`
- ✅ R2: `PRODUCT_IMAGES` → `product-images`

## ⚠️ Troubleshooting

### Error: "Bindings de Cloudflare no configurados"

**Solución**: Estás ejecutando con `npm run next:dev`. Usa `npm run dev` para tener acceso a R2.

### Error: "No se encontró el binding PRODUCT_IMAGES"

**Solución**: 
1. Verifica que los buckets R2 existan:
   ```bash
   wrangler r2 bucket list
   ```
2. Si no existen, créalos:
   ```bash
   wrangler r2 bucket create product-images
   wrangler r2 bucket create product-images-preview
   ```

### Error: "Credenciales de Google Drive incompletas"

**Solución**: Verifica que todas las variables `GOOGLE_*` estén en `.env`:
- `GOOGLE_DRIVE_FOLDER_ID`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `GOOGLE_REFRESH_TOKEN`

### Error: "Invalid grant" (Google API)

**Solución**: El refresh token expiró. Genera uno nuevo desde OAuth Playground.

## 📊 Base de Datos

### Ver datos en Drizzle Studio

```bash
npm run db:studio
```

Abre: http://localhost:4983

### Migrar cambios de schema

```bash
# 1. Modificar lib/db/schema.ts

# 2. Generar migración
npm run db:generate

# 3. Aplicar en local
npm run db:migrate:local

# 4. Aplicar en remoto (producción)
npm run db:migrate:remote
```

## 🎯 Checklist de Desarrollo

- [ ] Instalar dependencias: `npm install`
- [ ] Crear `.env` con variables de Google Drive
- [ ] Crear buckets R2: `wrangler r2 bucket create ...`
- [ ] Aplicar migraciones: `npm run db:migrate:local`
- [ ] Iniciar dev server: `npm run dev`
- [ ] Probar upload CSV: http://localhost:3000/admin/products/upload
- [ ] Verificar imágenes en R2

## 📝 Notas

- **TODAS las imágenes se sirven desde R2** (desarrollo y producción)
- **Google Drive** solo se usa como fuente de descarga
- **Cache**: Las imágenes tienen cache infinito (`max-age=31536000`)
- **Formato**: Las imágenes deben llamarse igual que el `slug` del producto
- **Extensiones soportadas**: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`

---

¿Dudas? Revisa el código en:
- `app/api/products/upload/route.ts` (upload + sync automático)
- `app/api/admin/sync-images/route.ts` (sync manual)
- `app/api/images/[filename]/route.ts` (servir desde R2)
