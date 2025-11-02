import { NextRequest } from 'next/server';

export const runtime = 'edge'; // Edge para acceder a R2

interface UploadRequest {
  slug: string;
  imageUrl: string;
  googleDriveId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as UploadRequest;
    const { slug, imageUrl, googleDriveId } = body;

    if (!slug || !imageUrl) {
      return Response.json({ error: 'slug e imageUrl son requeridos' }, { status: 400 });
    }

    // 1. Obtener R2 bucket desde bindings
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const { env } = getRequestContext();

    if (!env.PRODUCT_IMAGES) {
      return Response.json({ 
        error: 'R2 bucket no configurado',
        details: { r2: !!env.PRODUCT_IMAGES }
      }, { status: 500 });
    }

    const r2Bucket = env.PRODUCT_IMAGES;

    // 2. Descargar imagen desde Google Drive
    console.log(`📥 Descargando imagen: ${slug} desde ${imageUrl}`);
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Error descargando imagen: HTTP ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // 3. Detectar extensión
    const ext = contentType.includes('png') ? 'png' : 
                contentType.includes('webp') ? 'webp' : 
                contentType.includes('gif') ? 'gif' : 'jpg';
    
    const filename = `${slug}.${ext}`;

    // 4. Subir a R2
    await r2Bucket.put(filename, arrayBuffer, {
      httpMetadata: {
        contentType,
      },
    });

    const finalUrl = `/api/images/${filename}`;
    console.log(`✅ Imagen subida a R2: ${filename}`);

    // 5. Retornar resultado
    return Response.json({
      success: true,
      slug,
      filename,
      url: finalUrl,
      googleDriveId,
    });

  } catch (error) {
    console.error('❌ Error subiendo a R2:', error);
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
