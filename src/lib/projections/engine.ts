// ─────────────────────────────────────────────────────────────────────────────
// src/lib/projections/engine.ts
//
// Pure financial projections engine for Wuduh.
// No fetch, no DB, no side effects. Identical output for identical input.
// Runs in the browser (live chart) and on the server (PDF export).
//
// Input:  RawAnswers — the JSONB values stored in the answers table,
//         keyed by cardId. Pass every card answer you have; the engine
//         reads only what it needs and ignores the rest.
//
// Output: ProjectionResult | null
//         null means the minimum required cards (4.6 + 4.3 or 4.7) are
//         not filled in yet. The caller shows an "incomplete" state.
// ─────────────────────────────────────────────────────────────────────────────

// ── Public types ─────────────────────────────────────────────────────────────

/** One month of computed financial data */
export interface MonthlySnapshot {
  month: number          // 1–12
  label: string          // "Month 1" … "Month 12"
  customers: number      // from card 4.6
  revenue: number        // customers × pricePerCustomer  (SAR)
  variableCosts: number  // customers × variablePerCustomer (SAR)
  fixedCosts: number     // sum of applicable fixed costs this month (SAR)
  totalCosts: number     // variableCosts + fixedCosts
  grossProfit: number    // revenue − totalCosts (can be negative)
  cumulativeProfit: number // running sum of grossProfit from month 1
  cashBalance: number    // initialCash + cumulativeProfit (if runway provided)
}

/** The complete result object returned by runProjections() */
export interface ProjectionResult {
  // Month-by-month detail
  months: MonthlySnapshot[]

  // Headline metrics (investor-facing)
  mrrMonth12: number           // Monthly recurring revenue at month 12 (SAR)
  totalRevenueYear1: number    // Sum of all monthly revenues (SAR)
  totalCostsYear1: number      // Sum of all monthly costs (SAR)
  grossMarginPct: number       // (totalRevenue − totalVariableCosts) / totalRevenue × 100
  breakevenMonth: number | null // First month cumulativeProfit ≥ 0, or null if not reached

  // Runway (null if 4.9 not provided)
  initialCash: number | null
  runwayMonths: number | null  // How many months of runway at month-1 burn rate
  cashRunsOutMonth: number | null // Month where cashBalance first goes negative

  // Sanity flags — shown as callouts in the chart, not errors
  flags: ProjectionFlag[]

  // Metadata
  pricePerCustomer: number     // extracted from card 4.3 (SAR)
  variablePerCustomer: number  // from card 4.8 (SAR), default 0
  dataCompleteness: 'full' | 'partial' // partial = some optional cards missing
}

export interface ProjectionFlag {
  type: 'revenue_exceeds_som' | 'ramp_gtm_mismatch' | 'no_breakeven' | 'approximate_price'
  severity: 'info' | 'warning'
  messageEn: string
  messageAr: string
}

// ── Raw input shape ───────────────────────────────────────────────────────────

/** Shape of card 4.6 answer rows (customer ramp table) */
interface RampRow {
  month: string        // "Month 1" … "Month 12"
  customers: number | string
  revenue_sar?: number | string  // may be auto-calculated or manually entered
}

/** Shape of card 4.7 answer rows (fixed costs table) */
interface CostRow {
  cost_item: string
  monthly_sar: number | string
  starts_month?: number | string  // default 1
}

/**
 * All card answers keyed by cardId.
 * Values are whatever is stored in the JSONB `answer` column —
 * string for text cards, RampRow[] / CostRow[] for table cards.
 */
export type RawAnswers = Record<string, unknown>

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Safely coerce a value to a non-negative number; returns fallback on failure */
function toNum(val: unknown, fallback = 0): number {
  if (val === null || val === undefined || val === '') return fallback
  const n = typeof val === 'number' ? val : parseFloat(String(val).replace(/[,،\s]/g, ''))
  return isFinite(n) && n >= 0 ? n : fallback
}

/**
 * Extract the first SAR number from a free-text answer.
 * Handles formats like "SAR 149/month", "SAR 120,000", "149 ريال", "3.35"
 * Preserves comma-separated thousands (120,000 → 120000).
 */
function extractSarNumber(text: unknown): number | null {
  if (!text || typeof text !== 'string') return null
  // Strip currency labels but keep digits, commas, dots
  const cleaned = text.replace(/SAR|ريال|ر\.س/gi, ' ')
  // Match a number that may use commas as thousands separators
  const match = cleaned.match(/[\d,،]+(\.\d+)?/)
  if (!match) return null
  // Strip thousands separators, then parse
  const numStr = match[0].replace(/[,،]/g, '')
  const n = parseFloat(numStr)
  return isFinite(n) && n > 0 ? n : null
}

/**
 * Parse the customer ramp table (card 4.6).
 * Returns an array of 12 numbers (one per month), filling gaps with 0.
 */
function parseRamp(raw: unknown): number[] {
  const result = new Array<number>(12).fill(0)
  if (!Array.isArray(raw)) return result

  for (const row of raw as RampRow[]) {
    // Month label → 0-based index  ("Month 3" → 2)
    const monthStr = String(row.month ?? '').replace(/[^\d]/g, '')
    const idx = parseInt(monthStr, 10) - 1
    if (idx < 0 || idx > 11) continue
    result[idx] = toNum(row.customers, 0)
  }
  return result
}

/**
 * Parse the fixed costs table (card 4.7).
 * Returns an array of 12 numbers — total fixed cost for each month,
 * accounting for costs that start later (starts_month field).
 */
function parseFixedCosts(raw: unknown): number[] {
  const result = new Array<number>(12).fill(0)
  if (!Array.isArray(raw)) return result

  for (const row of raw as CostRow[]) {
    const monthly = toNum(row.monthly_sar, 0)
    if (monthly <= 0) continue
    const startsMonth = toNum(row.starts_month, 1)
    const startIdx = Math.max(0, Math.min(11, Math.round(startsMonth) - 1))
    for (let i = startIdx; i < 12; i++) {
      result[i] += monthly
    }
  }
  return result
}

/**
 * Parse card 6.4 (year-1 acquisition plan) for a rough customer target.
 * Looks for the highest customer count mentioned alongside customer-related words.
 * Used for GTM mismatch flag only — not for the chart math.
 */
function parseGtmTarget(text: unknown): number | null {
  if (!text || typeof text !== 'string') return null
  const nums = [...text.matchAll(/\b(\d{1,4})\s*(paying|customers?|clients?|عميل|عملاء|مشترك)/gi)]
    .map(m => parseInt(m[1], 10))
    .filter(n => n > 0 && n < 10000)
  return nums.length > 0 ? Math.max(...nums) : null
}

/**
 * Parse card 3.2 (TAM/SAM/SOM) for the SOM in SAR.
 * Handles "SOM: SAR 8.6M", "SOM: SAR 8,600,000", etc.
 */
function parseSom(text: unknown): number | null {
  if (!text || typeof text !== 'string') return null
  const match = text.match(/SOM[^:]*:?\s*(?:SAR\s*)?([\d,،.]+)\s*(M|K|B|million|thousand|billion)?/i)
  if (!match) return null
  let val = parseFloat(match[1].replace(/[,،]/g, ''))
  if (!isFinite(val)) return null
  const unit = (match[2] ?? '').toLowerCase()
  if (unit === 'm' || unit === 'million') val *= 1_000_000
  else if (unit === 'k' || unit === 'thousand') val *= 1_000
  else if (unit === 'b' || unit === 'billion') val *= 1_000_000_000
  return val > 0 ? val : null
}

// ── Main engine function ──────────────────────────────────────────────────────

/**
 * Run the financial projections engine.
 *
 * @param answers  All card answers for the study, keyed by cardId.
 * @returns        ProjectionResult, or null if minimum required data is missing.
 *
 * Minimum required:
 *   - Card 4.6 must have at least one month with customers > 0
 *   - Card 4.3 must contain a parseable SAR price (for revenue calculation)
 *     OR card 4.7 must exist (costs-only mode still shows cost line, revenue = 0)
 */
export function runProjections(answers: RawAnswers): ProjectionResult | null {

  // ── 1. Extract raw inputs ─────────────────────────────────────────────────

  const rampRaw    = answers['4.6']
  const costsRaw   = answers['4.7']
  const price43    = extractSarNumber(answers['4.3'])
  const variable48 = toNum(extractSarNumber(answers['4.8']), 0)
  const runway49   = extractSarNumber(answers['4.9'])
  const som32      = parseSom(answers['3.2'])
  const gtm64      = parseGtmTarget(answers['6.4'])

  const ramp       = parseRamp(rampRaw)
  const fixedCosts = parseFixedCosts(costsRaw)

  // Guard: need at least one non-zero month in the customer ramp
  const hasRamp = ramp.some(c => c > 0)
  if (!hasRamp) return null

  // Price: use 4.3 if extractable, else 0 (costs-only, flagged as approximate)
  const pricePerCustomer   = price43 ?? 0
  const priceIsApproximate = price43 === null

  // ── 2. Build month-by-month snapshots ────────────────────────────────────

  const months: MonthlySnapshot[] = []
  let cumulativeProfit = 0

  for (let i = 0; i < 12; i++) {
    const month       = i + 1
    const customers   = ramp[i]
    const revenue     = customers * pricePerCustomer
    const varCosts    = customers * variable48
    const fixCosts    = fixedCosts[i]
    const totalCosts  = varCosts + fixCosts
    const grossProfit = revenue - totalCosts
    cumulativeProfit += grossProfit

    const cashBalance = runway49 !== null
      ? runway49 + cumulativeProfit
      : cumulativeProfit

    months.push({
      month,
      label: `Month ${month}`,
      customers,
      revenue,
      variableCosts: varCosts,
      fixedCosts: fixCosts,
      totalCosts,
      grossProfit,
      cumulativeProfit,
      cashBalance,
    })
  }

  // ── 3. Headline metrics ───────────────────────────────────────────────────

  const totalRevenueYear1  = months.reduce((s, m) => s + m.revenue, 0)
  const totalCostsYear1    = months.reduce((s, m) => s + m.totalCosts, 0)
  const totalVarCostsYear1 = months.reduce((s, m) => s + m.variableCosts, 0)
  const mrrMonth12         = months[11].revenue

  const grossMarginPct = totalRevenueYear1 > 0
    ? Math.round(((totalRevenueYear1 - totalVarCostsYear1) / totalRevenueYear1) * 100 * 10) / 10
    : 0

  const breakevenMonth = months.find(m => m.cumulativeProfit >= 0)?.month ?? null

  // ── 4. Runway ─────────────────────────────────────────────────────────────

  let runwayMonths: number | null       = null
  let cashRunsOutMonth: number | null   = null

  if (runway49 !== null) {
    // Burn rate = month-1 total costs (conservative baseline)
    const month1Burn = months[0].totalCosts
    runwayMonths = month1Burn > 0 ? Math.floor(runway49 / month1Burn) : null

    // First month where cumulative cash balance goes negative
    const drainMonth = months.find(m => m.cashBalance < 0)
    cashRunsOutMonth = drainMonth?.month ?? null
  }

  // ── 5. Sanity flags ───────────────────────────────────────────────────────

  const flags: ProjectionFlag[] = []

  if (priceIsApproximate) {
    flags.push({
      type: 'approximate_price',
      severity: 'warning',
      messageEn: 'Revenue shows as SAR 0 because no price was found in card 4.3. Add your price per customer to see the revenue line.',
      messageAr: 'تظهر الإيرادات كـ 0 ريال لأنه لم يُعثر على سعر في البطاقة 4.3. أضف سعرك لكل عميل لرؤية خط الإيرادات.',
    })
  }

  if (som32 !== null && totalRevenueYear1 > som32) {
    flags.push({
      type: 'revenue_exceeds_som',
      severity: 'warning',
      messageEn: `Your projected year-1 revenue (SAR ${Math.round(totalRevenueYear1).toLocaleString()}) exceeds the SOM you stated in card 3.2 (SAR ${Math.round(som32).toLocaleString()}). Review your market size or customer ramp.`,
      messageAr: `إيراداتك المتوقعة في السنة الأولى (${Math.round(totalRevenueYear1).toLocaleString()} ريال) تتجاوز SOM الذي ذكرته في البطاقة 3.2 (${Math.round(som32).toLocaleString()} ريال). راجع حجم السوق أو منحدر العملاء.`,
    })
  }

  if (gtm64 !== null) {
    const month12Customers = months[11].customers
    const ratio = month12Customers / gtm64
    if (ratio < 0.5 || ratio > 2.0) {
      flags.push({
        type: 'ramp_gtm_mismatch',
        severity: 'info',
        messageEn: `Your acquisition plan (card 6.4) mentions ~${gtm64} customers, but your ramp shows ${month12Customers} by month 12. Align these numbers — investors will compare them.`,
        messageAr: `تشير خطة الاستحواذ (البطاقة 6.4) إلى ~${gtm64} عميلاً، لكن جدول المنحدر يُظهر ${month12Customers} بحلول الشهر 12. اجعل هذه الأرقام متوافقة — المستثمرون سيقارنونها.`,
      })
    }
  }

  if (breakevenMonth === null) {
    flags.push({
      type: 'no_breakeven',
      severity: 'info',
      messageEn: 'This ramp and cost structure does not reach breakeven within year 1. That is normal at this stage — be ready to explain your path to profitability.',
      messageAr: 'هذا المنحدر وهيكل التكلفة لا يصل إلى نقطة التعادل خلال السنة الأولى. هذا طبيعي في هذه المرحلة — كن مستعداً لشرح مسارك نحو الربحية.',
    })
  }

  // ── 6. Completeness ───────────────────────────────────────────────────────

  const hasCosts = Array.isArray(costsRaw) &&
    (costsRaw as CostRow[]).some(r => toNum(r.monthly_sar) > 0)

  const dataCompleteness: 'full' | 'partial' =
    hasRamp && price43 !== null && hasCosts ? 'full' : 'partial'

  // ── 7. Return ─────────────────────────────────────────────────────────────

  return {
    months,
    mrrMonth12,
    totalRevenueYear1,
    totalCostsYear1,
    grossMarginPct,
    breakevenMonth,
    initialCash: runway49,
    runwayMonths,
    cashRunsOutMonth,
    flags,
    pricePerCustomer,
    variablePerCustomer: variable48,
    dataCompleteness,
  }
}
