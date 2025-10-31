import { getRequestContext } from '@cloudflare/next-on-pages';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export const runtime = process.env.NODE_ENV === 'production' ? 'edge' : 'nodejs';

// GET - Obtener carrito del usuario
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }
  let db;
  if (process.env.NODE_ENV === 'production') {
    const { env } = getRequestContext();
    const { getDb } = await import('@/lib/db');
    // @ts-ignore
    db = getDb(env.DB);
  } else {
    const { getDb } = await import('@/lib/db');
    db = getDb();
  }
  const [cart] = await db
    .select()
    .from(schema.carts)
    .where(and(eq(schema.carts.user_id, session.user.id), eq(schema.carts.status, 'active')))
    .limit(1);
  if (!cart) {
    return Response.json({ cart: null, items: [] });
  }
  const items = await db
    .select({
      id: schema.cartItems.id,
      quantity: schema.cartItems.quantity,
      price: schema.cartItems.price,
      product: schema.products,
      variant: schema.productVariants,
    })
    .from(schema.cartItems)
    .leftJoin(schema.products, eq(schema.cartItems.product_id, schema.products.id))
    .leftJoin(schema.productVariants, eq(schema.cartItems.variant_id, schema.productVariants.id))
    .where(eq(schema.cartItems.cart_id, cart.id));
  return Response.json({ cart, items });
}

// POST - Agregar producto al carrito
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }
  const { productId, variantId, quantity = 1 } = await request.json();
  if (!productId) {
    return Response.json({ error: 'productId requerido' }, { status: 400 });
  }
  let db;
  if (process.env.NODE_ENV === 'production') {
    const { env } = getRequestContext();
    const { getDb } = await import('@/lib/db');
    // @ts-ignore
    db = getDb(env.DB);
  } else {
    const { getDb } = await import('@/lib/db');
    db = getDb();
  }
  const [product] = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, productId))
    .limit(1);
  if (!product) {
    return Response.json({ error: 'Producto no encontrado' }, { status: 404 });
  }
  let [cart] = await db
    .select()
    .from(schema.carts)
    .where(and(eq(schema.carts.user_id, session.user.id), eq(schema.carts.status, 'active')))
    .limit(1);
  if (!cart) {
    const [newCart] = await db
      .insert(schema.carts)
      .values({
        user_id: session.user.id,
        status: 'active',
        created_at: Date.now(),
        updated_at: Date.now(),
      })
      .returning();
    cart = newCart;
  }
  const [existingItem] = await db
    .select()
    .from(schema.cartItems)
    .where(and(
      eq(schema.cartItems.cart_id, cart.id),
      eq(schema.cartItems.product_id, productId),
      variantId !== undefined && variantId !== null
        ? eq(schema.cartItems.variant_id, variantId)
        : eq(schema.cartItems.variant_id, 0)
    ))
    .limit(1);
  if (existingItem) {
    await db
      .update(schema.cartItems)
      .set({ quantity: existingItem.quantity + quantity })
      .where(eq(schema.cartItems.id, existingItem.id));
  } else {
    const price = variantId 
      ? (await db.select().from(schema.productVariants).where(eq(schema.productVariants.id, variantId)).limit(1))[0]?.price || product.price
      : product.price;
    await db.insert(schema.cartItems).values({
      cart_id: cart.id,
      product_id: productId,
      variant_id: variantId || null,
      quantity,
      price,
      created_at: Date.now(),
    });
  }
  await db
    .update(schema.carts)
    .set({ updated_at: Date.now() })
    .where(eq(schema.carts.id, cart.id));
  return Response.json({ success: true, cartId: cart.id });
}

// DELETE - Eliminar item del carrito
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: 'No autenticado' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get('itemId');
  if (!itemId) {
    return Response.json({ error: 'itemId requerido' }, { status: 400 });
  }
  let db;
  if (process.env.NODE_ENV === 'production') {
    const { env } = getRequestContext();
    const { getDb } = await import('@/lib/db');
    // @ts-ignore
    db = getDb(env.DB);
  } else {
    const { getDb } = await import('@/lib/db');
    db = getDb();
  }
  await db
    .delete(schema.cartItems)
    .where(eq(schema.cartItems.id, parseInt(itemId)));
  return Response.json({ success: true });
}
