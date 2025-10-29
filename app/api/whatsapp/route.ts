import { NextResponse } from 'next/server'
import { sendOrderNotification, sendWhatsAppCloud } from '../../../lib/whatsapp'

export async function POST(req: Request) {
  const body = await req.json()
  const { adminNumber, message, orderId, customerName, customerPhone } = body
  if (orderId && customerName && customerPhone) {
    // prefer structured order notification
    try {
      await sendOrderNotification({ id: orderId, customerName, customerPhone })
      return NextResponse.json({ ok: true })
    } catch (err) {
      return NextResponse.json({ error: String(err) }, { status: 500 })
    }
  }

  if (!adminNumber || !message) return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  try {
    await sendWhatsAppCloud(adminNumber, message)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
