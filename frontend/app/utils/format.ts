const RELATIVE_THRESHOLDS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
  { unit: 'second', ms: 1000 },
]

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  const diff = date.getTime() - Date.now()
  const abs = Math.abs(diff)
  if (abs < 30 * 1000) return 'just now'

  for (const { unit, ms } of RELATIVE_THRESHOLDS) {
    if (abs >= ms) {
      const v = Math.round(diff / ms)
      return rtf.format(v, unit)
    }
  }
  return ''
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatShortDate(value: string | Date | null | undefined): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}
