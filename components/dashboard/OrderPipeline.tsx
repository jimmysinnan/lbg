import { StatusBadge } from '@/components/commandes/StatusBadge'
import type { Order, OrderStatus } from '@/types'

const PIPELINE_COLUMNS: OrderStatus[] = ['a_traiter', 'validee', 'en_preparation', 'prete']

interface OrderPipelineProps {
  orders: Order[]
}

export function OrderPipeline({ orders }: OrderPipelineProps) {
  const byStatus = (status: OrderStatus) => orders.filter(o => o.status === status)

  return (
    <div className="grid grid-cols-4 gap-3">
      {PIPELINE_COLUMNS.map(status => {
        const col = byStatus(status)
        return (
          <div key={status} className="bg-gray-50 rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <StatusBadge status={status} />
              <span className="text-sm font-bold text-gray-700">{col.length}</span>
            </div>
            <div className="space-y-2">
              {col.map(order => (
                <a
                  key={order.id}
                  href={`/commandes/${order.id}`}
                  className="block bg-white rounded border border-gray-200 p-2 text-xs hover:border-blue-300 transition-colors"
                >
                  <div className="font-semibold text-gray-900 truncate">{order.reference}</div>
                  <div className="text-gray-500 truncate mt-0.5">
                    {order.customer_name ?? order.customer_phone ?? 'Client inconnu'}
                  </div>
                  {order.total_amount && (
                    <div className="text-gray-700 font-medium mt-0.5">{Number(order.total_amount).toFixed(2)}€</div>
                  )}
                  {order.escalate && (
                    <div className="text-red-600 font-medium mt-0.5">⚠ Escalade</div>
                  )}
                </a>
              ))}
              {col.length === 0 && (
                <div className="text-xs text-gray-400 text-center py-6">—</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
