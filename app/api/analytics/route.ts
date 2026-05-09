import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { todayISO } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const period = params.get('period') ?? 'day'
  const date = params.get('date') ?? todayISO()

  // Calculer la plage de dates
  let fromDate: string
  if (period === 'week') {
    const d = new Date(date)
    d.setDate(d.getDate() - 7)
    fromDate = d.toISOString().slice(0, 10)
  } else if (period === 'month') {
    const d = new Date(date)
    d.setDate(1)
    fromDate = d.toISOString().slice(0, 10)
  } else {
    fromDate = date
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, order_items(quantity, unit_price, product:products(name, flavor, category))')
    .gte('created_at', `${fromDate}T00:00:00.000Z`)
    .lte('created_at', `${date}T23:59:59.999Z`)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const all = orders ?? []
  const active = all.filter(o => o.status !== 'annulee')

  const ca = active.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
  const nbCommandes = active.length
  const panierMoyen = nbCommandes > 0 ? ca / nbCommandes : 0

  const validees = all.filter(o => ['validee', 'en_preparation', 'prete', 'livree'].includes(o.status)).length
  const annulees = all.filter(o => o.status === 'annulee').length
  const escalades = all.filter(o => o.escalate === true).length

  // Top produits
  const productCount: Record<string, { name: string; qty: number }> = {}
  for (const order of active) {
    for (const item of (order.order_items ?? []) as Array<{ quantity: number; product?: { name: string } }>) {
      const name = item.product?.name ?? 'Inconnu'
      if (!productCount[name]) productCount[name] = { name, qty: 0 }
      productCount[name].qty += item.quantity
    }
  }
  const topProduits = Object.values(productCount)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5)

  return NextResponse.json({
    ca: Math.round(ca * 100) / 100,
    nbCommandes,
    panierMoyen: Math.round(panierMoyen * 100) / 100,
    tauxValidation: all.length > 0 ? Math.round((validees / all.length) * 100) : 0,
    tauxAnnulation: all.length > 0 ? Math.round((annulees / all.length) * 100) : 0,
    tauxEscalade: all.length > 0 ? Math.round((escalades / all.length) * 100) : 0,
    topProduits,
    periode: { from: fromDate, to: date, type: period },
  })
}
