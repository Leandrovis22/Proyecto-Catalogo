import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: {
    id: number;
    slug: string;
    name: string;
    price: number;
    promotionalPrice?: number;
    imageUrl?: string;
    stock: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const displayPrice = product.promotionalPrice || product.price;
  const hasDiscount = !!product.promotionalPrice;

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-64 bg-gray-200">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Sin imagen
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
              ¡Oferta!
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <span className="text-gray-500 line-through text-sm">
                ${product.price.toFixed(2)}
              </span>
            )}
            <span className="text-xl font-bold text-blue-600">
              ${displayPrice.toFixed(2)}
            </span>
          </div>
          {product.stock === 0 && (
            <span className="text-red-500 text-sm mt-2 block">Sin stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}