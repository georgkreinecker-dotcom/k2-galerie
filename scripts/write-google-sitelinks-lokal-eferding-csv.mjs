#!/usr/bin/env node
/**
 * Schreibt public/ + Desktop-Copy der Lokal-Eferding-Sitelinks-CSV.
 * Aufruf: node scripts/write-google-sitelinks-lokal-eferding-csv.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const campaign = 'Lokal K2 Galerie Eferding'
const q =
  'k=eferding-google-2026q2&utm_source=google&utm_medium=cpc&utm_campaign=eferding-google-2026q2'
const base = 'https://k2-galerie.vercel.app'

const rows = [
  ['Samstag geöffnet', `${base}/galerie?${q}`, 'Jeden Samstag vor Ort', 'Malerei & Keramik'],
  ['Werke online', `${base}/galerie?${q}`, 'Homepage Galerie K2', 'Bilder vor dem Besuch'],
  [
    'Gruppenbesuch',
    `${base}/texte-schreibtisch/einladung-gruppen-serviceclubs-k2-galerie.html?${q}`,
    'Für Verein & Club',
    'Termin nach Vereinbarung',
  ],
  ['Termin anfragen', `${base}/galerie?${q}`, 'Telefonisch vereinbaren', 'Auch außerhalb Samstag'],
  [
    'Virtueller Rundgang',
    `${base}/projects/k2-galerie/virtueller-rundgang?${q}`,
    'Rundgang in der Galerie',
    'Vorab online ansehen',
  ],
  ['Kontakt & Anfahrt', `${base}/galerie?${q}`, '4070 Eferding', 'Schlossergasse 4'],
]

const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
const lines = ['Kampagne,Linktext,Finale URL,Textzeile 1,Textzeile 2']
for (const r of rows) {
  lines.push([campaign, ...r].map(esc).join(','))
}
const csv = `\uFEFF${lines.join('\r\n')}\r\n`

const targets = [
  path.join(root, 'public/texte-schreibtisch/k2-agentur-sitelinks-lokal-eferding-google.csv'),
  path.join(process.env.HOME || '', 'Desktop/k2-agentur-sitelinks-lokal-eferding-google.csv'),
]

for (const t of targets) {
  if (!t.includes('Desktop') || fs.existsSync(path.dirname(t))) {
    fs.writeFileSync(t, csv, 'utf8')
    console.log('OK', t)
  }
}
