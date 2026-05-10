'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StatusBadge } from '@/components/commandes/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { Order, OrderStatus } from '@/types'

const STATUTS_SUIVANTS: Record<OrderStatus, OrderStatus | null> = {
  a_traiter: 'validee',
  validee: 'en_preparation',
  en_preparation: 'prete',
  prete: 'livree',
  livree: null,
  annulee: null,
  escalade: 'a_traiter',
}

const TEMPLATE_PAR_STATUT: Partial<Record<OrderStatus, string>> = {
  validee: 'commande_validee',
  prete: 'commande_prete',
  livree: 'commande_livree',
  annulee: 'commande_annulee',
}

export default function CommandeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [sending, setSending] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetch(`/api/commandes/${id}`)
      .then(r => r.json())
      .then(data => setOrder(data as Order))
      .finally(() => setLoading(false))
  }, [id])

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text })
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleChangeStatut = async (newStatus: OrderStatus) => {
    if (!order) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/commandes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json() as Order
      setOrder(updated)

      // Envoyer automatiquement le template WhatsApp si disponible
      const slug = TEMPLATE_PAR_STATUT[newStatus]
      if (slug && order.customer_phone) {
        await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: id, templateSlug: slug }),
        })
        showFeedback('success', `Statut mis à jour → "${newStatus}" + message WhatsApp envoyé`)
      } else {
        showFeedback('success', `Statut mis à jour → "${newStatus}"`)
      }
    } catch {
      showFeedback('error', 'Erreur lors de la mise à jour du statut')
    } finally {
      setUpdating(false)
    }
  }

  const handleSendCustom = async () => {
    if (!customMessage.trim() || !order?.customer_phone) return
    setSending(true)
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, customMessage }),
      })
      if (!res.ok) throw new Error()
      setCustomMessage('')
      showFeedback('success', 'Message WhatsApp envoyé')
    } catch {
      showFeedback('error', 'Erreur envoi WhatsApp (vérifiez les credentials Meta)')
    } finally {
      setSending(false)
    }
  }

  const handleAnnuler = async () => {
    if (!confirm('Confirmer l\'annulation de cette commande ?')) return
    await handleChangeStatut('annulee')
  }

  if (loading) return <div className="text-sm text-gray-400 p-6">Chargement...</div>
  if (!order) return <div className="text-sm text-red-500 p-6">Commande introuvable</div>

  const prochainStatut = STATUTS_SUIVANTS[order.status]
  const parsed = order.parsed_data

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => router.back()} className="text-xs text-gray-400 hover:text-gray-600 mb-2">
            ← Retour aux commandes
          </button>
          <h1 className="text-lg font-bold text-gray-900">{order.reference}</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.created_at).toLocaleString('fr-FR')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {order.escalate && <Badge label="Escalade humaine" variant="red" />}
          {order.confidence && (
            <Badge
              label={`Confiance : ${order.confidence}`}
              variant={order.confidence === 'high' ? 'green' : order.confidence === 'medium' ? 'yellow' : 'red'}
            />
          )}
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`text-sm px-4 py-2 rounded border ${
          feedback.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {feedback.text}
        </div>
      )}

      {/* Infos client */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Client</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Nom</span>
            <p className="font-medium text-gray-900 mt-0.5">{order.customer_name ?? '—'}</p>
          </div>
          <div>
            <span className="text-gray-500">Téléphone</span>
            <p className="font-medium text-gray-900 mt-0.5">{order.customer_phone ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Détail commande */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Commande</h2>

        {parsed?.items && parsed.items.length > 0 && (
          <div className="space-y-1">
            {parsed.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                <span className={`${!item.available ? 'line-through text-red-400' : 'text-gray-900'}`}>
                  {item.quantity}× {item.product_name}
                  {item.flavor ? ` — ${item.flavor}` : ''}
                  <span className="text-gray-400 ml-1">({item.format})</span>
                </span>
                {!item.available && (
                  <Badge label="Indisponible" variant="red" />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Lieu de retrait</span>
            <p className="font-medium text-gray-900 mt-0.5">
              {parsed?.location ?? (order.location as any)?.name ?? '—'}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Horaire</span>
            <p className="font-medium text-gray-900 mt-0.5">
              {parsed?.pickup_date ?? order.pickup_date ?? '—'}
              {(parsed?.pickup_time ?? order.pickup_time) ? ` à ${parsed?.pickup_time ?? order.pickup_time}` : ''}
            </p>
          </div>
          {order.total_amount && (
            <div>
              <span className="text-gray-500">Montant estimé</span>
              <p className="font-medium text-gray-900 mt-0.5">{Number(order.total_amount).toFixed(2)}€</p>
            </div>
          )}
          {parsed?.special_notes && (
            <div className="col-span-2">
              <span className="text-gray-500">Notes</span>
              <p className="font-medium text-gray-900 mt-0.5">{parsed.special_notes}</p>
            </div>
          )}
        </div>

        {parsed?.missing_fields && parsed.missing_fields.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 text-xs text-amber-700">
            Champs manquants : {parsed.missing_fields.join(', ')}
          </div>
        )}

        {parsed?.question_a_poser && (
          <div className="bg-blue-50 border border-blue-200 rounded px-3 py-2 text-xs text-blue-700">
            Question suggérée : <em>{parsed.question_a_poser}</em>
          </div>
        )}

        {order.escalate_reason && (
          <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-xs text-red-700">
            Raison escalade : {order.escalate_reason}
          </div>
        )}
      </div>

      {/* Message brut */}
      {order.raw_message && (
        <details className="bg-white border border-gray-200 rounded-lg">
          <summary className="px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer">
            Message WhatsApp original
          </summary>
          <div className="px-4 pb-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 rounded p-3 border border-gray-100">
              {order.raw_message}
            </p>
          </div>
        </details>
      )}

      {/* Actions statut */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Actions</h2>
        <div className="flex flex-wrap gap-2">
          {prochainStatut && (
            <Button onClick={() => handleChangeStatut(prochainStatut)} disabled={updating}>
              {updating ? 'En cours...' : `→ Passer en "${prochainStatut.replace('_', ' ')}"`}
            </Button>
          )}
          {order.status !== 'annulee' && order.status !== 'livree' && (
            <Button variant="danger" onClick={handleAnnuler} disabled={updating}>
              Annuler la commande
            </Button>
          )}
          {order.status === 'a_traiter' && (
            <Button variant="secondary" onClick={() => handleChangeStatut('escalade')} disabled={updating}>
              Marquer escalade
            </Button>
          )}
        </div>
      </div>

      {/* Envoi message WhatsApp libre */}
      {order.customer_phone && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">
            Envoyer un message WhatsApp à {order.customer_phone}
          </h2>
          <textarea
            className="w-full border border-gray-200 rounded-md p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Tapez votre message..."
            value={customMessage}
            onChange={e => setCustomMessage(e.target.value)}
          />
          <Button onClick={handleSendCustom} disabled={sending || !customMessage.trim()} variant="secondary">
            {sending ? 'Envoi...' : 'Envoyer'}
          </Button>
        </div>
      )}
    </div>
  )
}
