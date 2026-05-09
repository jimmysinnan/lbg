'use client'
import { KPICard } from '@/components/dashboard/KPICard'

interface FinanceBlockProps {
  ca: number
  nbCommandes: number
  panierMoyen: number
}

export function FinanceBlock({ ca, nbCommandes, panierMoyen }: FinanceBlockProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <KPICard label="CA période" value={`${ca.toFixed(2)}€`} />
        <KPICard label="Commandes" value={nbCommandes} />
        <KPICard label="Panier moyen" value={`${panierMoyen.toFixed(2)}€`} />
      </div>
    </div>
  )
}
