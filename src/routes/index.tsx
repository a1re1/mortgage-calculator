import { createFileRoute } from '@tanstack/react-router'
import {
  Activity,
  Clock,
  GitCompare,
  Plus,
  RotateCcw,
  Target,
} from 'lucide-react'
import * as React from 'react'

import { BigStat } from '~/components/big-stat'
import { CompositionBarChart } from '~/components/charts/composition-bar'
import { HomeValueVsPaidChart } from '~/components/charts/home-value-vs-paid'
import { MultiLineChart } from '~/components/charts/multi-line'
import { PaymentBreakdownChart } from '~/components/charts/payment-breakdown'
import { ScenarioWaterfall } from '~/components/charts/scenario-waterfall'
import { COLORS } from '~/components/charts/shared'
import { Panel } from '~/components/panel'
import { ScenarioForm } from '~/components/scenario-form'
import { Sidebar } from '~/components/sidebar'
import { SliderField } from '~/components/slider-field'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import {
  defaultScenario,
  simulateScenario,
  type ScenarioInputs,
  type ScenarioResult,
} from '~/lib/mortgage'
import { formatCurrency } from '~/lib/utils'

export const Route = createFileRoute('/')({
  component: Home,
})

// Two scenarios out of the box:
// 1. Chase preapproval (May 5 2026, ref MAX9058061) — max stretch at $1.5M,
//    30yr fixed @ 5.625% with 2.15 points. Modeled as base 6.1625% reduced
//    0.5375% by 2.15 points (default 0.25%/pt), landing on Chase's 5.625%
//    effective rate. Point cost ≈ $25,800.
// 2. 118 Pearl St #2, Cambridge — actual target at $1,294,000. Same Chase
//    loan terms applied. Real listing numbers: HOA $461/mo (water, sewer,
//    master ins, snow, reserves), property tax $4,179/yr → 0.32% of price,
//    HO-6 personal policy ~$500/yr (master is in HOA), 0.6% maintenance
//    (1874 build, duplex condo, exterior covered by HOA).
const initialPresets = (): ScenarioInputs[] => [
  defaultScenario({
    name: 'Chase preapproval · $1.5M',
    color: COLORS[0]!,
    homePrice: 1_500_000,
    loanTermYears: 30,
    interestRate: 6.1625,
    points: 2.15,
  }),
  defaultScenario({
    name: '118 Pearl St · $1.294M',
    color: COLORS[1]!,
    homePrice: 1_294_000,
    loanTermYears: 30,
    interestRate: 6.1625,
    points: 2.15,
    propertyTaxRate: 0.32,
    homeInsuranceAnnual: 500,
    hoaMonthly: 461,
    maintenancePctAnnual: 0.6,
  }),
]

const TIME_RANGES = [
  { label: '5 yr', value: 5 },
  { label: '10 yr', value: 10 },
  { label: '15 yr', value: 15 },
  { label: '20 yr', value: 20 },
  { label: '30 yr', value: 30 },
  { label: 'full', value: 0 },
]

function Home() {
  const [scenarios, setScenarios] = React.useState<ScenarioInputs[]>(() => initialPresets())
  const [focusedId, setFocusedId] = React.useState<string>(scenarios[0]!.id)
  const [baselineId, setBaselineId] = React.useState<string>(scenarios[0]!.id)
  const [breakdownId, setBreakdownId] = React.useState<string>(scenarios[0]!.id)
  const [equityYear, setEquityYear] = React.useState(10)
  const [maxYear, setMaxYear] = React.useState(30)

  const results = React.useMemo(
    () => scenarios.map((s) => simulateScenario(s)),
    [scenarios],
  )
  const visibleResults = results.filter((r) => r.inputs.visible)
  const focused: ScenarioResult =
    results.find((r) => r.inputs.id === focusedId) ?? results[0]!
  const baseline: ScenarioResult | null =
    results.find((r) => r.inputs.id === baselineId) ?? null
  const breakdown: ScenarioResult =
    results.find((r) => r.inputs.id === breakdownId) ?? results[0]!

  const focusedEquityRow =
    focused.rows.find((r) => r.month === Math.round(equityYear * 12)) ??
    focused.rows[focused.rows.length - 1]!

  const update = (id: string, patch: Partial<ScenarioInputs>) => {
    setScenarios((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }
  const replaceScenario = (next: ScenarioInputs) => {
    setScenarios((prev) => prev.map((s) => (s.id === next.id ? next : s)))
  }
  const addScenario = () => {
    const next = defaultScenario({
      name: `Scenario ${scenarios.length + 1}`,
      color: COLORS[scenarios.length % COLORS.length]!,
    })
    setScenarios((prev) => [...prev, next])
  }
  const removeScenario = (id: string) => {
    setScenarios((prev) => {
      if (prev.length <= 1) return prev
      const next = prev.filter((s) => s.id !== id)
      if (focusedId === id) setFocusedId(next[0]!.id)
      if (baselineId === id) setBaselineId(next[0]!.id)
      if (breakdownId === id) setBreakdownId(next[0]!.id)
      return next
    })
  }
  const reset = () => {
    const fresh = initialPresets()
    setScenarios(fresh)
    setFocusedId(fresh[0]!.id)
    setBaselineId(fresh[0]!.id)
    setBreakdownId(fresh[0]!.id)
  }

  const fs = focused.inputs
  const compactDelta = (v: number) => formatCurrency(v, { compact: true })
  const effectiveMax = maxYear === 0 ? undefined : maxYear

  const monthlyDelta =
    baseline && baseline.inputs.id !== focused.inputs.id
      ? focused.summary.initialMonthlyTotal - baseline.summary.initialMonthlyTotal
      : undefined
  const interestDelta =
    baseline && baseline.inputs.id !== focused.inputs.id
      ? focused.summary.totalInterest - baseline.summary.totalInterest
      : undefined
  const equityDelta =
    baseline && baseline.inputs.id !== focused.inputs.id
      ? focusedEquityRow.equity -
        (baseline.rows.find((r) => r.month === Math.round(equityYear * 12))?.equity ??
          baseline.rows[baseline.rows.length - 1]!.equity)
      : undefined
  const breakEvenDelta =
    baseline &&
    baseline.inputs.id !== focused.inputs.id &&
    focused.summary.breakEvenMonth &&
    baseline.summary.breakEvenMonth
      ? focused.summary.breakEvenMonth - baseline.summary.breakEvenMonth
      : undefined

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b border-panel-border bg-panel/85 px-3 py-2 backdrop-blur lg:h-12 lg:flex-nowrap lg:py-0">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-tight">Mortgage Lab</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                scenario comparison · over time
              </div>
            </div>
            <div className="ml-2 hidden items-center gap-1.5 rounded-md border border-panel-border bg-input/40 pl-2 pr-1 py-1 lg:flex">
              <Target className="h-3 w-3 text-primary" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                focus
              </span>
              <Select value={focusedId} onValueChange={setFocusedId}>
                <SelectTrigger className="h-6 w-44 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                vs
              </span>
              <Select value={baselineId} onValueChange={setBaselineId}>
                <SelectTrigger className="h-6 w-44 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="hidden items-center gap-1.5 rounded-md border border-panel-border bg-input/40 px-2 py-1 text-[11px] text-muted-foreground sm:flex">
              <Activity
                className="h-3 w-3"
                style={{ color: 'var(--color-pos)' }}
              />
              <span>{visibleResults.length} live · {scenarios.length} total</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-panel-border bg-input/40 pl-2 pr-1 py-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <Select
                value={String(maxYear)}
                onValueChange={(v) => setMaxYear(Number(v))}
              >
                <SelectTrigger className="h-6 w-20 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0 sm:w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_RANGES.map((r) => (
                    <SelectItem key={r.value} value={String(r.value)}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="secondary" size="sm" onClick={reset} title="Reset">
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">reset</span>
            </Button>
            <Button variant="default" size="sm" onClick={addScenario} title="Add scenario">
              <Plus className="h-3 w-3" />
              <span className="hidden sm:inline">scenario</span>
            </Button>
          </div>
          <div className="flex w-full items-center gap-1.5 rounded-md border border-panel-border bg-input/40 px-2 py-1 lg:hidden">
            <Target className="h-3 w-3 shrink-0 text-primary" />
            <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
              focus
            </span>
            <Select value={focusedId} onValueChange={setFocusedId}>
              <SelectTrigger className="h-6 min-w-0 flex-1 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">
              vs
            </span>
            <Select value={baselineId} onValueChange={setBaselineId}>
              <SelectTrigger className="h-6 min-w-0 flex-1 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </header>

        <main className="flex-1 space-y-3 p-2 sm:p-3">
          <div className="grid gap-3 lg:grid-cols-2">
            <Panel
              title="Home Value vs Total Paid"
              description="solid = appreciated value · dashed = cumulative cash out"
            >
              <HomeValueVsPaidChart
                results={visibleResults}
                height={260}
                maxYear={effectiveMax}
              />
            </Panel>

            <Panel
              title={`Monthly Payment Breakdown · ${breakdown.inputs.name}`}
              description="stacked components · markers for refi / recast / lump sum"
              accent={breakdown.inputs.color}
              action={
                <Select value={breakdownId} onValueChange={setBreakdownId}>
                  <SelectTrigger className="h-6 w-32 px-2 text-[11px] sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            >
              <PaymentBreakdownChart
                result={breakdown}
                height={260}
                maxYear={effectiveMax}
              />
            </Panel>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            <Panel
              accent={focused.inputs.color}
              title={`Monthly payment · ${focused.inputs.name}`}
              description="incl. tax · ins · pmi · hoa · maint"
            >
              <BigStat
                label="month 1 total"
                value={formatCurrency(focused.summary.initialMonthlyTotal)}
                sub={`P&I ${formatCurrency(focused.summary.initialMonthlyPI)}`}
                color={focused.inputs.color}
                delta={monthlyDelta}
                deltaFormat={(v) => formatCurrency(v)}
              />
            </Panel>
            <Panel
              accent={focused.inputs.color}
              title={`Total interest paid · ${focused.inputs.name}`}
              description={`${focused.summary.payoffYear.toFixed(1)}yr payoff · ${focused.summary.effectiveStartRate.toFixed(3)}% eff`}
            >
              <BigStat
                label="paid to lender"
                value={formatCurrency(focused.summary.totalInterest, { compact: true })}
                sub={`of ${formatCurrency(focused.summary.totalCost, { compact: true })} all-in`}
                color="var(--color-chart-2)"
                delta={interestDelta}
                deltaFormat={compactDelta}
              />
            </Panel>
            <Panel
              accent={focused.inputs.color}
              title={`Break-even year · ${focused.inputs.name}`}
              description="equity > total cash out"
            >
              <BigStat
                label="month equity > OOP"
                value={
                  focused.summary.breakEvenMonth
                    ? `Yr ${(focused.summary.breakEvenMonth / 12).toFixed(1)}`
                    : '—'
                }
                sub={
                  focused.summary.breakEvenMonth
                    ? `${focused.summary.breakEvenMonth} mo`
                    : 'never within term'
                }
                color={
                  focused.summary.breakEvenMonth
                    ? 'var(--color-pos)'
                    : 'var(--color-neg)'
                }
                delta={breakEvenDelta}
                deltaFormat={(v) => `${v.toFixed(0)}mo`}
              />
            </Panel>
            <Panel
              accent={focused.inputs.color}
              title={`Equity at year ${equityYear} · ${focused.inputs.name}`}
              description={`bal ${formatCurrency(focusedEquityRow.balance, { compact: true })} · val ${formatCurrency(focusedEquityRow.homeValue, { compact: true })}`}
            >
              <BigStat
                label="if you sold today"
                value={formatCurrency(focusedEquityRow.equity, { compact: true })}
                sub={`net ${formatCurrency(focusedEquityRow.netPosition, { compact: true })}`}
                color="var(--color-chart-3)"
                delta={equityDelta}
                deltaFormat={compactDelta}
              />
              <div className="mx-3 mb-3">
                <SliderField
                  label="year"
                  value={equityYear}
                  min={1}
                  max={Math.min(40, Math.ceil(focused.summary.payoffYear) + 5)}
                  step={1}
                  format={(v) => `yr ${v}`}
                  onChange={setEquityYear}
                />
              </div>
            </Panel>
          </div>

          <div className="grid gap-3 lg:grid-cols-12">
            <Panel
              title="Parameters"
              description={`editing · ${fs.name}`}
              accent={focused.inputs.color}
              className="lg:col-span-5"
            >
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                <SliderField
                  label="Home price"
                  value={fs.homePrice}
                  min={50000}
                  max={3000000}
                  step={5000}
                  format={(v) => formatCurrency(v, { compact: true })}
                  onChange={(v) => update(fs.id, { homePrice: v })}
                />
                <SliderField
                  label="Down payment"
                  value={fs.downPaymentPct}
                  min={0}
                  max={50}
                  step={0.5}
                  format={(v) => `${v.toFixed(1)}%`}
                  hint={formatCurrency(fs.homePrice * (fs.downPaymentPct / 100), {
                    compact: true,
                  })}
                  onChange={(v) => update(fs.id, { downPaymentPct: v })}
                />
                <SliderField
                  label="Interest rate"
                  value={fs.interestRate}
                  min={0}
                  max={15}
                  step={0.05}
                  format={(v) => `${v.toFixed(2)}%`}
                  onChange={(v) => update(fs.id, { interestRate: v })}
                />
                <SliderField
                  label="Loan term"
                  value={fs.loanTermYears}
                  min={5}
                  max={40}
                  step={1}
                  format={(v) => `${v} yr`}
                  onChange={(v) => update(fs.id, { loanTermYears: v })}
                />
                <SliderField
                  label="Point buydowns"
                  value={fs.points}
                  min={0}
                  max={4}
                  step={0.25}
                  format={(v) => `${v.toFixed(2)} pts`}
                  hint={
                    fs.points > 0
                      ? `eff ${(
                          fs.interestRate -
                          fs.points * fs.pointReductionPct
                        ).toFixed(3)}%`
                      : undefined
                  }
                  onChange={(v) => update(fs.id, { points: v })}
                />
                <SliderField
                  label="Closing costs"
                  value={fs.closingCostsPct}
                  min={0}
                  max={6}
                  step={0.1}
                  format={(v) => `${v.toFixed(1)}%`}
                  hint={formatCurrency(fs.homePrice * (fs.closingCostsPct / 100), {
                    compact: true,
                  })}
                  onChange={(v) => update(fs.id, { closingCostsPct: v })}
                />
                <SliderField
                  label="Property tax"
                  value={fs.propertyTaxRate}
                  min={0}
                  max={4}
                  step={0.05}
                  format={(v) => `${v.toFixed(2)}%`}
                  hint="annual / value"
                  onChange={(v) => update(fs.id, { propertyTaxRate: v })}
                />
                <SliderField
                  label="HOI (insurance)"
                  value={fs.homeInsuranceAnnual}
                  min={0}
                  max={10000}
                  step={50}
                  format={(v) => `${formatCurrency(v / 12)}/mo`}
                  onChange={(v) => update(fs.id, { homeInsuranceAnnual: v })}
                />
                <SliderField
                  label="Maintenance %"
                  value={fs.maintenancePctAnnual}
                  min={0}
                  max={5}
                  step={0.1}
                  format={(v) => `${v.toFixed(1)}%`}
                  hint="of value/yr"
                  onChange={(v) => update(fs.id, { maintenancePctAnnual: v })}
                />
                <SliderField
                  label="Appreciation rate"
                  value={fs.appreciationPct}
                  min={-5}
                  max={12}
                  step={0.25}
                  format={(v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`}
                  onChange={(v) => update(fs.id, { appreciationPct: v })}
                />
                <SliderField
                  label="HOA / mo"
                  value={fs.hoaMonthly}
                  min={0}
                  max={2000}
                  step={10}
                  format={(v) => formatCurrency(v)}
                  onChange={(v) => update(fs.id, { hoaMonthly: v })}
                />
                <SliderField
                  label="Monthly extra"
                  value={fs.monthlyExtra}
                  min={0}
                  max={3000}
                  step={25}
                  format={(v) => formatCurrency(v)}
                  hint="to principal"
                  onChange={(v) => update(fs.id, { monthlyExtra: v })}
                />
              </div>
            </Panel>

            <Panel
              title={
                <span className="inline-flex items-center gap-1.5">
                  <GitCompare className="h-2.5 w-2.5" /> Scenario comparison
                </span>
              }
              description={`Δ vs ${baseline?.inputs.name ?? 'baseline'}`}
              className="lg:col-span-7"
              action={
                <Select value={baselineId} onValueChange={setBaselineId}>
                  <SelectTrigger className="h-6 w-44 px-2 text-[11px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            >
              <ScenarioWaterfall results={visibleResults} baseline={baseline} />
            </Panel>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">over time</TabsTrigger>
              <TabsTrigger value="totals">totals</TabsTrigger>
              <TabsTrigger value="scenarios">scenario detail</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-3">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <Panel title="Equity over time">
                  <MultiLineChart
                    results={visibleResults}
                    pick={(r) => r.equity}
                    maxYear={effectiveMax}
                  />
                </Panel>
                <Panel title="Loan balance">
                  <MultiLineChart
                    results={visibleResults}
                    pick={(r) => r.balance}
                    maxYear={effectiveMax}
                  />
                </Panel>
                <Panel title="Net position (equity − cash out)">
                  <MultiLineChart
                    results={visibleResults}
                    pick={(r) => r.netPosition}
                    zeroLine
                    maxYear={effectiveMax}
                  />
                </Panel>
                <Panel title="Cumulative interest paid">
                  <MultiLineChart
                    results={visibleResults}
                    pick={(r) => r.cumulativeInterest}
                    maxYear={effectiveMax}
                  />
                </Panel>
                <Panel title="Cumulative cash out">
                  <MultiLineChart
                    results={visibleResults}
                    pick={(r) => r.cumulativeOutOfPocket}
                    maxYear={effectiveMax}
                  />
                </Panel>
                <Panel title="Total monthly payment">
                  <MultiLineChart
                    results={visibleResults}
                    pick={(r) => r.totalMonthly}
                    maxYear={effectiveMax}
                  />
                </Panel>
              </div>
            </TabsContent>
            <TabsContent value="totals" className="mt-3">
              <Panel
                title="Lifetime cost composition"
                description="all-in cost stacked per scenario"
              >
                <CompositionBarChart results={visibleResults} height={320} />
              </Panel>
            </TabsContent>
            <TabsContent value="scenarios" className="mt-3 space-y-3">
              {scenarios.map((s) => (
                <ScenarioForm
                  key={s.id}
                  scenario={s}
                  onChange={replaceScenario}
                  removable={scenarios.length > 1}
                  onRemove={() => removeScenario(s.id)}
                />
              ))}
              <div className="flex justify-center">
                <Button variant="secondary" size="lg" onClick={addScenario}>
                  <Plus className="h-3.5 w-3.5" /> add scenario
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <footer className="pb-1 pt-2 text-center text-[10px] text-muted-foreground/60">
            Mortgage Lab · figures are estimates, not financial advice
          </footer>
        </main>
      </div>
    </div>
  )
}
