#!/usr/bin/env node
/**
 * Schreibt public/ + Desktop-Copy der P3-Sitelinks-CSV (ohne Leerzeilen).
 * Aufruf: node scripts/write-google-sitelinks-p3-csv.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const campaign = 'P3 K2 Familie'
const q =
  'k=p3-google-2026q2&utm_source=google&utm_medium=cpc&utm_campaign=p3-google-2026q2'
const base = 'https://k2-galerie.vercel.app'

const rows = [
  [
    'Musterfamilie ansehen',
    `${base}/projects/k2-familie/meine-familie?t=huber&${q}`,
    'Demo Huber ohne Anmeldung',
    'Fotos, Chronik, Stammbaum',
  ],
  [
    'Familien-Lizenz',
    `${base}/projects/k2-familie/lizenz-erwerben?${q}`,
    'Eigene Familie starten',
    'Transparente Konditionen',
  ],
  [
    'Stammbaum Demo',
    `${base}/projects/k2-familie/stammbaum?t=huber&${q}`,
    'Beziehungen aus Karten',
    'Musterfamilie Huber live',
  ],
  [
    'K2 Familie Handbuch',
    `${base}/k2-familie-handbuch?${q}`,
    'Schritt für Schritt erklärt',
    'Für Familien in DACH',
  ],
  [
    'Präsentation ansehen',
    `${base}/projects/k2-familie/praesentationsmappe-kunde?${q}`,
    'So funktioniert K2 Familie',
    'Überblick zum Zeigen',
  ],
  [
    'AGB & Rechtliches',
    `${base}/agb?${q}`,
    'Transparent und fair',
    'kgm solution · K2 Familie',
  ],
]

const esc = (v) => `"${String(v).replace(/"/g, '""')}"`
const lines = ['Kampagne,Linktext,Finale URL,Textzeile 1,Textzeile 2']
for (const r of rows) {
  lines.push([campaign, ...r].map(esc).join(','))
}
const csv = `\uFEFF${lines.join('\r\n')}\r\n`

const targets = [
  path.join(root, 'public/texte-schreibtisch/k2-agentur-sitelinks-p3-google.csv'),
  path.join(process.env.HOME || '', 'Desktop/k2-agentur-sitelinks-p3-google.csv'),
]

for (const t of targets) {
  if (!t.includes('Desktop') || fs.existsSync(path.dirname(t))) {
    fs.writeFileSync(t, csv, 'utf8')
    console.log('OK', t)
  }
}
