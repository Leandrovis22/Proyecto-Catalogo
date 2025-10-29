import { NextResponse } from 'next/server'
import { parseTiendaNubeCSV } from '../../../../lib/csvParser'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as unknown as File
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const products = await parseTiendaNubeCSV(arrayBuffer)

    // TODO: persist products to DB (drizzle)

    return NextResponse.json({ imported: products.length, products })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
