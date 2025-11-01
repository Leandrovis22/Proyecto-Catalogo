import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    // Validar filename (seguridad)
    if (!/^[a-z0-9\-]+\.(jpg|jpeg|png|webp|gif)$/i.test(filename)) {
      return new Response('Invalid filename', { status: 400 });
    }
    // Obtener R2 bucket
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const { env } = getRequestContext();
    if (!env.PRODUCT_IMAGES) {
      return new Response('R2 bucket not configured', { status: 500 });
    }
    const bucket = env.PRODUCT_IMAGES;
    // Obtener imagen desde R2
    const object = await bucket.get(filename);
    if (!object) {
      return new Response('Image not found', { status: 404 });
    }
    // Servir imagen con cache headers
    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    if (object.httpMetadata?.cacheControl) {
      headers.set('Cache-Control', object.httpMetadata.cacheControl);
    }
    if (object.etag) {
      headers.set('ETag', object.etag);
    }
    return new Response(object.body, { headers });
  } catch (error) {
    console.error('Error serving image from R2:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
