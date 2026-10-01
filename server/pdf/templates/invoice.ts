import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const TAX_RATE = 0.1


export type InvoiceItem = {
  name: string
  quantity: number | ''
  unitPrice: number | ''
}

export type InvoiceData = {
  invoiceNo: string
  issueDate: string // 例: '2026-09-30'
  customerName: string
  items: InvoiceItem[]
  taxRate?: number // 既定 0.1
  note?: string
}

const css = readFileSync(join(__dirname, 'invoice.css'), 'utf-8')

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )

const yen = (n: number) => `¥${Math.round(n).toLocaleString('ja-JP')}`
const asNumber = (value: number | '') => (typeof value === 'number' ? value : 0)

const numOrBlank = (n: number | '') =>
  n === '' ? '' : n.toLocaleString('ja-JP')
const yenOrBlank = (n: number | '') => (n === '' ? '' : yen(n))

export function renderInvoiceHtml(data: InvoiceData): string {
  const taxRate = data.taxRate ?? TAX_RATE
  const subtotal = data.items.reduce(
    (sum, i) => sum + asNumber(i.quantity) * asNumber(i.unitPrice),
    0,
  )
  const tax = Math.floor(subtotal * taxRate)
  const blank = (s: string) => (s === '' ? '&nbsp;' : s)

  const rows = data.items
    .map(
      (i) => {
        // 数量か単価のどちらかが空なら、金額も空欄にする
        const lineTotal = i.quantity === '' || i.unitPrice === '' ? '' : i.quantity * i.unitPrice

        return `
      <tr>
        <td>${blank(esc(i.name))}</td>
        <td class="num">${numOrBlank(i.quantity)}</td>
        <td class="num">${yenOrBlank(i.unitPrice)}</td>
        <td class="num">${yenOrBlank(lineTotal)}</td>
      </tr>`
      },
    )
    .join('')

  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <style>${css}</style>
</head>
<body>
  <h1>請求書</h1>
  <div class="meta">
    <div>
      <div class="customer">${esc(data.customerName)} 御中</div>
    </div>
    <div class="meta-right">
      <div>請求番号: ${esc(data.invoiceNo)}</div>
      <div>発行日: ${esc(data.issueDate)}</div>
    </div>
  </div>

  <div class="total-box">
    <span>ご請求金額</span>
    <strong>${yen(subtotal + tax)}</strong>
  </div>

  <table class="items">
    <thead>
      <tr><th>品名</th><th>数量</th><th>単価</th><th>金額</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <table class="summary">
    <tr><th>小計</th><td class="num">${yen(subtotal)}</td></tr>
    <tr><th>消費税(${Math.round(taxRate * 100)}%)</th><td class="num">${yen(tax)}</td></tr>
    <tr class="grand"><th>合計</th><td class="num">${yen(subtotal + tax)}</td></tr>
  </table>

  ${data.note ? `<div class="note">${esc(data.note)}</div>` : ''}
</body>
</html>`
}
