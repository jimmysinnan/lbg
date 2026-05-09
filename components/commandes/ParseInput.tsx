'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import type { ParsedOrder } from '@/types'

interface ParseInputProps {
  onParsed?: (parsed: ParsedOrder, rawMessage: string) => void
}

export function ParseInput({ onParsed }: ParseInputProps) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [parsed, setParsed] = useState<ParsedOrder | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(false)

  const handleParse = async () => {
    if (!message.trim()) return
    setLoading(true)
    setError(null)
    setParsed(null)
    setCreated(false)

    try {
      const res = await fetch('/api/ia/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json() as ParsedOrder
      setParsed(data)
      onParsed?.(data, message)
    } catch {
      setError('Impossible d\'analyser le message. Vérifiez votre connexion.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrder = async () => {
    if (!parsed) return
    setCreating(true)
    try {
      const res = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: parsed.customer_name,
          customer_phone: parsed.customer_phone,
          raw_message: message,
          parsed_data: parsed,
          status: 'a_traiter',
          confidence: parsed.confidence,
          missing_fields: parsed.missing_fields,
          escalate: parsed.escalate,
          escalate_reason: parsed.escalate_reason,
        }),
      })
      if (!res.ok) throw new Error('Erreur création commande')
      setCreated(true)
      setMessage('')
      setParsed(null)
      setTimeout(() => window.location.reload(), 1500)
    } catch {
      setError('Impossible de créer la commande.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="text-sm font-semibold text-gray-700">Nouvelle commande WhatsApp</div>

      <textarea
        className="w-full border border-gray-200 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        rows={4}
        placeholder="Coller ici le message WhatsApp du client..."
        value={message}
        onChange={e => setMessage(e.target.value)}
        disabled={loading}
      />

      <div className="flex gap-2">
        <Button
          onClick={handleParse}
          disabled={loading || !message.trim()}
        >
          {loading ? 'Analyse en cours...' : 'Analyser avec IA'}
        </Button>
        {message && (
          <Button variant="ghost" size="sm" onClick={() => { setMessage(''); setParsed(null); setError(null) }}>
            Effacer
          </Button>
        )}
      </div>

      {error && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      {created && (
        <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded px-3 py-2">
          Commande créée avec succès.
        </div>
      )}

      {parsed && !created && (
        <div className="border border-gray-200 rounded-md p-3 space-y-2 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Résultat IA</span>
            <div className="flex gap-2">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                parsed.confidence === 'high' ? 'bg-green-100 text-green-700' :
                parsed.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                Confiance : {parsed.confidence}
              </span>
              {parsed.escalate && (
                <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">
                  ⚠ Escalade
                </span>
              )}
            </div>
          </div>

          <dl className="text-xs space-y-1">
            {parsed.customer_name && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-24">Client</dt>
                <dd className="text-gray-900">{parsed.customer_name}</dd>
              </div>
            )}
            {parsed.customer_phone && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-24">Téléphone</dt>
                <dd className="text-gray-900">{parsed.customer_phone}</dd>
              </div>
            )}
            {parsed.items.length > 0 && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-24">Produits</dt>
                <dd className="text-gray-900">
                  {parsed.items.map((item, i) => (
                    <span key={i} className={`${!item.available ? 'line-through text-red-400' : ''}`}>
                      {item.quantity}× {item.product_name} ({item.format})
                      {i < parsed.items.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            {parsed.location && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-24">Lieu</dt>
                <dd className="text-gray-900">{parsed.location}</dd>
              </div>
            )}
            {parsed.pickup_date && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-24">Date</dt>
                <dd className="text-gray-900">{parsed.pickup_date} {parsed.pickup_time ?? ''}</dd>
              </div>
            )}
            {parsed.missing_fields.length > 0 && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-24">Manquants</dt>
                <dd className="text-amber-600">{parsed.missing_fields.join(', ')}</dd>
              </div>
            )}
            {parsed.question_a_poser && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-24">Question</dt>
                <dd className="text-blue-600 italic">{parsed.question_a_poser}</dd>
              </div>
            )}
            {parsed.escalate_reason && (
              <div className="flex gap-2">
                <dt className="text-gray-500 w-24">Escalade</dt>
                <dd className="text-red-600">{parsed.escalate_reason}</dd>
              </div>
            )}
          </dl>

          <Button
            onClick={handleCreateOrder}
            disabled={creating}
            className="mt-2"
          >
            {creating ? 'Création...' : 'Créer la précommande'}
          </Button>
        </div>
      )}
    </div>
  )
}
