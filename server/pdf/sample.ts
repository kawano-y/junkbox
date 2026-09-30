import { writeFileSync } from 'node:fs'
import { closeBrowser, renderPdf } from './render'
import { renderInvoiceHtml } from './templates/invoice'

async function main() {
  const html = renderInvoiceHtml({
    invoiceNo: 'INV-2026-0001',
    issueDate: '2026-09-30',
    customerName: '株式会社サンプル',
    items: Array.from({ length: 40 }, (_, i) => ({
      name: `サンプル商品 ${i + 1}`,
      quantity: (i % 5) + 1,
      unitPrice: 1000 + i * 150,
    })),
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
