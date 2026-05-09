'use client'
import { useState } from 'react'
import { ProductCard } from '@/components/catalogue/ProductCard'
import { ProductForm } from '@/components/catalogue/ProductForm'
import { Button } from '@/components/ui/Button'
import type { Product } from '@/types'

export function CatalogueClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const handleToggle = async (id: string, available: boolean) => {
    // Optimistic update
    setProducts(prev => prev.map(p => p.id === id ? { ...p, available } : p))
    try {
      const res = await fetch(`/api/catalogue/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available }),
      })
      if (!res.ok) throw new Error('Erreur API')
    } catch {
      // Rollback si erreur réseau OU erreur serveur
      setProducts(prev => prev.map(p => p.id === id ? { ...p, available: !available } : p))
    }
  }

  const handleEdit = (product: Product) => {
    setEditProduct(product)
    setFormOpen(true)
  }

  const handleSaved = async () => {
    // Recharger les produits depuis l'API
    try {
      const res = await fetch('/api/catalogue')
      const data = await res.json() as Product[]
      setProducts(data)
    } catch { /* silencieux */ }
  }

  const active = products.filter(p => p.available)
  const inactive = products.filter(p => !p.available)

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {active.length} actif(s) · {inactive.length} inactif(s)
        </div>
        <Button size="sm" onClick={() => alert('Création produit — à implémenter en v2')}>
          + Ajouter un produit
        </Button>
      </div>

      <div className="space-y-2">
        {products.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            onToggle={handleToggle}
            onEdit={handleEdit}
          />
        ))}
        {products.length === 0 && (
          <div className="text-sm text-gray-400 text-center py-8 bg-white border border-gray-200 rounded-lg">
            Aucun produit pour ce mois
          </div>
        )}
      </div>

      <ProductForm
        product={editProduct}
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditProduct(null) }}
        onSaved={handleSaved}
      />
    </>
  )
}
