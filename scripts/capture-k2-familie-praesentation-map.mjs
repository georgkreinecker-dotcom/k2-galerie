/**
 * Präsentationsmappe Kunde: Screenshots Musterfamilie Huber → public/img/k2-familie/pm-*.png
 *
 * Voraussetzung: Vite-Dev-Server (Port 5177), z. B. `npx vite --port 5177 --host 127.0.0.1`
 *
 *   BASE_URL=http://127.0.0.1:5177 node scripts/capture-k2-familie-praesentation-map.mjs
 *
 * URLs erhalten automatisch `pm=1` (ohne Impressum-Balken und ohne Huber-Rundgang in den PNGs).
 * Deckblatt-Startseite: zusätzlich `deckblatt=1` (minimale Text-Chrome, siehe useK2FamiliePresentationMode).
 */
import { chromium } from 'playwright'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = join(__dirname, '..')
const OUT_DIR = join(REPO_ROOT, 'public/img/k2-familie')
const BASE_URL = (process.env.BASE_URL || 'http://127.0.0.1:5177').replace(/\/$/, '')
/** Präsentations-/Screenshot-Modus: Layout blendet Impressum-Footer aus (`K2FamilieLayout` → `?pm=1`). */
function withPm1(path) {
  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}pm=1`
}
/** Wie in der App: `pm=1` + `deckblatt=1` für Deckblatt-PNG (Hero-/Nav-Texte reduziert). */
function withPm1Deckblatt(path) {
  const base = withPm1(path)
  return base.includes('deckblatt=') ? base : `${base}&deckblatt=1`
}
const R = (path) => `${BASE_URL}${withPm1(path)}`
const RDeck = (path) => `${BASE_URL}${withPm1Deckblatt(path)}`

/** Wie `readMusterLeitfadenAbgeschlossen` in FamilieMusterHuberLeitfaden.tsx – ohne Rundgang-Modal bei Screenshots. */
const LS_MUSTER_LEITFADEN_FERTIG = 'k2-familie-muster-huber-leitfaden-abgeschlossen'

const shots = [
  {
    file: 'pm-familie-einstieg.png',
    path: '/projects/k2-familie/einstieg?t=huber',
    wait: { state: 'networkidle', timeout: 120_000 },
  },
  {
    file: 'pm-stammbaum.png',
    path: '/projects/k2-familie/stammbaum?t=huber',
    wait: { state: 'networkidle', timeout: 120_000 },
  },
  /** Stammbaum Bereich „Grafik“ – Familiengrafik (Zoom/Orientierung), Musterfamilie Huber */
  {
    file: 'pm-familiengrafik-huber.png',
    path: '/projects/k2-familie/stammbaum?t=huber&bereich=grafik',
    wait: { state: 'networkidle', timeout: 120_000 },
    waitForSelector: '#stufe-grafik',
    postWaitMs: 900,
  },
  {
    file: 'pm-person-beziehungen.png',
    path: '/projects/k2-familie/personen/stefan?t=huber',
    wait: { state: 'networkidle', timeout: 120_000 },
  },
  {
    file: 'pm-rollen.png',
    path: '/projects/k2-familie/einstellungen?t=huber',
    wait: { state: 'networkidle', timeout: 120_000 },
  },
  /** Familien-Events (Geburtstage, Treffen, Feste) – Musterfamilie Huber */
  {
    file: 'pm-events.png',
    path: '/projects/k2-familie/events?t=huber',
    wait: { state: 'networkidle', timeout: 120_000 },
  },
  /** Geschichten – roter Faden aus Events & Momenten */
  {
    file: 'pm-geschichten.png',
    path: '/projects/k2-familie/geschichte?t=huber',
    wait: { state: 'networkidle', timeout: 120_000 },
  },
  {
    file: 'pm-gedenk-oder-momente.png',
    path: '/projects/k2-familie/gedenkort?t=huber',
    wait: { state: 'networkidle', timeout: 120_000 },
  },
]

async function ensureMusterLeitfadenClosed(page) {
  const btn = page.getByRole('button', { name: /^Später$/ })
  try {
    await btn.waitFor({ state: 'visible', timeout: 2500 })
    await btn.click()
    await page.waitForTimeout(400)
  } catch {
    /* kein Modal */
  }
}

async function seedHuberIfOffered(page) {
  await page.goto(R('/projects/k2-familie/meine-familie'), {
    waitUntil: 'domcontentloaded',
    timeout: 120_000,
  })
  const btn = page.getByRole('button', { name: /Musterfamilie laden/ })
  try {
    await btn.waitFor({ state: 'visible', timeout: 12_000 })
    await btn.click()
    await page.waitForTimeout(800)
  } catch {
    /* bereits geladen oder Button fehlt */
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  })
  await context.addInitScript((key) => {
    try {
      localStorage.setItem(key, '1')
    } catch {
      /* ignore */
    }
  }, LS_MUSTER_LEITFADEN_FERTIG)
  const page = await context.newPage()
  try {
    await seedHuberIfOffered(page)
    await ensureMusterLeitfadenClosed(page)
    for (const s of shots) {
      const out = join(OUT_DIR, s.file)
      const url = s.deckblatt ? RDeck(s.path) : R(s.path)
      await page.goto(url, {
        waitUntil: s.wait?.state || 'networkidle',
        timeout: s.wait?.timeout ?? 120_000,
      })
      if (s.waitForSelector) {
        try {
          await page.waitForSelector(s.waitForSelector, { timeout: 45_000 })
        } catch {
          /* Grafik kann bei leerer Demo fehlen – trotzdem Screenshot */
        }
      }
      await page.waitForTimeout(typeof s.postWaitMs === 'number' ? s.postWaitMs : 600)
      await ensureMusterLeitfadenClosed(page)
      await page.waitForFunction(
        () => document.documentElement.getAttribute('data-k2-familie-pm') === '1',
        { timeout: 45_000 },
      )
      await page.waitForFunction(
        () => document.querySelectorAll('.k2-familie-app-footer').length === 0,
        { timeout: 15_000 },
      )
      await page.waitForFunction(
        () =>
          document.querySelectorAll('[aria-labelledby="k2-familie-muster-leitfaden-titel"]').length === 0,
        { timeout: 15_000 },
      )
      await page.screenshot({ path: out, type: 'png', fullPage: false })
      console.log('OK →', out)
    }
  } finally {
    await browser.close()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
