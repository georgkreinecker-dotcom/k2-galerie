import { chromium } from 'playwright'

const BASE_URL = 'http://127.0.0.1:5177'
const FLYER_PATH = '/projects/k2-galerie/flyer-event-bogen-neu'
const TARGET_WORK_NUMBER = 'k2-M-0001'
const LEFT_WORK_KEY = 'k2-flyer-event-bogen-left-work'
const RIGHT_WORK_KEY = 'k2-flyer-event-bogen-right-work'
const USB_DIR = '/Volumes/INTENSO/K2-Galerie-Druckerei-2026-03-27'

const EXPORTS = [
  {
    fileName: 'Flyer-A4-2xA5-variant2.pdf',
    url: `${BASE_URL}${FLYER_PATH}?layout=variant2`,
    pdf: { format: 'A4', printBackground: true, preferCSSPageSize: true },
  },
  {
    fileName: 'Plakat-A3-hochkant.pdf',
    url: `${BASE_URL}${FLYER_PATH}?mode=a3&layout=variant2`,
    pdf: { format: 'A3', printBackground: true, preferCSSPageSize: true },
  },
  {
    fileName: 'Flyer-A6-quer-seite1-2.pdf',
    url: `${BASE_URL}${FLYER_PATH}?mode=a6&layout=variant2`,
    pdf: { width: '148mm', height: '105mm', printBackground: true, preferCSSPageSize: true },
  },
  {
    fileName: 'Visitenkarte-55x85-seite1-2.pdf',
    url: `${BASE_URL}${FLYER_PATH}?mode=card&layout=variant2`,
    pdf: { width: '55mm', height: '85mm', printBackground: true, preferCSSPageSize: true },
  },
]

function parseArtworks(raw) {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function ensureWorkAndSetStorage(page) {
  await page.goto(`${BASE_URL}${FLYER_PATH}?layout=variant2`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)

  const result = await page.evaluate(
    ({ targetWorkNumber, leftWorkKey, rightWorkKey }) => {
      const artworks = JSON.parse(localStorage.getItem('k2-artworks') || '[]')
      const isArray = Array.isArray(artworks)
      const exactMatch = isArray
        ? artworks.find((item) => String(item?.number || '') === targetWorkNumber)
        : null
      if (!exactMatch) {
        return { ok: false, reason: `Werk ${targetWorkNumber} nicht in localStorage(k2-artworks) gefunden` }
      }
      localStorage.setItem(leftWorkKey, targetWorkNumber)
      localStorage.setItem(rightWorkKey, targetWorkNumber)
      return { ok: true, selected: targetWorkNumber }
    },
    {
      targetWorkNumber: TARGET_WORK_NUMBER,
      leftWorkKey: LEFT_WORK_KEY,
      rightWorkKey: RIGHT_WORK_KEY,
    }
  )

  if (!result?.ok) {
    throw new Error(result?.reason || `Werk ${TARGET_WORK_NUMBER} nicht gefunden`)
  }

  return result.selected
}

async function exportOne(context, entry) {
  const page = await context.newPage()
  try {
    await page.goto(entry.url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(500)
    const outPath = `${USB_DIR}/${entry.fileName}`
    await page.pdf({ path: outPath, ...entry.pdf })
    return outPath
  } finally {
    await page.close()
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  try {
    const seedPage = await context.newPage()
    const selectedWorkNumber = await ensureWorkAndSetStorage(seedPage)
    await seedPage.close()

    const writtenFiles = []
    for (const entry of EXPORTS) {
      const outPath = await exportOne(context, entry)
      writtenFiles.push(outPath)
    }

    console.log(`Gewaehlte Werknummer: ${selectedWorkNumber}`)
    console.log('Zielpfad-Dateiliste auf USB:')
    for (const file of writtenFiles) {
      console.log(`- ${file}`)
    }
  } finally {
    await context.close()
    await browser.close()
  }
}

main().catch((error) => {
  console.error(`FEHLER: ${error?.message || error}`)
  process.exit(1)
})
