// PDF generator — uses @sparticuz/chromium for Vercel serverless compatibility.
// In development, falls back to local Chrome.

import { buildPdfHtml } from './template'

interface GenerateOptions {
  studyId: string
  startup_name: string | null
  founder_name: string | null
  logo_url: string | null
  language: 'en' | 'ar'
  completion_percentage: number
  answers: Record<string, { answer: unknown; status: 'done' | 'skipped' }>
}

export async function generatePdf(options: GenerateOptions): Promise<Buffer> {
  const html = buildPdfHtml(options)
  const isDev = process.env.NODE_ENV === 'development'

  let browser

  if (isDev) {
    const puppeteer = await import('puppeteer-core')
    browser = await puppeteer.default.launch({
      executablePath: getLocalChromePath(),
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  } else {
    // Production: @sparticuz/chromium bundles Chromium for serverless environments
    const chromium = await import('@sparticuz/chromium')
    const puppeteer = await import('puppeteer-core')

    browser = await puppeteer.default.launch({
      args: [
        ...chromium.default.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
      ],
      defaultViewport: chromium.default.defaultViewport,
      executablePath: await chromium.default.executablePath(),
      headless: chromium.default.headless,
    })
  }

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}

function getLocalChromePath(): string {
  const platform = process.platform
  if (platform === 'win32') {
    const paths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ]
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    return (
      paths.find(p => {
        try { fs.accessSync(p); return true } catch { return false }
      }) ?? paths[0]
    )
  }
  if (platform === 'darwin') return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  return '/usr/bin/google-chrome'
}
