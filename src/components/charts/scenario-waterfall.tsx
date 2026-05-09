import * as React from 'react'
import type { ScenarioResult } from '~/lib/mortgage'
import { formatCurrency } from '~/lib/utils'

interface Metric {
  label: string
  pick: (r: ScenarioResult) => number
  better: 'lower' | 'higher'
  format: (v: number) => string
}

const METRICS: Metric[] = [
  {
    label: 'Total cost',
    pick: (r) => r.summary.totalCost,
    better: 'lower',
    format: (v) => formatCurrency(v, { compact: true }),
  },
  {
    label: 'Total interest',
    pick: (r) => r.summary.totalInterest,
    better: 'lower',
    format: (v) => formatCurrency(v, { compact: true }),
  },
  {
    label: 'Initial monthly',
    pick: (r) => r.summary.initialMonthlyTotal,
    better: 'lower',
    format: (v) => formatCurrency(v),
  },
  {
    label: 'Final equity',
    pick: (r) => r.summary.finalEquity,
    better: 'higher',
    format: (v) => formatCurrency(v, { compact: true }),
  },
  {
    label: 'Net position',
    pick: (r) => r.summary.finalNetPosition,
    better: 'higher',
    format: (v) => formatCurrency(v, { compact: true }),
  },
  {
    label: 'Payoff (yr)',
    pick: (r) => r.summary.payoffYear,
    better: 'lower',
    format: (v) => `${v.toFixed(1)}y`,
  },
]

export function ScenarioWaterfall({
  results,
  baseline,
}: {
  results: ScenarioResult[]
  baseline: ScenarioResult | null
}) {
  if (!baseline || results.length <= 1) {
    return (
      <div className="py-6 text-center text-[11px] text-muted-foreground">
        Add another scenario to compare deltas vs baseline.
      </div>
    )
  }
  const others = results.filter((r) => r.inputs.id !== baseline.inputs.id)

  return (
    <div className="space-y-4">
      {METRICS.map((m) => {
        const baseVal = m.pick(baseline)
        const deltas = others.map((r) => ({ r, delta: m.pick(r) - baseVal }))
        const maxAbs = Math.max(1, ...deltas.map((d) => Math.abs(d.delta)))
        return (
          <div key={m.label}>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {m.label} <span className="text-muted-foreground/60">vs {baseline.inputs.name}</span>
              </div>
              <div className="text-[10px] font-mono tabular-nums text-muted-foreground/70">
                base {m.format(baseVal)}
              </div>
            </div>
            <div className="space-y-1.5">
              {deltas.map(({ r, delta }) => {
                const pct = (Math.abs(delta) / maxAbs) * 50
                const positive = m.better === 'lower' ? delta < 0 : delta > 0
                const color = delta === 0
                  ? 'var(--color-muted-foreground)'
                  : positive
                    ? 'var(--color-pos)'
                    : 'var(--color-neg)'
                return (
                  <div key={r.inputs.id} className="flex items-center gap-2">
                    <div
                      className="w-16 shrink-0 truncate text-[11px] sm:w-24"
                      style={{ color: r.inputs.color }}
                      title={r.inputs.name}
                    >
                      {r.inputs.name}
                    </div>
                    <div className="relative h-4 flex-1 min-w-0">
                      <div className="absolute inset-y-0 left-1/2 w-px bg-panel-border" />
                      <div
                        className="absolute inset-y-0.5 rounded-sm"
                        style={
                          delta < 0
                            ? { right: '50%', width: `${pct}%`, background: color }
                            : { left: '50%', width: `${pct}%`, background: color }
                        }
                      />
                    </div>
                    <div
                      className="w-16 shrink-0 text-right font-mono text-[11px] font-semibold tabular-nums sm:w-20"
                      style={{ color }}
                    >
                      {delta === 0 ? '—' : `${delta > 0 ? '+' : '−'}${m.format(Math.abs(delta))}`}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
