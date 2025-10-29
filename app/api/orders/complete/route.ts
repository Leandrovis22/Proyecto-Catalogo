import { NextResponse } from 'next/server'
import { sendOrderNotification } from '../../../../lib/whatsapp'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { orderId, customerName, customerPhone } = body
    if (!orderId || !customerName || !customerPhone) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const result = await sendOrderNotification({ id: orderId, customerName, customerPhone })
    return NextResponse.json({ ok: true, result })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
