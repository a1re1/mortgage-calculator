import { Eye, EyeOff, GitCompare } from 'lucide-react'
import { Panel } from '~/components/panel'
import { Stat } from '~/components/stat'
import type { ScenarioResult } from '~/lib/mortgage'
import { formatCurrency } from '~/lib/utils'

interface ScenarioStatsProps {
  results: ScenarioResult[]
  baseline?: ScenarioResult | null
}

export function ScenarioStats({ results, baseline }: ScenarioStatsProps) {
  if (results.length === 0) return null
  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {results.map((r) => {
        const visible = r.inputs.visible
        const delta = baseline && baseline.inputs.id !== r.inputs.id
          ? r.summary.totalCost - baseline.summary.totalCost
          : null
        const deltaInterest = baseline && baseline.inputs.id !== r.inputs.id
          ? r.summary.totalInterest - baseline.summary.totalInterest
          : null
        const monthsSaved = baseline && baseline.inputs.id !== r.inputs.id
          ? baseline.summary.payoffMonth - r.summary.payoffMonth
          : null

        return (
          <Panel
            key={r.inputs.id}
            accent={r.inputs.color}
            className={visible ? '' : 'opacity-60'}
            title={
              <span className="flex items-center gap-1.5">
                {visible ? (
                  <Eye className="h-2.5 w-2.5" />
                ) : (
                  <EyeOff className="h-2.5 w-2.5" />
                )}
                {r.inputs.name}
              </span>
            }
            description={
              baseline?.inputs.id === r.inputs.id ? (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary">
                  <GitCompare className="h-2.5 w-2.5" /> baseline
                </span>
              ) : null
            }
          >
            <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
              <Stat
                label="Loan"
                value={formatCurrency(r.summary.loanAmount, { compact: true })}
                sub={`${r.summary.effectiveStartRate.toFixed(3)}% • ${r.inputs.loanTermYears}yr`}
              />
              <Stat
                label="Cash to close"
                value={formatCurrency(r.summary.cashToClose, { compact: true })}
                sub={`down + closing${r.summary.pointCost > 0 ? ' + pts' : ''}`}
              />
              <Stat
                label="Initial P&I"
                value={formatCurrency(r.summary.initialMonthlyPI, { cents: false })}
                sub={`/mo`}
                color="var(--color-chart-2)"
              />
              <Stat
                label="Total monthly"
                value={formatCurrency(r.summary.initialMonthlyTotal, { cents: false })}
                sub="incl. tax/ins/HOA/maint"
                color="var(--color-chart-1)"
              />
              <Stat
                label="Payoff"
                value={`${(r.summary.payoffYear).toFixed(1)}y`}
                sub={
                  monthsSaved && monthsSaved !== 0
                    ? `${monthsSaved > 0 ? '−' : '+'}${Math.abs(monthsSaved)}mo vs baseline`
                    : `${r.summary.payoffMonth} mo`
                }
                color={monthsSaved && monthsSaved > 0 ? 'var(--color-pos)' : undefined}
              />
              <Stat
                label="Total interest"
                value={formatCurrency(r.summary.totalInterest, { compact: true })}
                sub={
                  deltaInterest !== null
                    ? `${deltaInterest >= 0 ? '+' : '−'}${formatCurrency(Math.abs(deltaInterest), { compact: true })}`
                    : 'paid to lender'
                }
                color={
                  deltaInterest === null
                    ? undefined
                    : deltaInterest < 0
                      ? 'var(--color-pos)'
                      : 'var(--color-neg)'
                }
              />
              <Stat
                label="Total cost"
                value={formatCurrency(r.summary.totalCost, { compact: true })}
                sub={
                  delta !== null
                    ? `${delta >= 0 ? '+' : '−'}${formatCurrency(Math.abs(delta), { compact: true })}`
                    : 'all-in cash out'
                }
                color={
                  delta === null
                    ? undefined
                    : delta < 0
                      ? 'var(--color-pos)'
                      : 'var(--color-neg)'
                }
              />
              <Stat
                label="Final equity"
                value={formatCurrency(r.summary.finalEquity, { compact: true })}
                sub={`net ${formatCurrency(r.summary.finalNetPosition, { compact: true })}`}
                color={
                  r.summary.finalNetPosition >= 0
                    ? 'var(--color-pos)'
                    : 'var(--color-neg)'
                }
              />
            </div>
          </Panel>
        )
      })}
    </div>
  )
}
