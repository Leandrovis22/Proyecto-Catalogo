import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  // Admin: list orders
  return NextResponse.json({ orders: [] })
}

export async function POST(req: Request) {
  // Create an order from a cart
  const body = await req.json()
  return NextResponse.json({ ok: true, order: { ...body, id: 'order_123' } })
}

export async function PUT(req: Request) {
  // Update order status (admin)
  const body = await req.json()
  return NextResponse.json({ ok: true, order: body })
}
