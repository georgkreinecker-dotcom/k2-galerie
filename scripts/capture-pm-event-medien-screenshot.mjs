/**
 * Präsentationsmappe: Admin Tab „Event- und Medienplanung“ → Unterbereich Öffentlichkeitsarbeit (ök2).
 * Voraussetzung: laufender Vite-Dev-Server (Standard port 5177).
 *
 *   BASE_URL=http://127.0.0.1:5177 node scripts/capture-pm-event-medien-screenshot.mjs
 */
import { chromium } from 'playwright'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')
const OUT = join(REPO_ROOT, 'public/img/oeffentlich/pm-event-medienplanung.png')
const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:5177').replace(/\/$/, '')

async function main() {
  const u = new URL('/admin', BASE_URL)
  u.searchParams.set('context', 'oeffentlich')
  u.searchParams.set('tab', 'eventplan')
  u.searchParams.set('eventplan', 'öffentlichkeitsarbeit')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  try {
    await page.goto(u.toString(), {
      waitUntil: 'networkidle',
      timeout: 120_000,
    })
    await page.getByText('Öffentlichkeit mit Schwung', { exact: false }).waitFor({
      state: 'visible',
      timeout: 60_000,
    })
    await page.waitForTimeout(600)
    await page.screenshot({
      path: OUT,
      type: 'png',
      fullPage: false,
    })
    console.log('OK →', OUT)
  } finally {
    await browser.close()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
