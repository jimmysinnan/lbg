import Link from 'next/link'
import { StatusBadge } from '@/components/commandes/StatusBadge'
import type { Order, OrderStatus } from '@/types'

const COLUMNS: { status: OrderStatus; accent: string }[] = [
  { status: 'a_traiter',      accent: 'var(--gold)' },
  { status: 'validee',        accent: 'var(--sky)' },
  { status: 'en_preparation', accent: 'var(--cara2)' },
  { status: 'prete',          accent: 'var(--teal)' },
]

export function OrderPipeline({ orders }: { orders: Order[] }) {
  const byStatus = (s: OrderStatus) => orders.filter(o => o.status === s)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
      overflowX: 'auto',
      minWidth: 0,
    }}
    className="pipeline-grid"
    >
      {COLUMNS.map(({ status, accent }) => {
        const col = byStatus(status)
        return (
          <div key={status} style={{
            background: '#fff',
            borderRadius: '14px',
            border: '1px solid var(--bord)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow)',
          }}>
            {/* Header colonne */}
            <div style={{
              padding: '12px 14px',
              borderBottom: `2px solid ${accent}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--cream2)',
            }}>
              <StatusBadge status={status} />
              <span style={{
                fontFamily: 'var(--fraunces)',
                fontSize: '20px',
                fontWeight: 900,
                color: accent,
                lineHeight: 1,
              }}>
                {col.length}
              </span>
            </div>

            {/* Cards */}
            <div style={{ padding: '10px', minHeight: '80px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {col.map(order => (
                <Link key={order.id} href={`/commandes/${order.id}`} style={{
                  display: 'block',
                  background: 'var(--cream)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  border: '1px solid var(--bord)',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
                className="pipeline-card"
                >
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--brown)',
                    fontFamily: 'var(--mono)',
                    letterSpacing: '0.03em',
                  }}>
                    {order.reference}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--brown3)',
                    marginTop: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {order.customer_name ?? order.customer_phone ?? 'Client'}
                  </div>
                  {order.total_amount && (
                    <div style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: 'var(--caramel)',
                      marginTop: '4px',
                      fontFamily: 'var(--fraunces)',
                    }}>
                      {Number(order.total_amount).toFixed(2)}€
                    </div>
                  )}
                  {order.escalate && (
                    <div style={{
                      fontSize: '10px',
                      color: 'var(--red)',
                      fontWeight: 600,
                      marginTop: '3px',
                    }}>
                      ⚠ Escalade
                    </div>
                  )}
                </Link>
              ))}
              {col.length === 0 && (
                <div style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: 'rgba(58,37,16,0.2)',
                  padding: '20px 0',
                  fontStyle: 'italic',
                }}>
                  Vide
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
