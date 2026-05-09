import { currentMonth, generateReference, interpolateTemplate, todayISO, formatCurrency } from '@/lib/utils'

describe('currentMonth', () => {
  it('retourne le mois courant au format YYYY-MM', () => {
    const result = currentMonth()
    expect(result).toMatch(/^\d{4}-\d{2}$/)
  })
})

describe('generateReference', () => {
  it('génère une référence au format LBG-YYYYMMDD-XXXX', () => {
    const ref = generateReference()
    expect(ref).toMatch(/^LBG-\d{8}-[A-Z0-9]{4}$/)
  })

  it('génère des références quasi-uniques', () => {
    const refs = new Set(Array.from({ length: 100 }, generateReference))
    expect(refs.size).toBeGreaterThan(90)
  })
})

describe('interpolateTemplate', () => {
  it('remplace les variables dans le template', () => {
    const result = interpolateTemplate('Bonjour {{prenom}} !', { prenom: 'Marie' })
    expect(result).toBe('Bonjour Marie !')
  })

  it('laisse les variables manquantes intactes', () => {
    const result = interpolateTemplate('{{a}} et {{b}}', { a: 'X' })
    expect(result).toBe('X et {{b}}')
  })

  it('remplace plusieurs occurrences', () => {
    const result = interpolateTemplate('{{x}} + {{x}}', { x: '1' })
    expect(result).toBe('1 + 1')
  })
})

describe('todayISO', () => {
  it('retourne la date du jour au format ISO YYYY-MM-DD', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('formatCurrency', () => {
  it('formate un montant en euros', () => {
    expect(formatCurrency(7.5)).toBe('7.50€')
  })

  it('retourne — pour null', () => {
    expect(formatCurrency(null)).toBe('—')
  })
})
