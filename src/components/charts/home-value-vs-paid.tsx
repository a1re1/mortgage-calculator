import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ScenarioResult } from '~/lib/mortgage'
import { moneyTooltip, shortMoney, yearTickFormatter } from './shared'

interface HomeValueVsPaidProps {
  results: ScenarioResult[]
  height?: number
  maxYear?: number
}

interface MergedRow {
  year: number
  [key: string]: number | null
}

export function HomeValueVsPaidChart({ results, height = 280, maxYear }: HomeValueVsPaidProps) {
  const cap = maxYear ? maxYear * 12 : Infinity
  const maxLen = Math.min(cap, Math.max(0, ...results.map((r) => r.rows.length)))
  const data: MergedRow[] = []
  for (let i = 0; i < maxLen; i++) {
    const month = i + 1
    const row: MergedRow = { year: month / 12 }
    for (const r of results) {
      const x = r.rows[i]
      row[`${r.inputs.id}_value`] = x ? x.homeValue : null
      row[`${r.inputs.id}_paid`] = x ? x.cumulativeOutOfPocket : null
    }
    data.push(row)
  }

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
          tickFormatter={shortMoney}
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <Tooltip
          formatter={(v, key) => {
            const k = String(key)
            const r = results.find(
              (res) => k.startsWith(res.inputs.id),
            )
            const kind = k.endsWith('_value') ? 'Home value' : 'Total paid'
            return [moneyTooltip(v as number), `${r?.inputs.name ?? ''} • ${kind}`]
          }}
          labelFormatter={(l) =>
            `Year ${typeof l === 'number' ? l.toFixed(1) : l}`
          }
          isAnimationActive={false}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
          iconType="plainline"
          iconSize={14}
          formatter={(v) => {
            const k = String(v)
            const r = results.find((res) => k.startsWith(res.inputs.id))
            const kind = k.endsWith('_value') ? 'value' : 'paid'
            return `${r?.inputs.name ?? ''} ${kind}`
          }}
        />
        {results.map((r) => (
          <Line
            key={`${r.inputs.id}_value`}
            type="monotone"
            dataKey={`${r.inputs.id}_value`}
            stroke={r.inputs.color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls={false}
          />
        ))}
        {results.map((r) => (
          <Line
            key={`${r.inputs.id}_paid`}
            type="monotone"
            dataKey={`${r.inputs.id}_paid`}
            stroke={r.inputs.color}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
