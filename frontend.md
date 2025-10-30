# FRONTEND COMPLETO - COMPONENTES Y PÁGINAS

## COMPONENTES UI BASE

### `components/ui/Button.tsx`
```tsx
'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

### `components/ui/Input.tsx`
```tsx
'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
          {...props}
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
```

### `components/ui/Card.tsx`
```tsx
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}

export default function Card({ children, className = '', padding = true }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}
```

### `components/ui/Modal.tsx`
```tsx
'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
```

### `components/ui/Loading.tsx`
```tsx
export default function Loading() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
```

---

## COMPONENTES DE PRODUCTOS

### `components/products/VariantSelector.tsx`
```tsx
'use client';

import { useState } from 'react';

interface Variant {
  id: number;
  property1Name?: string;
  property1Value?: string;
  property2Name?: string;
  property2Value?: string;
  property3Name?: string;
  property3Value?: string;
  price?: number;
  stock: number;
  sku: string;
}

interface VariantSelectorProps {
  variants: Variant[];
  onVariantChange: (variant: Variant) => void;
}

export default function VariantSelector({ variants, onVariantChange }: VariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(variants[0] || null);

  // Agrupar variantes por propiedades
  const properties: { [key: string]: Set<string> } = {};

  variants.forEach((variant) => {
    if (variant.property1Name && variant.property1Value) {
      if (!properties[variant.property1Name]) {
        properties[variant.property1Name] = new Set();
      }
      properties[variant.property1Name].add(variant.property1Value);
    }
    if (variant.property2Name && variant.property2Value) {
      if (!properties[variant.property2Name]) {
        properties[variant.property2Name] = new Set();
      }
      properties[variant.property2Name].add(variant.property2Value);
    }
    if (variant.property3Name && variant.property3Value) {
      if (!properties[variant.property3Name]) {
        properties[variant.property3Name] = new Set();
      }
      properties[variant.property3Name].add(variant.property3Value);
    }
  });

  const handleVariantSelect = (propertyName: string, value: string) => {
    const variant = variants.find((v) => {
      if (propertyName === v.property1Name) return v.property1Value === value;
      if (propertyName === v.property2Name) return v.property2Value === value;
      if (propertyName === v.property3Name) return v.property3Value === value;
      return false;
    });

    if (variant) {
      setSelectedVariant(variant);
      onVariantChange(variant);
    }
  };

  if (variants.length === 0) return null;

  return (
    <div className="space-y-4">
      {Object.entries(properties).map(([propertyName, values]) => (
        <div key={propertyName}>
          <h4 className="font-semibold mb-2">{propertyName}</h4>
          <div className="flex flex-wrap gap-2">
            {Array.from(values).map((value) => {
              const isSelected =
                (selectedVariant?.property1Name === propertyName && selectedVariant?.property1Value === value) ||
                (selectedVariant?.property2Name === propertyName && selectedVariant?.property2Value === value) ||
                (selectedVariant?.property3Name === propertyName && selectedVariant?.property3Value === value);

              return (
                <button
                  key={value}
                  onClick={() => handleVariantSelect(propertyName, value)}
                  className={`px-4 py-2 border rounded-lg transition ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### `components/products/ProductDetail.tsx`
```tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';
import VariantSelector from './VariantSelector';
import Button from '../ui/Button';

interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  promotionalPrice?: number;
  imageUrl?: string;
  stock: number;
  brand?: string;
  categories?: string;
  variants: any[];
}

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const displayPrice = product.promotionalPrice || product.price;
  const hasDiscount = !!product.promotionalPrice;

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant?.id,
          quantity,
        }),
      });

      if (res.ok) {
        alert('¡Producto agregado al carrito!');
      } else {
        alert('Error al agregar al carrito');
      }
    } catch (error) {
      alert('Error al agregar al carrito');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Imagen */}
      <div className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Sin imagen
          </div>
        )}
        {hasDiscount && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-lg font-semibold">
            ¡Oferta!
          </div>
        )}
      </div>

      {/* Detalles */}
      <div className="space-y-6">
        {product.brand && (
          <p className="text-sm text-gray-600 uppercase">{product.brand}</p>
        )}
        
        <h1 className="text-3xl font-bold">{product.name}</h1>

        <div className="flex items-center gap-3">
          {hasDiscount && (
            <span className="text-2xl text-gray-500 line-through">
              ${product.price.toFixed(2)}
            </span>
          )}
          <span className="text-4xl font-bold text-blue-600">
            ${displayPrice.toFixed(2)}
          </span>
        </div>

        {product.description && (
          <div className="prose max-w-none">
            <p className="text-gray-700">{product.description}</p>
          </div>
        )}

        {/* Selector de variantes */}
        {product.variants && product.variants.length > 0 && (
          <VariantSelector
            variants={product.variants}
            onVariantChange={setSelectedVariant}
          />
        )}

        {/* Stock */}
        <div>
          {product.stock > 0 ? (
            <p className="text-green-600 font-semibold">
              ✓ En stock ({product.stock} disponibles)
            </p>
          ) : (
            <p className="text-red-600 font-semibold">✗ Sin stock</p>
          )}
        </div>

        {/* Cantidad y agregar al carrito */}
        <div className="flex gap-4">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-4 py-2 hover:bg-gray-100 transition"
            >
              -
            </button>
            <span className="px-6 py-2 border-x">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-4 py-2 hover:bg-gray-100 transition"
            >
              +
            </button>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={loading || product.stock === 0}
            variant="primary"
            size="lg"
            className="flex-1 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            {loading ? 'Agregando...' : 'Agregar al carrito'}
          </Button>
        </div>

        {/* Botón favoritos (opcional) */}
        <button className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition">
          <Heart className="w-5 h-5" />
          <span>Agregar a favoritos</span>
        </button>
      </div>
    </div>
  );
}
```

### `components/products/ProductFilters.tsx`
```tsx
'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface ProductFiltersProps {
  categories: string[];
  onFilterChange: (filters: {
    search: string;
    category: string;
    minPrice: string;
    maxPrice: string;
  }) => void;
}

export default function ProductFilters({ categories, onFilterChange }: ProductFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleApplyFilters = () => {
    onFilterChange({ search, category, minPrice, maxPrice });
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    onFilterChange({ search: '', category: '', minPrice: '', maxPrice: '' });
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
            className="pl-10"
          />
        </div>
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <Filter className="w-5 h-5" />
          Filtros
        </Button>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Filtros</h3>
            <button onClick={() => setShowFilters(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium mb-2">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Precio mínimo */}
            <div>
              <label className="block text-sm font-medium mb-2">Precio mínimo</label>
              <Input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            {/* Precio máximo */}
            <div>
              <label className="block text-sm font-medium mb-2">Precio máximo</label>
              <Input
                type="number"
                placeholder="999999"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} variant="primary">
              Aplicar filtros
            </Button>
            <Button onClick={handleClearFilters} variant="secondary">
              Limpiar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## COMPONENTES DE CARRITO

### `components/cart/CartItem.tsx`
```tsx
'use client';

import Image from 'next/image';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartItemProps {
  item: {
    id: number;
    quantity: number;
    price: number;
    product: {
      name: string;
      imageUrl?: string;
    };
    variant?: {
      property1Value?: string;
      property2Value?: string;
      property3Value?: string;
    };
  };
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  onRemove: (itemId: number) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-4 p-4 border rounded-lg">
      {/* Imagen */}
      <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0 relative overflow-hidden">
        {item.product.imageUrl ? (
          <Image
            src={item.product.imageUrl}
            alt={item.product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
            Sin imagen
          </div>
        )}
      </div>

      {/* Detalles */}
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{item.product.name}</h3>
        {item.variant && (
          <p className="text-sm text-gray-600">
            {[
              item.variant.property1Value,
              item.variant.property2Value,
              item.variant.property3Value,
            ]
              .filter(Boolean)
              .join(' / ')}
          </p>
        )}
        <p className="text-xl font-bold text-blue-600 mt-2">
          ${item.price.toFixed(2)}
        </p>
      </div>

      {/* Controles */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => onRemove(item.id)}
          className="text-red-500 hover:text-red-700 transition"
        >
          <Trash2 className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 border rounded">
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="p-2 hover:bg-gray-100 transition disabled:opacity-50"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 font-semibold">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className="p-2 hover:bg-gray-100 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

### `components/cart/CartSummary.tsx`
```tsx
'use client';

import Button from '../ui/Button';
import Card from '../ui/Card';

interface CartSummaryProps {
  items: any[];
  onComplete: () => void;
  loading: boolean;
}

export default function CartSummary({ items, onComplete, loading }: CartSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = 0; // Calcular según lógica de negocio
  const total = subtotal + shipping;

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal ({items.length} items)</span>
          <span className="font-semibold">${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Envío</span>
          <span className="font-semibold">
            {shipping === 0 ? 'GRATIS' : `$${shipping.toFixed(2)}`}
          </span>
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between text-lg">
            <span className="font-bold">Total</span>
            <span className="font-bold text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={onComplete}
        disabled={loading || items.length === 0}
        variant="success"
        size="lg"
        className="w-full"
      >
        {loading ? 'Procesando...' : 'Completar pedido'}
      </Button>

      <p className="text-xs text-gray-500 text-center mt-4">
        Al completar el pedido, nos contactaremos contigo por WhatsApp
      </p>
    </Card>
  );
}
```

---

## COMPONENTES DE ADMIN

### `components/admin/OrderCard.tsx`
```tsx
import Link from 'next/link';
import { Calendar, User, Phone, DollarSign } from 'lucide-react';

interface OrderCardProps {
  order: {
    id: number;
    status: string;
    total: number;
    completedAt: string;
    user: {
      name: string;
      phone: string;
    };
  };
}

export default function OrderCard({ order }: OrderCardProps) {
  const statusColors: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusLabels: { [key: string]: string } = {
    pending: 'Pendiente',
    processing: 'En proceso',
    completed: 'Completada',
    cancelled: 'Cancelada',
  };

  return (
    <Link href={`/admin/orders/${order.id}`}>
      <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">Orden #{order.id}</h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <Calendar className="w-4 h-4" />
              {new Date(order.completedAt).toLocaleDateString('es-AR')}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>
            {statusLabels[order.status]}
          </span>
        </div>

        <div className="space-y-2">
          <p className="flex items-center gap-2 text-gray-700">
            <User className="w-4 h-4" />
            {order.user.name}
          </p>
          <p className="flex items-center gap-2 text-gray-700">
            <Phone className="w-4 h-4" />
            {order.user.phone}
          </p>
          <p className="flex items-center gap-2 text-gray-700 font-bold text-lg">
            <DollarSign className="w-5 h-5" />
            ${order.total.toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  );
}
```

### `components/admin/OrderDetail.tsx`
```tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import StatusSelect from './StatusSelect';
import Card from '../ui/Card';

interface OrderDetailProps {
  order: {
    id: number;
    status: string;
    total: number;
    completedAt: string;
    whatsappSent: boolean;
    user: {
      name: string;
      email: string;
      phone: string;
    };
    items: Array<{
      id: number;
      quantity: number;
      price: number;
      product: {
        name: string;
        imageUrl?: string;
      };
      variant?: {
        property1Value?: string;
        property2Value?: string;
        property3Value?: string;
      };
    }>;
  };
}

export default function OrderDetail({ order }: OrderDetailProps) {
  const [status, setStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
        alert('Estado actualizado correctamente');
      } else {
        alert('Error al actualizar estado');
      }
    } catch (error) {
      alert('Error al actualizar estado');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">Orden #{order.id}</h1>
            <p className="text-gray-600 mt-1">
              {new Date(order.completedAt).toLocaleString('es-AR')}
            </p>
          </div>
          <StatusSelect
            currentStatus={status}
            onChange={handleStatusChange}
            disabled={updating}
          />
        </div>

        {/* Info del cliente */}
        <div className="border-t pt-4">
          <h2 className="font-bold text-lg mb-3">Información del cliente</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nombre</p>
              <p className="font-semibold">{order.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{order.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Teléfono</p>
              <p className="font-semibold">{order.user.phone}</p>
            </div>
          </div>
        </div>

        {/* WhatsApp status */}
        <div className="border-t pt-4 mt-4">
          <p className="text-sm">
            Estado de WhatsApp:{' '}
            <span
              className={`font-semibold ${
                order.whatsappSent ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {order.whatsappSent ? '✓ Enviado' : '✗ No enviado'}
            </span>
          </p>
        </div>
      </Card>

      {/* Productos */}
      <Card>
        <h2 className="font-bold text-lg mb-4">Productos ({order.items.length})</h2>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 border-b pb-4 last:border-b-0">
              <div className="w-20 h-20 bg-gray-200 rounded relative overflow-hidden flex-shrink-0">
                {item.product.imageUrl ? (
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.product.name}</h3>
                {item.variant && (
                  <p className="text-sm text-gray-600">
                    {[
                      item.variant.property1Value,
                      item.variant.property2Value,
                      item.variant.property3Value,
                    ]
                      .filter(Boolean)
                      .join(' / ')}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-600">Cantidad: {item.quantity}</span>
                  <span className="font-semibold">${item.price.toFixed(2)} c/u</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center text-2xl font-bold">
            <span>Total</span>
            <span className="text-blue-600">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

### `components/admin/StatusSelect.tsx`
```tsx
'use client';

interface StatusSelectProps {
  currentStatus: string;
  onChange: (status: string) => void;
  disabled?: boolean;
}

export default function StatusSelect({ currentStatus, onChange, disabled }: StatusSelectProps) {
  const statuses = [
    { value: 'pending', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', label: 'En proceso', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completada', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelada', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <select
      value={currentStatus}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="px-4 py-2 border rounded-lg font-semibold focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {statuses.map((status) => (
        <option key={status.value} value={status.value}>
          {status.label}
        </option>
      ))}
    </select>
  );
}
```

### `components/admin/CSVUploader.tsx`
```tsx
'use client';

import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function CSVUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    productsCount?: number;
    variantsCount?: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setResult(null);
    } else {
      alert('Por favor selecciona un archivo CSV válido');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult({
          success: true,
          message: data.message,
          productsCount: data.productsCount,
          variantsCount: data.variantsCount,
        });
        setFile(null);
      } else {
        setResult({
          success: false,
          message: data.error || 'Error al importar productos',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Error de conexión al importar productos',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-6">Importar productos desde CSV</h2>

      <div className="space-y-4">
        {/* File input */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="text-blue-600 hover:underline font-semibold">
              Selecciona un archivo CSV
            </span>
            <p className="text-sm text-gray-500 mt-2">
              Formato TiendaNube (encoding ANSI, separado por punto y coma)
            </p>
          </label>
        </div>

        {/* Selected file */}
        {file && (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">{file.name}</p>
              <p className="text-sm text-gray-600">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <Button onClick={handleUpload} disabled={uploading} variant="primary">
              {uploading ? 'Importando...' : 'Importar'}
            </Button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            className={`p-4 rounded-lg flex items-start gap-3 ${
              result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {result.success ? (
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
            )}
            <div>
              <p className="font-semibold">{result.message}</p>
              {result.productsCount !== undefined && (
                <p className="text-sm mt-1">
                  Productos importados: {result.productsCount} <br />
                  Variantes creadas: {result.variantsCount}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Instrucciones:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• El CSV debe estar en formato TiendaNube</li>
            <li>• Encoding: ANSI</li>
            <li>• Separador: punto y coma (;)</li>
            <li>• Las variantes se detectan automáticamente</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
```

---

## COMPONENTES DE LAYOUT

### `components/layout/Header.tsx`
```tsx
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, User, LogOut, Settings } from 'lucide-react';
import CartButton from '../cart/CartButton';

export default function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            MiTienda
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="hover:text-blue-600 transition">
              Productos
            </Link>
            {session?.user && (
              <Link href="/cart" className="hover:text-blue-600 transition">
                Mi Carrito
              </Link>
            )}
            {session?.user && (session.user as any).role === 'admin' && (
              <Link href="/admin/dashboard" className="hover:text-blue-600 transition">
                Admin
              </Link>
            )}
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : session?.user ? (
              <>
                {session.user && (session.user as any).role !== 'admin' && <CartButton />}
                <div className="relative group">
                  <button className="flex items-center gap-2 hover:text-blue-600 transition">
                    <User className="w-6 h-6" />
                    <span className="hidden md:inline">{session.user.name}</span>
                  </button>
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="py-2">
                      <button
                        onClick={() => signOut()}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    Iniciar sesión
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Registrarse
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
```

### `components/layout/Footer.tsx`
```tsx
import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sobre nosotros */}
          <div>
            <h3 className="text-xl font-bold mb-4">MiTienda</h3>
            <p className="text-gray-400 text-sm">
              Tu tienda online de confianza. Productos de calidad al mejor precio.
            </p>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-white transition">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Políticas */}
          <div>
            <h3 className="font-bold mb-4">Información</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition">
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-400 hover:text-white transition">
                  Envíos y devoluciones
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-bold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4" />
                info@mitienda.com
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4" />
                +54 9 11 1234-5678
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 MiTienda. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
```

### `components/layout/Sidebar.tsx`
```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Upload,
  Image as ImageIcon,
  Settings,
} from 'lucide-react';

const menuItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Órdenes',
    href: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    label: 'Productos',
    href: '/admin/products',
    icon: Package,
  },
  {
    label: 'Importar CSV',
    href: '/admin/products/upload',
    icon: Upload,
  },
  {
    label: 'Configuración',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-8">Panel Admin</h2>
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

---

## PÁGINAS COMPLETAS

### `app/layout.tsx`
```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getServerSession } from 'next-auth';
import SessionProvider from '@/components/providers/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MiTienda - Catálogo de Productos',
  description: 'Encuentra los mejores productos al mejor precio',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  return (
    <html lang="es">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <SessionProvider session={session}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
```

### `components/providers/SessionProvider.tsx`
```tsx
'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export default function SessionProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: any;
}) {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
}
```

### `app/globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 255, 255, 255;
  --background-end-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Loading animations */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
  background: linear-gradient(
    to right,
    #f6f7f8 0%,
    #edeef1 20%,
    #f6f7f8 40%,
    #f6f7f8 100%
  );
  background-size: 1000px 100%;
}
```

### `app/(customer)/products/[slug]/page.tsx`
```tsx
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/products/ProductDetail';

async function getProduct(slug: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/products/${slug}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const data = await getProduct(params.slug);

  if (!data || !data.product) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductDetail product={data.product} />
    </div>
  );
}
```

### `app/(customer)/layout.tsx`
```tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  // Las páginas de productos son públicas, pero el carrito requiere login
  // Esta validación se hace en cada página individual si es necesario

  return <>{children}</>;
}
```

### `app/admin/layout.tsx`
```tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session || (session.user as any).role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 bg-gray-50 min-h-screen">{children}</div>
    </div>
  );
}
```

### `app/admin/dashboard/page.tsx`
```tsx
import Card from '@/components/ui/Card';
import { Package, ShoppingBag, Users, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  // TODO: Fetch real stats
  const stats = {
    totalOrders: 45,
    pendingOrders: 12,
    totalProducts: 156,
    totalRevenue: 12345.67,
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Órdenes</p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ShoppingBag className="w-8 h-8 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold">{stats.pendingOrders}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Productos</p>
              <p className="text-2xl font-bold">{stats.totalProducts}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ingresos</p>
              <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <h2 className="text-xl font-bold mb-4">Órdenes Recientes</h2>
        <p className="text-gray-600">Próximamente...</p>
      </Card>
    </div>
  );
}
```

### `app/admin/products/page.tsx`
```tsx
import Link from 'next/link';
import { Plus } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function AdminProductsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Productos</h1>
        <Link href="/admin/products/upload">
          <Button variant="primary" className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Importar CSV
          </Button>
        </Link>
      </div>

      <p className="text-gray-600">Lista de productos próximamente...</p>
    </div>
  );
}
```

### `app/admin/products/upload/page.tsx`
```tsx
import CSVUploader from '@/components/admin/CSVUploader';

export default function UploadPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Importar Productos</h1>
      <CSVUploader />
    </div>
  );
}
```

### `app/admin/orders/[orderId]/page.tsx`
```tsx
import { notFound } from 'next/navigation';
import OrderDetail from '@/components/admin/OrderDetail';

async function getOrder(orderId: string) {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/orders/${orderId}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function OrderDetailPage({
  params,
}: {
  params: { orderId: string };
}) {
  const data = await getOrder(params.orderId);

  if (!data || !data.order) {
    notFound();
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <OrderDetail order={data.order} />
    </div>
  );
}
```

### `app/not-found.tsx`
```tsx
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Página no encontrada
        </h2>
        <p className="text-gray-600 mb-8">
          Lo sentimos, la página que buscas no existe.
        </p>
        <Link href="/">
          <Button variant="primary" size="lg">
            Volver al inicio
          </Button>
        </Link>
      </div>
    </div>
  );
}
```

---

## ESTILOS Y CONFIGURACIÓN TAILWIND

### `tailwind.config.ts`
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
};

export default config;
```
