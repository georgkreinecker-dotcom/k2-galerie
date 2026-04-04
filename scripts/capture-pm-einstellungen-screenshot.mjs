/**
 * Präsentationsmappe: Admin Tab „Einstellungen“ → Stammdaten (ök2 Demo).
 * Voraussetzung: laufender Vite-Dev-Server (Standard port 5177).
 *
 *   BASE_URL=http://127.0.0.1:5177 node scripts/capture-pm-einstellungen-screenshot.mjs
 */
import { chromium } from 'playwright'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')
const OUT = join(REPO_ROOT, 'public/img/oeffentlich/pm-einstellungen-stammdaten.png')
const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:5177').replace(/\/$/, '')

async function main() {
  const u = new URL('/admin', BASE_URL)
  u.searchParams.set('context', 'oeffentlich')
  u.searchParams.set('tab', 'einstellungen')
  u.searchParams.set('settings', 'stammdaten')

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
    await page.getByText('Demo-Modus (ök2)', { exact: false }).waitFor({
      state: 'visible',
      timeout: 60_000,
    })
    const meinWeg = page.getByText('Wofür nutzt du deine Galerie?', { exact: false })
    await meinWeg.waitFor({ state: 'attached', timeout: 60_000 })
    await meinWeg.scrollIntoViewIfNeeded()
    await page.waitForTimeout(500)
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
