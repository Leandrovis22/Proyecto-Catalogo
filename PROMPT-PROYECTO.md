# 🛍️ Catálogo de Productos - Proyecto Next.js

## 🎯 Objetivo
Crear un catálogo web de productos con carrito de compra (no se realizan pagos es solo para obtener una orden de compra para el vendedor).

**Características principales:**
- Panel de admin protegido (un solo usuario administrador)
- Catálogo simple con búsqueda y filtros por categoría
- Gestión automática de stock y precios
- Sincronización incremental de imágenes Drive → R2

---

## 🏗️ Stack Tecnológico

```
Frontend:  Next.js 15 App Router + React 19 + TailwindCSS
Backend:   Next.js API Routes
Database:  Cloudflare D1 (SQLite en la nube)
ORM:       Drizzle ORM
Storage:   Cloudflare R2 (imágenes de productos)
Auth:      NextAuth.js v4
Hosting:   Cloudflare Pages
```

**💰 Tier Gratuito:**
- D1: 100,000 lecturas/día
- R2: 10GB almacenamiento + 1M lecturas/mes
- Pages: Despliegue sin costo por uso comercial
- Se tendra alrededor de 10 personas diferentes por dia cada dia usando la pag, con alrededor de 200 productos

---

**Conceptos clave:** 
- Un producto puede tener variantes (ej: Material → Acero blanco/dorado, Diseño → En punta/Redondeado)
- CSV de TiendaNube tiene filas duplicadas por slug = diferentes variantes del mismo producto
- Los productos se borran y recrean completamente con cada importación de CSV
- **Cloudflare Pages soporta Next.js con App Router** (estructura de carpetas con subdirectorios ✅)

---

## 🔑 Funcionalidades Core

### 1. Panel de Admin (Protegido)
**Acceso:** Un solo usuario administrador con NextAuth

**Funciones:**
- 📤 Subir CSV de TiendaNube
- 🔄 Sincronizar imágenes manualmente (Drive → R2)
- 📦 Ver todas las órdenes de todos los usuarios
- ✅ Marcar órdenes como "Finalizadas" (no se pueden modificar después)
- ❌ Cancelar órdenes
- ⚠️ Ver errores de productos/imágenes durante importación

### 2. Importar Productos desde CSV (TiendaNube)
- Admin sube CSV con formato TiendaNube (delimiter `;`, encoding ANSI)
- Backend parsea con PapaParse y agrupa por slug
- **Borra todos los productos** y re-inserta productos + variantes
- Validación: mostrar errores en front si hay problemas
- **Automáticamente sincroniza imágenes: Google Drive → R2**

### 3. Imágenes en R2 (crucial para gratuidad)
**Problema:** Si 50 personas visitan el catálogo, Google Drive bloquea por exceso de requests
**Solución:** Sincronizar Drive → R2 una vez, servir desde R2 siempre

**Flujo completo:**
```
1. Admin sube CSV
2. Backend lee Google Drive API (lista de imágenes actuales)
3. Compara con R2:
   - Si imagen ya no está en Drive → elimina de R2
   - Si imagen es nueva o cambió (hash MD5) → descarga y sube
   - Si imagen no cambió → skip
4. Guarda en DB: image_url = /api/images/{slug}.jpg
5. Frontend usa: <Image src="/api/images/cadenas-acero-gruesas.jpg" />
6. API route /api/images/[filename] sirve desde R2 con cache 1 año
```

**Sincronización incremental:**
- Comparar hashes MD5 de Drive vs R2
- Solo transferir lo que cambió
- Eliminar de R2 las imágenes que ya no existen en Drive

### 4. Catálogo de Productos (Pantalla Principal)
**Diseño:**
- Grid de cards con imagen 3:4 (vertical)
- Cada card muestra:
  - 🖼️ Imagen del producto
  - 📝 Nombre
  - 💰 Precio
  - 📦 Cantidad disponible (stock)
  - ➕➖ Botones +/- para agregar/quitar del carrito (directo desde catálogo)

**Funcionalidades:**
- 🔍 Buscador simple (por nombre)
- 🏷️ Filtros por categorías (extraídas del CSV)
- ❌ **NO mostrar productos sin stock** (ocultos automáticamente)
- Sin página de detalle individual, todo desde el grid principal

### 5. Carrito de Compras (Persistente en DB)
**Comportamiento:**
- Persistente en DB (no localStorage)
- Si usuario cierra sesión y vuelve, carrito persiste
- Agregar/quitar/actualizar cantidad desde catálogo o carrito
- **Sincronización automática con cambios de productos:**
  - Si producto se queda sin stock → quitar del carrito + email al admin
  - Si producto cambia de precio → actualizar en carrito + email al admin
  - Si producto se elimina → quitar del carrito + email al admin
  - **Excepciones:** Órdenes finalizadas NO se modifican

**Estados del carrito:**
- "En proceso": usuario editando
- "Pedido completado": orden finalizada por cliente

### 6. Órdenes
**Flujo del cliente:**
- Completa carrito → crea registro en `orders`
- Puede modificar orden yendo al carrito (si no está finalizada)
- Solo puede ver SUS órdenes

**Flujo del admin:**
- 📧 Recibe email cuando se crea una orden
- 📧 Recibe email si productos en órdenes activas cambian (precio/stock/eliminados)
- Ve TODAS las órdenes de TODOS los usuarios
- Puede marcar como "Finalizada" (bloquea modificaciones)
- Puede cancelar órdenes
- Ve historial completo de órdenes

---

## ⚙️ Configuración Clave

### `wrangler.toml`
```toml
name = "catalogo-productos"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "catalogo-db"
database_id = "xxx"

[[r2_buckets]]
binding = "PRODUCT_IMAGES"
bucket_name = "product-images"
```

---

### Variables de entorno (.env)
```env
# Google Drive
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REFRESH_TOKEN=xxx
GOOGLE_DRIVE_FOLDER_ID=xxx

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=xxx

CLOUDFLARE_ACCOUNT_ID=xxx
CLOUDFLARE_D1_ID=xxx
CLOUDFLARE_D1_TOKEN=xxx

# Email?

```

---

## 🎯 Arquitectura de Imágenes (simplificada)

**Solución:**
```
1. /api/products/upload (Node.js runtime)
   ↓ Parsea CSV y borra/inserta productos en DB
   ↓ Llama a ↓

2. /api/admin/sync-images (Node.js runtime)
   ↓ Obtiene lista de imágenes desde Drive con googleapis
   ↓ Compara con imágenes actuales en R2
   ↓ Para cada imagen:
      • Si está en Drive pero no en R2 → descarga y sube
      • Si cambió el hash MD5 → actualiza en R2
      • Si está en R2 pero NO en Drive → elimina de R2
   ↓ Actualiza DB con URLs finales: /api/images/{slug}.jpg
```

**Estrategia incremental:**
- Comparar hashes MD5 (Drive vs R2)
- Solo transferir lo que cambió
- Limpiar imágenes huérfanas (en R2 pero no en Drive)

**Gestión de errores:**
- Mostrar en panel de admin si faltan imágenes
- Mostrar en panel de admin si productos no tienen imagen asociada
- Log de sincronización con detalles

---

## 📝 Formato CSV TiendaNube

**Ejemplo real:**
```csv
"Identificador de URL";Nombre;Categorías;"Nombre de propiedad 1";"Valor de propiedad 1";"Nombre de propiedad 2";"Valor de propiedad 2";Precio;Stock
cadenas-acero-gruesas-lisas;"Cadenas acero gruesas lisas";"Acero > Acero Blanco > Cadenas";;;5,900.00;4
cadenas-acero-dorado-gruesas;"Cadenas acero dorado gruesas lisas";"Acero > Acero Dorado > Cadenas";;;5,900.00;4
cadenas-acero-blanco-y-dorado;"Cadenas acero blanco y dorado planas";"Acero > Acero Blanco > Cadenas";Material;"Acero blanco";2,400.00;3
cadenas-acero-blanco-y-dorado;;;Material;"Acero dorado";2,400.00;5
aros-pasantes-corazones;"Aros pasantes acero blanco corazones";"Acero > Acero Blanco > Aros";Diseño;"En punta";1,250.00;5
aros-pasantes-corazones;;;Diseño;Redondeado;1,100.00;5
```

**Características:**
- Delimiter: `;` (punto y coma)
- Encoding: ANSI (Windows-1252)
- Precios con coma decimal: `2,400.00` → parsear a `2400.00`
- Categorías jerárquicas con `>`: "Acero > Acero Blanco > Cadenas"
- Variantes: filas con mismo slug pero diferentes propiedades/precios/stock

**Lógica de parseo:**
1. Primera fila con slug = producto base (nombre, categorías completas)
2. Filas siguientes con mismo slug = variantes (solo propiedades/precio/stock que difieren)
3. Agrupar por `Identificador de URL` (slug)
4. Crear un producto con múltiples variantes si aplica

**Estructura simplificada en DB:**
```sql
-- Tabla única de productos (incluye variantes)
products:
  - id
  - slug (identificador único del producto/variante)
  - name
  - category
  - price
  - stock
  - variant_name (ej: "Material")
  - variant_value (ej: "Acero blanco")
  - image_url
```

---

## 🎯 Objetivo de Costos

**Meta:** $0/mes para ~200 productos × 20 visitas de usuarios distintos/día

**Límites gratuitos:**
- ✅ D1: 5GB + 100K reads/day (suficiente)
- ✅ R2: 10GB + 1M reads/month (suficiente para ~200 imágenes)

**Por qué R2 es crucial:**
- Sin R2: Google Drive bloquea después de ~50-100 requests (la fuente de las imagenes es drive)
- Con R2: Cache de Cloudflare + 1M requests gratis/mes = sin límites prácticos

---

## 🔧 Desarrollo Local

**Emular servicios de Cloudflare localmente:**

```bash
# Instalar Wrangler globalmente
npm install -g wrangler

# Crear DB local
wrangler d1 create catalogo-db --local

# Crear bucket R2 local
wrangler r2 bucket create product-images --local

# Correr Next.js con bindings locales de Cloudflare
wrangler pages dev -- npm run dev
```

**Ventajas:**
- ✅ Pruebas completas sin consumir cuota de producción
- ✅ D1 y R2 funcionan igual que en producción
- ✅ No necesitas mocks ni servicios externos durante desarrollo

---

## 📊 Esquema de Base de Datos (Simplificado)

**Diseño orientado a borrar/recrear constantemente:**

```sql
-- Productos (se borra y recrea con cada CSV)
products:
  - id (auto)
  - slug (ej: "cadenas-acero-gruesas")
  - name
  - category (ej: "Acero > Acero Blanco > Cadenas")
  - price (decimal)
  - stock (integer)
  - variant_name (nullable, ej: "Material")
  - variant_value (nullable, ej: "Acero blanco")
  - image_url (ej: "/api/images/cadenas-acero-gruesas.jpg")
  - created_at

-- Carritos (persistente)
carts:
  - id (auto)
  - user_id (foreign key)
  - status ("en_proceso" | "pedido_completado")
  - created_at
  - updated_at

-- Items del carrito
cart_items:
  - id (auto)
  - cart_id (foreign key)
  - product_id (foreign key, puede ser null si producto fue eliminado)
  - product_snapshot (JSON: nombre, precio al momento de agregar)
  - quantity
  - created_at

-- Órdenes
orders:
  - id (auto)
  - user_id (foreign key)
  - cart_snapshot (JSON: todos los productos al momento de crear orden)
  - total
  - status ("activa" | "finalizada" | "cancelada")
  - finalized_by_admin (boolean)
  - created_at
  - updated_at

-- Usuarios (NextAuth)
users:
  - id
  - email
  - password_hash
  - role ("admin" | "customer")
  - created_at
```

**Lógica de sincronización de carritos:**
- Cuando se importa nuevo CSV → verificar todos los carritos activos
- Si producto cambió de precio/stock/eliminado → actualizar `cart_items.product_snapshot`
- Enviar email al admin con lista de carritos afectados
- NO modificar órdenes con `finalized_by_admin = true`

---

## 📧 Notificaciones por Email

**Eventos que generan emails al admin:**
1. ✅ Nueva orden creada por cliente
2. ⚠️ Producto en carrito activo se quedó sin stock
3. ⚠️ Producto en carrito activo cambió de precio
4. ⚠️ Producto en carrito activo fue eliminado

**Contenido del email:**
- Nombre del usuario afectado
- Detalle del cambio
- Link directo a la orden/carrito
- Timestamp del cambio