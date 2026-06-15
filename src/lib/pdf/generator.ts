// PDF generator — uses puppeteer-core + @sparticuz/chromium for Vercel compatibility.
// Falls back to local Chrome in development.

import { buildPdfHtml } from './template'
import type { Language } from '@/types/cards'

interface GenerateOptions {
  studyId: string
  startup_name: string | null
  founder_name: string | null
  logo_url: string | null
  language: Language
  completion_percentage: number
  answers: Record<string, { answer: unknown; status: 'done' | 'skipped' }>
}

export async function generatePdf(options: GenerateOptions): Promise<Buffer> {
  const html = buildPdfHtml(options)

  const isDev = process.env.NODE_ENV === 'development'

  let browser

  if (isDev) {
    // Local development — use puppeteer with local Chrome
    const puppeteer = await import('puppeteer-core')
    browser = await puppeteer.default.launch({
      executablePath: getLocalChromePath(),
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
  } else {
    // Production (Vercel) — use @sparticuz/chromium
    const chromium  = await import('@sparticuz/chromium')
    const puppeteer = await import('puppeteer-core')
    browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath: await chromium.default.executablePath(),
      headless: true,
    })
  }

  try {
    const page = await browser.newPage()

    // Set content and wait for fonts to load
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 })

    // Generate PDF — A4, portrait
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
    return [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ].find(p => {
      try { require('fs').accessSync(p); return true } catch { return false }
    }) ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  }
  if (platform === 'darwin') return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  return '/usr/bin/google-chrome'
}
