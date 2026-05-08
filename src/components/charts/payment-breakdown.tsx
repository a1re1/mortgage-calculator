import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ScenarioResult } from '~/lib/mortgage'
import { moneyTooltip, shortMoney, yearTickFormatter } from './shared'

interface PaymentBreakdownChartProps {
  result: ScenarioResult
  height?: number
  maxYear?: number
}

export function PaymentBreakdownChart({ result, height = 280, maxYear }: PaymentBreakdownChartProps) {
  const rows = maxYear ? result.rows.filter((r) => r.year <= maxYear) : result.rows
  const data = rows.map((r) => ({
    year: r.year,
    Principal: r.principalPaid,
    Interest: r.interestPaid,
    Extra: r.extraPrincipal,
    Taxes: r.taxes,
    Insurance: r.insurance,
    PMI: r.pmi,
    HOA: r.hoa,
    Maintenance: r.maintenance,
  }))
  const refis = rows.filter((r) => r.isRefiMonth).map((r) => r.year)
  const recasts = rows.filter((r) => r.isRecastMonth).map((r) => r.year)
  const lumps = rows.filter((r) => r.hasLumpSum).map((r) => r.year)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="2 4" />
        <XAxis
          dataKey="year"
          type="number"
          domain={[0, 'dataMax']}
          tickFormatter={yearTickFormatter}
          tickLine={false}
          axisLine={false}
        />
        <YAxis tickFormatter={shortMoney} tickLine={false} axisLine={false} width={56} />
        <Tooltip
          formatter={(v) => moneyTooltip(v as number)}
          labelFormatter={(label) =>
            `Year ${typeof label === 'number' ? label.toFixed(1) : label}`
          }
          isAnimationActive={false}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} iconType="square" iconSize={8} />
        <Area
          type="monotone"
          dataKey="Principal"
          stackId="1"
          stroke="var(--color-chart-3)"
          fill="var(--color-chart-3)"
          fillOpacity={0.7}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="Interest"
          stackId="1"
          stroke="var(--color-chart-2)"
          fill="var(--color-chart-2)"
          fillOpacity={0.7}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="Extra"
          stackId="1"
          stroke="var(--color-chart-5)"
          fill="var(--color-chart-5)"
          fillOpacity={0.7}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="Taxes"
          stackId="1"
          stroke="var(--color-chart-4)"
          fill="var(--color-chart-4)"
          fillOpacity={0.55}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="Insurance"
          stackId="1"
          stroke="var(--color-chart-1)"
          fill="var(--color-chart-1)"
          fillOpacity={0.5}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="PMI"
          stackId="1"
          stroke="var(--color-neg)"
          fill="var(--color-neg)"
          fillOpacity={0.55}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="HOA"
          stackId="1"
          stroke="var(--color-chart-6)"
          fill="var(--color-chart-6)"
          fillOpacity={0.5}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="Maintenance"
          stackId="1"
          stroke="var(--color-muted-foreground)"
          fill="var(--color-muted-foreground)"
          fillOpacity={0.4}
          isAnimationActive={false}
        />
        {refis.map((y) => (
          <ReferenceLine
            key={`refi-${y}`}
            x={y}
            stroke="var(--color-chart-5)"
            strokeWidth={1.5}
            label={{ value: 'refi', position: 'top', fontSize: 9, fill: 'var(--color-chart-5)' }}
          />
        ))}
        {recasts.map((y) => (
          <ReferenceLine
            key={`recast-${y}`}
            x={y}
            stroke="var(--color-chart-1)"
            strokeWidth={1}
            label={{ value: 'recast', position: 'top', fontSize: 9, fill: 'var(--color-chart-1)' }}
          />
        ))}
        {lumps.map((y) => (
          <ReferenceLine
            key={`lump-${y}`}
            x={y}
            stroke="var(--color-chart-4)"
            strokeWidth={1}
            label={{ value: '$', position: 'top', fontSize: 9, fill: 'var(--color-chart-4)' }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
