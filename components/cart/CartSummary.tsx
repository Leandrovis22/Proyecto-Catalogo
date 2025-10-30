'use client';

import Button from '../ui/Button';
import Card from '../ui/Card';

interface CartSummaryProps {
  items: any[];
  onComplete: () => void;
  loading: boolean;
}

export default function CartSummary({ items, onComplete, loading }: CartSummaryProps) {
  const handleComplete = () => {
    onComplete();
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0; // Calcular según lógica de negocio
  const total = subtotal + shipping;

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-700">Subtotal</span>
          <span className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-700">Envío</span>
          <span className="text-sm font-medium text-gray-900">${shipping.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t pt-4">
          <span className="text-lg font-semibold text-gray-900">Total</span>
          <span className="text-lg font-semibold text-gray-900">${total.toFixed(2)}</span>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={handleComplete}
          disabled={loading || items.length === 0}
        >
          {loading ? 'Procesando...' : 'Completar compra'}
        </Button>
      </div>
    </Card>
  );
}