interface QualityBlockProps {
  tauxValidation: number
  tauxAnnulation: number
  tauxEscalade: number
}

function ProgressRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-xs text-gray-600">{label}</div>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <div className="text-xs font-semibold text-gray-600 w-10 text-right">{value}%</div>
    </div>
  )
}

export function QualityBlock({ tauxValidation, tauxAnnulation, tauxEscalade }: QualityBlockProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Qualité</h3>
      <div className="space-y-3">
        <ProgressRow label="Taux validées" value={tauxValidation} color="bg-green-500" />
        <ProgressRow label="Taux annulées" value={tauxAnnulation} color="bg-red-400" />
        <ProgressRow label="Taux escalade" value={tauxEscalade} color="bg-yellow-400" />
      </div>
    </div>
  )
}
