import Link from 'next/link';
import { Calendar, User, Phone, DollarSign } from 'lucide-react';

interface OrderCardProps {
  order: {
    id: number;
    customerName: string;
    customerPhone: string;
    total: number;
    status: string;
    createdAt: string;
  };
}

export default function OrderCard({ order }: OrderCardProps) {
  const statusColors: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels: { [key: string]: string } = {
    pending: 'Pendiente',
    completed: 'Completada',
    cancelled: 'Cancelada',
  };

  return (
    <Link href={`/admin/orders/${order.id}`} className="block p-4 border rounded-lg hover:shadow-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Orden #{order.id}</h3>
        <span
          className={`px-2 py-1 text-sm font-medium rounded ${statusColors[order.status]}`}
        >
          {statusLabels[order.status]}
        </span>
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <p className="flex items-center gap-2">
          <User size={16} /> {order.customerName}
        </p>
        <p className="flex items-center gap-2">
          <Phone size={16} /> {order.customerPhone}
        </p>
        <p className="flex items-center gap-2">
          <DollarSign size={16} /> ${order.total.toFixed(2)}
        </p>
        <p className="flex items-center gap-2">
          <Calendar size={16} /> {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}