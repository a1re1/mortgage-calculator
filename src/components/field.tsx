import * as React from 'react'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { cn } from '~/lib/utils'

interface NumberFieldProps {
  label: React.ReactNode
  value: number
  onChange: (v: number) => void
  step?: number
  min?: number
  max?: number
  suffix?: string
  prefix?: string
  hint?: string
  className?: string
  inputClassName?: string
  disabled?: boolean
}

export function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  suffix,
  prefix,
  hint,
  className,
  inputClassName,
  disabled,
}: NumberFieldProps) {
  const id = React.useId()
  const [local, setLocal] = React.useState(String(value))
  React.useEffect(() => {
    setLocal(String(value))
  }, [value])
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <Label htmlFor={id} className="flex items-center justify-between gap-2">
        <span className="truncate">{label}</span>
        {hint && <span className="text-muted-foreground/70 normal-case">{hint}</span>}
      </Label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-[11px] text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          id={id}
          type="number"
          value={local}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(e) => {
            setLocal(e.target.value)
            const n = e.target.value === '' ? 0 : Number(e.target.value)
            if (Number.isFinite(n)) onChange(n)
          }}
          onBlur={() => {
            const n = local === '' ? 0 : Number(local)
            if (!Number.isFinite(n)) {
              setLocal(String(value))
            }
          }}
          className={cn(prefix && 'pl-5', suffix && 'pr-7', inputClassName)}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-[11px] text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}
