import crypto from 'crypto'

const GRAPH_API_BASE = 'https://graph.facebook.com/v19.0'

export interface SendMessageResult {
  messageId: string
}

export async function sendWhatsAppMessage(
  to: string,
  body: string
): Promise<SendMessageResult> {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID
  const accessToken = process.env.META_ACCESS_TOKEN

  if (!phoneNumberId || !accessToken) {
    throw new Error('Credentials Meta WhatsApp manquants (META_PHONE_NUMBER_ID, META_ACCESS_TOKEN)')
  }

  const response = await fetch(`${GRAPH_API_BASE}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Meta API error ${response.status}: ${errorText}`)
  }

  const data = await response.json() as { messages: Array<{ id: string }> }
  return { messageId: data.messages[0].id }
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  if (!signature.startsWith('sha256=')) return false
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex')
  // Comparaison à temps constant pour éviter les timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}
