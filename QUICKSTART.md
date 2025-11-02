# Instrucciones Rápidas de Setup

## 🚀 Setup Inicial (5 pasos)

### 1. Instalar Dependencias
```bash
npm install
npm install -g wrangler
wrangler login
```

### 2. Configurar Cloudflare

```bash
# Crear base de datos D1
wrangler d1 create catalogo-db
# Copiar el database_id a wrangler.toml

# Crear bucket R2
wrangler r2 bucket create product-images
```

### 3. Variables de Entorno

Copia `.env.example` a `.env.local` y completa:

**Mínimo requerido para empezar:**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secret_aqui  # genera con: openssl rand -base64 32

# Para Drizzle (obtener de Cloudflare Dashboard)
CLOUDFLARE_ACCOUNT_ID=tu_account_id
CLOUDFLARE_D1_ID=tu_database_id
CLOUDFLARE_D1_TOKEN=tu_api_token

# Admin por defecto
ADMIN_EMAIL_DEFAULT=admin@example.com
ADMIN_PASSWORD_DEFAULT=admin123
```

**Google Drive (necesario para sincronización de imágenes):**
- Ve a [Google Cloud Console](https://console.cloud.google.com/)
- Crea proyecto → Activa Drive API → Genera OAuth2 credentials
- Sigue [esta guía](https://developers.google.com/drive/api/guides/enable-sdk) para el refresh token

### 4. Crear Base de Datos

```bash
# Generar migraciones
npm run db:generate

# Aplicar migraciones local
npm run db:migrate:local

# Crear usuario admin
npm run create-admin
# Copia y ejecuta el comando que te muestra
```

### 5. Iniciar Desarrollo

```bash
# Con soporte de D1 y R2
npm run wrangler:dev

# O simple (sin Cloudflare bindings)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## 📝 Siguiente Paso

1. Login con las credenciales de admin que creaste
2. Ve al panel de admin
3. Sube un CSV de TiendaNube
4. Sincroniza las imágenes desde Google Drive
5. ¡Ya tienes tu catálogo funcionando!

---

## 🐛 Problemas Comunes

### "D1 Database not available"
→ Usa `npm run wrangler:dev` en lugar de `npm run dev`

### "Cannot find module '@/lib/...'"
→ Verifica que `tsconfig.json` tenga `"@/*": ["./*"]`

### Imágenes no se cargan
→ Verifica que completaste las credenciales de Google Drive en `.env.local`

---

## 📚 Documentación Completa

Ver [README.md](./README.md) para documentación completa.
Ver [TODO.md](./TODO.md) para lista de tareas pendientes.
