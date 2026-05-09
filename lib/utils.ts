export function currentMonth(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function generateReference(): string {
  const now = new Date()
  const date = now.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `LBG-${date}-${rand}`
}

export function interpolateTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`)
}

export function formatCurrency(amount: number | null): string {
  if (amount === null) return '—'
  return `${amount.toFixed(2)}€`
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
