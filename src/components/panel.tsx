import * as React from 'react'
import { cn } from '~/lib/utils'

interface PanelProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  bodyClassName?: string
  noPadding?: boolean
  accent?: string
}

export function Panel({
  title,
  description,
  action,
  bodyClassName,
  noPadding,
  accent,
  className,
  children,
  ...rest
}: PanelProps) {
  return (
    <div
      className={cn(
        'relative rounded-md border border-panel-border bg-panel/95 shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]',
        className,
      )}
      {...rest}
    >
      {accent && (
        <div
          className="absolute left-0 top-0 h-full w-[2px] rounded-l-md"
          style={{ background: accent }}
        />
      )}
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-panel-border px-3 py-1.5">
          <div className="flex items-baseline gap-2 min-w-0">
            {title && (
              <div className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-panel-header">
                {title}
              </div>
            )}
            {description && (
              <div className="truncate text-[10px] text-muted-foreground">{description}</div>
            )}
          </div>
          {action && <div className="flex items-center gap-1.5">{action}</div>}
        </div>
      )}
      <div className={cn(noPadding ? '' : 'p-3', bodyClassName)}>{children}</div>
    </div>
  )
}
