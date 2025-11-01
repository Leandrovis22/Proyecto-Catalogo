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
    let r2Bucket; // ✅ NUEVO: Binding R2
    
    if (process.env.NODE_ENV === 'production') {
      const { getRequestContext } = await import('@cloudflare/next-on-pages');
      const { env } = getRequestContext();
      
      if (!env.DB) {
        return Response.json({ error: 'No se encontró el binding DB en Cloudflare' }, { status: 500 });
      }
      
      if (!env.PRODUCT_IMAGES) {
        return Response.json({ error: 'No se encontró el binding PRODUCT_IMAGES (R2)' }, { status: 500 });
      }
      
      db = getDb(env.DB);
      r2Bucket = env.PRODUCT_IMAGES; // ✅ NUEVO
    } else {
      db = getDb();
      r2Bucket = null; // En local no usamos R2 (o usar miniflare)
    }

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

    // 6. ✅ NUEVO: Sync images from Google Drive → R2
    console.log('🖼️ Sincronizando imágenes desde Google Drive...');
    
    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const driveAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
    };

    if (!driveFolderId || !driveAuthConfig.clientId || !driveAuthConfig.clientSecret || 
        !driveAuthConfig.redirectUri || !driveAuthConfig.refreshToken) {
      console.warn('⚠️ Credenciales de Google Drive incompletas, saltando sincronización de imágenes');
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

            if (!product) {
              console.warn(`⚠️ No se encontró producto con slug: ${img.slug}`);
              imageErrors++;
              continue;
            }

            let finalImageUrl = img.url; // Default: URL de Google Drive

            // ✅ NUEVO: Si estamos en producción, descargar y subir a R2
            if (r2Bucket) {
              try {
                console.log(`📥 Descargando imagen desde Drive: ${img.slug}...`);
                
                // Descargar imagen desde Google Drive
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

                // ✅ Subir a R2
                await r2Bucket.put(filename, arrayBuffer, {
                  httpMetadata: {
                    contentType,
                  },
                });

                // Actualizar URL para que apunte a nuestra API
                finalImageUrl = `/api/images/${filename}`;
                console.log(`✅ Imagen subida a R2: ${filename}`);

              } catch (r2Error) {
                console.error(`⚠️ Error subiendo ${img.slug} a R2:`, r2Error);
                // Fallback: usar URL de Google Drive
                console.log(`   ↳ Usando URL de Google Drive como fallback`);
              }
            }

            // Insertar en productImages
            await db.insert(schema.productImages).values({
              product_id: product.id,
              google_drive_id: img.googleDriveId,
              url: finalImageUrl, // ✅ URL actualizada (R2 o Drive)
              is_primary: true,
              cached_at: Math.floor(Date.now() / 1000),
            });

            // Actualizar imageUrl del producto
            await db
              .update(schema.products)
              .set({ image_url: finalImageUrl })
              .where(eq(schema.products.id, product.id));

            imagesLinked++;
            console.log(`✅ Imagen vinculada: ${img.slug} → ${product.name}`);

          } catch (linkError) {
            console.error(`❌ Error vinculando imagen ${img.slug}:`, linkError);
            imageErrors++;
          }
        }

        console.log(`✅ Imágenes procesadas: ${imagesLinked} vinculadas, ${imageErrors} errores`);

      } catch (imageError) {
        console.error('⚠️ Error sincronizando imágenes desde Google Drive:');
        console.error(imageError);
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