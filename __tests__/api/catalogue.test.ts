import { NextRequest } from 'next/server'

const mockProducts = [
  {
    id: 'prod-1',
    name: 'Cerise Hibiscus',
    flavor: 'Cerise Hibiscus',
    category: 'yolice',
    format: 'unite',
    price_unit: 3.50,
    available: true,
    month_active: '2026-05',
    created_at: '2026-05-01T00:00:00Z'
  }
]

// Mock Supabase complet
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({ data: mockProducts, error: null }),
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockProducts[0], error: null })
        })
      }),
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockProducts[0], error: null })
        })
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { ...mockProducts[0], available: false },
              error: null
            })
          })
        })
      }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      }),
    })
  }
}))

describe('GET /api/catalogue', () => {
  beforeEach(() => jest.resetModules())

  it('retourne la liste des produits avec status 200', async () => {
    const { GET } = await import('@/app/api/catalogue/route')
    const req = new NextRequest('http://localhost/api/catalogue')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body)).toBe(true)
    expect(body[0].name).toBe('Cerise Hibiscus')
  })
})

describe('POST /api/catalogue', () => {
  beforeEach(() => jest.resetModules())

  it('crée un produit et retourne 201', async () => {
    const { POST } = await import('@/app/api/catalogue/route')
    const req = new NextRequest('http://localhost/api/catalogue', {
      method: 'POST',
      body: JSON.stringify({ name: 'Cerise Hibiscus', category: 'yolice', format: 'unite' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.name).toBe('Cerise Hibiscus')
  })
})

describe('PATCH /api/catalogue/[id]', () => {
  beforeEach(() => jest.resetModules())

  it('met à jour un produit et retourne 200', async () => {
    const { PATCH } = await import('@/app/api/catalogue/[id]/route')
    const req = new NextRequest('http://localhost/api/catalogue/prod-1', {
      method: 'PATCH',
      body: JSON.stringify({ available: false }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: 'prod-1' }) })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.available).toBe(false)
  })
})

describe('DELETE /api/catalogue/[id]', () => {
  beforeEach(() => jest.resetModules())

  it('supprime un produit et retourne 204', async () => {
    const { DELETE } = await import('@/app/api/catalogue/[id]/route')
    const req = new NextRequest('http://localhost/api/catalogue/prod-1', {
      method: 'DELETE',
    })
    const res = await DELETE(req, { params: Promise.resolve({ id: 'prod-1' }) })
    expect(res.status).toBe(204)
  })
})
