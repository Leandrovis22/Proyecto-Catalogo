import { getDb } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = process.env.NODE_ENV === "production" ? "edge" : "nodejs";

export async function GET() {
  const db = getDb();
  // Solo productos visibles en tienda
  const result = await db.select().from(products).where(eq(products.show_in_store, true)).all();
  return Response.json({ products: result });
}
