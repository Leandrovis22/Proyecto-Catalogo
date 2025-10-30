
import ProductGrid from '@/components/products/ProductGrid';
import CartButton from '@/components/cart/CartButton';

export default function Home() {
  const products = [
    {
      id: 1,
      slug: 'producto-1',
      name: 'Producto 1',
      price: 100,
      promotionalPrice: 90,
      imageUrl: '/images/producto1.jpg',
      stock: 10,
    },
    {
      id: 2,
      slug: 'producto-2',
      name: 'Producto 2',
      price: 200,
      imageUrl: '/images/producto2.jpg',
      stock: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center">
      <section className="w-full max-w-4xl mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-700">Bienvenido a MiTienda</h1>
        <p className="text-center text-lg text-gray-800 mb-12">
          Descubre los mejores productos al mejor precio. ¡Compra fácil y rápido!
        </p>
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Catálogo de Productos</h2>
        <ProductGrid products={products} />
        <div className="flex justify-center mt-8">
          <CartButton />
        </div>
      </section>
    </div>
  );
}
