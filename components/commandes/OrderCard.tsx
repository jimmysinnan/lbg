import Link from 'next/link'
import { StatusBadge } from './StatusBadge'
import { Badge } from '@/components/ui/Badge'
import type { Order } from '@/types'

export function OrderCard({ order }: { order: Order }) {
  const timeStr = new Date(order.created_at).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Link href={`/commandes/${order.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900">{order.reference}</div>
            <div className="text-xs text-gray-500 mt-0.5 truncate">
              {order.customer_name ?? order.customer_phone ?? 'Client inconnu'}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {order.escalate && <Badge label="Escalade ⚠" variant="red" />}
            {order.confidence === 'low' && <Badge label="Confiance faible" variant="yellow" />}
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
          <span>{timeStr}</span>
          {order.location && <span>📍 {(order.location as unknown as { name: string })?.name}</span>}
          {order.total_amount && (
            <span className="text-gray-700 font-medium">{Number(order.total_amount).toFixed(2)}€</span>
          )}
        </div>
      </div>
    </Link>
  )
}
