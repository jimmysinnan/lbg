import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateDailyExport } from '@/lib/excel'
import { todayISO } from '@/lib/utils'
import type { Order } from '@/types'

export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date') ?? todayISO()

  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, location:locations(name), order_items(*, product:products(name, flavor))')
    .gte('created_at', `${date}T00:00:00.000Z`)
    .lte('created_at', `${date}T23:59:59.999Z`)
    .neq('status', 'annulee')
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const buffer = await generateDailyExport((orders ?? []) as Order[])

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="lbg-${date}.xlsx"`,
      'Content-Length': String(buffer.length),
    },
  })
}
