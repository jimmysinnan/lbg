'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface BatchResult {
  success: number
  total?: number
  error?: string
}

export function QuickActions() {
  const [modal, setModal] = useState<'valider' | 'export' | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<BatchResult | null>(null)

  const handleValiderTout = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/commandes/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'valider_tout' }),
      })
      const data = await res.json() as BatchResult
      setResult(data)
      // Recharger seulement en cas de succès, après délai pour lire le feedback
      if (!data.error) {
        setTimeout(() => window.location.reload(), 2500)
      }
    } catch {
      setResult({ success: 0, error: 'Erreur réseau — réessayez' })
    } finally {
      setLoading(false)
      setModal(null)
    }
  }

  const handleExportExcel = () => {
    const today = new Date().toISOString().slice(0, 10)
    const link = document.createElement('a')
    link.href = `/api/export/excel?date=${today}`
    link.download = `lbg-${today}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setModal(null)
  }

  return (
    <>
      {/* Boutons d'action */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Actions rapides</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setModal('valider')}
            variant="primary"
          >
            Valider toutes les commandes OK
          </Button>
          <Button
            onClick={() => setModal('export')}
            variant="secondary"
          >
            Export Excel du jour
          </Button>
        </div>

        {/* Feedback résultat */}
        {result && !result.error && (
          <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
            {result.success} commande(s) validée(s){result.total !== undefined ? ` sur ${result.total} éligible(s)` : ''}.
          </div>
        )}
        {result?.error && (
          <div className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
            {result.error}
          </div>
        )}
      </div>

      {/* Modal : Valider tout */}
      <Modal
        title="Valider toutes les commandes"
        open={modal === 'valider'}
        onClose={() => !loading && setModal(null)}
        onConfirm={handleValiderTout}
        confirmLabel="Valider et envoyer WhatsApp"
        loading={loading}
      >
        <p>
          Toutes les commandes <strong>À traiter</strong> sans alerte seront :
        </p>
        <ul className="list-disc ml-4 mt-2 space-y-1">
          <li>Passées au statut <strong>Validée</strong></li>
          <li>Le client recevra un message WhatsApp de confirmation</li>
        </ul>
        <p className="mt-3 text-xs text-gray-500">
          Conditions d&apos;éligibilité : confiance high ou medium, aucun champ manquant, pas d&apos;escalade.
        </p>
      </Modal>

      {/* Modal : Export Excel */}
      <Modal
        title="Export Excel du jour"
        open={modal === 'export'}
        onClose={() => setModal(null)}
        onConfirm={handleExportExcel}
        confirmLabel="Télécharger"
      >
        <p>
          Le fichier Excel contiendra toutes les commandes du jour (hors annulées) avec :
        </p>
        <ul className="list-disc ml-4 mt-2 space-y-1">
          <li>Référence, client, téléphone</li>
          <li>Produits, quantités, montant</li>
          <li>Lieu, horaire, statut, note</li>
        </ul>
      </Modal>
    </>
  )
}
