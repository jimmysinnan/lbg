import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { parseWhatsAppMessage } from '@/lib/claude'
import { verifyWebhookSignature } from '@/lib/whatsapp'
import { generateReference, currentMonth } from '@/lib/utils'

// GET — Vérification webhook Meta (phase d'inscription)
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const mode = params.get('hub.mode')
  const token = params.get('hub.verify_token')
  const challenge = params.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }
  return new NextResponse('Forbidden', { status: 403 })
}

// POST — Réception des messages WhatsApp entrants
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-hub-signature-256') ?? ''

  if (!verifyWebhookSignature(body, signature, process.env.META_APP_SECRET ?? '')) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  let data: Record<string, unknown>
  try {
    data = JSON.parse(body)
  } catch {
    return new NextResponse('Bad Request', { status: 400 })
  }

  // Extraire le message WhatsApp depuis la structure Meta
  const entry = (data.entry as Array<Record<string, unknown>>)?.[0]
  const change = (entry?.changes as Array<Record<string, unknown>>)?.[0]
  const value = change?.value as Record<string, unknown> | undefined
  const messages = value?.messages as Array<Record<string, unknown>> | undefined
  const message = messages?.[0]

  // Ignorer les non-messages (statuts, notifications, etc.)
  if (!message || message.type !== 'text') {
    return NextResponse.json({ status: 'ignored' })
  }

  const phone = message.from as string
  const messageBody = (message.text as { body: string }).body
  const waMessageId = message.id as string
  const timestamp = new Date(parseInt(message.timestamp as string) * 1000).toISOString()

  // Log du message entrant
  await supabase.from('wa_messages').insert({
    wa_message_id: waMessageId,
    direction: 'inbound',
    phone,
    body: messageBody,
    timestamp,
  })

  // Récupérer catalogue actif et lieux pour l'IA
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('available', true)
    .eq('month_active', currentMonth())

  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('active', true)

  // Parser avec Claude
  const parsed = await parseWhatsAppMessage(
    messageBody,
    products ?? [],
    locations ?? []
  )

  // Créer la précommande (jamais confirmée automatiquement)
  const reference = generateReference()
  await supabase.from('orders').insert({
    reference,
    customer_phone: phone,
    customer_name: parsed.customer_name,
    raw_message: messageBody,
    parsed_data: parsed,
    status: 'a_traiter',
    confidence: parsed.confidence,
    missing_fields: parsed.missing_fields,
    escalate: parsed.escalate,
    escalate_reason: parsed.escalate_reason,
    wa_message_id: waMessageId,
  })

  return NextResponse.json({ status: 'ok' })
}
