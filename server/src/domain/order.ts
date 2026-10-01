import { Quote, QuoteLine, QuoteTotals, assertConvertible } from './quote';

export interface Order {
  id: string;
  quoteId: string;
  customerName: string;
  lines: QuoteLine[];
  totals: QuoteTotals; // 見積の金額をそのまま引き継ぐ（再計算しない）
  orderedAt: Date;
}

export function convertQuoteToOrder(
  quote: Quote,
  now: Date,
  newId: () => string,
): { order: Order; quote: Quote } {
  assertConvertible(quote, now);

  const order: Order = {
    id: newId(),
    quoteId: quote.id,
    customerName: quote.customerName,
    lines: quote.totals.lines,
    totals: quote.totals,
    orderedAt: now,
  };

  return { order, quote: { ...quote, status: 'ordered' } };
}
