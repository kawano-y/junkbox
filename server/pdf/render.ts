import { chromium, type Browser } from 'playwright'

// ブラウザは使い回す(毎回起動すると遅い)
let browser: Browser | null = null

async function getBrowser(): Promise<Browser> {
  browser ??= await chromium.launch()
  return browser
}

export async function renderPdf(html: string): Promise<Buffer> {
  const page = await (await getBrowser()).newPage()
  try {
    await page.setContent(html, { waitUntil: 'networkidle' })
    return await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '15mm', bottom: '20mm', left: '15mm', right: '15mm' },
      // ページ番号(footerTemplate を使うには bottom マージンが必要)
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: `
        <div style="width:100%;font-size:8pt;text-align:center;color:#666;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>`,
    })
  } finally {
    await page.close()
  }
}

export async function closeBrowser(): Promise<void> {
  await browser?.close()
  browser = null
}
