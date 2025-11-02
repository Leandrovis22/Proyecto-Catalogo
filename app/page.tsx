'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Search, Plus, Minus, ShoppingCart, X } from 'lucide-react';
import { Navbar } from '@/components/Navbar';

interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  variantName: string | null;
  variantValue: string | null;
  imageUrl: string | null;
}

interface GroupedProduct {
  slug: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string | null;
  variants: Product[];
  hasVariants: boolean;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<GroupedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [cart, setCart] = useState<Record<number, number>>({});
  
  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<GroupedProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  // Group products by slug
  useEffect(() => {
    const grouped = products.reduce((acc, product) => {
      const existing = acc.find(g => g.slug === product.slug);
      
      if (existing) {
        existing.variants.push(product);
      } else {
        acc.push({
          slug: product.slug,
          name: product.name,
          category: product.category,
          price: product.price,
          imageUrl: product.imageUrl,
          variants: [product],
          hasVariants: false, // Se actualizará después
        });
      }
      
      return acc;
    }, [] as GroupedProduct[]);

    // Marcar productos que tienen variantes
    grouped.forEach(g => {
      g.hasVariants = g.variants.length > 1 || g.variants.some(v => v.variantName !== null);
    });

    setGroupedProducts(grouped);
  }, [products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json() as Product[];

      setProducts(data);

      // Extract unique categories
      const uniqueCategories: string[] = Array.from(
        new Set(data.map((p: Product) => p.category))
      );
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number) => {
    if (!session) {
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          quantity,
        }),
      });

      if (response.ok) {
        setCart((prev) => ({
          ...prev,
          [product.id]: (prev[product.id] || 0) + quantity,
        }));
        
        // Cerrar modal si está abierto
        closeModal();
      } else {
        // Debug: mostrar error en consola
        const error = await response.json();
        console.error('Error adding to cart:', error);
        console.log('Sent data:', { productId: product.id, quantity });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const openModal = (groupedProduct: GroupedProduct) => {
    setSelectedProduct(groupedProduct);
    setSelectedVariant(groupedProduct.variants[0]);
    setModalQuantity(1);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedVariant(null);
    setModalQuantity(1);
  };

  const handleAddFromModal = () => {
    if (selectedVariant) {
      addToCart(selectedVariant, modalQuantity);
    }
  };

  const handleQuickAdd = (groupedProduct: GroupedProduct) => {
    if (groupedProduct.hasVariants) {
      openModal(groupedProduct);
    } else {
      addToCart(groupedProduct.variants[0], 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                {category.split(' > ').pop()}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando productos...</p>
          </div>
        ) : groupedProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {groupedProducts.map((product) => (
              <div
                key={product.slug}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative aspect-[3/4] bg-gray-200">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      Sin imagen
                    </div>
                  )}
                  {product.hasVariants && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {product.variants.length} variantes
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                      ${product.price.toFixed(2)}
                    </span>
                    {!product.hasVariants && (
                      <span className="text-sm text-gray-500">
                        Stock: {product.variants[0].stock}
                      </span>
                    )}
                  </div>

                  {/* Add to Cart Button */}
                  {session ? (
                    product.hasVariants ? (
                      <button
                        onClick={() => openModal(product)}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Ver opciones
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const variant = product.variants[0];
                            const currentQty = cart[variant.id] || 0;
                            if (currentQty > 0) {
                              setCart((prev) => ({
                                ...prev,
                                [variant.id]: currentQty - 1,
                              }));
                            }
                          }}
                          disabled={!cart[product.variants[0].id] || cart[product.variants[0].id] === 0}
                          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <span className="flex-1 text-center font-semibold">
                          {cart[product.variants[0].id] || 0}
                        </span>

                        <button
                          onClick={() => handleQuickAdd(product)}
                          disabled={(cart[product.variants[0].id] || 0) >= product.variants[0].stock}
                          className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="text-center text-sm text-gray-500 py-2">
                      Inicia sesión para ordenar
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal para seleccionar variante */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedProduct.name}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Price */}
              <div className="text-3xl font-bold text-blue-600">
                ${selectedVariant?.price.toFixed(2)}
              </div>

              {/* Variant Selection */}
              {selectedProduct.hasVariants && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedProduct.variants[0].variantName || 'Variante'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedProduct.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`p-3 border-2 rounded-lg text-sm font-medium transition ${
                          selectedVariant?.id === variant.id
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div>{variant.variantValue}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Stock: {variant.stock}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock info */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Stock disponible:</span>
                <span className="font-semibold text-gray-900">
                  {selectedVariant?.stock || 0} unidades
                </span>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                    className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-semibold w-12 text-center">
                    {modalQuantity}
                  </span>
                  <button
                    onClick={() => setModalQuantity(Math.min(selectedVariant?.stock || 0, modalQuantity + 1))}
                    disabled={modalQuantity >= (selectedVariant?.stock || 0)}
                    className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddFromModal}
                disabled={!selectedVariant || modalQuantity < 1 || modalQuantity > (selectedVariant?.stock || 0)}
                className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
