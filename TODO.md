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

---

## 🚧 Por Completar

### Alta Prioridad

#### 1. Páginas Frontend Faltantes

- [ ] **Página de Carrito** (`app/cart/page.tsx`)
  - Mostrar items del carrito
  - Permitir modificar cantidades
  - Mostrar total
  - Botón "Crear Orden"

- [ ] **Página de Órdenes** (`app/orders/page.tsx`)
  - Vista de cliente: solo sus órdenes
  - Mostrar detalles de cada orden
  - Estados (activa, finalizada, cancelada)

- [ ] **Página de Sign In** (`app/auth/signin/page.tsx`)
  - Formulario de login
  - Opción de registro (opcional)
  - Manejo de errores

- [ ] **Panel de Admin** (`app/admin/page.tsx`)
  - Upload de CSV
  - Botón de sincronización de imágenes
  - Lista de órdenes de todos los usuarios
  - Acciones: Finalizar, Cancelar
  - Logs de sincronización
  - Vista de productos sin imagen

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

- [ ] **Generar Migraciones de DB**
  ```bash
  npm run db:generate
  npm run db:migrate:local
  ```

- [ ] **Crear Usuario Admin**
  ```bash
  npm run create-admin
  ```

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
3. ⬜ Completar página de Sign In
4. ⬜ Completar página de Carrito
5. ⬜ Completar página de Órdenes
6. ⬜ Completar Panel de Admin básico
7. ⬜ Probar flujo completo end-to-end

---

**Última actualización:** ${new Date().toLocaleDateString('es-ES')}
