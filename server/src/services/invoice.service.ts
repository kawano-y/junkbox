import { renderPdf } from '../pdf/render'
import { renderInvoiceHtml } from '../pdf/templates/invoice'
import { randomUUID } from 'node:crypto';
import { db, runInTransaction } from '../config/database';
import { createInvoice, remainingAmount, type Invoice } from '../domain/invoice';
import type { Order } from '../domain/order';

export const MAX_ROWS = 14

type Row = { name: string; quantity: number | ''; unitPrice: number | '' }

export type InvoiceInput = {
  invoiceNo: string
  issueDate: string
  customerName: string
  items: { name: string; quantity: number; unitPrice: number }[]
  note?: string
}

// 足りない行を空行で埋めて常に MAX_ROWS 行にする
export function padItems(items: Row[]): Row[] {
  const blanks: Row[] = Array.from({ length: MAX_ROWS - items.length }, () => ({
    name: '',
    quantity: '',
    unitPrice: '',
  }))
  return [...items, ...blanks]
}

export async function createInvoicePdf(input: InvoiceInput) {
  const html = renderInvoiceHtml({ ...input, items: padItems(input.items) })
  return renderPdf(html)
}

export class OrderNotFoundError extends Error {}

type InvoiceTarget = Pick<Order, 'id' | 'totals'>;

function loadOrder(orderId: string): InvoiceTarget {
  const row = db
    .prepare('SELECT id, totals_json FROM orders WHERE id = ?')
    .get(orderId) as { id: string; totals_json: string } | undefined;
  if (!row) throw new OrderNotFoundError(`受注が見つかりません: ${orderId}`);
  return { id: row.id, totals: JSON.parse(row.totals_json) };
}

function sumInvoiced(orderId: string): number {
  const row = db
    .prepare(`SELECT COALESCE(SUM(amount), 0) AS total
              FROM invoices WHERE order_id = ? AND status = 'issued'`)
    .get(orderId) as { total: number };
  return row.total;
}

export function issueInvoice(orderId: string, amount: number): Invoice {
  // BEGIN IMMEDIATE の中で「取得→チェック→INSERT」まで行う
  return runInTransaction(() => {
    const order = loadOrder(orderId);
    const invoice = createInvoice(order, sumInvoiced(orderId), amount, new Date(), randomUUID());

    db.prepare(
      `INSERT INTO invoices (id, order_id, amount, status, issued_at)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(invoice.id, invoice.orderId, invoice.amount, invoice.status, invoice.issuedAt);

    return invoice;
  });
}

export function listInvoices(orderId: string) {
  const order = loadOrder(orderId);
  const invoices = db
    .prepare('SELECT id, order_id AS orderId, amount, status, issued_at AS issuedAt FROM invoices WHERE order_id = ? ORDER BY issued_at')
    .all(orderId) as Invoice[];
  const invoicedTotal = sumInvoiced(orderId);
  return {
    invoices,
    orderTotal: order.totals.total,
    invoicedTotal,
    remaining: remainingAmount(order, invoicedTotal),
  };
}
