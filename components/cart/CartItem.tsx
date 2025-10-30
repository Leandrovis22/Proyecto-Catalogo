'use client';

import Image from 'next/image';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartItemProps {
  item: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
  };
}

export default function CartItem({ item }: CartItemProps) {
  const handleUpdateQuantity = (newQuantity: number) => {
    // onUpdateQuantity(item.id, newQuantity);
  };

  const handleRemove = () => {
    // onRemove(item.id);
  };

  return (
    <div className="flex gap-4 p-4 border rounded-lg">
      {item.imageUrl && (
        <div className="relative w-20 h-20">
          <Image
            src={item.imageUrl}
            alt={item.name}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{item.name}</h3>
        <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
        <div className="flex items-center mt-2 space-x-2">
          <button
            onClick={() => handleUpdateQuantity(item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="p-1 border rounded-md"
          >
            <Minus size={16} />
          </button>
          <span className="px-4 py-1 border rounded-md">{item.quantity}</span>
          <button
            onClick={() => handleUpdateQuantity(item.quantity + 1)}
            className="p-1 border rounded-md"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <button
        onClick={handleRemove}
        className="p-2 text-red-500 hover:text-red-700"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}