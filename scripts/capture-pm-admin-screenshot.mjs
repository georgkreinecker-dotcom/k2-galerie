/**
 * Präsentationsmappe: Admin-Hub (ök2) als PNG für Druck/Web.
 * Voraussetzung: laufender Vite-Dev-Server (Standard port 5177).
 *
 *   BASE_URL=http://127.0.0.1:5177 node scripts/capture-pm-admin-screenshot.mjs
 */
import { chromium } from 'playwright'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')
const OUT = join(REPO_ROOT, 'public/img/oeffentlich/pm-admin-uebersicht.png')
const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:5177').replace(/\/$/, '')

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  })
  const page = await context.newPage()
  try {
    await page.goto(`${BASE_URL}/admin?context=oeffentlich`, {
      waitUntil: 'networkidle',
      timeout: 120_000,
    })
    await page.getByRole('heading', { name: 'Was möchtest du heute tun?' }).waitFor({ state: 'visible', timeout: 60_000 })
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
