Necesito crear una aplicación web de catálogo de productos con carrito de compras usando Next.js 15 con App Router, desplegada en Cloudflare Pages.

## FUNCIONALIDADES PRINCIPALES:

### 1. CATÁLOGO DE PRODUCTOS
- Importar productos desde un archivo CSV con formato TiendaNube (encoding ANSI) (admin)
- Las imágenes de productos se obtienen desde Google Drive API
- Mostrar catálogo completo con búsqueda y filtros
- Vista de detalle de cada producto
- Manejo de variantes de productos (mismo producto con diferentes propiedades como color, talle, diseño, material)

### 2. SISTEMA DE USUARIOS
- Registro de clientes con: nombre, correo electrónico y teléfono
- Sistema de login/logout con autenticación segura
- Sesiones persistentes
- Dos roles: Cliente y Admin

### 3. CARRITO DE COMPRAS
- Los clientes pueden agregar productos al carrito (incluyendo variantes específicas)
- Ver y modificar cantidades en el carrito
- Los clientes pueden marcar su estado de carrito como "orden completada"
- El carrito es persistente (se guarda en la base de datos)

### 4. NOTIFICACIONES WHATSAPP
- Cuando un cliente marca su orden como completada, enviar notificación automática a mi WhatsApp Business
- La notificación debe incluir:
  - Nombre del cliente
  - Teléfono del cliente
  - Link directo para ver el carrito/orden de esa persona con todos los productos y detalles

### 5. PANEL DE ADMINISTRADOR
- Usuario admin puede ver todas las órdenes/carritos
- Ver detalles completos de cada orden (productos con variantes, cantidades, datos del cliente)
- Modificar estado de las órdenes (pendiente, en proceso, completada, cancelada)
- Ver historial de órdenes completadas
- Subir/actualizar CSV de productos
- Conectar con Google Drive para las imágenes

## STACK TECNOLÓGICO:

- **Framework:** Next.js 15 con App Router (NO Pages Router)
- **Hosting:** Cloudflare Pages usando @opennextjs/cloudflare
- **Backend:** API Routes de Next.js para todas las operaciones
- **Base de datos:** Cloudflare D1 (para usuarios, carritos, órdenes, productos)
- **Autenticación:** NextAuth.js con JWT
- **Imágenes:** Google Drive API
- **CSV Parsing:** Papa Parse para leer el archivo TiendaNube (encoding ANSI)
- **Estilos:** Tailwind CSS
- **WhatsApp:** WhatsApp Business API Cloud (Meta)

## REQUERIMIENTOS TÉCNICOS:

- Usar Server Components y Client Components apropiadamente
- Implementar SSR donde sea necesario para SEO y performance
- Usar @opennextjs/cloudflare como adaptador para el build y deploy en Cloudflare Pages
- API Routes para:
  - Autenticación (register, login, logout)
  - CRUD de carrito
  - Completar orden y trigger notificación WhatsApp
  - Admin: obtener y modificar órdenes
  - Admin: importar CSV de productos
  - Admin: conectar con Google Drive
- Manejo de estados con React hooks
- Responsive design (mobile-first)
- Validación de formularios
- Manejo de errores apropiado

## ESTRUCTURA CSV TIENDANUBE:

El CSV tiene las siguientes columnas (separadas por punto y coma ";"):
- "Identificador de URL" (slug único del producto)
- "Nombre" (nombre del producto)
- "Categorías" (puede tener múltiples categorías separadas por comas)
- "Nombre de propiedad 1", "Valor de propiedad 1" (ej: Material, Diseño, Color, Talle)
- "Nombre de propiedad 2", "Valor de propiedad 2"
- "Nombre de propiedad 3", "Valor de propiedad 3"
- "Precio" (formato con punto para miles y coma para decimales: 5.900,00)
- "Precio promocional"
- "Peso (kg)", "Alto (cm)", "Ancho (cm)", "Profundidad (cm)"
- "Stock"
- "SKU"
- "Código de barras"
- "Mostrar en tienda" (SI/NO)
- "Envío sin cargo" (SI/NO)
- "Descripción"
- "Tags"
- "Título para SEO"
- "Descripción para SEO"
- "Marca"
- "Producto Físico" (SI/NO)
- "MPN (Número de pieza del fabricante)"
- "Sexo"
- "Rango de edad"
- "Costo"

**IMPORTANTE sobre variantes:**
- Si un producto tiene variantes (color, talle, etc.), aparecerá en múltiples filas
- La primera fila tiene todos los datos completos
- Las filas siguientes del mismo producto solo tienen el "Identificador de URL" y las propiedades/valores que varían
- Las variantes comparten el mismo slug pero tienen diferentes valores en las propiedades

## FLUJO DE USUARIO:

1. **Admin** importa CSV de productos y conecta Google Drive
2. Sistema procesa CSV y crea productos con sus variantes
3. **Cliente** se registra/inicia sesión
4. Cliente navega catálogo (con filtros por categoría, precio, etc.)
5. Cliente ve detalle de producto y selecciona variante si aplica
6. Cliente agrega productos al carrito
7. Cliente revisa su carrito y puede modificar cantidades
8. Cliente marca orden como completada
9. Sistema envía notificación a WhatsApp del admin con:
   - Nombre y teléfono del cliente
   - Link: https://tu-dominio.com/admin/orders/[order_id]
10. Admin recibe notificación en WhatsApp, hace clic en el link
11. Admin ve detalles completos de la orden
12. Admin puede cambiar estado de la orden (en proceso, completada, etc.)


## WhatsApp Business API Cloud (Meta) - integración

Este proyecto integra la WhatsApp Business API Cloud (Meta) para enviar notificaciones al administrador cuando un cliente completa una orden.

Variables de entorno necesarias:
- `WA_CLOUD_TOKEN` — Token (Bearer) de la aplicación en Meta (WhatsApp Cloud API)
- `WA_PHONE_NUMBER_ID` — El phone_number_id asociado al número de WhatsApp en Meta
- `ADMIN_WHATSAPP_NUMBER` — Número del admin en formato internacional (ej: 5491112345678)
- `NEXT_PUBLIC_SITE_URL` — URL pública del sitio (usada para construir el link a la orden)


Notas:
- La API oficial de Meta puede aplicar cargos por mensaje según región y tipo de plantilla.
- Para enviar mensajes template/plantilla debes revisar la documentación oficial de Meta y configurar plantillas aprobadas si vas a iniciar conversaciones desde la empresa.
- El código incluye un rate limiter en memoria y un intento de logging en DB (`notifications_log`). Para producción es recomendable habilitar el almacenamiento de rate-limiter en DB (tabla `whatsapp_rate`) y ajustar límites.

Ejemplo: cómo llamar al endpoint cuando una orden se marca como completada (frontend / backend):

POST /api/orders/complete  (body JSON)
{
  "orderId": "order_123",
  "customerName": "Juan Perez",
  "customerPhone": "5491112345678"
}

El endpoint enviará un mensaje al número configurado en `ADMIN_WHATSAPP_NUMBER` con el nombre del cliente, teléfono y un link directo para ver la orden en el panel de admin.


## CONSIDERACIONES ESPECIALES:

1. **Parsing CSV:** El CSV usa encoding ANSI y punto y coma como delimitador
2. **Variantes:** Implementar lógica para agrupar variantes del mismo producto
3. **Imágenes:** Usar Google Drive API para obtener URLs de imágenes públicas
4. **Precios:** Convertir formato europeo (5.900,00) a formato numérico
5. **Persistencia:** Los carritos deben persistir en base de datos, no solo en localStorage
6. **Persistencia:** Las imagenes de productos no deben ser consultadas a drive con cada usuario entrando al sitio, se debe consultar una vez para obtener las imagenes en el servidor que lo dara a los clientes, y se renueva segun lo dicte el admin
7. **WhatsApp:** Implementar rate limiting para evitar spam de notificaciones

Por favor, genera la arquitectura completa del proyecto con:
- Estructura de carpetas para Next.js 15 App Router
- Componentes principales (Server y Client Components)
- API routes necesarios
- Base de datos, Drizzle ORM y Drizzle Kit para migrations
- Configuración de Cloudflare Pages
- Código inicial para el parser de CSV y conexión con Google Drive
- Sistema de autenticación con NextAuth.js
- Integración con WhatsApp API