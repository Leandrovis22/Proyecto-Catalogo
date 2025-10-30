'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';
import VariantSelector from './VariantSelector';
import Button from '../ui/Button';

interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  promotionalPrice?: number;
  imageUrl?: string;
  stock: number;
  brand?: string;
  categories?: string;
  variants: any[];
}

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const displayPrice = product.promotionalPrice || product.price;
  const hasDiscount = !!product.promotionalPrice;

  const handleAddToCart = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Producto añadido al carrito');
    }, 1000);
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="relative w-full h-96">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        )}
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
        {hasDiscount && (
          <p className="text-sm text-red-500 line-through">${product.price.toFixed(2)}</p>
        )}
        <p className="text-xl font-semibold text-gray-800">${displayPrice.toFixed(2)}</p>
        <p className="text-gray-600 mt-4">{product.description}</p>

        {product.variants.length > 0 && (
          <VariantSelector
            variants={product.variants}
            onVariantChange={setSelectedVariant}
          />
        )}

        <div className="flex items-center mt-4 space-x-4">
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-16 border rounded-md text-center"
          />
          <Button
            variant="primary"
            size="md"
            onClick={handleAddToCart}
            disabled={loading || product.stock === 0}
          >
            {loading ? 'Añadiendo...' : 'Añadir al carrito'}
          </Button>
        </div>
      </div>
    </div>
  );
}