'use client';

import { useState } from 'react';
import Image from 'next/image';
import StatusSelect from './StatusSelect';
import Card from '../ui/Card';

interface OrderDetailProps {
  order: {
    id: number;
    customerName: string;
    customerPhone: string;
    total: number;
    status: string;
    createdAt: string;
    items: {
      id: number;
      name: string;
      price: number;
      quantity: number;
      imageUrl?: string;
    }[];
  };
}

export default function OrderDetail({ order }: OrderDetailProps) {
  const [status, setStatus] = useState(order.status);

  return (
    <Card className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Orden #{order.id}</h1>
        <StatusSelect currentStatus={status} onChange={setStatus} />
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <p><strong>Cliente:</strong> {order.customerName}</p>
        <p><strong>Teléfono:</strong> {order.customerPhone}</p>
        <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
        <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
      </div>
      <div className="space-y-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-4">
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
              <p className="text-sm text-gray-500">${item.price.toFixed(2)} x {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}