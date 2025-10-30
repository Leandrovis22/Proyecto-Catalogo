export default function CartSummary({ items }: { items: Array<{ id: number; name: string; price: number; quantity: number; imageUrl: string }> }) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-4">Resumen del Carrito</h2>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-4">
            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
            </div>
            <p className="font-bold">${(item.price * item.quantity).toFixed(2)}</p>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-right">
        <h3 className="text-xl font-bold">Total: ${total.toFixed(2)}</h3>
      </div>
    </div>
  );
}