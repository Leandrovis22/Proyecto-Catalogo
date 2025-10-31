import ProductGrid from "@/components/products/ProductGrid";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

async function fetchProducts() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/products`, {
    cache: "no-store"
  });
  const data = await res.json();
  return data.products || [];
}

export default async function Home() {
  const products = await fetchProducts();
  const session = await getServerSession(authOptions);

  async function handleAddToCart(productId: number) {
    // Implementar lógica de agregar al carrito (requiere login)
  }

  return (
    <main className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Catálogo de Productos</h1>
      <ProductGrid
        products={products}
        onAddToCart={handleAddToCart}
        isAuthenticated={!!session}
      />
    </main>
  );
}
