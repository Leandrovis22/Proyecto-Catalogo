
import CSVUploader from '@/components/admin/CSVUploader';
import SyncImagesButton from '@/components/admin/SyncImagesButton';

export default function AdminProductsUploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Importar catálogo CSV</h1>
        <CSVUploader />
        <div className="mt-8">
          <SyncImagesButton />
        </div>
      </div>
    </div>
  );
}
