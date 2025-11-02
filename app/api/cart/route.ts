import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/cloudflare';
import { carts, cartItems, products } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const runtime = 'nodejs';

// Obtener carrito actual del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Buscar carrito activo
    const [cart] = await db
      .select()
      .from(carts)
      .where(
        and(
          eq(carts.userId, session.user.id),
          eq(carts.status, 'en_proceso')
        )
      )
      .limit(1);

    if (!cart) {
      return NextResponse.json({ items: [], total: 0 });
    }

    // Obtener items del carrito
    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cart.id));

    const total = items.reduce(
      (sum, item) => sum + (item.productSnapshot as any).price * item.quantity,
      0
    );

    return NextResponse.json({ cart, items, total });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Agregar producto al carrito
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { productId: number; quantity: number };
    const { productId, quantity } = body;

    console.log('Cart POST request:', { productId, quantity, userId: session.user.id });

    if (!productId || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid input', details: { productId, quantity } }, { status: 400 });
    }

    const db = getDb();

    // Verificar producto y stock
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Buscar o crear carrito activo
    let [cart] = await db
      .select()
      .from(carts)
      .where(
        and(
          eq(carts.userId, session.user.id),
          eq(carts.status, 'en_proceso')
        )
      )
      .limit(1);

    if (!cart) {
      const [newCart] = await db
        .insert(carts)
        .values({
          userId: session.user.id,
          status: 'en_proceso',
        })
        .returning();
      cart = newCart;
    }

    // Verificar si el producto ya está en el carrito
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, productId)
        )
      )
      .limit(1);

    if (existingItem) {
      // Actualizar cantidad
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.stock) {
        return NextResponse.json(
          { error: 'Insufficient stock' },
          { status: 400 }
        );
      }

      await db
        .update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existingItem.id));
    } else {
      // Crear nuevo item
      await db.insert(cartItems).values({
        cartId: cart.id,
        productId: product.id,
        productSnapshot: {
          slug: product.slug,
          name: product.name,
          price: product.price,
          variantName: product.variantName || undefined,
          variantValue: product.variantValue || undefined,
          imageUrl: product.imageUrl || undefined,
        },
        quantity,
      });
    }

    // Actualizar timestamp del carrito
    await db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cart.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Actualizar cantidad de un item
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { itemId: number; quantity: number };
    const { itemId, quantity } = body;

    if (!itemId || quantity < 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const db = getDb();

    // Verificar que el item pertenece al usuario
    const result = await db
      .select()
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .where(
        and(
          eq(cartItems.id, itemId),
          eq(carts.userId, session.user.id),
          eq(carts.status, 'en_proceso')
        )
      )
      .limit(1);

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const item = result[0];

    // Si quantity es 0, eliminar
    if (quantity === 0) {
      await db.delete(cartItems).where(eq(cartItems.id, itemId));
      return NextResponse.json({ success: true, deleted: true });
    }

    // Verificar stock
    if (item.cart_items.productId) {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.cart_items.productId))
        .limit(1);

      if (product && product.stock < quantity) {
        return NextResponse.json(
          { error: 'Insufficient stock' },
          { status: 400 }
        );
      }
    }

    // Actualizar cantidad
    await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, itemId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Eliminar item del carrito
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    const db = getDb();

    // Verificar que el item pertenece al usuario
    const result = await db
      .select()
      .from(cartItems)
      .innerJoin(carts, eq(cartItems.cartId, carts.id))
      .where(
        and(
          eq(cartItems.id, parseInt(itemId)),
          eq(carts.userId, session.user.id)
        )
      )
      .limit(1);

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await db.delete(cartItems).where(eq(cartItems.id, parseInt(itemId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
