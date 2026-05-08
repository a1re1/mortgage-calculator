import * as React from 'react'
import { cn } from '~/lib/utils'

interface BigStatProps {
  label: React.ReactNode
  value: React.ReactNode
  sub?: React.ReactNode
  color?: string
  className?: string
  delta?: number
  deltaFormat?: (v: number) => string
}

export function BigStat({
  label,
  value,
  sub,
  color,
  className,
  delta,
  deltaFormat,
}: BigStatProps) {
  return (
    <div
      className={cn(
        'flex h-full min-h-[120px] flex-col items-center justify-center px-3 py-4 text-center',
        className,
      )}
    >
      <div className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div
        className="font-mono text-4xl font-light leading-none tabular-nums xl:text-5xl"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-2 text-[11px] text-muted-foreground tabular-nums">{sub}</div>
      )}
      {delta !== undefined && Number.isFinite(delta) && (
        <div
          className={cn(
            'mt-1.5 text-[10px] font-semibold uppercase tracking-wider tabular-nums',
            delta < 0 ? 'text-pos' : delta > 0 ? 'text-neg' : 'text-muted-foreground',
          )}
          style={
            delta < 0
              ? { color: 'var(--color-pos)' }
              : delta > 0
                ? { color: 'var(--color-neg)' }
                : undefined
          }
        >
          {delta === 0
            ? '— vs baseline'
            : `${delta < 0 ? '↓' : '↑'} ${deltaFormat ? deltaFormat(Math.abs(delta)) : Math.abs(delta).toFixed(0)} vs baseline`}
        </div>
      )}
    </div>
  )
}
