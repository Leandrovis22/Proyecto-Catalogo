'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, User, LogOut, Settings } from 'lucide-react';
import CartButton from '../cart/CartButton';

export default function Header() {
  const { data: session, status } = useSession();

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          MiTienda
        </Link>
        <div className="flex items-center space-x-4">
          <CartButton />
          {status === 'authenticated' ? (
            <div className="flex items-center space-x-2">
              <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                <User size={20} />
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-700 hover:text-red-600"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="text-gray-700 hover:text-blue-600">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}