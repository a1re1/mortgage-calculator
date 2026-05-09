export interface ExtraPayment {
  id: string
  month: number // 1-indexed month after closing
  amount: number // dollars applied to principal
  recast: boolean // if true, lender recalculates monthly P&I from new balance + remaining term
}

export interface RefinanceEvent {
  id: string
  month: number // month at which refi closes
  newRate: number // new annual interest rate (%)
  newTermYears: number // new amortization term
  closingCosts: number // closing costs in dollars
  rollClosingIntoLoan: boolean // if true, costs are added to loan balance
}

export interface ScenarioInputs {
  id: string
  name: string
  color: string
  visible: boolean

  // home
  homePrice: number
  appreciationPct: number // annual %
  inflationPct: number // annual %, applied to recurring expenses

  // financing
  downPaymentPct: number // % of home price
  loanTermYears: number // 15 / 20 / 30
  interestRate: number // annual %, before points
  points: number // discount points purchased (can be fractional)
  pointCostPct: number // % of loan amount per point (typical 1.0)
  pointReductionPct: number // % rate reduction per point (typical 0.25)
  closingCostsPct: number // % of home price (typical 2-3)
  pmiRate: number // annual % of remaining balance, drops at 78% LTV

  // recurring carrying costs
  propertyTaxRate: number // annual % of home value
  homeInsuranceAnnual: number // dollars
  hoaMonthly: number // dollars
  maintenancePctAnnual: number // annual % of home value

  // extras
  monthlyExtra: number // recurring extra principal per month
  extraPayments: ExtraPayment[]
  refinances: RefinanceEvent[]
}

export interface MonthRow {
  month: number
  year: number
  homeValue: number
  balance: number
  monthlyPI: number
  interestPaid: number
  principalPaid: number
  extraPrincipal: number
  taxes: number
  insurance: number
  pmi: number
  hoa: number
  maintenance: number
  totalMonthly: number
  cumulativeInterest: number
  cumulativePrincipal: number
  cumulativeTaxes: number
  cumulativeInsurance: number
  cumulativePmi: number
  cumulativeHoa: number
  cumulativeMaintenance: number
  cumulativeOutOfPocket: number
  equity: number
  netPosition: number
  ltv: number
  effectiveRate: number
  isRecastMonth: boolean
  isRefiMonth: boolean
  hasLumpSum: boolean
}

export interface ScenarioSummary {
  loanAmount: number
  effectiveStartRate: number
  pointCost: number
  closingCosts: number
  cashToClose: number
  initialMonthlyPI: number
  initialMonthlyTotal: number
  payoffMonth: number
  payoffYear: number
  totalInterest: number
  totalPrincipal: number
  totalTaxes: number
  totalInsurance: number
  totalPmi: number
  totalHoa: number
  totalMaintenance: number
  totalCost: number
  finalHomeValue: number
  finalEquity: number
  finalNetPosition: number
  breakEvenMonth: number | null
}

export interface ScenarioResult {
  inputs: ScenarioInputs
  rows: MonthRow[]
  summary: ScenarioSummary
}

function computePI(principal: number, monthlyRate: number, n: number): number {
  if (n <= 0 || principal <= 0) return 0
  if (monthlyRate === 0) return principal / n
  const factor = Math.pow(1 + monthlyRate, n)
  return (principal * (monthlyRate * factor)) / (factor - 1)
}

export function simulateScenario(s: ScenarioInputs): ScenarioResult {
  const downPayment = s.homePrice * (s.downPaymentPct / 100)
  let loan = s.homePrice - downPayment
  const pointCost = loan * ((s.points * s.pointCostPct) / 100)
  const closingCosts = s.homePrice * (s.closingCostsPct / 100)
  const cashToClose = downPayment + closingCosts + pointCost

  let rate = (s.interestRate - s.points * s.pointReductionPct) / 100
  const startRate = rate
  let monthlyRate = rate / 12
  let remainingMonths = s.loanTermYears * 12
  let monthlyPI = computePI(loan, monthlyRate, remainingMonths)

  const monthlyAppreciation = Math.pow(1 + s.appreciationPct / 100, 1 / 12) - 1
  const monthlyInflation = Math.pow(1 + s.inflationPct / 100, 1 / 12) - 1

  const annualTaxRate = s.propertyTaxRate / 100 // applied to homeValue
  const annualMaintRate = s.maintenancePctAnnual / 100 // applied to homeValue
  const baseMonthlyInsurance = s.homeInsuranceAnnual / 12
  const baseMonthlyHoa = s.hoaMonthly

  const extraByMonth = new Map<number, ExtraPayment[]>()
  for (const ep of s.extraPayments) {
    const arr = extraByMonth.get(ep.month) ?? []
    arr.push(ep)
    extraByMonth.set(ep.month, arr)
  }
  const refiByMonth = new Map<number, RefinanceEvent>()
  for (const re of s.refinances) refiByMonth.set(re.month, re)

  let homeValue = s.homePrice
  let cumI = 0,
    cumP = 0,
    cumT = 0,
    cumIns = 0,
    cumPmi = 0,
    cumHoa = 0,
    cumM = 0
  let cumOOP = downPayment + closingCosts + pointCost

  const rows: MonthRow[] = []
  let breakEvenMonth: number | null = null
  let payoffMonth = remainingMonths
  const maxMonths = s.loanTermYears * 12 + 120

  for (let month = 1; month <= maxMonths; month++) {
    homeValue = homeValue * (1 + monthlyAppreciation)

    let isRefiMonth = false
    const refi = refiByMonth.get(month)
    if (refi) {
      isRefiMonth = true
      if (refi.rollClosingIntoLoan) {
        loan += refi.closingCosts
      } else {
        cumOOP += refi.closingCosts
      }
      rate = refi.newRate / 100
      monthlyRate = rate / 12
      remainingMonths = refi.newTermYears * 12
      monthlyPI = computePI(loan, monthlyRate, remainingMonths)
    }

    const inflFactor = Math.pow(1 + monthlyInflation, month - 1)
    const taxes = (homeValue * annualTaxRate) / 12
    const insurance = baseMonthlyInsurance * inflFactor
    const maintenance = (homeValue * annualMaintRate) / 12
    const hoa = baseMonthlyHoa * inflFactor
    const ltv = homeValue > 0 ? (loan / homeValue) * 100 : 0
    const pmi = ltv > 78 ? (loan * (s.pmiRate / 100)) / 12 : 0

    const interest = loan * monthlyRate
    const scheduledPrincipal = Math.max(0, Math.min(monthlyPI - interest, loan))

    const remainingAfterScheduled = loan - scheduledPrincipal
    let extraPrincipal = Math.min(s.monthlyExtra, remainingAfterScheduled)
    let hasLumpSum = false
    let recastTriggered = false
    const extras = extraByMonth.get(month) ?? []
    for (const ep of extras) {
      const cap = remainingAfterScheduled - extraPrincipal
      const apply = Math.min(ep.amount, Math.max(0, cap))
      if (apply > 0) {
        extraPrincipal += apply
        hasLumpSum = true
      }
      if (ep.recast) recastTriggered = true
    }

    loan = Math.max(0, loan - scheduledPrincipal - extraPrincipal)

    cumI += interest
    cumP += scheduledPrincipal + extraPrincipal
    cumT += taxes
    cumIns += insurance
    cumPmi += pmi
    cumHoa += hoa
    cumM += maintenance

    const totalMonthly =
      scheduledPrincipal + interest + extraPrincipal + taxes + insurance + pmi + hoa + maintenance
    cumOOP += totalMonthly

    const equity = homeValue - loan
    const netPosition = equity - cumOOP

    if (breakEvenMonth === null && netPosition > 0) breakEvenMonth = month

    rows.push({
      month,
      year: month / 12,
      homeValue,
      balance: loan,
      monthlyPI,
      interestPaid: interest,
      principalPaid: scheduledPrincipal,
      extraPrincipal,
      taxes,
      insurance,
      pmi,
      hoa,
      maintenance,
      totalMonthly,
      cumulativeInterest: cumI,
      cumulativePrincipal: cumP,
      cumulativeTaxes: cumT,
      cumulativeInsurance: cumIns,
      cumulativePmi: cumPmi,
      cumulativeHoa: cumHoa,
      cumulativeMaintenance: cumM,
      cumulativeOutOfPocket: cumOOP,
      equity,
      netPosition,
      ltv,
      effectiveRate: rate * 100,
      isRecastMonth: recastTriggered,
      isRefiMonth,
      hasLumpSum,
    })

    remainingMonths -= 1

    if (recastTriggered && loan > 0.01 && remainingMonths > 0) {
      monthlyPI = computePI(loan, monthlyRate, remainingMonths)
    }

    if (loan <= 0.01) {
      payoffMonth = month
      break
    }
  }

  const last = rows[rows.length - 1]

  return {
    inputs: s,
    rows,
    summary: {
      loanAmount: s.homePrice - downPayment,
      effectiveStartRate: startRate * 100,
      pointCost,
      closingCosts,
      cashToClose,
      initialMonthlyPI: rows[0]?.monthlyPI ?? 0,
      initialMonthlyTotal: rows[0]?.totalMonthly ?? 0,
      payoffMonth,
      payoffYear: payoffMonth / 12,
      totalInterest: cumI,
      totalPrincipal: cumP,
      totalTaxes: cumT,
      totalInsurance: cumIns,
      totalPmi: cumPmi,
      totalHoa: cumHoa,
      totalMaintenance: cumM,
      totalCost: cumOOP,
      finalHomeValue: last?.homeValue ?? s.homePrice,
      finalEquity: last?.equity ?? 0,
      finalNetPosition: last?.netPosition ?? 0,
      breakEvenMonth,
    },
  }
}

export function defaultScenario(
  overrides: Partial<ScenarioInputs> = {},
): ScenarioInputs {
  return {
    id: cryptoId(),
    name: 'Baseline',
    color: 'var(--color-chart-1)',
    visible: true,
    homePrice: 500000,
    appreciationPct: 3.5,
    inflationPct: 2.5,
    downPaymentPct: 20,
    loanTermYears: 30,
    interestRate: 7.0,
    points: 0,
    pointCostPct: 1.0,
    pointReductionPct: 0.25,
    closingCostsPct: 3.0,
    pmiRate: 0.5,
    propertyTaxRate: 1.2,
    homeInsuranceAnnual: 1800,
    hoaMonthly: 0,
    maintenancePctAnnual: 1.0,
    monthlyExtra: 0,
    extraPayments: [],
    refinances: [],
    ...overrides,
  }
}

export function cryptoId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export function findRowAtYear(rows: MonthRow[], year: number): MonthRow | undefined {
  const target = Math.round(year * 12)
  return rows.find((r) => r.month === target) ?? rows[rows.length - 1]
}
