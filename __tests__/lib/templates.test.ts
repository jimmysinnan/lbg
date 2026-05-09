import { renderTemplate } from '@/lib/templates'

describe('renderTemplate', () => {
  it('remplace les variables dans un template', () => {
    const result = renderTemplate(
      'Bonjour {{prenom}} !\n\nVotre commande {{reference}} est confirmée.',
      { prenom: 'Marie', reference: 'LBG-20260508-AB01' }
    )
    expect(result).toContain('Marie')
    expect(result).toContain('LBG-20260508-AB01')
    expect(result).not.toContain('{{prenom}}')
    expect(result).not.toContain('{{reference}}')
  })

  it('laisse intactes les variables non fournies', () => {
    const result = renderTemplate('{{a}} et {{b}}', { a: 'X' })
    expect(result).toBe('X et {{b}}')
  })

  it('gère les templates avec émojis', () => {
    const result = renderTemplate('Bonjour {{prenom}} 🍦', { prenom: 'Jean' })
    expect(result).toBe('Bonjour Jean 🍦')
  })
})

describe('verifyWebhookSignature', () => {
  const crypto = require('crypto')

  it('valide une signature correcte', () => {
    const { verifyWebhookSignature } = require('@/lib/whatsapp')
    const body = '{"test": true}'
    const secret = 'my-secret'
    const sig = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex')
    expect(verifyWebhookSignature(body, sig, secret)).toBe(true)
  })

  it('rejette une signature incorrecte', () => {
    const { verifyWebhookSignature } = require('@/lib/whatsapp')
    expect(verifyWebhookSignature('body', 'sha256=invalide', 'secret')).toBe(false)
  })

  it('rejette une signature sans préfixe sha256=', () => {
    const { verifyWebhookSignature } = require('@/lib/whatsapp')
    expect(verifyWebhookSignature('body', 'invalide', 'secret')).toBe(false)
  })
})
