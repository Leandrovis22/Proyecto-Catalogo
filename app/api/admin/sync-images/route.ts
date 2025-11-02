import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb, getR2 } from '@/lib/cloudflare';
import { products, syncLogs } from '@/lib/db/schema';
import {
  listDriveImages,
  downloadDriveImage,
  extractSlugFromFilename,
} from '@/lib/google-drive';
import {
  listImagesInR2,
  uploadImageToR2,
  deleteImageFromR2,
} from '@/lib/r2';
import { eq, isNull } from 'drizzle-orm';

export const runtime = 'nodejs'; // Necesario para Google Drive API
export const maxDuration = 300; // 5 minutos para la sincronización

interface SyncResult {
  uploaded: number;
  deleted: number;
  skipped: number;
  errors: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
      return NextResponse.json(
        { error: 'Google Drive folder ID not configured' },
        { status: 500 }
      );
    }

    const db = getDb();
    const r2 = getR2();

    const result: SyncResult = {
      uploaded: 0,
      deleted: 0,
      skipped: 0,
      errors: [],
    };

    // 1. Listar imágenes en Drive
    const driveImages = await listDriveImages(folderId);
    console.log(`Found ${driveImages.length} images in Google Drive`);

    // 2. Listar imágenes en R2
    const r2Objects = await listImagesInR2(r2);
    const r2Images = new Map(
      r2Objects.objects.map((obj: { key: string; etag: string }) => [obj.key, obj.etag])
    );

    // 3. Crear un mapa de slugs de Drive
    const driveImageMap = new Map(
      driveImages.map((img) => [extractSlugFromFilename(img.name), img])
    );

    // 4. Sincronizar: Drive → R2
    for (const driveImage of driveImages) {
      try {
        const slug = extractSlugFromFilename(driveImage.name);
        const r2Key = `${slug}.jpg`; // Normalizar extensión

        // Verificar si la imagen cambió comparando MD5
        const r2Etag = r2Images.get(r2Key);
        const driveHash = driveImage.md5Checksum;

        if (r2Etag && r2Etag === `"${driveHash}"`) {
          // Imagen no cambió, skip
          result.skipped++;
          continue;
        }

        // Descargar de Drive
        console.log(`Downloading ${driveImage.name} from Drive...`);
        const imageData = await downloadDriveImage(driveImage.id);

        // Subir a R2
        console.log(`Uploading ${r2Key} to R2...`);
        await uploadImageToR2(r2, r2Key, imageData, 'image/jpeg');

        // Actualizar URL en productos con este slug
        await db
          .update(products)
          .set({ imageUrl: `/api/images/${r2Key}` })
          .where(eq(products.slug, slug));

        result.uploaded++;

        // Log exitoso
        await db.insert(syncLogs).values({
          type: 'success',
          message: `Synced image: ${driveImage.name}`,
          details: JSON.stringify({ slug, driveId: driveImage.id }),
        });
      } catch (error) {
        const errorMsg = `Failed to sync ${driveImage.name}: ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);

        // Log error
        await db.insert(syncLogs).values({
          type: 'error',
          message: errorMsg,
          details: JSON.stringify({ image: driveImage }),
        });
      }
    }

    // 5. Eliminar de R2 las imágenes que ya no están en Drive
    for (const [r2Key] of r2Images) {
      const slug = (r2Key as string).replace(/\.(jpg|jpeg|png|webp)$/i, '');

      if (!driveImageMap.has(slug)) {
        try {
          console.log(`Deleting ${r2Key} from R2 (not in Drive)...`);
          await deleteImageFromR2(r2, r2Key as string);

          // Limpiar imageUrl en productos con este slug
          await db
            .update(products)
            .set({ imageUrl: null })
            .where(eq(products.slug, slug));

          result.deleted++;

          // Log
          await db.insert(syncLogs).values({
            type: 'success',
            message: `Deleted orphaned image: ${r2Key}`,
            details: JSON.stringify({ slug }),
          });
        } catch (error) {
          const errorMsg = `Failed to delete ${r2Key}: ${error}`;
          result.errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
    }

    // 6. Verificar productos sin imagen
    const productsWithoutImage = await db
      .select()
      .from(products)
      .where(isNull(products.imageUrl));

    if (productsWithoutImage.length > 0) {
      const warningMsg = `${productsWithoutImage.length} products have no associated image`;
      await db.insert(syncLogs).values({
        type: 'warning',
        message: warningMsg,
        details: JSON.stringify({
          slugs: productsWithoutImage.map((p) => p.slug),
        }),
      });
    }

    return NextResponse.json({
      success: true,
      result,
      productsWithoutImage: productsWithoutImage.length,
    });
  } catch (error) {
    console.error('Error syncing images:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
