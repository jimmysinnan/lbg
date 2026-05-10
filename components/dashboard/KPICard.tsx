interface KPICardProps {
  label: string
  value: string | number
  delta?: string
  deltaPositive?: boolean
  highlight?: boolean
  accent?: 'caramel' | 'teal' | 'rose' | 'sky'
}

const accentColors = {
  caramel: 'var(--caramel)',
  teal:    'var(--teal)',
  rose:    'var(--rose)',
  sky:     'var(--sky)',
}

export function KPICard({ label, value, delta, deltaPositive, highlight, accent = 'caramel' }: KPICardProps) {
  const color = accentColors[accent]
  return (
    <div
      className="rounded-xl p-4 transition-all duration-200"
      style={{
        background: '#fff',
        border: '1px solid var(--bord)',
        borderTop: `3px solid ${color}`,
        boxShadow: highlight ? 'var(--shadow-md)' : 'var(--shadow)',
      }}
    >
      <div className="text-xs font-medium mb-2" style={{ color: 'var(--brown3)', letterSpacing: '0.03em' }}>
        {label}
      </div>
      <div className="text-3xl font-black leading-none mb-1" style={{ fontFamily: 'var(--fraunces)', color }}>
        {value}
      </div>
      {delta && (
        <div className="text-xs mt-1.5" style={{ color: deltaPositive ? 'var(--teal)' : 'var(--red)' }}>
          {delta}
        </div>
      )}
    </div>
  )
}
