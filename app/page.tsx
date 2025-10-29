import React from 'react'

export default async function Home() {
  // Server component: we'll fetch products from DB later
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Catálogo</h2>
      <p className="text-slate-600">Carga inicial: No hay productos todavía. Usa el panel de admin para importar CSV.</p>
    </section>
  )
}
