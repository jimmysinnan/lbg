import Anthropic from '@anthropic-ai/sdk'
import type { Product, Location, ParsedOrder } from '@/types'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? 'placeholder',
})

export function buildSystemPrompt(products: Product[], locations: Location[]): string {
  const catalogueStr = products
    .map(p => {
      const parts = [`- ${p.name}`]
      if (p.flavor) parts[0] += ` (${p.flavor})`
      const prices: string[] = []
      if (p.price_unit) prices.push(`${p.price_unit}€/unité`)
      if (p.price_box8) prices.push(`coffret x8: ${p.price_box8}€`)
      if (p.price_box20) prices.push(`coffret x20: ${p.price_box20}€`)
      if (prices.length) parts.push(prices.join(' | '))
      return parts.join(' — ')
    })
    .join('\n')

  const lieuxStr = locations
    .map(l => `- ${l.name} (${l.type})${l.hours ? ' — ' + l.hours : ''}`)
    .join('\n')

  return `Tu es l'agent de prise de commande de La Bonne Glace Martinique.
Tu analyses des messages WhatsApp clients et extrais les informations de commande.

CATALOGUE ACTIF CE MOIS :
${catalogueStr || '(aucun produit disponible)'}

LIEUX DE RETRAIT / LIVRAISON ACTIFS :
${lieuxStr || '(aucun lieu configuré)'}

RÈGLES ABSOLUES :
- Ne jamais confirmer définitivement une commande.
- Créer uniquement une précommande en attente de validation gérant.
- Vérifier que chaque produit demandé est dans le catalogue actif.
- Si produit indisponible → suggérer une alternative dans "notes_agent".
- Si demande ambiguë → formuler une question dans "question_a_poser".
- Si demande complexe (volume > 30 unités, événement, paiement spécial) → escalade obligatoire.
- Retourner UNIQUEMENT un JSON strict, sans texte autour.

FORMAT DE SORTIE (JSON strict) :
{
  "customer_name": "string | null",
  "customer_phone": "string | null",
  "items": [{"product_name": "string", "flavor": "string | null", "quantity": number, "format": "unite | coffret_8 | coffret_20", "available": boolean}],
  "location": "string | null",
  "pickup_date": "string | null",
  "pickup_time": "string | null",
  "special_notes": "string | null",
  "confidence": "high | medium | low",
  "missing_fields": ["string"],
  "question_a_poser": "string | null",
  "escalate": boolean,
  "escalate_reason": "string | null",
  "notes_agent": "string | null"
}`
}

export async function parseWhatsAppMessage(
  message: string,
  products: Product[],
  locations: Location[]
): Promise<ParsedOrder> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: buildSystemPrompt(products, locations),
    messages: [{ role: 'user', content: message }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'

  // Extraire le JSON même si Claude ajoute du texte autour (défense en profondeur)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  const jsonStr = jsonMatch ? jsonMatch[0] : '{}'

  try {
    return JSON.parse(jsonStr) as ParsedOrder
  } catch {
    return {
      customer_name: null,
      customer_phone: null,
      items: [],
      location: null,
      pickup_date: null,
      pickup_time: null,
      special_notes: null,
      confidence: 'low',
      missing_fields: ['tous les champs'],
      question_a_poser: null,
      escalate: true,
      escalate_reason: 'Impossible de parser la réponse IA',
      notes_agent: text.slice(0, 500),
    }
  }
}
