import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { carts, cartItems, products, productVariants } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import getServerSession from 'next-auth';
import { getAuthOptions } from '@/lib/auth/config';

export const runtime = 'edge';

// GET: Obtener carrito del usuario
export async function GET(request: NextRequest) {
  try {
    // @ts-ignore
    const db = getDb(request.env.DB);
    const authOptions = getAuthOptions(db);
    const session: any = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id);

    // Buscar o crear carrito activo
    let cart = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, userId), eq(carts.status, 'active')))
      .get();

    if (!cart) {
      cart = await db.insert(carts).values({
        userId,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning().get();
    }

    // Obtener items del carrito con detalles de productos
    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cart.id))
      .all();

    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        const product = await db
          .select()
          .from(products)
          .where(eq(products.id, item.productId))
          .get();

        let variant = null;
        if (item.variantId) {
          variant = await db
            .select()
            .from(productVariants)
            .where(eq(productVariants.id, item.variantId))
            .get();
        }

        return {
          ...item,
          product,
          variant,
        };
      })
    );

    return NextResponse.json({ cart, items: itemsWithDetails });
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    return NextResponse.json({ error: 'Error al obtener carrito' }, { status: 500 });
  }
}