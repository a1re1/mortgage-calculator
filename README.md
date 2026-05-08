# Mortgage Lab

Grafana-style mortgage scenario visualization tool. Compare loan structures over
time — payments, equity, total cost, points, recasts, refinances, lump-sum
payments — side-by-side.

Built with TanStack Start (Vite), React 19, Tailwind v4, shadcn/ui, recharts.
Deployed to Vercel.

## Develop

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
```

Output is generated for the Vercel preset. The `vercel` directory will contain
the deploy artifacts.

## What's in here

- `src/lib/mortgage.ts` — full month-by-month amortization simulator. Handles
  PMI dropoff, points buydowns, property tax, insurance, HOA, maintenance,
  appreciation, inflation. Supports recurring extra principal, scheduled lump
  sums (with optional recast), and full refinance events.
- `src/routes/index.tsx` — main dashboard: focus/baseline scenario picker,
  time-range selector, big stat panels, parameter sliders, scenario waterfall
  comparison, multi-line over-time charts, and per-scenario detail forms.
- `src/components/charts/*` — recharts visuals tuned for the dark Grafana
  palette.

Not financial advice.
