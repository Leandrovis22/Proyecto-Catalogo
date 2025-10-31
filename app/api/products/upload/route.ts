// app/api/products/upload/route.ts
import { NextRequest } from 'next/server';
import Papa from 'papaparse';
import { getProductImagesFromDrive } from '@/lib/services/google-drive';
import { getDb } from '@/lib/db';
import * as schema from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';

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
    
    // ✅ Corrección: Tipado explícito para Papa.parse
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

    // 2. Get DB instance (híbrido)
    let db;
    if (process.env.NODE_ENV === 'production') {
      const { getRequestContext } = await import('@cloudflare/next-on-pages');
      const { env } = getRequestContext();
      if (!env.DB) {
        return Response.json({ error: 'No se encontró el binding DB en Cloudflare' }, { status: 500 });
      }
      db = getDb(env.DB);
    } else {
      db = getDb();
    }

    // 3. Delete all existing data (en orden correcto por foreign keys)
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

    // 5. Insert products and variants (SECUENCIALMENTE)
    console.log('💾 Insertando productos y variantes...');
    let insertedCount = 0;
    let variantsCount = 0;

    for (const [slug, productData] of productsMap.entries()) {
      const base = productData.base;
      
      console.log(`📝 Insertando producto: ${slug}`);

      try {
        // Helper para parsear números de forma segura
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

        // Insertar producto y obtener ID inmediatamente con .returning()
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
          image_url: null, // Se actualizará después con Google Drive
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

        // Insertar variantes para este producto
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

    // 6. Sync images from Google Drive
    console.log('🖼️ Sincronizando imágenes desde Google Drive...');
    
    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const driveAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
    };

    // Validar configuración de Google Drive
    if (!driveFolderId) {
      console.warn('⚠️ GOOGLE_DRIVE_FOLDER_ID no configurado, saltando sincronización de imágenes');
    } else if (!driveAuthConfig.clientId || !driveAuthConfig.clientSecret || 
               !driveAuthConfig.redirectUri || !driveAuthConfig.refreshToken) {
      console.warn('⚠️ Credenciales de Google Drive incompletas:');
      console.warn(`   - clientId: ${driveAuthConfig.clientId ? '✓' : '✗'}`);
      console.warn(`   - clientSecret: ${driveAuthConfig.clientSecret ? '✓' : '✗'}`);
      console.warn(`   - redirectUri: ${driveAuthConfig.redirectUri ? '✓' : '✗'}`);
      console.warn(`   - refreshToken: ${driveAuthConfig.refreshToken ? '✓' : '✗'}`);
      console.warn('   Saltando sincronización de imágenes');
    } else {
      try {
        const images = await getProductImagesFromDrive(driveFolderId, driveAuthConfig);
        console.log(`📸 ${images.length} imágenes encontradas en Google Drive`);

        let imagesLinked = 0;
        let imageErrors = 0;

        for (const img of images) {
          try {
            // Buscar producto por slug
            const [product] = await db
              .select()
              .from(schema.products)
              .where(eq(schema.products.slug, img.slug))
              .limit(1);

            if (product) {
              // Insertar en productImages
              await db.insert(schema.productImages).values({
                product_id: product.id,
                google_drive_id: img.googleDriveId,
                url: img.url,
                is_primary: true,
                cached_at: img.cachedAt,
              });

              // Actualizar imageUrl del producto
              await db
                .update(schema.products)
                .set({ image_url: img.url })
                .where(eq(schema.products.id, product.id));

              imagesLinked++;
              console.log(`✅ Imagen vinculada: ${img.slug} → ${product.name}`);
            } else {
              console.warn(`⚠️ No se encontró producto con slug: ${img.slug}`);
              imageErrors++;
            }
          } catch (linkError) {
            console.error(`❌ Error vinculando imagen ${img.slug}:`, linkError);
            imageErrors++;
          }
        }

        console.log(`✅ Imágenes procesadas: ${imagesLinked} vinculadas, ${imageErrors} errores`);

      } catch (imageError) {
        console.error('⚠️ Error sincronizando imágenes desde Google Drive:');
        console.error(imageError);
        
        if (imageError instanceof Error) {
          if (imageError.message.includes('invalid_grant')) {
            console.error('💡 Solución: El refresh token es inválido o expiró. Genera uno nuevo.');
          } else if (imageError.message.includes('insufficient permissions')) {
            console.error('💡 Solución: Verifica que la API tenga permisos de lectura en Google Drive.');
          } else if (imageError.message.includes('quota')) {
            console.error('💡 Solución: Se excedió la cuota de Google Drive. Intenta más tarde.');
          }
        }
        
        // No lanzar error, permitir que la importación continúe sin imágenes
        console.warn('⚠️ Continuando sin imágenes...');
      }
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