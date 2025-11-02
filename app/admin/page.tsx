'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Upload, RefreshCw, Package, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface Order {
  id: number;
  userId: string;
  total: number;
  status: string;
  finalizedByAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  slug: string;
  name: string;
  category: string;
  imageUrl: string | null;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsWithoutImage, setProductsWithoutImage] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingCSV, setUploadingCSV] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Protección de ruta
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') {
      router.push('/auth/signin?callbackUrl=/admin');
    }
  }, [session, status, router]);

  // Cargar órdenes
  useEffect(() => {
    if (session?.user.role === 'admin') {
      loadOrders();
      loadProductsWithoutImage();
    }
  }, [session]);

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json() as Order[];
        setOrders(data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadProductsWithoutImage = async () => {
    try {
      const res = await fetch('/api/products?noImage=true');
      if (res.ok) {
        const data = await res.json() as { products: Product[] };
        setProductsWithoutImage(data.products || []);
      }
    } catch (error) {
      console.error('Error loading products without image:', error);
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCSV(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json() as { productsImported?: number; error?: string };

      if (res.ok) {
        setMessage({
          type: 'success',
          text: `✅ ${data.productsImported} productos importados. Sincronización de imágenes iniciada.`,
        });
        loadProductsWithoutImage();
      } else {
        setMessage({
          type: 'error',
          text: `❌ Error: ${data.error || 'Error al importar CSV'}`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: '❌ Error al subir archivo',
      });
    } finally {
      setUploadingCSV(false);
      e.target.value = '';
    }
  };

  const handleSyncImages = async () => {
    setSyncing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/sync-images', {
        method: 'POST',
      });

      const data = await res.json() as {
        result?: { uploaded: number; deleted: number; skipped: number };
        error?: string;
      };

      if (res.ok) {
        setMessage({
          type: 'success',
          text: `✅ Sincronización completa: ${data.result?.uploaded} subidas, ${data.result?.deleted} eliminadas, ${data.result?.skipped} sin cambios`,
        });
        loadProductsWithoutImage();
      } else {
        setMessage({
          type: 'error',
          text: `❌ Error: ${data.error || 'Error al sincronizar'}`,
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: '❌ Error al sincronizar imágenes',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: string, finalize?: boolean) => {
    setLoading(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status, finalize }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Orden actualizada' });
        loadOrders();
      } else {
        setMessage({ type: 'error', text: '❌ Error al actualizar orden' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Error al actualizar orden' });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Gestiona productos, imágenes y órdenes</p>
        </div>

        {/* Mensaje de feedback */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Acciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Upload CSV */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Upload className="w-6 h-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold">Importar Productos</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Sube un CSV de TiendaNube para actualizar el catálogo
            </p>
            <label
              htmlFor="csv-upload"
              className={`block w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition ${
                uploadingCSV ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                disabled={uploadingCSV}
                className="hidden"
              />
              <span className="text-sm font-medium text-gray-700">
                {uploadingCSV ? 'Subiendo...' : 'Seleccionar archivo CSV'}
              </span>
            </label>
          </div>

          {/* Sync Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <RefreshCw className="w-6 h-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold">Sincronizar Imágenes</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Sincroniza imágenes desde Google Drive a Cloudflare R2
            </p>
            <button
              onClick={handleSyncImages}
              disabled={syncing}
              className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {syncing ? 'Sincronizando...' : 'Iniciar Sincronización'}
            </button>
          </div>
        </div>

        {/* Productos sin imagen */}
        {productsWithoutImage.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <h3 className="text-lg font-semibold text-yellow-900">
                Productos sin imagen ({productsWithoutImage.length})
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {productsWithoutImage.slice(0, 8).map((product) => (
                <div key={product.id} className="text-sm text-yellow-800">
                  • {product.slug}
                </div>
              ))}
            </div>
            {productsWithoutImage.length > 8 && (
              <p className="text-sm text-yellow-700 mt-2">
                ... y {productsWithoutImage.length - 8} más
              </p>
            )}
          </div>
        )}

        {/* Lista de órdenes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Package className="w-6 h-6 text-gray-700 mr-2" />
              <h2 className="text-xl font-semibold">Órdenes ({orders.length})</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No hay órdenes aún
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.userId.slice(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'activa'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'finalizada'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {order.status}
                        </span>
                        {order.finalizedByAdmin && (
                          <span className="ml-2 text-xs text-gray-500">✓ Admin</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {order.status === 'activa' && !order.finalizedByAdmin && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'finalizada', true)}
                              disabled={loading}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Finalizar orden"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'cancelada')}
                              disabled={loading}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              title="Cancelar orden"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
