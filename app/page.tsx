import { getDb } from "@/lib/db";
import { products } from "@/lib/db/schema";
import ProductGridClient from "@/components/products/ProductGridClient";
import { eq } from "drizzle-orm";

export default async function Home() {
  const db = getDb();
  // Solo productos visibles en tienda
  const allProducts = await db.select().from(products).where(eq(products.show_in_store, true));

  return (
    <main className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Catálogo de Productos</h1>
  <ProductGridClient products={allProducts} />
    </main>
  );
}
