import { NextRequest } from 'next/server';
import { getProductImagesFromDrive } from '@/lib/services/google-drive';
import { getDb } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs'; // Node.js para googleapis (no soporta edge)

export async function POST(request: NextRequest) {
  try {
    // TODO: Verificar autenticación de admin aquí
    // const session = await getServerSession(authOptions);
    // if (!session?.user || session.user.role !== 'admin') {
    //   return Response.json({ error: 'No autorizado' }, { status: 401 });
    // }

    // 1. Obtener DB instance
    const db = getDb();

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

    // 4. Subir a R2 usando endpoint edge
    let downloaded = 0;
    let errors = 0;
    const processedImages: { slug: string; localUrl: string; googleDriveId: string }[] = [];

    for (const img of images) {
      try {
        console.log(`📥 Procesando: ${img.slug}...`);
        
        // Llamar al endpoint edge para subir a R2
        const uploadResponse = await fetch(`${request.nextUrl.origin}/api/admin/upload-to-r2`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug: img.slug,
            imageUrl: img.url,
            googleDriveId: img.googleDriveId,
          }),
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.error || `HTTP ${uploadResponse.status}`);
        }

        const uploadResult = await uploadResponse.json();
        
        processedImages.push({
          slug: img.slug,
          localUrl: uploadResult.url,
          googleDriveId: img.googleDriveId,
        });

        downloaded++;
        console.log(`✅ Imagen subida a R2: ${img.slug}`);

      } catch (error) {
        console.error(`❌ Error con ${img.slug}:`, error);
        errors++;
      }
    }

    // 5. Actualizar URLs en la base de datos
    console.log('💾 Actualizando URLs en base de datos...');
    let updated = 0;

    for (const { slug, localUrl, googleDriveId } of processedImages) {
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
              google_drive_id: googleDriveId,
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
