import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  // Return current user's cart (requires auth)
  return NextResponse.json({ items: [] })
}

export async function POST(req: Request) {
  // Add item to cart
  const body = await req.json()
  return NextResponse.json({ ok: true, item: body })
}

export async function PUT(req: Request) {
  // Update cart (quantities, remove items)
  const body = await req.json()
  return NextResponse.json({ ok: true, cart: body })
}
