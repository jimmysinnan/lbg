import { supabase } from '@/lib/supabase'
import { todayISO } from '@/lib/utils'
import { KPICard } from '@/components/dashboard/KPICard'
import { OrderPipeline } from '@/components/dashboard/OrderPipeline'
import { QuickActions } from '@/components/dashboard/QuickActions'
import type { Order } from '@/types'

async function getTodayOrders(): Promise<Order[]> {
  const today = todayISO()
  const { data } = await supabase
    .from('orders')
    .select('*, location:locations(name), order_items(quantity, unit_price, product:products(name))')
    .gte('created_at', `${today}T00:00:00.000Z`)
    .order('created_at', { ascending: false })
  return (data ?? []) as Order[]
}

export default async function DashboardPage() {
  const orders = await getTodayOrders()
  const active  = orders.filter(o => o.status !== 'annulee')
  const ca      = active.reduce((s, o) => s + (Number(o.total_amount) || 0), 0)
  const aTraiter = orders.filter(o => o.status === 'a_traiter').length
  const escalades = orders.filter(o => o.escalate && o.status === 'a_traiter').length
  const livrees   = orders.filter(o => o.status === 'livree').length

  const now = new Date()
  const heure = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const date  = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <span style={{ fontSize: '26px' }}>🍦</span>
            <h1 style={{
              fontFamily: 'var(--fraunces)',
              fontSize: '26px',
              fontWeight: 900,
              fontStyle: 'italic',
              color: 'var(--brown)',
              lineHeight: 1,
            }}>
              Bonjour
            </h1>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--brown3)' }}>
            {date.charAt(0).toUpperCase() + date.slice(1)} · {heure}
          </p>
        </div>
        <div style={{
          background: 'var(--brown)',
          borderRadius: '12px',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--teal2)', animation: 'pulse-dot 2s infinite', display: 'inline-block' }} />
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--sans)' }}>
            Supabase · Claude · En ligne
          </span>
        </div>
      </div>

      {/* ── Alerte escalades ── */}
      {escalades > 0 && (
        <div style={{
          background: 'rgba(180,48,48,0.06)',
          border: '1px solid rgba(180,48,48,0.2)',
          borderLeft: '4px solid var(--red)',
          borderRadius: '12px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '22px' }}>🚨</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--red)' }}>
              {escalades} commande{escalades > 1 ? 's' : ''} en escalade humaine
            </div>
            <div style={{ fontSize: '12px', color: 'var(--brown3)', marginTop: '2px' }}>
              Ces commandes nécessitent votre attention avant validation
            </div>
          </div>
        </div>
      )}

      {/* ── KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }} className="kpi-grid">
        <KPICard label="🛒 Commandes" value={orders.length} accent="caramel" />
        <KPICard label="💰 CA du jour" value={`${ca.toFixed(2)}€`} accent="teal" />
        <KPICard
          label="⏳ À traiter"
          value={aTraiter}
          accent="sky"
          highlight={aTraiter > 0}
          delta={aTraiter > 0 ? `${aTraiter} en attente` : '✓ Tout traité'}
          deltaPositive={aTraiter === 0}
        />
        <KPICard
          label="⚡ Livrées"
          value={livrees}
          accent="rose"
          delta={`sur ${orders.length} commandes`}
          deltaPositive={livrees > 0}
        />
      </div>

      {/* ── Actions rapides ── */}
      <QuickActions />

      {/* ── Pipeline ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span style={{ fontSize: '16px' }}>📋</span>
          <h2 style={{
            fontFamily: 'var(--fraunces)',
            fontSize: '16px',
            fontWeight: 700,
            fontStyle: 'italic',
            color: 'var(--brown)',
          }}>
            Pipeline du jour
          </h2>
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '20px',
            background: 'rgba(196,98,26,0.1)',
            color: 'var(--caramel)',
            fontWeight: 600,
          }}>
            {active.length} actives
          </span>
        </div>
        <OrderPipeline orders={orders} />
      </div>

      {/* ── Stats secondaires ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }} className="kpi-grid">
        <KPICard label="✅ Validées" value={orders.filter(o => o.status === 'validee').length} accent="teal" />
        <KPICard label="🍦 En préparation" value={orders.filter(o => o.status === 'en_preparation').length} accent="caramel" />
        <KPICard label="❌ Annulées" value={orders.filter(o => o.status === 'annulee').length} accent="rose" />
      </div>

    </div>
  )
}
