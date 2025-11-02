import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/cloudflare';
import { orders, carts, cartItems, products } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const runtime = 'nodejs';

// Obtener órdenes del usuario (o todas si es admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    let result;
    if (session.user.role === 'admin') {
      // Admin ve todas las órdenes
      result = await db.select().from(orders);
    } else {
      // Cliente ve solo sus órdenes
      result = await db
        .select()
        .from(orders)
        .where(eq(orders.userId, session.user.id));
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Crear orden desde carrito actual
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Obtener carrito activo del usuario
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
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Obtener items del carrito
    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cart.id));

    if (items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Calcular total
    const total = items.reduce(
      (sum, item) => sum + (item.productSnapshot as any).price * item.quantity,
      0
    );

    // Crear snapshot del carrito
    const cartSnapshot = {
      items: items.map((item) => ({
        ...(item.productSnapshot as any),
        quantity: item.quantity,
      })),
    };

    // Crear orden
    const [order] = await db
      .insert(orders)
      .values({
        userId: session.user.id,
        cartSnapshot,
        total,
        status: 'activa',
        finalizedByAdmin: false,
      })
      .returning();

    // Marcar carrito como completado
    await db
      .update(carts)
      .set({ status: 'pedido_completado' })
      .where(eq(carts.id, cart.id));

    // TODO: Enviar email al admin

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Actualizar estado de orden (solo admin)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as { orderId: number; status?: string; finalize?: boolean };
    const { orderId, status, finalize } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const db = getDb();

    const updateData: any = {};

    if (status) {
      updateData.status = status;
    }

    if (finalize !== undefined) {
      updateData.finalizedByAdmin = finalize;
      if (finalize) {
        updateData.status = 'finalizada';
      }
    }

    updateData.updatedAt = new Date();

    await db.update(orders).set(updateData).where(eq(orders.id, orderId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
