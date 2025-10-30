'use client';

import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function CSVUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccess(false);
      setError(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setSuccess(false);
    setError(false);

    // Simulate file upload
    setTimeout(() => {
      setUploading(false);
      if (Math.random() > 0.5) {
        setSuccess(true);
      } else {
        setError(true);
      }
    }, 2000);
  };

  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Subir archivo CSV</label>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      <Button
        variant="primary"
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? 'Subiendo...' : 'Subir'}
      </Button>
      {success && (
        <div className="flex items-center text-green-600">
          <CheckCircle size={20} className="mr-2" /> Archivo subido con éxito
        </div>
      )}
      {error && (
        <div className="flex items-center text-red-600">
          <AlertCircle size={20} className="mr-2" /> Error al subir el archivo
        </div>
      )}
    </Card>
  );
}