import * as React from 'react'
import type { ScenarioResult } from '~/lib/mortgage'
import { formatCurrency } from '~/lib/utils'

interface Metric {
  label: string
  pick: (r: ScenarioResult) => number
  better: 'lower' | 'higher'
  format?: (v: number) => string
}

const METRICS: Metric[] = [
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
    label: 'Payoff (years)',
    pick: (r) => r.summary.payoffYear,
    better: 'lower',
    format: (v) => `${v.toFixed(1)}y`,
  },
]

export function ComparisonBars({ results }: { results: ScenarioResult[] }) {
  if (results.length === 0)
    return <div className="text-xs text-muted-foreground">no visible scenarios</div>

  return (
    <div className="space-y-3">
      {METRICS.map((m) => {
        const values = results.map((r) => m.pick(r))
        const max = Math.max(...values.map((v) => Math.abs(v)), 1)
        const best = m.better === 'lower' ? Math.min(...values) : Math.max(...values)
        return (
          <div key={m.label}>
            <div className="mb-1 flex items-center justify-between">
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {m.label}
              </div>
              <div className="text-[10px] text-muted-foreground/70">
                lower is {m.better === 'lower' ? 'better' : 'worse'}
              </div>
            </div>
            <div className="space-y-1">
              {results.map((r, i) => {
                const v = values[i]
                if (v === undefined) return null
                const pct = (Math.abs(v) / max) * 100
                const isBest = v === best
                return (
                  <div key={r.inputs.id} className="flex items-center gap-2">
                    <div
                      className="w-20 shrink-0 truncate text-[11px] font-medium"
                      style={{ color: r.inputs.color }}
                      title={r.inputs.name}
                    >
                      {r.inputs.name}
                    </div>
                    <div className="relative h-3.5 flex-1 rounded-sm bg-input/40">
                      <div
                        className="absolute inset-y-0 left-0 rounded-sm transition-[width]"
                        style={{
                          width: `${pct}%`,
                          background: r.inputs.color,
                          opacity: isBest ? 1 : 0.45,
                        }}
                      />
                      {isBest && (
                        <div className="absolute inset-y-0 right-1 flex items-center text-[9px] font-semibold uppercase tracking-wider text-foreground">
                          best
                        </div>
                      )}
                    </div>
                    <div className="w-20 shrink-0 text-right font-mono text-[11px] tabular-nums">
                      {m.format ? m.format(v) : v.toFixed(0)}
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
