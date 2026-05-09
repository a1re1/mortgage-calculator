import * as React from 'react'
import { Slider } from '~/components/ui/slider'
import { Label } from '~/components/ui/label'
import { cn } from '~/lib/utils'

interface SliderFieldProps {
  label: React.ReactNode
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  step?: number
  format?: (v: number) => string
  hint?: React.ReactNode
  className?: string
}

export function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  format,
  hint,
  className,
}: SliderFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-2">
          {hint && (
            <span className="text-[10px] text-muted-foreground/80">{hint}</span>
          )}
          <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
            {format ? format(value) : value}
          </span>
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(vs) => onChange(vs[0] ?? value)}
      />
    </div>
  )
}
