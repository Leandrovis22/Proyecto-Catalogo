'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-800">
            Catálogo
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">
            {status === 'loading' ? (
              <div className="animate-pulse">Cargando...</div>
            ) : session ? (
              <>
                {/* Cart */}
                <Link
                  href="/cart"
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="hidden sm:inline">Carrito</span>
                </Link>

                {/* My Orders */}
                <Link
                  href="/orders"
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">Mis Órdenes</span>
                </Link>

                {/* Admin Panel */}
                {session.user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}

                {/* User email and logout */}
                <div className="flex items-center gap-3 pl-4 border-l">
                  <span className="text-sm text-gray-600 hidden sm:inline">
                    {session.user.email}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 text-gray-700 hover:text-red-600"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="hidden sm:inline">Salir</span>
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
