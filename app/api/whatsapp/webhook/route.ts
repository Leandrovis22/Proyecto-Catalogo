import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/services/whatsapp';

export const runtime = 'edge';

// GET: Verificación del webhook
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (!mode || !token || !challenge) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
  }

  const whatsappService = new WhatsAppService();
  const verifiedChallenge = await whatsappService.verifyWebhook(mode, token, challenge);

  if (verifiedChallenge) {
    return new NextResponse(verifiedChallenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verificación fallida' }, { status: 403 });
}

// POST: Recibir notificaciones de WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log para debugging (opcional)
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Aquí puedes procesar mensajes entrantes si lo necesitas en el futuro
    
    return NextResponse.json({ message: 'Webhook procesado' }, { status: 200 });
  } catch (error) {
    console.error('Error en webhook:', error);
    return NextResponse.json({ error: 'Error procesando webhook' }, { status: 500 });
  }
}