import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { parseWhatsAppMessage } from '@/lib/claude'
import { currentMonth } from '@/lib/utils'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { message } = body as { message?: string }

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Le champ "message" est requis et ne peut pas être vide' }, { status: 400 })
  }

  // Catalogue actif du mois (produits disponibles uniquement)
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('*')
    .eq('available', true)
    .eq('month_active', currentMonth())

  if (prodErr) {
    return NextResponse.json({ error: 'Erreur récupération catalogue' }, { status: 500 })
  }

  // Lieux actifs
  const { data: locations, error: locErr } = await supabase
    .from('locations')
    .select('*')
    .eq('active', true)

  if (locErr) {
    return NextResponse.json({ error: 'Erreur récupération lieux' }, { status: 500 })
  }

  const parsed = await parseWhatsAppMessage(
    message,
    products ?? [],
    locations ?? []
  )

  return NextResponse.json(parsed)
}
