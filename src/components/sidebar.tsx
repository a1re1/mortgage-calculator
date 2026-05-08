import { BarChart3, Bell, Compass, Home, LayoutDashboard, Settings } from 'lucide-react'
import * as React from 'react'
import { cn } from '~/lib/utils'

interface NavItem {
  icon: React.ReactNode
  label: string
  active?: boolean
}

const items: NavItem[] = [
  { icon: <Home className="h-3.5 w-3.5" />, label: 'Home' },
  { icon: <LayoutDashboard className="h-3.5 w-3.5" />, label: 'Dashboard', active: true },
  { icon: <BarChart3 className="h-3.5 w-3.5" />, label: 'Analytics' },
  { icon: <Compass className="h-3.5 w-3.5" />, label: 'Explore' },
  { icon: <Bell className="h-3.5 w-3.5" />, label: 'Alerts' },
  { icon: <Settings className="h-3.5 w-3.5" />, label: 'Settings' },
]

export function Sidebar() {
  return (
    <aside className="hidden w-12 shrink-0 flex-col items-center border-r border-panel-border bg-panel/60 py-2 md:flex">
      <div
        className="mb-3 flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[oklch(0.78_0.16_50)] to-[oklch(0.65_0.20_25)] text-background shadow-md"
        title="Mortgage Lab"
      >
        <span className="font-mono text-sm font-bold">M</span>
      </div>
      <nav className="flex flex-1 flex-col items-center gap-1">
        {items.map((it) => (
          <button
            key={it.label}
            type="button"
            title={it.label}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
              it.active && 'bg-accent text-foreground',
            )}
          >
            {it.icon}
          </button>
        ))}
      </nav>
    </aside>
  )
}
