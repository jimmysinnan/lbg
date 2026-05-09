import { supabase } from '@/lib/supabase'
import { todayISO } from '@/lib/utils'
import { KPICard } from '@/components/dashboard/KPICard'
import { OrderPipeline } from '@/components/dashboard/OrderPipeline'
import type { Order } from '@/types'

async function getTodayOrders(): Promise<Order[]> {
  const today = todayISO()
  const { data, error } = await supabase
    .from('orders')
    .select('*, location:locations(name), order_items(quantity, unit_price, product:products(name))')
    .gte('created_at', `${today}T00:00:00.000Z`)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data ?? []) as Order[]
}

export default async function DashboardPage() {
  const orders = await getTodayOrders()

  const active = orders.filter(o => o.status !== 'annulee')
  const ca = active.reduce((s, o) => s + (Number(o.total_amount) || 0), 0)
  const aTraiter = orders.filter(o => o.status === 'a_traiter').length
  const escalades = orders.filter(o => o.escalate && o.status === 'a_traiter').length
  const livrees = orders.filter(o => o.status === 'livree').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
          <p className="text-xs text-gray-400 mt-0.5">{todayISO()}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          label="Commandes aujourd'hui"
          value={orders.length}
        />
        <KPICard
          label="CA estimé du jour"
          value={`${ca.toFixed(2)}€`}
        />
        <KPICard
          label="À traiter"
          value={aTraiter}
          highlight={aTraiter > 0}
          delta={aTraiter > 0 ? `${aTraiter} en attente de validation` : 'Tout est traité'}
          deltaPositive={aTraiter === 0}
        />
        <KPICard
          label="Escalades"
          value={escalades}
          highlight={escalades > 0}
          delta={escalades > 0 ? 'Nécessitent attention' : 'Aucune escalade'}
          deltaPositive={escalades === 0}
        />
      </div>

      {/* Actions rapides — placeholder pour T13 */}
      <div id="quick-actions-placeholder" className="bg-white border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-400">Actions rapides (T13)</p>
      </div>

      {/* Pipeline */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Pipeline du jour</h2>
        <OrderPipeline orders={orders} />
      </div>

      {/* Stats basses */}
      <div className="grid grid-cols-3 gap-4">
        <KPICard label="Livrées" value={livrees} />
        <KPICard label="Annulées" value={orders.filter(o => o.status === 'annulee').length} />
        <KPICard label="Commandes actives" value={active.length} />
      </div>
    </div>
  )
}
