import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { renderTemplate } from '@/lib/templates'

type BatchAction = 'valider_tout' | 'marquer_prete' | 'marquer_livree'

interface BatchRequest {
  action: BatchAction
  orderIds?: string[]
}

async function sendTemplateToOrder(
  order: Record<string, unknown>,
  slug: string
): Promise<void> {
  if (!order.customer_phone) return

  const { data: template } = await supabase
    .from('wa_templates')
    .select('body_template')
    .eq('slug', slug)
    .single()

  if (!template) return

  const location = order.location as { name: string } | null

  const body = renderTemplate(template.body_template as string, {
    prenom: (order.customer_name as string) ?? 'Client',
    reference: order.reference as string,
    details: JSON.stringify((order.parsed_data as { items?: unknown[] } | null)?.items ?? []),
    montant: order.total_amount != null ? (order.total_amount as number).toFixed(2) : '—',
    lieu: location?.name ?? '—',
    horaire: (order.pickup_time as string) ?? '—',
  })

  await sendWhatsAppMessage(order.customer_phone as string, body)
}

export async function POST(req: NextRequest) {
  const { action, orderIds } = await req.json() as BatchRequest

  // Action 1 : Valider toutes les commandes éligibles
  if (action === 'valider_tout') {
    const { data: eligibles, error } = await supabase
      .from('orders')
      .select('*, location:locations(name)')
      .eq('status', 'a_traiter')
      .eq('escalate', false)
      .in('confidence', ['high', 'medium'])

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Filtre supplémentaire : pas de champs manquants
    const toValidate = (eligibles ?? []).filter(
      o => (o.missing_fields as string[])?.length === 0
    )

    const results = await Promise.allSettled(
      toValidate.map(async (order) => {
        await supabase.from('orders').update({ status: 'validee' }).eq('id', order.id)
        await sendTemplateToOrder(order, 'commande_validee')
      })
    )

    const success = results.filter(r => r.status === 'fulfilled').length
    return NextResponse.json({ success, total: toValidate.length })
  }

  // Actions 2 & 3 : Marquer prête ou livrée sur sélection
  if ((action === 'marquer_prete' || action === 'marquer_livree') && orderIds?.length) {
    const newStatus = action === 'marquer_prete' ? 'prete' : 'livree'
    const templateSlug = action === 'marquer_prete' ? 'commande_prete' : 'commande_livree'

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, location:locations(name)')
      .in('id', orderIds)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const results = await Promise.allSettled(
      (orders ?? []).map(async (order) => {
        await supabase.from('orders').update({ status: newStatus }).eq('id', order.id)
        await sendTemplateToOrder(order, templateSlug)
      })
    )

    const success = results.filter(r => r.status === 'fulfilled').length
    return NextResponse.json({ success, total: orderIds.length })
  }

  return NextResponse.json({ error: 'Action inconnue ou paramètres manquants' }, { status: 400 })
}
