'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import type { Product, ProductCategory, ProductFormat } from '@/types'

interface ProductFormProps {
  product: Product | null
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function ProductForm({ product, open, onClose, onSaved }: ProductFormProps) {
  const [form, setForm] = useState({
    name: '', flavor: '', category: 'yolice' as ProductCategory,
    format: 'unite' as ProductFormat,
    price_unit: '', price_box8: '', price_box20: '',
    stock_estimated: '', month_active: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        flavor: product.flavor ?? '',
        category: product.category,
        format: product.format,
        price_unit: product.price_unit?.toString() ?? '',
        price_box8: product.price_box8?.toString() ?? '',
        price_box20: product.price_box20?.toString() ?? '',
        stock_estimated: product.stock_estimated?.toString() ?? '',
        month_active: product.month_active ?? '',
      })
    }
  }, [product])

  const handleSave = async () => {
    if (!product || !form.name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/catalogue/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          flavor: form.flavor || null,
          category: form.category,
          format: form.format,
          price_unit: form.price_unit ? parseFloat(form.price_unit) : null,
          price_box8: form.price_box8 ? parseFloat(form.price_box8) : null,
          price_box20: form.price_box20 ? parseFloat(form.price_box20) : null,
          stock_estimated: form.stock_estimated ? parseInt(form.stock_estimated) : null,
          month_active: form.month_active || null,
        }),
      })
      if (!res.ok) throw new Error('Erreur sauvegarde')
      onSaved()
      onClose()
    } catch {
      setError('Impossible de sauvegarder.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Modifier le produit</h2>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nom *</label>
            <input
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Parfum / sous-titre</label>
            <input
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.flavor}
              onChange={e => setForm(f => ({ ...f, flavor: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value as ProductCategory }))}
              >
                <option value="yolice">YOL&apos;ICE</option>
                <option value="aperitif_glace">Apéritif glacé</option>
                <option value="coffret_personnalise">Coffret</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Format</label>
              <select
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                value={form.format}
                onChange={e => setForm(f => ({ ...f, format: e.target.value as ProductFormat }))}
              >
                <option value="unite">Unité</option>
                <option value="coffret_8">Coffret ×8</option>
                <option value="coffret_20">Coffret ×20</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Prix unité (€)</label>
              <input type="number" step="0.01" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.price_unit} onChange={e => setForm(f => ({ ...f, price_unit: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Prix ×8 (€)</label>
              <input type="number" step="0.01" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.price_box8} onChange={e => setForm(f => ({ ...f, price_box8: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Prix ×20 (€)</label>
              <input type="number" step="0.01" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.price_box20} onChange={e => setForm(f => ({ ...f, price_box20: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Stock estimé</label>
              <input type="number" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm" value={form.stock_estimated} placeholder="vide = illimité" onChange={e => setForm(f => ({ ...f, stock_estimated: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Mois actif</label>
              <input className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm font-mono" value={form.month_active} placeholder="2026-05" onChange={e => setForm(f => ({ ...f, month_active: e.target.value }))} />
            </div>
          </div>
        </div>

        {error && <div className="mt-3 text-xs text-red-600">{error}</div>}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose} disabled={saving}>Annuler</Button>
          <Button onClick={handleSave} disabled={saving || !form.name.trim()}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>
    </div>
  )
}
