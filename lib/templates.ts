import { interpolateTemplate } from '@/lib/utils'

export function renderTemplate(
  bodyTemplate: string,
  vars: Record<string, string>
): string {
  return interpolateTemplate(bodyTemplate, vars)
}
