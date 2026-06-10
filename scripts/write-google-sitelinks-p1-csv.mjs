#!/usr/bin/env node
/**
 * Schreibt public/ + Desktop-Copy der P1-Sitelinks-CSV (ohne Leerzeilen).
 * Aufruf: node scripts/write-google-sitelinks-p1-csv.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

// Inhalt = exportGoogleSitelinksP1BulkCsvDe() – hier ohne TS-Import (Node ohne Vite)
const campaign = 'Campaign #1'
const rows = [
  ['Demo-Galerie ansehen', 'https://k2-galerie.vercel.app/projects/k2-galerie/galerie-oeffentlich?k=p1-google-2026q2&utm_source=google&utm_medium=cpc&utm_campaign=p1-google-2026q2', 'Musterwerke live im Browser', 'Ohne Anmeldung sofort'],
  ['4 Wochen gratis testen', 'https://k2-galerie.vercel.app/projects/k2-galerie/lizenz-kaufen?k=p1-google-2026q2&utm_source=google&utm_medium=cpc&utm_campaign=p1-google-2026q2', 'K2 Galerie ausprobieren', 'Danach Basic oder Pro'],
  ['Preise & Lizenzen', 'https://k2-galerie.vercel.app/projects/k2-galerie/licences?k=p1-google-2026q2&utm_source=google&utm_medium=cpc&utm_campaign=p1-google-2026q2', 'Ab 10 Euro pro Monat', 'Pro mit Kassa & Marketing'],
  ['Benutzerhandbuch', 'https://k2-galerie.vercel.app/benutzer-handbuch?k=p1-google-2026q2&utm_source=google&utm_medium=cpc&utm_campaign=p1-google-2026q2', 'Schritt für Schritt erklärt', 'Für Künstler:innen & Galerien'],
  ['Galerie-Vorschau', 'https://k2-galerie.vercel.app/projects/k2-galerie/galerie-oeffentlich-vorschau?k=p1-google-2026q2&utm_source=google&utm_medium=cpc&utm_campaign=p1-google-2026q2', 'So sieht Besucher:innen aus', 'Design & Werke im Überblick'],
  ['AGB & Rechtliches', 'https://k2-galerie.vercel.app/agb?k=p1-google-2026q2&utm_source=google&utm_medium=cpc&utm_campaign=p1-google-2026q2', 'Transparent und fair', 'kgm solution - K2 Galerie'],
]

const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
const lines = ['Kampagne,Linktext,Finale URL,Textzeile 1,Textzeile 2']
for (const r of rows) {
  lines.push([campaign, ...r].map(esc).join(','))
}
const csv = `\uFEFF${lines.join('\r\n')}\r\n`

const targets = [
  path.join(root, 'public/texte-schreibtisch/k2-agentur-sitelinks-p1-google.csv'),
  path.join(process.env.HOME || '', 'Desktop/k2-agentur-sitelinks-p1-google.csv'),
]

for (const t of targets) {
  if (!t.includes('Desktop') || fs.existsSync(path.dirname(t))) {
    fs.writeFileSync(t, csv, 'utf8')
    console.log('OK', t)
  }
}
