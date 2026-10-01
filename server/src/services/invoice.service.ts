import { renderPdf } from '../pdf/render'
import { renderInvoiceHtml } from '../pdf/templates/invoice'

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
