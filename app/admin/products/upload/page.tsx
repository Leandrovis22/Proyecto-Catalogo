import CSVUploader from '@/components/admin/CSVUploader';

export default function AdminProductsUploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Importar catálogo CSV</h1>
        <CSVUploader />
      </div>
    </div>
  );
}
