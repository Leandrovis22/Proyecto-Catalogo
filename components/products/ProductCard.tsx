import Image from "next/image";

export default function ProductCard({ product, onAddToCart, isAuthenticated }: {
  product: any;
  onAddToCart: (id: number) => void;
  isAuthenticated: boolean;
}) {
  return (
    <div className="border rounded shadow p-4 flex flex-col">
      <Image
        src={product.image_url || "/placeholder.png"}
        alt={product.name}
        width={200}
        height={200}
        className="object-cover mb-2 rounded"
      />
      <h2 className="font-bold text-lg mb-1">{product.name}</h2>
      <p className="text-gray-600 mb-2">{product.description}</p>
      <div className="mb-2">
        <span className="font-semibold text-blue-700">${product.price}</span>
        {product.promotional_price && (
          <span className="ml-2 text-green-600 font-semibold">Promo: ${product.promotional_price}</span>
        )}
      </div>
      <button
        className="bg-blue-600 text-white py-1 px-4 rounded mt-auto disabled:opacity-50"
        onClick={() => {
          if (isAuthenticated) {
            onAddToCart(product.id);
          } else {
            window.location.href = "/login";
          }
        }}
        disabled={product.stock <= 0}
      >
        {product.stock > 0 ? "Agregar al carrito" : "Sin stock"}
      </button>
    </div>
  );
}
