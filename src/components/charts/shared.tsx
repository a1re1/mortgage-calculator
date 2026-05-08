import type { ScenarioResult, MonthRow } from '~/lib/mortgage'

export const COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-6)',
]

export interface MergedRow {
  month: number
  year: number
  [scenarioId: string]: number | null
}

export function mergeMetric(
  results: ScenarioResult[],
  pick: (r: MonthRow) => number,
  step: number = 1,
): MergedRow[] {
  const maxMonth = Math.max(0, ...results.map((r) => r.rows.length))
  const out: MergedRow[] = []
  for (let i = 0; i < maxMonth; i++) {
    if (i % step !== 0 && i !== maxMonth - 1) continue
    const month = i + 1
    const row: MergedRow = { month, year: month / 12 }
    for (const res of results) {
      const r = res.rows[i]
      row[res.inputs.id] = r ? pick(r) : null
    }
    out.push(row)
  }
  return out
}

export function yearTickFormatter(v: number) {
  return `${v.toFixed(0)}y`
}

export function shortMoney(v: number) {
  if (!Number.isFinite(v)) return ''
  const abs = Math.abs(v)
  if (abs >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `$${(v / 1e3).toFixed(0)}k`
  return `$${v.toFixed(0)}`
}

export function moneyTooltip(v: number | string) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return v
  return v.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}
