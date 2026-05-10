'use client'
import { type ReactNode } from 'react'
import { Button } from './Button'

interface ModalProps {
  title: string
  open: boolean
  onClose: () => void
  onConfirm: () => void
  confirmLabel?: string
  loading?: boolean
  children: ReactNode
}

export function Modal({ title, open, onClose, onConfirm, confirmLabel = 'Confirmer', loading = false, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0" style={{ background: 'rgba(58,37,16,0.45)' }} onClick={onClose} />
      <div
        className="relative w-full max-w-md mx-4 p-6 rounded-2xl animate-fade-up"
        style={{ background: '#fff', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--bord)' }}
      >
        <h2
          className="text-base font-bold mb-4"
          style={{ fontFamily: 'var(--fraunces)', fontStyle: 'italic', color: 'var(--brown)' }}
        >
          {title}
        </h2>
        <div className="mb-6 text-sm leading-relaxed" style={{ color: 'var(--brown3)' }}>
          {children}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Annuler</Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? 'En cours...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
