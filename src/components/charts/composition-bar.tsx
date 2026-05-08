import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ScenarioResult } from '~/lib/mortgage'
import { moneyTooltip, shortMoney } from './shared'

export function CompositionBarChart({
  results,
  height = 260,
}: {
  results: ScenarioResult[]
  height?: number
}) {
  const data = results.map((r) => ({
    name: r.inputs.name,
    Principal: r.summary.totalPrincipal,
    Interest: r.summary.totalInterest,
    Taxes: r.summary.totalTaxes,
    Insurance: r.summary.totalInsurance,
    PMI: r.summary.totalPmi,
    HOA: r.summary.totalHoa,
    Maintenance: r.summary.totalMaintenance,
    'Down + Closing': r.summary.cashToClose,
  }))
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="2 4" vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickFormatter={shortMoney}
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <Tooltip
          formatter={(v) => moneyTooltip(v as number)}
          isAnimationActive={false}
          cursor={{ fill: 'var(--color-accent)', opacity: 0.3 }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} iconType="square" iconSize={8} />
        <Bar dataKey="Down + Closing" stackId="1" fill="var(--color-chart-6)" />
        <Bar dataKey="Principal" stackId="1" fill="var(--color-chart-3)" />
        <Bar dataKey="Interest" stackId="1" fill="var(--color-chart-2)" />
        <Bar dataKey="Taxes" stackId="1" fill="var(--color-chart-4)" />
        <Bar dataKey="Insurance" stackId="1" fill="var(--color-chart-1)" />
        <Bar dataKey="PMI" stackId="1" fill="var(--color-neg)" />
        <Bar dataKey="HOA" stackId="1" fill="var(--color-chart-5)" />
        <Bar dataKey="Maintenance" stackId="1" fill="var(--color-muted-foreground)" />
      </BarChart>
    </ResponsiveContainer>
  )
}
