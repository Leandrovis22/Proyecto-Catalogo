'use client';

import { useState } from 'react';

export default function SyncImagesButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    if (!confirm('¿Sincronizar imágenes desde Google Drive a R2? Esto puede tardar varios minutos.')) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/sync-images', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error desconocido');
      }

      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-2">🔄 Sincronizar Imágenes</h2>
      <p className="text-gray-600 text-sm mb-4">
        Descarga las imágenes desde Google Drive y las guarda en R2 (Cloudflare).
        Solo necesitas hacer esto cuando las imágenes cambien en Drive.
      </p>

      <button
        onClick={handleSync}
        disabled={loading}
        className={`px-6 py-3 rounded-lg font-medium transition-colors ${
          loading
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {loading ? '⏳ Sincronizando...' : '🔄 Sincronizar Ahora'}
      </button>

      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-bold text-green-800 mb-2">✅ Sincronización exitosa</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>📸 Encontradas: <strong>{result.stats.found}</strong></li>
            <li>✅ Descargadas: <strong>{result.stats.downloaded}</strong></li>
            <li>❌ Errores: <strong>{result.stats.errors}</strong></li>
            <li>💾 Actualizadas en DB: <strong>{result.stats.dbUpdated}</strong></li>
          </ul>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-bold text-red-800 mb-2">❌ Error</h3>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
        <strong>💡 Tip:</strong> Las imágenes se sincronizan automáticamente cuando subes el CSV.
        Este botón es solo para re-sincronizar si necesitas actualizar las imágenes sin volver a subir el CSV.
      </div>
    </div>
  );
}
