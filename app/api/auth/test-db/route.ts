import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = process.env.NODE_ENV === "production" ? "edge" : "nodejs";

export async function GET() {
  const db = getDb();
  const { users } = require("@/lib/db/schema");
  const result = await db.select().from(users).all();
  return NextResponse.json({ users: result });
}