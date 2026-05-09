'use client'
import { useState, useEffect } from 'react'
import { ParseInput } from '@/components/commandes/ParseInput'
import { OrderCard } from '@/components/commandes/OrderCard'
import type { Order, OrderStatus } from '@/types'

const STATUS_FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'Toutes', value: 'all' },
  { label: 'À traiter', value: 'a_traiter' },
  { label: 'Validée', value: 'validee' },
  { label: 'En préparation', value: 'en_preparation' },
  { label: 'Prête', value: 'prete' },
  { label: 'Livrée', value: 'livree' },
  { label: 'Escalade', value: 'escalade' },
]

export default function CommandesPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/commandes')
      const data = await res.json() as Order[]
      setOrders(data)
    } catch {
      // silencieux
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Commandes</h1>
        <span className="text-sm text-gray-400">{orders.length} commande(s)</span>
      </div>

      <ParseInput onParsed={() => fetchOrders()} />

      {/* Filtres par statut */}
      <div className="flex flex-wrap gap-1">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
            {f.value !== 'all' && (
              <span className="ml-1">
                ({orders.filter(o => o.status === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Liste commandes */}
      {loading ? (
        <div className="text-sm text-gray-400 text-center py-8">Chargement...</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-gray-400 text-center py-8 bg-white border border-gray-200 rounded-lg">
              Aucune commande{filter !== 'all' ? ' dans cette catégorie' : ''}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
