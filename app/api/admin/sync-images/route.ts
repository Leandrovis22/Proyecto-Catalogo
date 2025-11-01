import { NextRequest } from 'next/server';
import { getProductImagesFromDrive } from '@/lib/services/google-drive';
import { getDb } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // TODO: Verificar autenticación de admin aquí
    // const session = await getServerSession(authOptions);
    // if (!session?.user || session.user.role !== 'admin') {
    //   return Response.json({ error: 'No autorizado' }, { status: 401 });
    // }

    // 1. Obtener bindings de Cloudflare
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const { env } = getRequestContext();

    if (!env.DB || !env.PRODUCT_IMAGES) {
      return Response.json({ 
        error: 'Bindings de Cloudflare no configurados',
        details: {
          db: !!env.DB,
          r2: !!env.PRODUCT_IMAGES,
        }
      }, { status: 500 });
    }

    const db = getDb(env.DB);
    const r2Bucket = env.PRODUCT_IMAGES;

    // 2. Validar configuración de Google Drive
    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const driveAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
    };

    if (!driveFolderId || !driveAuthConfig.clientId || !driveAuthConfig.clientSecret || 
        !driveAuthConfig.redirectUri || !driveAuthConfig.refreshToken) {
      return Response.json({ 
        error: 'Configuración de Google Drive incompleta',
        details: {
          folderId: !!driveFolderId,
          clientId: !!driveAuthConfig.clientId,
          clientSecret: !!driveAuthConfig.clientSecret,
          redirectUri: !!driveAuthConfig.redirectUri,
          refreshToken: !!driveAuthConfig.refreshToken,
        }
      }, { status: 500 });
    }

    // 3. Obtener imágenes desde Google Drive
    console.log('📸 Obteniendo lista de imágenes desde Google Drive...');
    const images = await getProductImagesFromDrive(driveFolderId, driveAuthConfig);
    console.log(`✅ ${images.length} imágenes encontradas`);

    // 4. Descargar y subir a R2
    let downloaded = 0;
    let errors = 0;
    const processedImages: { slug: string; localUrl: string }[] = [];

    for (const img of images) {
      try {
        console.log(`📥 Procesando: ${img.slug}...`);
        
        // Descargar desde Google Drive
        const response = await fetch(img.url);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        // Detectar extensión
        const ext = contentType.includes('png') ? 'png' : 
                    contentType.includes('webp') ? 'webp' : 
                    contentType.includes('gif') ? 'gif' : 'jpg';
        
        const filename = `${img.slug}.${ext}`;

        // Subir a R2
        await r2Bucket.put(filename, arrayBuffer, {
          httpMetadata: {
            contentType,
          },
        });

        const localUrl = `/api/images/${filename}`;
        processedImages.push({ slug: img.slug, localUrl });

        downloaded++;
        console.log(`✅ Guardado en R2: ${filename}`);

      } catch (error) {
        console.error(`❌ Error con ${img.slug}:`, error);
        errors++;
      }
    }

    // 5. Actualizar URLs en la base de datos
    console.log('💾 Actualizando URLs en base de datos...');
    let updated = 0;

    for (const { slug, localUrl } of processedImages) {
      try {
        const [product] = await db
          .select()
          .from(schema.products)
          .where(eq(schema.products.slug, slug))
          .limit(1);

        if (product) {
          // Actualizar producto
          await db
            .update(schema.products)
            .set({ image_url: localUrl })
            .where(eq(schema.products.id, product.id));

          // Actualizar productImages (buscar por product_id primero)
          const [existingImage] = await db
            .select()
            .from(schema.productImages)
            .where(eq(schema.productImages.product_id, product.id))
            .limit(1);

          if (existingImage) {
            await db
              .update(schema.productImages)
              .set({
                url: localUrl,
                cached_at: Math.floor(Date.now() / 1000),
              })
              .where(eq(schema.productImages.id, existingImage.id));
          } else {
            await db.insert(schema.productImages).values({
              product_id: product.id,
              google_drive_id: slug,
              url: localUrl,
              is_primary: true,
              cached_at: Math.floor(Date.now() / 1000),
            });
          }

          updated++;
        }
      } catch (dbError) {
        console.error(`❌ Error actualizando DB para ${slug}:`, dbError);
      }
    }

    console.log('🎉 Sincronización completada');

    return Response.json({
      success: true,
      stats: {
        found: images.length,
        downloaded,
        errors,
        dbUpdated: updated,
      }
    });

  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    return Response.json({
      error: 'Error sincronizando imágenes',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
