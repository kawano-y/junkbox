import type { Order } from './order';

export type InvoiceStatus = 'issued' | 'cancelled';

export interface Invoice {
  id: string;
  orderId: string;
  amount: number; // 税込・円（整数）
  status: InvoiceStatus;
  issuedAt: string;
}

export class InvoiceError extends Error {
  constructor(
    public readonly code: 'INVALID_AMOUNT' | 'EXCEEDS_ORDER_TOTAL',
    message: string,
  ) {
    super(message);
    this.name = 'InvoiceError';
  }
}

type InvoiceTarget = Pick<Order, 'id' | 'totals'>;

export function remainingAmount(order: InvoiceTarget, invoicedTotal: number): number {
  return order.totals.total - invoicedTotal;
}

export function createInvoice(
  order: InvoiceTarget,
  invoicedTotal: number,
  amount: number,
  now: Date,
  id: string,
): Invoice {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new InvoiceError('INVALID_AMOUNT', '請求額は1円以上の整数で指定してください');
  }
  const remaining = remainingAmount(order, invoicedTotal);
  if (amount > remaining) {
    throw new InvoiceError(
      'EXCEEDS_ORDER_TOTAL',
      `請求額が受注金額を超えます（請求可能残額: ${remaining}円）`,
    );
  }
  return { id, orderId: order.id, amount, status: 'issued', issuedAt: now.toISOString() };
}
