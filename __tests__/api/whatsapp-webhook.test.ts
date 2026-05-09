import { NextRequest } from 'next/server'
import crypto from 'crypto'

// Variables d'environnement pour les tests
process.env.META_VERIFY_TOKEN = 'lbg-test-token'
process.env.META_APP_SECRET = 'test-app-secret'

function makeSignature(body: string, secret = 'test-app-secret'): string {
  return 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex')
}

const mockOrders = [{ id: 'order-1', reference: 'LBG-001', customer_phone: '596123456' }]

jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
          single: jest.fn().mockResolvedValue({ data: mockOrders[0], error: null }),
        })
      })
    })
  }
}))

jest.mock('@/lib/claude', () => ({
  parseWhatsAppMessage: jest.fn().mockResolvedValue({
    customer_name: null, customer_phone: null, items: [],
    location: null, pickup_date: null, pickup_time: null,
    special_notes: null, confidence: 'low', missing_fields: ['tous'],
    question_a_poser: null, escalate: true,
    escalate_reason: 'Message incomplet', notes_agent: null,
  })
}))

jest.mock('@/lib/utils', () => ({
  generateReference: jest.fn().mockReturnValue('LBG-20260508-TEST'),
  currentMonth: jest.fn().mockReturnValue('2026-05'),
}))

describe('GET /api/whatsapp/webhook (vérification Meta)', () => {
  it('retourne le challenge si le token est correct', async () => {
    const { GET } = await import('@/app/api/whatsapp/webhook/route')
    const req = new NextRequest(
      'http://localhost/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=lbg-test-token&hub.challenge=ABC123'
    )
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('ABC123')
  })

  it('retourne 403 si le token est incorrect', async () => {
    const { GET } = await import('@/app/api/whatsapp/webhook/route')
    const req = new NextRequest(
      'http://localhost/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong-token&hub.challenge=ABC123'
    )
    const res = await GET(req)
    expect(res.status).toBe(403)
  })
})

describe('POST /api/whatsapp/webhook (réception message)', () => {
  it('accepte un message valide avec signature correcte', async () => {
    const { POST } = await import('@/app/api/whatsapp/webhook/route')
    const payload = JSON.stringify({
      object: 'whatsapp_business_account',
      entry: [{
        changes: [{
          value: {
            messages: [{
              id: 'msg-001',
              from: '596123456',
              timestamp: '1715000000',
              text: { body: 'Bonjour, je veux 2 glaces Cerise Hibiscus' },
              type: 'text',
            }]
          }
        }]
      }]
    })

    const req = new NextRequest('http://localhost/api/whatsapp/webhook', {
      method: 'POST',
      body: payload,
      headers: { 'x-hub-signature-256': makeSignature(payload) },
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
  })

  it('retourne 401 si la signature est invalide', async () => {
    const { POST } = await import('@/app/api/whatsapp/webhook/route')
    const req = new NextRequest('http://localhost/api/whatsapp/webhook', {
      method: 'POST',
      body: '{"test": true}',
      headers: { 'x-hub-signature-256': 'sha256=invalide' },
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('ignore les messages non-texte (statuts, etc.)', async () => {
    const { POST } = await import('@/app/api/whatsapp/webhook/route')
    const payload = JSON.stringify({
      entry: [{ changes: [{ value: { statuses: [{ id: 'st-1' }] } }] }]
    })
    const req = new NextRequest('http://localhost/api/whatsapp/webhook', {
      method: 'POST',
      body: payload,
      headers: { 'x-hub-signature-256': makeSignature(payload) },
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ignored')
  })
})
