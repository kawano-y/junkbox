import { writeFileSync } from 'node:fs'
import { closeBrowser, renderPdf } from './render'
import { renderInvoiceHtml } from './templates/invoice'

const MAX_ROWS = 14

async function main() {

  const itemCount = 13 // 請求する実態の数
  const html = renderInvoiceHtml({
    invoiceNo: 'INV-2026-0001',
    issueDate: '2026-09-30',
    customerName: '株式会社サンプル',
    items: buildItems(itemCount),
    note: 'お振込手数料は貴社にてご負担ください。',
  })

  writeFileSync('output/invoice/temp/invoice.html', html)
  writeFileSync('output/invoice/pdf/invoice.pdf', await renderPdf(html))
  await closeBrowser()
  console.log('invoice.pdf を出力しました')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

function buildItems(count: number) {
  const n = Math.min(Math.max(count, 0), MAX_ROWS)

  const items = Array.from({ length: n }, (_, i) => ({
    name: `サンプル商品 ${i + 1}`,
    quantity: (i % 5) + 1 as number | '',
    unitPrice: 1000 + i * 150 as number | '',
  }))

  const blanks = Array.from({ length: MAX_ROWS - n }, () => ({
    name: '',
    quantity: '' as number | '',
    unitPrice: '' as number | '',
  }))

  return [...items, ...blanks]
}
