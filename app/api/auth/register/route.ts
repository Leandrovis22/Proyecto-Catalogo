import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/d1';
// Si usas el cliente oficial de Cloudflare D1 para Node.js:
// import { D1Database } from '@cloudflare/d1';
import * as schema from '@/lib/db/schema';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Conexión remota a Cloudflare D1 usando variables de entorno
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const databaseId = process.env.CLOUDFLARE_D1_ID;
    const token = process.env.CLOUDFLARE_D1_TOKEN;
    if (!accountId || !databaseId || !token) {
      return NextResponse.json({ error: 'Credenciales de D1 no configuradas' }, { status: 500 });
    }
    // Construir la URL de Cloudflare D1
    const d1Url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
    const db = drizzle({ url: d1Url, token }, { schema });

    // Verificar si el usuario ya existe
    const existingUsers = await db.select().from(users).where(eq(users.email, email)).all();
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const inserted = await db.insert(users).values({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 'customer',
      createdAt: new Date(),
    }).returning().all();
    const newUser = inserted[0];
    return NextResponse.json(
      { 
        message: 'Usuario registrado exitosamente',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
}
