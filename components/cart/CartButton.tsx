"use client";

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartButton() {
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    fetchCartCount();
  }, []);

  const fetchCartCount = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        setItemCount(data.items?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  return (
    <Link href="/cart" className="relative">
      <button className="p-2 hover:bg-gray-100 rounded-full transition">
        <ShoppingCart className="w-6 h-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>
    </Link>
  );
}