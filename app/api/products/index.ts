import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { products, productVariants } from '@/lib/db/schema';
import { eq, like, and } from 'drizzle-orm';

export const runtime = 'edge';

// GET: Obtener productos con filtros
export async function GET(request: NextRequest) {
  try {
    // @ts-ignore
    const db = getDb(request.env.DB);

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    const conditions = [];

    if (search) {
      conditions.push(like(products.name, `%${search}%`));
    }

    if (category) {
      conditions.push(like(products.categories, `%${category}%`));
    }

    const productsList = await db
      .select()
      .from(products)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .all();

    // Obtener variantes para cada producto
    const productsWithVariants = await Promise.all(
      productsList.map(async (product) => {
        const variants = await db
          .select()
          .from(productVariants)
          .where(eq(productVariants.productId, product.id))
          .all();

        return {
          ...product,
          variants,
        };
      })
    );

    return NextResponse.json({ products: productsWithVariants });
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}