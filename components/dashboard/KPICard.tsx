interface KPICardProps {
  label: string
  value: string | number
  delta?: string
  deltaPositive?: boolean
  highlight?: boolean
}

export function KPICard({ label, value, delta, deltaPositive, highlight = false }: KPICardProps) {
  return (
    <div className={`bg-white rounded-lg border p-4 ${highlight ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}`}>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
      {delta && (
        <div className={`mt-1 text-xs font-medium ${deltaPositive ? 'text-green-600' : 'text-amber-600'}`}>
          {delta}
        </div>
      )}
    </div>
  )
}
