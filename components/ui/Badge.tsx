type BadgeVariant = 'default' | 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: { background: 'rgba(58,37,16,0.08)',  color: 'var(--brown3)' },
  green:   { background: 'rgba(26,122,94,0.1)',  color: 'var(--teal)' },
  yellow:  { background: 'rgba(212,160,48,0.12)', color: 'var(--gold)' },
  red:     { background: 'rgba(180,48,48,0.1)',  color: 'var(--red)' },
  blue:    { background: 'rgba(26,104,180,0.1)', color: 'var(--sky)' },
  gray:    { background: 'rgba(58,37,16,0.05)',  color: 'var(--brown4)' },
  orange:  { background: 'rgba(196,98,26,0.1)',  color: 'var(--caramel)' },
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
      style={{ fontFamily: 'var(--sans)', ...variantStyles[variant] }}
    >
      {label}
    </span>
  )
}
