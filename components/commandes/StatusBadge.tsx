import { Badge } from '@/components/ui/Badge'
import type { OrderStatus } from '@/types'

type BadgeVariant = 'default' | 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange'

const statusConfig: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
  a_traiter:      { label: 'À traiter', variant: 'yellow' },
  validee:        { label: 'Validée', variant: 'blue' },
  en_preparation: { label: 'En préparation', variant: 'orange' },
  prete:          { label: 'Prête', variant: 'green' },
  livree:         { label: 'Livrée', variant: 'gray' },
  annulee:        { label: 'Annulée', variant: 'red' },
  escalade:       { label: 'Escalade ⚠', variant: 'red' },
}

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status]
  return <Badge label={config.label} variant={config.variant} />
}
