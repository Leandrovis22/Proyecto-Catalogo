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

  if (!data) {
    notFound();
  }

  return (
    <div className="py-6">
      <ProductDetail product={data} />
    </div>
  );
}