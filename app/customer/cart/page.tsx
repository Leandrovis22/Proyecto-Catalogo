import CartSummary from '@/components/cart/CartSummary';

export default function CartPage() {
  const cartItems = [
    {
      id: 1,
      name: 'Producto 1',
      price: 90,
      quantity: 2,
      imageUrl: '/images/producto1.jpg',
    },
    {
      id: 2,
      name: 'Producto 2',
      price: 200,
      quantity: 1,
      imageUrl: '/images/producto2.jpg',
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Carrito de Compras</h1>
      <CartSummary items={cartItems} />
    </div>
  );
}