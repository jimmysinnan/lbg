type BadgeVariant = 'default' | 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
  gray: 'bg-gray-100 text-gray-500',
  orange: 'bg-orange-100 text-orange-700',
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  )
}
