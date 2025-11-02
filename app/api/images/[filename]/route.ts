import { NextRequest, NextResponse } from 'next/server';
import { getR2 } from '@/lib/cloudflare';
import { getImageFromR2 } from '@/lib/r2';

export const runtime = 'edge'; // Edge runtime para R2

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;

    if (!filename) {
      return new NextResponse('Filename required', { status: 400 });
    }

    const r2 = getR2();
    const object = await getImageFromR2(r2, filename);

    if (!object) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable'); // Cache 1 año
    headers.set('ETag', object.etag);

    return new NextResponse(object.body, {
      headers,
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
