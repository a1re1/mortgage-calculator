import * as React from 'react'
import { cn } from '~/lib/utils'

interface StatProps {
  label: React.ReactNode
  value: React.ReactNode
  sub?: React.ReactNode
  color?: string
  className?: string
  align?: 'left' | 'right'
}

export function Stat({ label, value, sub, color, className, align = 'left' }: StatProps) {
  return (
    <div className={cn('flex flex-col', align === 'right' && 'items-end', className)}>
      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div
        className="mt-0.5 font-mono text-xl font-semibold tabular-nums leading-tight"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      {sub && (
        <div className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">{sub}</div>
      )}
    </div>
  )
}
