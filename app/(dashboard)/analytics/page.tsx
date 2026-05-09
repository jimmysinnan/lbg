'use client'
import { useState, useEffect } from 'react'
import { FinanceBlock } from '@/components/analytics/FinanceBlock'
import { ProductsBlock } from '@/components/analytics/ProductsBlock'
import { QualityBlock } from '@/components/analytics/QualityBlock'

type Period = 'day' | 'week' | 'month'

interface AnalyticsData {
  ca: number
  nbCommandes: number
  panierMoyen: number
  tauxValidation: number
  tauxAnnulation: number
  tauxEscalade: number
  topProduits: { name: string; qty: number }[]
  periode: { from: string; to: string; type: string }
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('month')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const today = new Date().toISOString().slice(0, 10)
        const res = await fetch(`/api/analytics?period=${period}&date=${today}`)
        const json = await res.json() as AnalyticsData
        setData(json)
      } catch { /* silencieux */ }
      finally { setLoading(false) }
    }
    fetchData()
  }, [period])

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Analyse</h1>
        <div className="flex gap-1">
          {(['day', 'week', 'month'] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                period === p ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p === 'day' ? "Aujourd'hui" : p === 'week' ? '7 jours' : 'Ce mois'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-gray-400 text-center py-12">Chargement...</div>
      ) : data ? (
        <>
          <FinanceBlock
            ca={data.ca}
            nbCommandes={data.nbCommandes}
            panierMoyen={data.panierMoyen}
          />
          <ProductsBlock topProduits={data.topProduits} />
          <QualityBlock
            tauxValidation={data.tauxValidation}
            tauxAnnulation={data.tauxAnnulation}
            tauxEscalade={data.tauxEscalade}
          />
          <div className="text-xs text-gray-400 text-right">
            Période : {data.periode.from} → {data.periode.to}
          </div>
        </>
      ) : (
        <div className="text-sm text-red-500 text-center py-8">Erreur de chargement</div>
      )}
    </div>
  )
}
