#!/usr/bin/env node
/**
 * K2-Export extrahieren
 * - Von einer lokalen Datei (z.B. vom Schreibtisch) → speichert als k2-export.json
 * - Von einer Joomla-URL (format=json) → speichert als k2-export.json
 *
 * Verwendung:
 *   node extract.js ~/Desktop/k2-export.json
 *   node extract.js "/Users/georgkreinecker/Desktop/meine-daten.json"
 *   node extract.js "https://deine-seite.de/...?format=json"
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const OUT_FILE = 'k2-export.json';

function resolveInput(arg) {
  if (!arg) return null;
  if (arg.startsWith('http://') || arg.startsWith('https://')) {
    return { type: 'url', value: arg };
  }
  const filePath = arg.replace(/^~/, process.env.HOME || '');
  if (fs.existsSync(filePath)) {
    return { type: 'file', value: path.resolve(filePath) };
  }
  return { type: 'file', value: path.resolve(filePath) };
}

function getInput() {
  const arg = process.argv[2];
  const resolved = resolveInput(arg);
  if (resolved) return resolved;
  if (process.env.K2_URL) return { type: 'url', value: process.env.K2_URL };
  const home = process.env.HOME || '';
  const desktop = path.join(home, 'Desktop', 'k2-export.json');
  if (fs.existsSync(desktop)) return { type: 'file', value: desktop };
  // Standard: Ordner "K2 Galerie" auf dem Schreibtisch (kompletter Code-Export)
  const k2GalerieDir = path.join(home, 'Desktop', 'K2 Galerie');
  if (fs.existsSync(k2GalerieDir)) {
    const names = fs.readdirSync(k2GalerieDir).filter((n) => n.endsWith('.json'));
    const exportFile = names.find((n) => n.includes('KOMPLETTER') || n.includes('CODE') || n.includes('EXPORT')) || names[0];
    if (exportFile) {
      return { type: 'file', value: path.join(k2GalerieDir, exportFile) };
    }
  }
  console.error('Bitte Quelle angeben:');
  console.error('  Lokale Datei:  node extract.js ~/Desktop/k2-export.json');
  console.error('  URL:          node extract.js "https://..."');
  process.exit(1);
}

function fetch(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8');
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ raw: body, parseError: e.message });
        }
      });
    });
    req.on('error', reject);
  });
}

async function main() {
  const input = getInput();
  let data;

  try {
    if (input.type === 'file') {
      console.log('Lese von:', input.value);
      const raw = fs.readFileSync(input.value, 'utf8');
      try {
        data = JSON.parse(raw);
      } catch (e) {
        data = { raw };
      }
    } else {
      console.log('Lade von URL:', input.value);
      data = await fetch(input.value);
    }
    fs.writeFileSync(OUT_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log('Fertig. Gespeichert als:', OUT_FILE);
  } catch (err) {
    console.error('Fehler:', err.message);
    process.exit(1);
  }
}

main();
