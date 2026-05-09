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

export function Modal({
  title,
  open,
  onClose,
  onConfirm,
  confirmLabel = 'Confirmer',
  loading = false,
  children,
}: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">{title}</h2>
        <div className="mb-6 text-sm text-gray-600 leading-relaxed">{children}</div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? 'En cours...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
