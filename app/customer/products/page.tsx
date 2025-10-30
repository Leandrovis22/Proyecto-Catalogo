import ProductGrid from '@/components/products/ProductGrid';

export default function ProductsPage() {
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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Productos</h1>
      <ProductGrid products={products} />
    </div>
  );
}