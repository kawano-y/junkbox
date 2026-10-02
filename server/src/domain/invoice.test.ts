import { describe, it, expect } from 'vitest';
import { createInvoice, InvoiceError } from './invoice';

const order = { id: 'o1', status: 'confirmed', totals: { subtotal: 10000, tax: 1000, total: 11000 } } as any;
const now = new Date('2026-10-01T00:00:00Z');

describe('createInvoice', () => {
  it('残額以内なら作成できる', () => {
    expect(createInvoice(order, 0, 11000, now, 'i1').amount).toBe(11000);
  });
  it('分割請求の合計がちょうど受注金額になるのはOK', () => {
    expect(createInvoice(order, 6000, 5000, now, 'i2').amount).toBe(5000);
  });
  it('合計が受注金額を1円でも超えたらエラー', () => {
    expect(() => createInvoice(order, 6000, 5001, now, 'i3'))
      .toThrowError(expect.objectContaining({ code: 'EXCEEDS_ORDER_TOTAL' }));
  });
  it('0円・負数・小数は不可', () => {
    for (const bad of [0, -1, 100.5]) {
      expect(() => createInvoice(order, 0, bad, now, 'x')).toThrow(InvoiceError);
    }
  });
});
