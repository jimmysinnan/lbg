import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { renderTemplate } from '@/lib/templates'

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    orderId: string
    templateSlug?: string
    customMessage?: string
  }

  const { orderId, templateSlug, customMessage } = body

  if (!orderId) {
    return NextResponse.json({ error: 'orderId requis' }, { status: 400 })
  }

  if (!templateSlug && !customMessage) {
    return NextResponse.json({ error: 'templateSlug ou customMessage requis' }, { status: 400 })
  }

  // Récupérer la commande
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*, location:locations(name)')
    .eq('id', orderId)
    .single()

  if (orderErr || !order) {
    return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
  }

  if (!order.customer_phone) {
    return NextResponse.json({ error: 'Numéro de téléphone client manquant' }, { status: 400 })
  }

  let messageBody: string

  if (customMessage) {
    messageBody = customMessage
  } else {
    // Récupérer le template
    const { data: template, error: tplErr } = await supabase
      .from('wa_templates')
      .select('body_template')
      .eq('slug', templateSlug!)
      .single()

    if (tplErr || !template) {
      return NextResponse.json({ error: 'Template introuvable' }, { status: 404 })
    }

    const locationName = (order.location as { name: string } | null)?.name ?? '—'

    messageBody = renderTemplate(template.body_template, {
      prenom: order.customer_name ?? 'Client',
      reference: order.reference,
      details: JSON.stringify(order.parsed_data?.items ?? []),
      montant: order.total_amount != null ? order.total_amount.toFixed(2) : '—',
      lieu: locationName,
      horaire: order.pickup_time ?? '—',
    })
  }

  // Envoyer via Meta API
  const { messageId } = await sendWhatsAppMessage(order.customer_phone, messageBody)

  // Log du message sortant
  await supabase.from('wa_messages').insert({
    wa_message_id: messageId,
    direction: 'outbound',
    phone: order.customer_phone,
    body: messageBody,
    timestamp: new Date().toISOString(),
    order_id: orderId,
  })

  return NextResponse.json({ success: true, messageId })
}
