import Papa from 'papaparse'
import iconv from 'iconv-lite'
import { Buffer } from 'buffer'

type RawRow = Record<string, string>

function parseEuropeanPrice(value: string | undefined) {
  if (!value) return 0
  // e.g. "5.900,00" -> 5900.00
  const cleaned = value.replace(/\./g, '').replace(/,/g, '.')
  const n = parseFloat(cleaned)
  return Number.isNaN(n) ? 0 : n
}

/**
 * Parse TiendaNube CSV (ANSI encoding, semicolon delimiter) and group variants
 * Returns an array of products with variants
 */
export async function parseTiendaNubeCSV(buffer: ArrayBuffer) {
  // Decode ANSI (Windows-1252) which is commonly used for TiendaNube CSVs
  const buf = Buffer.from(new Uint8Array(buffer))
  const str = iconv.decode(buf, 'win1252')

  const parsed = Papa.parse<RawRow>(str, {
    header: true,
    delimiter: ';',
    skipEmptyLines: true
  })

  const rows = parsed.data

  const productsMap: Record<string, any> = {}

  for (const row of rows) {
    const slug = (row['Identificador de URL'] || '').trim()
    if (!slug) continue

    if (!productsMap[slug]) {
      productsMap[slug] = {
        slug,
        name: row['Nombre'] || '',
        categories: (row['Categorías'] || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        description: row['Descripción'] || '',
        price: parseEuropeanPrice(row['Precio']),
        price_sale: parseEuropeanPrice(row['Precio promocional']),
        sku: row['SKU'] || '',
        stock: Number(row['Stock'] || 0),
        show: ((row['Mostrar en tienda'] || '').toUpperCase() === 'SI'),
        properties: [],
        variants: [] as any[]
      }
    }

    // Gather properties / variant-specific values
    const propNames = [
      'Nombre de propiedad 1',
      'Nombre de propiedad 2',
      'Nombre de propiedad 3'
    ]

    const propValues = [
      'Valor de propiedad 1',
      'Valor de propiedad 2',
      'Valor de propiedad 3'
    ]

    const variantProps: Record<string, string> = {}
    for (let i = 0; i < propNames.length; i++) {
      const nameKey = propNames[i]
      const valKey = propValues[i]
      const propName = (row[nameKey] || '').trim()
      const propVal = (row[valKey] || '').trim()
      if (propName && propVal) variantProps[propName] = propVal
    }

    // Add variant
    productsMap[slug].variants.push({
      sku: row['SKU'] || '',
      price: parseEuropeanPrice(row['Precio']),
      stock: Number(row['Stock'] || 0),
      properties: variantProps,
      barcode: row['Código de barras'] || ''
    })
  }

  // Convert map to array
  const products = Object.values(productsMap)
  return products
}
