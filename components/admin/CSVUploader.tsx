
"use client";
import React, { useState } from 'react';

export default function CSVUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setSuccess(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Selecciona un archivo CSV.');
      return;
    }
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/products/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Catálogo actualizado correctamente.');
      } else {
        setError(data.error || 'Error al actualizar catálogo.');
      }
    } catch (err) {
      setError('Error de red o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-white shadow max-w-md mx-auto">
      <h2 className="text-lg font-bold mb-2">Subir catálogo CSV TiendaNube</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-2"
      />
      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Subiendo...' : 'Subir y actualizar'}
      </button>
      {success && <div className="mt-2 text-green-600">{success}</div>}
      {error && <div className="mt-2 text-red-600">{error}</div>}
      <div className="mt-4 text-sm text-gray-500">
        El archivo debe tener el formato exportado por TiendaNube.<br />
        Al subir, se borrarán y actualizarán todos los productos y variantes.
      </div>
    </div>
  );
}
