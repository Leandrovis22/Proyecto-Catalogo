import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = process.env.NODE_ENV === "production" ? "edge" : "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, phone } = body;
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }
  const db = getDb();
  const { users } = require("@/lib/db/schema");
  const { eq } = require('drizzle-orm');
  const existing = await db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    return NextResponse.json({ error: "El email ya está registrado" }, { status: 409 });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
    phone,
    role: "customer",
  });
  return NextResponse.json({ success: true });
}