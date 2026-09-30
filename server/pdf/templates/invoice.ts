// import { readFileSync } from 'node:fs'
// import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export type InvoiceItem = {
  name: string
  quantity: number
  unitPrice: number
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

export function renderInvoiceHtml(data: InvoiceData): string {
  const taxRate = data.taxRate ?? 0.1
  const subtotal = data.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
  const tax = Math.floor(subtotal * taxRate)

  const rows = data.items
    .map(
      (i) => `
      <tr>
        <td>${esc(i.name)}</td>
        <td class="num">${i.quantity.toLocaleString('ja-JP')}</td>
        <td class="num">${yen(i.unitPrice)}</td>
        <td class="num">${yen(i.quantity * i.unitPrice)}</td>
      </tr>`,
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
