import { NextRequest } from 'next/server'

const mockParsedOrder = {
  customer_name: 'Marie',
  customer_phone: null,
  items: [{ product_name: 'Cerise Hibiscus', flavor: null, quantity: 2, format: 'unite', available: true }],
  location: 'Galeries Bois Quarré – Lamentin',
  pickup_date: null,
  pickup_time: null,
  special_notes: null,
  confidence: 'high',
  missing_fields: [],
  question_a_poser: null,
  escalate: false,
  escalate_reason: null,
  notes_agent: null,
}

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn((table: string) => {
      if (table === 'products') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                data: [{ id: '1', name: 'Cerise Hibiscus', available: true, month_active: '2026-05' }],
                error: null,
              })
            })
          })
        }
      }
      if (table === 'locations') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: [{ id: '1', name: 'Galeries Bois Quarré – Lamentin', type: 'retrait', active: true }],
              error: null,
            })
          })
        }
      }
      return { select: jest.fn().mockResolvedValue({ data: [], error: null }) }
    })
  }
}))

jest.mock('@/lib/claude', () => ({
  parseWhatsAppMessage: jest.fn().mockResolvedValue(mockParsedOrder),
}))

describe('POST /api/ia/parse', () => {
  beforeEach(() => jest.clearAllMocks())

  it('retourne un ParsedOrder structuré depuis un message valide', async () => {
    const { POST } = await import('@/app/api/ia/parse/route')
    const req = new NextRequest('http://localhost/api/ia/parse', {
      method: 'POST',
      body: JSON.stringify({ message: 'Bonjour je veux 2 Cerise Hibiscus retrait Lamentin' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.confidence).toBe('high')
    expect(body.escalate).toBe(false)
    expect(body.items).toHaveLength(1)
  })

  it('retourne 400 si le message est absent', async () => {
    const { POST } = await import('@/app/api/ia/parse/route')
    const req = new NextRequest('http://localhost/api/ia/parse', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('retourne 400 si le message est une chaîne vide', async () => {
    const { POST } = await import('@/app/api/ia/parse/route')
    const req = new NextRequest('http://localhost/api/ia/parse', {
      method: 'POST',
      body: JSON.stringify({ message: '   ' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
