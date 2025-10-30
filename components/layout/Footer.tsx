import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-6">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">&copy; 2025 MiTienda. Todos los derechos reservados.</p>
          <div className="flex space-x-4">
            <Link href="https://facebook.com" target="_blank" className="text-gray-600 hover:text-blue-600">
              <Facebook size={20} />
            </Link>
            <Link href="https://instagram.com" target="_blank" className="text-gray-600 hover:text-pink-600">
              <Instagram size={20} />
            </Link>
            <Link href="https://twitter.com" target="_blank" className="text-gray-600 hover:text-blue-400">
              <Twitter size={20} />
            </Link>
            <Link href="mailto:contacto@mitienda.com" className="text-gray-600 hover:text-red-600">
              <Mail size={20} />
            </Link>
            <Link href="tel:+123456789" className="text-gray-600 hover:text-green-600">
              <Phone size={20} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}