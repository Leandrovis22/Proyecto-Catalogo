"use client";
import ProductCard from "./ProductCard";
import { useSession } from "next-auth/react";

export default function ProductGridClient({ products }: { products: any[] }) {
  const { data: session } = useSession();

  function handleAddToCart(productId: number) {
    if (!session) {
      window.location.href = "/login";
      return;
    }
    // Aquí iría la lógica para agregar al carrito vía fetch a /api/cart
    alert(`Producto ${productId} agregado al carrito (simulado)`);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
          isLoading={false}
          isAuthenticated={!!session}
        />
      ))}
    </div>
  );
}
