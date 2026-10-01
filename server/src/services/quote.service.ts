import {
  calculateQuote,
  CalcOptions,
  DEFAULT_OPTIONS,
  QuoteLineInput,
  QuoteTotals,
} from '../domain/quote';


import { randomUUID } from 'node:crypto';
import { db, runInTransaction } from '../config/database';
import { Quote } from '../domain/quote';
import { Order, convertQuoteToOrder } from '../domain/order';

export function buildQuote(
  lines: QuoteLineInput[],
  options: CalcOptions = DEFAULT_OPTIONS,
): QuoteTotals {
  return calculateQuote(lines, options);
}
export class NotFoundError extends Error {}

function rowToQuote(row: any): Quote {
  return {
    id: row.id,
    customerName: row.customer_name,
    status: row.status,
    validUntil: new Date(row.valid_until),
    totals: JSON.parse(row.totals_json),
  };
}

export function convertToOrder(quoteId: string): Order {
  return runInTransaction(() => {
    const row = db.prepare('SELECT * FROM quotes WHERE id = ?').get(quoteId) as any;
    if (!row) throw new NotFoundError('見積が見つかりません');

    const { order, quote } = convertQuoteToOrder(rowToQuote(row), new Date(), randomUUID);

    db.prepare(
      `INSERT INTO orders (id, quote_id, customer_name, totals_json, ordered_at)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(order.id, order.quoteId, order.customerName, JSON.stringify(order.totals), order.orderedAt.toISOString());

    db.prepare('UPDATE quotes SET status = ? WHERE id = ?').run(quote.status, quote.id);

    return order;
  });
}
