// app/api/products/upload/route.ts
import { NextRequest } from 'next/server';
import Papa from 'papaparse';
import { getDb } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs'; // Node.js para googleapis

export async function POST(request: NextRequest) {
  try {
    // 1. Parse CSV from form-data
    console.log('📄 Recibiendo archivo CSV...');
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 });
    }

    let csvText = '';
    if (typeof file === 'string') {
      csvText = file;
    } else if (file instanceof Blob) {
      csvText = await file.text();
    } else {
      return Response.json({ error: 'Formato de archivo no soportado' }, { status: 400 });
    }

    console.log('📊 Parseando CSV...');
    
    const parseResult = Papa.parse<Record<string, string>>(csvText, { 
      header: true, 
      delimiter: ';',
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (header: string) => header.trim(),
    });

    const typedRows = parseResult.data;

    if (typedRows.length === 0) {
      return Response.json({ error: 'El archivo CSV está vacío' }, { status: 400 });
    }

    console.log(`✅ ${typedRows.length} filas parseadas`);

    // 2. Get DB instance
    const db = getDb();

    // 3. Delete all existing data
    console.log('🗑️ Limpiando base de datos...');
    await db.delete(schema.productImages);
    await db.delete(schema.cartItems);
    await db.delete(schema.productVariants);
    await db.delete(schema.products);
    console.log('✅ Base de datos limpia');

    // 4. Group rows by slug
    console.log('📦 Agrupando productos por slug...');
    const productsMap = new Map<string, { 
      base: Record<string, string>, 
      variants: Record<string, string>[] 
    }>();
    
    for (const row of typedRows) {
      const slug = row['Identificador de URL']?.trim();
      
      if (!slug) {
        console.warn('⚠️ Fila sin slug, saltando:', row['Nombre'] || 'Sin nombre');
        continue;
      }

      if (!productsMap.has(slug)) {
        productsMap.set(slug, { base: row, variants: [] });
      }
      
      productsMap.get(slug)!.variants.push(row);
    }

    console.log(`✅ ${productsMap.size} productos únicos encontrados`);

    // 5. Insert products and variants
    console.log('💾 Insertando productos y variantes...');
    let insertedCount = 0;
    let variantsCount = 0;

    for (const [slug, productData] of productsMap.entries()) {
      const base = productData.base;
      
      console.log(`📝 Insertando producto: ${slug}`);

      try {
        const parseNumber = (value: string | undefined | null, defaultValue = 0): number => {
          if (!value) return defaultValue;
          const parsed = parseFloat(value);
          return isNaN(parsed) ? defaultValue : parsed;
        };

        const parseInt = (value: string | undefined | null, defaultValue = 0): number => {
          if (!value) return defaultValue;
          const parsed = Number.parseInt(value, 10);
          return isNaN(parsed) ? defaultValue : parsed;
        };

        const [insertedProduct] = await db.insert(schema.products).values({
          slug,
          name: base['Nombre']?.trim() || 'Sin nombre',
          description: base['Descripción']?.trim() || null,
          categories: base['Categorías'] 
            ? JSON.stringify(base['Categorías'].split(',').map(c => c.trim())) 
            : '[]',
          price: parseNumber(base['Precio']),
          promotional_price: base['Precio promocional'] 
            ? parseNumber(base['Precio promocional']) 
            : null,
          stock: parseInt(base['Stock']),
          sku: base['SKU']?.trim() || null,
          brand: base['Marca']?.trim() || null,
          image_url: null,
          show_in_store: true,
          free_shipping: base['Envío gratis']?.toLowerCase() === 'sí',
        }).returning();

        if (!insertedProduct?.id) {
          console.error(`❌ Error: No se pudo insertar el producto ${slug}`);
          continue;
        }

        const productId = insertedProduct.id;
        insertedCount++;
        console.log(`✅ Producto insertado con ID: ${productId}`);

        for (const variant of productData.variants) {
          try {
            await db.insert(schema.productVariants).values({
              product_id: productId,
              property1_name: variant['Nombre de propiedad 1']?.trim() || null,
              property1_value: variant['Valor de propiedad 1']?.trim() || null,
              property2_name: variant['Nombre de propiedad 2']?.trim() || null,
              property2_value: variant['Valor de propiedad 2']?.trim() || null,
              property3_name: variant['Nombre de propiedad 3']?.trim() || null,
              property3_value: variant['Valor de propiedad 3']?.trim() || null,
              price: parseNumber(variant['Precio']),
              stock: parseInt(variant['Stock']),
              sku: variant['SKU']?.trim() || null,
            });
            variantsCount++;
          } catch (variantError) {
            console.error(`❌ Error insertando variante para producto ${productId}:`, variantError);
          }
        }

        console.log(`✅ ${productData.variants.length} variantes insertadas para ${slug}`);

      } catch (productError) {
        console.error(`❌ Error insertando producto ${slug}:`, productError);
        continue;
      }
    }

    console.log(`✅ Total insertado: ${insertedCount} productos, ${variantsCount} variantes`);

    // 6. Sincronizar imágenes llamando al endpoint Edge
    console.log('🖼️ Sincronizando imágenes desde Google Drive → R2...');
    
    try {
      const syncResponse = await fetch(`${request.nextUrl.origin}/api/admin/sync-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!syncResponse.ok) {
        const error = await syncResponse.json();
        console.error('⚠️ Error sincronizando imágenes:', error);
        console.warn('⚠️ Productos insertados pero sin imágenes');
      } else {
        const syncResult = await syncResponse.json();
        console.log(`✅ Imágenes sincronizadas: ${syncResult.stats?.downloaded || 0} descargadas, ${syncResult.stats?.dbUpdated || 0} actualizadas en DB`);
      }
    } catch (syncError) {
      console.error('⚠️ Error llamando a sync-images:', syncError);
      console.warn('⚠️ Productos insertados pero sin imágenes');
    }

    // 7. Respuesta exitosa
    return Response.json({ 
      success: true,
      message: 'Productos importados exitosamente',
      stats: {
        products: insertedCount,
        variants: variantsCount,
        csvRows: typedRows.length,
        uniqueProducts: productsMap.size,
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Error crítico procesando CSV:');
    console.error(error);
    
    return Response.json({ 
      error: 'Error procesando archivo CSV',
      details: error instanceof Error ? error.message : 'Error desconocido',
      stack: process.env.NODE_ENV === 'development' && error instanceof Error 
        ? error.stack 
        : undefined
    }, { status: 500 });
  }
}