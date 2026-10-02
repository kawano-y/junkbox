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

const DEFAULT_VALID_DAYS = 30;
export type Rounding = 'floor' | 'ceil' | 'round';

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

export function registerQuote(customerName: string, validUntil: Date | undefined, lines: QuoteLineInput[], lineRounding: Rounding, taxRounding: Rounding): Quote {
  const issuedAt = new Date();
  const until = validUntil ?? addDays(issuedAt, DEFAULT_VALID_DAYS);

  const totals = calculateQuote(lines, { lineRounding, taxRounding });


  db.prepare(
    `INSERT OR IGNORE INTO quotes (id, customer_name, status, valid_until, totals_json)
    VALUES (?, ?, ?, ?, ?)`,
  ).run(randomUUID(), customerName, 'accepted', until.toISOString(), JSON.stringify(totals));

  // Return the created quote
  const row = db.prepare('SELECT * FROM quotes WHERE customer_name = ?').get(customerName) as any;
  return rowToQuote(row);
}

export const addDays = (date: Date, days: number): Date => {
  const d = new Date(date); // 元のDateを書き換えないようコピー
  d.setDate(d.getDate() + days);
  return d;
};
