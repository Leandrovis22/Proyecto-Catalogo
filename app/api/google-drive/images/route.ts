import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { productImages, products } from '@/lib/db/schema';
import { GoogleDriveService } from '@/lib/services/google-drive';
import { eq } from 'drizzle-orm';
import getServerSession from 'next-auth';
import { getAuthOptions } from '@/lib/auth/config';

export const runtime = 'nodejs';

// POST: Sincronizar imágenes desde Google Drive
export async function POST(request: NextRequest) {
  try {
    // Asegúrate de que la base de datos esté inicializada
    const db = globalThis.DB || getDb();

    const session: any = await getServerSession(getAuthOptions(db));

    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    if (!folderId) {
      return NextResponse.json({ error: 'Folder ID no configurado' }, { status: 500 });
    }

    const driveService = new GoogleDriveService();
    const imageMap = await driveService.syncProductImages(folderId);

    let syncedCount = 0;

    // Actualizar productos con las URLs de las imágenes
    for (const [slug, url] of imageMap.entries()) {
      const product = await db.select().from(products).where(eq(products.slug, slug)).get();

      if (product) {
        // Actualizar URL principal del producto
        await db.update(products).set({ imageUrl: url }).where(eq(products.id, product.id));

        // Guardar en caché de imágenes
        await db.insert(productImages).values({
          productId: product.id,
          googleDriveId: slug,
          url,
          isPrimary: true,
          cachedAt: new Date(),
        });

        syncedCount++;
      }
    }

    return NextResponse.json({
      message: 'Imágenes sincronizadas exitosamente',
      syncedCount,
      totalImages: imageMap.size,
    });
  } catch (error) {
    console.error('Error sincronizando imágenes:', error);
    return NextResponse.json({ error: 'Error al sincronizar imágenes' }, { status: 500 });
  }
}