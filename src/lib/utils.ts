import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(n: number, opts?: { compact?: boolean; cents?: boolean }) {
  if (!Number.isFinite(n)) return '—'
  if (opts?.compact) {
    const abs = Math.abs(n)
    if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
    if (abs >= 1e3) return `$${(n / 1e3).toFixed(1)}k`
    return `$${n.toFixed(0)}`
  }
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: opts?.cents ? 2 : 0,
    maximumFractionDigits: opts?.cents ? 2 : 0,
  })
}

export function formatPercent(n: number, digits = 2) {
  if (!Number.isFinite(n)) return '—'
  return `${n.toFixed(digits)}%`
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}
