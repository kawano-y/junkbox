import { describe, test, expect } from 'vitest';
import { calculateQuote } from './quote';

test('税は税率ごとに1回だけ端数処理する', () => {
  // 各行の税を行ごとに切り捨てると 1円×3行=3円だが、
  // 合計 33円 × 10% = 3.3円 → 3円 になる。差が出るケースは下で確認
  const r = calculateQuote([
    { name: 'A', quantity: 1, unitPrice: 15, taxRate: 10 },
    { name: 'B', quantity: 1, unitPrice: 15, taxRate: 10 },
    { name: 'C', quantity: 1, unitPrice: 15, taxRate: 10 },
  ]);
  // 行ごと切り捨て: 1+1+1=3円 / 税率ごと1回: 45×10%=4.5→4円
  expect(r.tax).toBe(4);
});

test('標準税率と軽減税率が混在しても税率ごとに集計される', () => {
  const r = calculateQuote([
    { name: 'A', quantity: 1, unitPrice: 1000, taxRate: 10 },
    { name: 'B', quantity: 1, unitPrice: 1000, taxRate: 8 },
  ]);
  expect(r.taxSummaries).toHaveLength(2);
  expect(r.total).toBe(2180);
});
