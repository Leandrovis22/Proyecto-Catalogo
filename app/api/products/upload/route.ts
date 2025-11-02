import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getD1 } from '@/lib/cloudflare';
import { getDb } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { parseTiendaNubeCSV, convertToANSI } from '@/lib/csv-parser';

export const runtime = 'nodejs'; // Necesario para Google Drive API

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener archivo
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Leer contenido del archivo
    const arrayBuffer = await file.arrayBuffer();
    const fileContent = convertToANSI(arrayBuffer);

    // Parsear CSV
    const { products: parsedProducts, errors: parseErrors } =
      await parseTiendaNubeCSV(fileContent);

    if (parseErrors.length > 0) {
      return NextResponse.json(
        {
          error: 'CSV parsing errors',
          details: parseErrors,
          productsCount: parsedProducts.length,
        },
        { status: 400 }
      );
    }

    if (parsedProducts.length === 0) {
      return NextResponse.json(
        { error: 'No products found in CSV' },
        { status: 400 }
      );
    }

    // Conectar a DB
    const d1 = getD1();
    const db = getDb(d1);

    // BORRAR todos los productos existentes
    await db.delete(products);

    // Insertar nuevos productos
    const insertedProducts = await db.insert(products).values(
      parsedProducts.map((p: typeof parsedProducts[0]) => ({
        slug: p.slug,
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock,
        variantName: p.variantName || null,
        variantValue: p.variantValue || null,
        imageUrl: null, // Se actualizará con sync-images
      }))
    ).returning();

    // Trigger sincronización de imágenes automáticamente
    try {
      const syncResponse = await fetch(
        `${process.env.NEXTAUTH_URL}/api/admin/sync-images`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: request.headers.get('cookie') || '',
          },
        }
      );

      if (!syncResponse.ok) {
        console.error('Image sync failed:', await syncResponse.text());
      }
    } catch (syncError) {
      console.error('Error triggering image sync:', syncError);
    }

    return NextResponse.json({
      success: true,
      productsImported: insertedProducts.length,
      message: `Successfully imported ${insertedProducts.length} products. Image synchronization started.`,
    });
  } catch (error) {
    console.error('Error uploading CSV:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
