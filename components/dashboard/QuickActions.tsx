'use client'
import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'

interface BatchResult { success: number; total?: number; error?: string }

const actionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 16px',
  borderRadius: '12px',
  border: '1px solid var(--bord2)',
  background: '#fff',
  cursor: 'pointer',
  transition: 'all 0.15s',
  textAlign: 'left',
  width: '100%',
  fontFamily: 'var(--sans)',
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
      if (!data.error) setTimeout(() => window.location.reload(), 2500)
    } catch {
      setResult({ success: 0, error: 'Erreur réseau' })
    } finally {
      setLoading(false)
      setModal(null)
    }
  }

  const handleExport = () => {
    const today = new Date().toISOString().slice(0, 10)
    const a = document.createElement('a')
    a.href = `/api/export/excel?date=${today}`
    a.download = `lbg-${today}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setModal(null)
  }

  return (
    <>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid var(--bord)',
        padding: '20px 24px',
        boxShadow: 'var(--shadow)',
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--brown3)',
          marginBottom: '14px',
        }}>
          Actions rapides
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }} className="quick-grid">
          {/* Valider tout */}
          <button style={actionStyle} onClick={() => setModal('valider')}>
            <span style={{ fontSize: '22px' }}>✅</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown)' }}>Valider toutes</div>
              <div style={{ fontSize: '11px', color: 'var(--brown3)' }}>Commandes OK → WhatsApp</div>
            </div>
          </button>

          {/* Export */}
          <button style={actionStyle} onClick={() => setModal('export')}>
            <span style={{ fontSize: '22px' }}>📊</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--brown)' }}>Export Excel</div>
              <div style={{ fontSize: '11px', color: 'var(--brown3)' }}>Ventes du jour</div>
            </div>
          </button>
        </div>

        {result && !result.error && (
          <div style={{
            marginTop: '12px',
            padding: '10px 14px',
            background: 'rgba(26,122,94,0.08)',
            border: '1px solid rgba(26,122,94,0.2)',
            borderRadius: '10px',
            fontSize: '13px',
            color: 'var(--teal)',
          }}>
            🎉 {result.success} commande(s) validée(s)
          </div>
        )}
        {result?.error && (
          <div style={{
            marginTop: '12px',
            padding: '10px 14px',
            background: 'rgba(180,48,48,0.08)',
            border: '1px solid rgba(180,48,48,0.2)',
            borderRadius: '10px',
            fontSize: '13px',
            color: 'var(--red)',
          }}>
            ⚠ {result.error}
          </div>
        )}
      </div>

      <Modal title="✅ Valider toutes les commandes" open={modal === 'valider'}
        onClose={() => !loading && setModal(null)} onConfirm={handleValiderTout}
        confirmLabel="Valider + envoyer WhatsApp" loading={loading}>
        Toutes les commandes <strong>À traiter</strong> (confiance high/medium, sans escalade, sans champ manquant) seront validées et le client recevra un message de confirmation WhatsApp.
      </Modal>

      <Modal title="📊 Export Excel du jour" open={modal === 'export'}
        onClose={() => setModal(null)} onConfirm={handleExport} confirmLabel="Télécharger">
        Le fichier contiendra toutes les commandes du jour avec référence, client, produits, montant, lieu et statut.
      </Modal>
    </>
  )
}
