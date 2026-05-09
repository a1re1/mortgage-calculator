import { Trash2, Plus, Repeat2, Coins, RefreshCcw } from 'lucide-react'
import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Button } from '~/components/ui/button'
import { Switch } from '~/components/ui/switch'
import { Label } from '~/components/ui/label'
import { Input } from '~/components/ui/input'
import { NumberField } from '~/components/field'
import { Panel } from '~/components/panel'
import {
  cryptoId,
  type ExtraPayment,
  type RefinanceEvent,
  type ScenarioInputs,
} from '~/lib/mortgage'
import { cn, formatCurrency } from '~/lib/utils'

interface ScenarioFormProps {
  scenario: ScenarioInputs
  onChange: (next: ScenarioInputs) => void
  onRemove?: () => void
  removable?: boolean
}

export function ScenarioForm({ scenario, onChange, onRemove, removable }: ScenarioFormProps) {
  const update = <K extends keyof ScenarioInputs>(key: K, value: ScenarioInputs[K]) => {
    onChange({ ...scenario, [key]: value })
  }

  const downPayment = scenario.homePrice * (scenario.downPaymentPct / 100)
  const loan = scenario.homePrice - downPayment
  const effectiveRate =
    scenario.interestRate - scenario.points * scenario.pointReductionPct
  const pointCost = loan * ((scenario.points * scenario.pointCostPct) / 100)

  return (
    <Panel
      accent={scenario.color}
      title={
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: scenario.color }}
          />
          <Input
            value={scenario.name}
            onChange={(e) => update('name', e.target.value)}
            className="h-6 w-44 px-1.5 text-[11px] font-semibold uppercase tracking-wider"
          />
        </div>
      }
      action={
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-[10px]">visible</Label>
            <Switch
              checked={scenario.visible}
              onCheckedChange={(v) => update('visible', v)}
            />
          </div>
          {removable && (
            <Button variant="ghost" size="icon" onClick={onRemove} title="Remove scenario">
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        <NumberField
          label="Home price"
          value={scenario.homePrice}
          onChange={(v) => update('homePrice', v)}
          step={5000}
          min={0}
          prefix="$"
        />
        <NumberField
          label="Down payment"
          value={scenario.downPaymentPct}
          onChange={(v) => update('downPaymentPct', v)}
          step={0.5}
          min={0}
          max={100}
          suffix="%"
          hint={formatCurrency(downPayment, { compact: true })}
        />
        <div className="flex flex-col gap-1">
          <Label>Loan term</Label>
          <Select
            value={String(scenario.loanTermYears)}
            onValueChange={(v) => update('loanTermYears', Number(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 years</SelectItem>
              <SelectItem value="15">15 years</SelectItem>
              <SelectItem value="20">20 years</SelectItem>
              <SelectItem value="25">25 years</SelectItem>
              <SelectItem value="30">30 years</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <NumberField
          label="Interest rate"
          value={scenario.interestRate}
          onChange={(v) => update('interestRate', v)}
          step={0.05}
          min={0}
          max={20}
          suffix="%"
          hint={`eff ${effectiveRate.toFixed(3)}%`}
        />
        <NumberField
          label="Points"
          value={scenario.points}
          onChange={(v) => update('points', v)}
          step={0.25}
          min={0}
          max={5}
          hint={pointCost > 0 ? `+${formatCurrency(pointCost, { compact: true })}` : 'none'}
        />
        <NumberField
          label="Closing costs"
          value={scenario.closingCostsPct}
          onChange={(v) => update('closingCostsPct', v)}
          step={0.25}
          min={0}
          max={10}
          suffix="%"
          hint={formatCurrency(scenario.homePrice * (scenario.closingCostsPct / 100), {
            compact: true,
          })}
        />
        <NumberField
          label="PMI rate"
          value={scenario.pmiRate}
          onChange={(v) => update('pmiRate', v)}
          step={0.05}
          min={0}
          max={3}
          suffix="%"
          hint="if LTV > 78%"
        />
        <NumberField
          label="Property tax"
          value={scenario.propertyTaxRate}
          onChange={(v) => update('propertyTaxRate', v)}
          step={0.05}
          min={0}
          max={5}
          suffix="%"
          hint="annual"
        />
        <NumberField
          label="Home insurance"
          value={scenario.homeInsuranceAnnual}
          onChange={(v) => update('homeInsuranceAnnual', v)}
          step={50}
          min={0}
          prefix="$"
          hint="/ year"
        />
        <NumberField
          label="HOA"
          value={scenario.hoaMonthly}
          onChange={(v) => update('hoaMonthly', v)}
          step={10}
          min={0}
          prefix="$"
          hint="/ month"
        />
        <NumberField
          label="Maintenance"
          value={scenario.maintenancePctAnnual}
          onChange={(v) => update('maintenancePctAnnual', v)}
          step={0.1}
          min={0}
          max={5}
          suffix="%"
          hint="of value / yr"
        />
        <NumberField
          label="Appreciation"
          value={scenario.appreciationPct}
          onChange={(v) => update('appreciationPct', v)}
          step={0.25}
          min={-10}
          max={20}
          suffix="%"
          hint="annual"
        />
        <NumberField
          label="Inflation (costs)"
          value={scenario.inflationPct}
          onChange={(v) => update('inflationPct', v)}
          step={0.25}
          min={-5}
          max={15}
          suffix="%"
          hint="annual"
        />
        <NumberField
          label="Monthly extra"
          value={scenario.monthlyExtra}
          onChange={(v) => update('monthlyExtra', v)}
          step={50}
          min={0}
          prefix="$"
          hint="recurring extra principal"
        />
      </div>

      <ExtraPaymentsEditor
        loanTermMonths={scenario.loanTermYears * 12}
        items={scenario.extraPayments}
        onChange={(items) => update('extraPayments', items)}
      />

      <RefinanceEditor
        currentRate={scenario.interestRate}
        loanTermMonths={scenario.loanTermYears * 12}
        items={scenario.refinances}
        onChange={(items) => update('refinances', items)}
      />
    </Panel>
  )
}

function ExtraPaymentsEditor({
  loanTermMonths,
  items,
  onChange,
}: {
  loanTermMonths: number
  items: ExtraPayment[]
  onChange: (items: ExtraPayment[]) => void
}) {
  const update = (id: string, patch: Partial<ExtraPayment>) => {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }
  const remove = (id: string) => onChange(items.filter((it) => it.id !== id))
  const add = () =>
    onChange([
      ...items,
      {
        id: cryptoId(),
        month: Math.min(loanTermMonths, 60),
        amount: 25000,
        recast: false,
      },
    ])

  return (
    <div className="mt-4 rounded-md border border-border bg-card/40 p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Coins className="h-3 w-3 text-chart-4" style={{ color: 'var(--color-chart-4)' }} />
          <Label className="text-[10px]">Lump-sum payments</Label>
        </div>
        <Button variant="secondary" size="sm" onClick={add}>
          <Plus className="h-3 w-3" /> Add lump sum
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="px-1 py-2 text-[11px] text-muted-foreground">
          No extra principal payments scheduled.
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((it, i) => (
            <div
              key={it.id}
              className="grid grid-cols-12 items-end gap-2 rounded-md border border-border/60 bg-input/40 p-2"
            >
              <div className="col-span-3">
                <NumberField
                  label={`#${i + 1} Month`}
                  value={it.month}
                  onChange={(v) => update(it.id, { month: Math.max(1, Math.round(v)) })}
                  min={1}
                  max={loanTermMonths}
                  hint={`yr ${(it.month / 12).toFixed(1)}`}
                />
              </div>
              <div className="col-span-4">
                <NumberField
                  label="Amount"
                  value={it.amount}
                  onChange={(v) => update(it.id, { amount: Math.max(0, v) })}
                  step={500}
                  min={0}
                  prefix="$"
                />
              </div>
              <div className="col-span-4 flex items-end gap-2 pb-0.5">
                <div className="flex flex-col gap-1">
                  <Label className="flex items-center gap-1">
                    <Repeat2 className="h-2.5 w-2.5" /> Recast
                  </Label>
                  <Switch
                    checked={it.recast}
                    onCheckedChange={(v) => update(it.id, { recast: v })}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {it.recast
                    ? 'Lender re-amortizes new balance over remaining term — lowers monthly P&I.'
                    : 'Pure principal reduction — keeps monthly payment, shortens loan.'}
                </span>
              </div>
              <div className="col-span-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(it.id)}
                  title="Remove"
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RefinanceEditor({
  currentRate,
  loanTermMonths,
  items,
  onChange,
}: {
  currentRate: number
  loanTermMonths: number
  items: RefinanceEvent[]
  onChange: (items: RefinanceEvent[]) => void
}) {
  const update = (id: string, patch: Partial<RefinanceEvent>) => {
    onChange(items.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }
  const remove = (id: string) => onChange(items.filter((it) => it.id !== id))
  const add = () =>
    onChange([
      ...items,
      {
        id: cryptoId(),
        month: Math.min(loanTermMonths, 60),
        newRate: Math.max(2, currentRate - 1.5),
        newTermYears: 30,
        closingCosts: 6000,
        rollClosingIntoLoan: true,
      },
    ])

  return (
    <div className="mt-3 rounded-md border border-border bg-card/40 p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <RefreshCcw
            className="h-3 w-3"
            style={{ color: 'var(--color-chart-5)' }}
          />
          <Label className="text-[10px]">Refinance events</Label>
        </div>
        <Button variant="secondary" size="sm" onClick={add}>
          <Plus className="h-3 w-3" /> Add refinance
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="px-1 py-2 text-[11px] text-muted-foreground">
          No refinances. (Recasts on lump sums above are different — they reuse the same rate.)
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((it, i) => (
            <div
              key={it.id}
              className="grid grid-cols-12 items-end gap-2 rounded-md border border-border/60 bg-input/40 p-2"
            >
              <div className="col-span-2">
                <NumberField
                  label={`#${i + 1} Month`}
                  value={it.month}
                  onChange={(v) => update(it.id, { month: Math.max(1, Math.round(v)) })}
                  min={1}
                  max={loanTermMonths * 2}
                  hint={`yr ${(it.month / 12).toFixed(1)}`}
                />
              </div>
              <div className="col-span-2">
                <NumberField
                  label="New rate"
                  value={it.newRate}
                  onChange={(v) => update(it.id, { newRate: v })}
                  step={0.05}
                  min={0}
                  max={20}
                  suffix="%"
                />
              </div>
              <div className="col-span-2">
                <div className="flex flex-col gap-1">
                  <Label>New term</Label>
                  <Select
                    value={String(it.newTermYears)}
                    onValueChange={(v) => update(it.id, { newTermYears: Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 yr</SelectItem>
                      <SelectItem value="15">15 yr</SelectItem>
                      <SelectItem value="20">20 yr</SelectItem>
                      <SelectItem value="25">25 yr</SelectItem>
                      <SelectItem value="30">30 yr</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="col-span-2">
                <NumberField
                  label="Closing"
                  value={it.closingCosts}
                  onChange={(v) => update(it.id, { closingCosts: v })}
                  step={500}
                  min={0}
                  prefix="$"
                />
              </div>
              <div className="col-span-3 flex items-end gap-2 pb-0.5">
                <div className="flex flex-col gap-1">
                  <Label>Roll into loan</Label>
                  <Switch
                    checked={it.rollClosingIntoLoan}
                    onCheckedChange={(v) => update(it.id, { rollClosingIntoLoan: v })}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {it.rollClosingIntoLoan
                    ? 'Closing costs added to balance.'
                    : 'Closing costs paid out of pocket.'}
                </span>
              </div>
              <div className={cn('col-span-1 flex justify-end')}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(it.id)}
                  title="Remove"
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
