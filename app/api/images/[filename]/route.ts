import { NextRequest, NextResponse } from 'next/server';
import { getImageFromR2, getImageMetadataFromR2 } from '@/lib/r2-client';

export const runtime = 'nodejs'; // Cambiado a nodejs para usar AWS SDK

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    if (!filename) {
      return new NextResponse('Filename required', { status: 400 });
    }

    // Obtener metadata para ETag
    const metadata = await getImageMetadataFromR2(filename);
    
    if (!metadata) {
      return new NextResponse('Image not found', { status: 404 });
    }

    // Verificar si el cliente tiene la versión actual (If-None-Match)
    const clientETag = request.headers.get('if-none-match');
    if (clientETag && clientETag === metadata.etag) {
      return new NextResponse(null, { status: 304 }); // Not Modified
    }

    // Descargar imagen
    const imageBuffer = await getImageFromR2(filename);

    if (!imageBuffer) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', metadata.contentType || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=86400, must-revalidate'); // 24h con revalidación
    headers.set('ETag', metadata.etag);

    return new NextResponse(new Uint8Array(imageBuffer), {
      headers,
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
