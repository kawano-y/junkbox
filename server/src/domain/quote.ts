import { RoundingMode, roundYen } from './money';

// ---- 見積の実体（状態・有効期限） ----

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'ordered';

export interface Quote {
  id: string;
  customerName: string;
  status: QuoteStatus;
  validUntil: Date; // この時刻を過ぎたら期限切れ
  totals: QuoteTotals; // 作成時点の計算結果を保持
}


/** 税率（%）。標準10%、軽減8%。 */
export type TaxRate = 10 | 8;

export interface QuoteLineInput {
  name: string;
  quantity: number;
  unitPrice: number; // 税抜単価（円）
  taxRate: TaxRate;
}

export interface QuoteLine extends QuoteLineInput {
  amount: number; // 行金額（税抜・整数円）
}

export interface TaxSummary {
  taxRate: TaxRate;
  subtotal: number; // 税抜小計
  tax: number; // 消費税額
}

export interface QuoteTotals {
  lines: QuoteLine[];
  taxSummaries: TaxSummary[];
  subtotal: number; // 税抜合計
  tax: number; // 消費税合計
  total: number; // 税込合計
}

export interface CalcOptions {
  lineRounding: RoundingMode; // 行金額の端数処理
  taxRounding: RoundingMode; // 消費税の端数処理
}

export const DEFAULT_OPTIONS: CalcOptions = {
  lineRounding: 'floor',
  taxRounding: 'floor',
};

export function validateLine(line: QuoteLineInput): void {
  if (!line.name?.trim()) throw new Error('品名は必須です');
  if (!(line.quantity > 0)) throw new Error('数量は0より大きい値にしてください');
  if (!(line.unitPrice >= 0)) throw new Error('単価は0以上にしてください');
  if (line.taxRate !== 10 && line.taxRate !== 8) {
    throw new Error('税率は10か8を指定してください');
  }
}

export function calculateQuote(
  inputs: QuoteLineInput[],
  options: CalcOptions = DEFAULT_OPTIONS,
): QuoteTotals {
  if (inputs.length === 0) throw new Error('明細が1行もありません');

  // 1. 行金額
  const lines: QuoteLine[] = inputs.map((input) => {
    validateLine(input);
    return {
      ...input,
      amount: roundYen(input.quantity * input.unitPrice, options.lineRounding),
    };
  });

  // 2. 税率ごとに小計 → 3. 税額は税率ごとに1回だけ端数処理
  const byRate = new Map<TaxRate, number>();
  for (const line of lines) {
    byRate.set(line.taxRate, (byRate.get(line.taxRate) ?? 0) + line.amount);
  }

  const taxSummaries: TaxSummary[] = [...byRate.entries()]
    .sort(([a], [b]) => b - a)
    .map(([taxRate, subtotal]) => ({
      taxRate,
      subtotal,
      tax: roundYen((subtotal * taxRate) / 100, options.taxRounding),
    }));

  // 4. 合計
  const subtotal = taxSummaries.reduce((sum, s) => sum + s.subtotal, 0);
  const tax = taxSummaries.reduce((sum, s) => sum + s.tax, 0);

  return { lines, taxSummaries, subtotal, tax, total: subtotal + tax };
}


/** 期限切れか。validUntil ちょうどはまだ有効。 */
export function isExpired(quote: Pick<Quote, 'validUntil'>, now: Date): boolean {
  return now.getTime() > quote.validUntil.getTime();
}

/** 日付（YYYY-MM-DD）の日本時間23:59:59.999を有効期限にする */
export function endOfDayJst(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999+09:00`);
}

export type ConversionErrorCode = 'INVALID_STATUS' | 'EXPIRED';

export class QuoteConversionError extends Error {
  constructor(
    public readonly code: ConversionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'QuoteConversionError';
  }
}

export function assertConvertible(quote: Quote, now: Date): void {
  if (quote.status !== 'accepted') {
    throw new QuoteConversionError(
      'INVALID_STATUS',
      `状態が「${quote.status}」の見積は受注に変換できません（承認済みのみ可）`,
    );
  }
  if (isExpired(quote, now)) {
    throw new QuoteConversionError('EXPIRED', '見積の有効期限が切れています');
  }
}
