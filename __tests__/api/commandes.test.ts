import { NextRequest } from 'next/server'

const mockOrders = [
  {
    id: 'order-1', reference: 'LBG-001', status: 'a_traiter',
    escalate: false, confidence: 'high', missing_fields: [],
    customer_phone: '596123456', customer_name: 'Marie',
    total_amount: 7.00, pickup_time: null, location: null, parsed_data: null
  }
]

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ data: mockOrders, error: null })
        }),
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockOrders[0], error: null }),
          in: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: mockOrders, error: null })
          })
        }),
        in: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: mockOrders, error: null })
        })
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { ...mockOrders[0], reference: 'LBG-NEW-001' }, error: null })
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { ...mockOrders[0], status: 'validee' }, error: null })
          }),
          mockResolvedValue: jest.fn().mockResolvedValue({ error: null })
        })
      }),
    })
  }
}))

jest.mock('@/lib/whatsapp', () => ({
  sendWhatsAppMessage: jest.fn().mockResolvedValue({ messageId: 'msg-out-001' })
}))

jest.mock('@/lib/templates', () => ({
  renderTemplate: jest.fn().mockReturnValue('Message de test')
}))

jest.mock('@/lib/utils', () => ({
  generateReference: jest.fn().mockReturnValue('LBG-NEW-001'),
  currentMonth: jest.fn().mockReturnValue('2026-05')
}))

describe('GET /api/commandes', () => {
  it('retourne la liste des commandes', async () => {
    const { GET } = await import('@/app/api/commandes/route')
    const req = new NextRequest('http://localhost/api/commandes')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
  })
})

describe('POST /api/commandes', () => {
  it('crée une commande avec une référence générée', async () => {
    const { POST } = await import('@/app/api/commandes/route')
    const req = new NextRequest('http://localhost/api/commandes', {
      method: 'POST',
      body: JSON.stringify({ customer_name: 'Marie', status: 'a_traiter' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
  })
})

describe('PATCH /api/commandes/[id]', () => {
  it('met à jour le statut d\'une commande', async () => {
    const { PATCH } = await import('@/app/api/commandes/[id]/route')
    const req = new NextRequest('http://localhost/api/commandes/order-1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'validee' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: 'order-1' }) })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('validee')
  })
})

describe('POST /api/commandes/batch', () => {
  it('retourne 400 pour une action inconnue', async () => {
    const { POST } = await import('@/app/api/commandes/batch/route')
    const req = new NextRequest('http://localhost/api/commandes/batch', {
      method: 'POST',
      body: JSON.stringify({ action: 'action_inconnue' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
