import { NextRequest, NextResponse } from 'next/server';
import { getD1 } from '@/lib/cloudflare';
import { getDb } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { like, gt, or, and } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    const d1 = getD1();
    const db = getDb(d1);

    let query = db.select().from(products);

    // Solo productos con stock > 0
    const conditions: any[] = [gt(products.stock, 0)];

    // Filtro de búsqueda
    if (search) {
      conditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.slug, `%${search}%`)
        )
      );
    }

    // Filtro de categoría
    if (category) {
      conditions.push(like(products.category, `%${category}%`));
    }

    const result = await query.where(and(...conditions));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
