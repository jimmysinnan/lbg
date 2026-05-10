import { type ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary:   { background: 'var(--caramel)', color: '#fff', border: '1px solid var(--caramel)' },
  secondary: { background: '#fff', color: 'var(--brown2)', border: '1px solid var(--bord2)' },
  danger:    { background: 'var(--red)', color: '#fff', border: '1px solid var(--red)' },
  ghost:     { background: 'transparent', color: 'var(--brown3)', border: '1px solid transparent' },
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  style,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed ${sizes[size]} ${className}`}
      style={{ fontFamily: 'var(--sans)', ...variantStyles[variant], ...style }}
      {...props}
    >
      {children}
    </button>
  )
}
