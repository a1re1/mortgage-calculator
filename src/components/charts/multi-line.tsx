import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MonthRow, ScenarioResult } from '~/lib/mortgage'
import { mergeMetric, moneyTooltip, shortMoney, yearTickFormatter } from './shared'

interface MultiLineChartProps {
  results: ScenarioResult[]
  pick: (r: MonthRow) => number
  height?: number
  yFormatter?: (v: number) => string
  zeroLine?: boolean
  step?: number
  maxYear?: number
  strokeDasharray?: (id: string) => string | undefined
}

export function MultiLineChart({
  results,
  pick,
  height = 240,
  yFormatter = shortMoney,
  zeroLine = false,
  step = 1,
  maxYear,
  strokeDasharray,
}: MultiLineChartProps) {
  const all = mergeMetric(results, pick, step)
  const data = maxYear ? all.filter((r) => r.year <= maxYear) : all
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="2 4" />
        <XAxis
          dataKey="year"
          type="number"
          domain={[0, 'dataMax']}
          tickFormatter={yearTickFormatter}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={yFormatter}
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <Tooltip
          formatter={(v, name) => {
            const r = results.find((res) => res.inputs.id === name)
            return [moneyTooltip(v as number), r?.inputs.name ?? name]
          }}
          labelFormatter={(label) =>
            `Year ${typeof label === 'number' ? label.toFixed(1) : label}`
          }
          isAnimationActive={false}
        />
        {zeroLine && <ReferenceLine y={0} stroke="var(--color-muted-foreground)" />}
        {results.map((r) => (
          <Line
            key={r.inputs.id}
            type="monotone"
            dataKey={r.inputs.id}
            stroke={r.inputs.color}
            strokeWidth={2}
            strokeDasharray={strokeDasharray?.(r.inputs.id)}
            dot={false}
            isAnimationActive={false}
            connectNulls={false}
            name={r.inputs.id}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
