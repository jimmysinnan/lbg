import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateReference } from '@/lib/utils'

export async function GET(_req: NextRequest) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, location:locations(name), order_items(*, product:products(name, flavor))')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const reference = generateReference()

  const { data, error } = await supabase
    .from('orders')
    .insert({ ...body, reference })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
