import { describe, it, expect } from 'vitest';
import { calculateQuote, endOfDayJst, Quote, QuoteConversionError } from './quote';
import { convertQuoteToOrder } from './order';

const makeQuote = (overrides: Partial<Quote> = {}): Quote => ({
  id: 'q-1',
  customerName: '株式会社テスト',
  status: 'accepted',
  validUntil: endOfDayJst('2026-10-31'),
  totals: calculateQuote([{ name: '開発', quantity: 1, unitPrice: 100000, taxRate: 10 }]),
  ...overrides,
});

const now = new Date('2026-10-15T10:00:00+09:00');
const newId = () => 'o-1';

describe('convertQuoteToOrder', () => {
  it('承認済み・期限内なら受注になり、見積はorderedになる', () => {
    const { order, quote } = convertQuoteToOrder(makeQuote(), now, newId);
    expect(order.quoteId).toBe('q-1');
    expect(order.totals.total).toBe(110000);
    expect(quote.status).toBe('ordered');
  });

  it.each(['draft', 'sent', 'rejected', 'ordered'] as const)(
    '状態が %s の見積は変換できない',
    (status) => {
      expect(() => convertQuoteToOrder(makeQuote({ status }), now, newId)).toThrowError(
        expect.objectContaining({ code: 'INVALID_STATUS' }),
      );
    },
  );

  it('期限切れは変換できない', () => {
    const expired = makeQuote({ validUntil: endOfDayJst('2026-10-14') });
    expect(() => convertQuoteToOrder(expired, now, newId)).toThrowError(QuoteConversionError);
    expect(() => convertQuoteToOrder(expired, now, newId)).toThrowError(
      expect.objectContaining({ code: 'EXPIRED' }),
    );
  });

  it('期限当日の23:59:59.999までは有効、1ms過ぎると無効', () => {
    const q = makeQuote({ validUntil: endOfDayJst('2026-10-15') });
    const lastMoment = new Date('2026-10-15T23:59:59.999+09:00');
    const justAfter = new Date('2026-10-16T00:00:00.000+09:00');
    expect(() => convertQuoteToOrder(q, lastMoment, newId)).not.toThrow();
    expect(() => convertQuoteToOrder(q, justAfter, newId)).toThrow();
  });

  it('元の見積オブジェクトは書き換えない', () => {
    const original = makeQuote();
    convertQuoteToOrder(original, now, newId);
    expect(original.status).toBe('accepted');
  });
});
