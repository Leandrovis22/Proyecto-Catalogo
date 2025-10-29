import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Tienda - Catálogo',
  description: 'Catálogo de productos con carrito de compras'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <header className="bg-slate-50 border-b">
          <div className="container py-4 flex items-center justify-between">
            <h1 className="text-lg font-semibold">Mi Tienda</h1>
            <nav>
              <a href="/" className="mr-4">Catálogo</a>
              <a href="/cart">Carrito</a>
            </nav>
          </div>
        </header>

        <main className="container py-8">{children}</main>

        <footer className="border-t mt-8 py-6 text-center text-sm text-slate-500">
          Hecho con ❤️ • Tienda Nube CSV importer
        </footer>
      </body>
    </html>
  )
}
