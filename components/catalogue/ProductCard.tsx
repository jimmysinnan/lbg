'use client'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onToggle: (id: string, available: boolean) => void
  onEdit: (product: Product) => void
}

const categoryLabels: Record<string, string> = {
  yolice: 'YOL\'ICE',
  aperitif_glace: 'Apéritif glacé',
  coffret_personnalise: 'Coffret',
}

const formatLabels: Record<string, string> = {
  unite: 'Unité',
  coffret_8: 'Coffret ×8',
  coffret_20: 'Coffret ×20',
}

export function ProductCard({ product, onToggle, onEdit }: ProductCardProps) {
  return (
    <div className={`bg-white rounded-lg border p-4 transition-opacity ${!product.available ? 'opacity-50' : ''}`}
      style={{ borderColor: product.available ? '#e5e7eb' : '#fca5a5' }}
    >
      <div className="flex items-start gap-3">
        {/* Image ou placeholder */}
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="w-14 h-14 rounded-md object-cover shrink-0 bg-gray-100"
          />
        ) : (
          <div className="w-14 h-14 rounded-md bg-gray-100 shrink-0 flex items-center justify-center text-2xl">
            🍦
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-gray-900">{product.name}</div>
              {product.flavor && (
                <div className="text-xs text-gray-500 mt-0.5">{product.flavor}</div>
              )}
              <div className="flex flex-wrap gap-1 mt-1.5">
                <Badge label={categoryLabels[product.category] ?? product.category} variant="blue" />
                <Badge label={formatLabels[product.format] ?? product.format} />
              </div>
            </div>

            {/* Toggle disponibilité */}
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs font-medium ${product.available ? 'text-green-600' : 'text-red-500'}`}>
                {product.available ? 'Actif' : 'Inactif'}
              </span>
              <button
                onClick={() => onToggle(product.id, !product.available)}
                className={`relative inline-flex h-5 w-9 rounded-full transition-colors focus:outline-none ${
                  product.available ? 'bg-green-500' : 'bg-gray-300'
                }`}
                title={product.available ? 'Désactiver' : 'Activer'}
                aria-label={`${product.available ? 'Désactiver' : 'Activer'} ${product.name}`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform mt-0.5 ${
                    product.available ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Prix et stock */}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
            {product.price_unit && <span>Unité : <strong>{product.price_unit}€</strong></span>}
            {product.price_box8 && <span>×8 : <strong>{product.price_box8}€</strong></span>}
            {product.price_box20 && <span>×20 : <strong>{product.price_box20}€</strong></span>}
            {product.stock_estimated !== null && (
              <span className={product.stock_estimated === 0 ? 'text-red-600 font-medium' : ''}>
                Stock : {product.stock_estimated === 0 ? 'Épuisé' : product.stock_estimated}
              </span>
            )}
          </div>

          <Button size="sm" variant="ghost" onClick={() => onEdit(product)} className="mt-2">
            Modifier
          </Button>
        </div>
      </div>
    </div>
  )
}
