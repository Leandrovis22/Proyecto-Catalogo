# 📝 Tareas Pendientes para Completar el Proyecto

## ✅ Completado

- [x] Estructura base del proyecto Next.js 15
- [x] Configuración de Drizzle ORM + Cloudflare D1
- [x] Esquema de base de datos completo
- [x] Sistema de autenticación con NextAuth
- [x] API de productos (GET con filtros)
- [x] API de carrito (CRUD completo)
- [x] API de órdenes (CRUD completo)
- [x] API para upload de CSV
- [x] API para sincronización de imágenes Drive → R2
- [x] API para servir imágenes desde R2
- [x] Parser de CSV de TiendaNube con soporte de variantes
- [x] Integración con Google Drive API
- [x] Helpers para R2
- [x] Página principal de catálogo con búsqueda y filtros
- [x] Componente de navegación
- [x] Sistema de providers para NextAuth
- [x] **Refactorización de DB: SQLite (dev) + D1 (prod)**
- [x] Migraciones aplicadas localmente
- [x] Usuario admin creado localmente
- [x] Downgrade a Next.js 15.5.6 y React 18.3.1 (versiones estables)
- [x] Corrección de parámetros async en rutas dinámicas (Next.js 15)
- [x] Todas las APIs actualizadas para usar getDb() híbrido

---

## 🚧 Por Completar

### Alta Prioridad

#### 1. Páginas Frontend Faltantes

- [x] **Página de Sign In** (`app/auth/signin/page.tsx`)
  - ✅ Formulario de login
  - ✅ Manejo de errores
  - ✅ Redirect después de login

- [ ] **Página de Carrito** (`app/cart/page.tsx`)
  - Mostrar items del carrito
  - Permitir modificar cantidades
  - Mostrar total
  - Botón "Crear Orden"

- [ ] **Página de Órdenes** (`app/orders/page.tsx`)
  - Vista de cliente: solo sus órdenes
  - Mostrar detalles de cada orden
  - Estados (activa, finalizada, cancelada)

- [x] **Panel de Admin** (`app/admin/page.tsx`)
  - ✅ Upload de CSV con feedback
  - ✅ Botón de sincronización de imágenes
  - ✅ Lista de órdenes de todos los usuarios
  - ✅ Acciones: Finalizar, Cancelar
  - ✅ Vista de productos sin imagen
  - ✅ Protección de ruta (solo admin)

#### 2. Funcionalidades Backend

- [ ] **Sincronización de Carritos al Importar CSV**
  - Al importar productos, verificar carritos activos
  - Si producto cambió de precio → actualizar snapshot + email
  - Si producto sin stock → eliminar del carrito + email
  - Si producto eliminado → eliminar del carrito + email
  - NO modificar órdenes finalizadas

- [ ] **Sistema de Emails Funcional**
  - Integrar nodemailer en las APIs
  - Email al crear orden (`/api/orders`)
  - Email al detectar cambios en productos de carritos

- [ ] **Página de Registro**
  - API para crear usuarios nuevos
  - Validación de email único
  - Hash de password con bcrypt

#### 3. Mejoras de UX

- [ ] **Loading States**
  - Spinners en uploads de CSV
  - Indicadores de sincronización de imágenes
  - Skeleton loaders en catálogo

- [ ] **Notificaciones Toast**
  - Success/Error al agregar al carrito
  - Success al crear orden
  - Errors en general

- [ ] **Validaciones Frontend**
  - Validar formato de CSV antes de upload
  - Validar stock antes de agregar al carrito
  - Feedback visual inmediato

#### 4. Seguridad y Validación

- [ ] **Middleware de Protección**
  - Proteger rutas de admin (`/admin/*`)
  - Proteger rutas de cliente autenticado (`/cart`, `/orders`)
  - Redirect automático al login

- [ ] **Rate Limiting**
  - Limitar requests a APIs (opcional)
  - Prevenir spam en creación de órdenes

- [ ] **Input Sanitization**
  - Sanitizar inputs de CSV
  - Validar tipos de datos en todas las APIs

#### 5. Testing y Debugging

- [x] **Generar Migraciones de DB**
  ```bash
  npm run db:generate
  npm run db:migrate:local
  ```

- [x] **Crear Usuario Admin**
  ```bash
  npm run create-admin
  ```
  - ✅ Usuario creado: admin@example.com / admin123

- [ ] **Probar Flujo Completo**
  - Upload CSV
  - Sincronización de imágenes
  - Agregar productos al carrito
  - Crear orden
  - Ver órdenes como admin
  - Finalizar orden

---

## 📋 Checklist de Deploy

### Antes de Deploy

- [ ] Revisar todos los errores de TypeScript
- [ ] Probar localmente con Wrangler
- [ ] Verificar variables de entorno
- [ ] Asegurar que wrangler.toml está configurado
- [ ] Generar y aplicar migraciones en producción
- [ ] Crear usuario admin en producción

### Durante Deploy

- [ ] Conectar repositorio a Cloudflare Pages
- [ ] Configurar bindings de D1 y R2
- [ ] Agregar variables de entorno en dashboard
- [ ] Configurar dominio personalizado (opcional)
- [ ] Verificar que build pasa

### Después de Deploy

- [ ] Probar login
- [ ] Probar upload de CSV
- [ ] Probar sincronización de imágenes
- [ ] Verificar que imágenes se sirven correctamente
- [ ] Probar flujo completo de compra
- [ ] Verificar emails (si configurado)

---

## 🎨 Mejoras Opcionales (Nice to Have)

### Funcionalidades Extra

- [ ] **Dashboard de Admin Mejorado**
  - Estadísticas de ventas
  - Gráficos de productos más vendidos
  - Total de ingresos

- [ ] **Búsqueda Avanzada**
  - Filtros por rango de precios
  - Ordenamiento (precio, nombre, stock)
  - Filtros por múltiples categorías

- [ ] **Carrito Optimista**
  - Actualizar UI inmediatamente
  - Sincronizar en background
  - Manejo de conflictos

- [ ] **Imágenes Optimizadas**
  - Generar thumbnails automáticamente
  - WebP conversion
  - Lazy loading

- [ ] **PWA Support**
  - Service worker
  - Instalable en móvil
  - Offline mode básico

- [ ] **Modo Oscuro**
  - Toggle en navbar
  - Persistir preferencia

### Optimizaciones

- [ ] **Caching**
  - Cache de productos en cliente
  - Revalidación incremental
  - Cache de imágenes

- [ ] **Optimización de Queries**
  - Indexar campos más usados
  - Paginación de productos
  - Lazy loading de órdenes

- [ ] **Monitoring**
  - Error tracking (Sentry)
  - Analytics (Google Analytics / Plausible)
  - Performance monitoring

---

## 🐛 Bugs Conocidos

- [ ] Edge runtime no soporta algunas APIs de Node.js
  - Solución: Usar `runtime = 'nodejs'` en rutas que necesiten googleapis/nodemailer

- [ ] NextAuth puede tener problemas con Edge
  - Solución: Verificar compatibilidad o usar adaptador custom

- [ ] Wrangler dev puede ser lento en Windows
  - Solución: Considerar WSL2 para desarrollo

---

## 📚 Documentación Pendiente

- [ ] Video tutorial de configuración inicial
- [ ] Guía de cómo obtener credentials de Google Drive
- [ ] Screenshots del panel de admin
- [ ] Ejemplos de CSV válidos
- [ ] Troubleshooting común

---

## 🎯 Prioridades Inmediatas (Esta Semana)

1. ✅ Generar migraciones y crear DB local
2. ✅ Crear usuario admin
3. ✅ Refactorizar sistema de DB (SQLite local + D1 producción)
4. ✅ Corregir versiones de Next.js y React (estabilizar proyecto)
5. ✅ Completar página de Sign In
6. ✅ Completar Panel de Admin básico
7. ⬜ **SIGUIENTE:** Completar página de Carrito
8. ⬜ Completar página de Órdenes
9. ⬜ Probar flujo completo end-to-end (login → agregar al carrito → crear orden → admin finaliza)

---

## 📝 Notas Técnicas Importantes

### Configuración de Base de Datos
- **Desarrollo:** SQLite local en `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/60eb755a5e57cbc02def8d3735fd2d41a57117937eb255b5c776679a855aca2e.sqlite`
- **Producción:** Cloudflare D1 (database_id: 8bed6fa2-5081-410d-807c-96f56fcf847c)
- **Estrategia:** `getDb()` detecta `NODE_ENV` y cambia automáticamente entre SQLite y D1
- **Runtime:** Cambiado de `edge` a `nodejs` en APIs que usan Google Drive/Nodemailer

### Credenciales Admin Locales
- **Email:** admin@example.com
- **Password:** admin123

### Comandos Útiles
```bash
# Desarrollo local (sin Wrangler)
npm run dev

# Generar nuevas migraciones
npm run db:generate

# Aplicar migraciones en local
npm run db:migrate:local

# Aplicar migraciones en producción
npm run db:migrate:prod
```

---

**Última actualización:** 2 de noviembre de 2025
