#!/usr/bin/env node
/**
 * Anke – Briefing für Session-Start
 * Stand, Offen, Proaktiv aus DIALOG-STAND + Grafiker-Tisch.
 * Schreibt docs/AGENTEN-BRIEFING.md. Ausführung: npm run briefing
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIALOG = path.join(ROOT, 'docs', 'DIALOG-STAND.md');
const GRAFIKER = path.join(ROOT, 'docs', 'GRAFIKER-TISCH-NOTIZEN.md');
const OUT = path.join(ROOT, 'docs', 'AGENTEN-BRIEFING.md');

function read(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return '';
  }
}

/** Erster Datum-Block aus DIALOG-STAND (neuester Eintrag) + Nächster Schritt */
function extractStand(dialog) {
  const lines = dialog.split('\n');
  const out = [];
  let inBlock = false;
  let foundNext = false;
  let nextStep = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^## Datum:/.test(line)) {
      if (inBlock) break;
      inBlock = true;
      out.push(line.replace(/^## /, '### '));
      continue;
    }
    if (inBlock) {
      if (/^---\s*$/.test(line)) break;
      if (/^\*\*Nächster Schritt\*\*:?/.test(line)) {
        nextStep = line.replace(/^\*\*Nächster Schritt\*\*:?\s*/, '').trim();
        foundNext = true;
      }
      out.push(line);
    }
  }
  const block = out.join('\n').trim();
  return { block, nextStep: foundNext ? nextStep : '' };
}

/** Offene Wünsche aus Grafiker-Tisch (zwischen "Offene Wünsche" und "Bereits umgesetzt" oder "---") */
function extractOffen(grafiker) {
  const lines = grafiker.split('\n');
  const out = [];
  let inSection = false;
  for (const line of lines) {
    if (/^## Offene Wünsche/.test(line)) {
      inSection = true;
      continue;
    }
    if (inSection && (/^## /.test(line) || /^---\s*$/.test(line))) break;
    if (inSection && line.trim()) out.push(line);
  }
  return out.join('\n').trim();
}

/** Proaktiv-Vorschläge aus Regeln */
function buildProaktiv(standNextStep, offenText, hasUncommitted) {
  const tips = [];
  if (standNextStep && /commit|push|build|Build/i.test(standNextStep)) {
    tips.push('- **Build/Commit:** Nächster Schritt nennt Commit/Build – schon erledigt? Wenn nicht: `npm run test` → `npm run build` → Commit + Push.');
  }
  if (hasUncommitted) {
    tips.push('- **Uncommitted:** Es gibt noch nicht committete Änderungen – vor Session-Ende: Commit + Push?');
  }
  if (offenText && /[Oo]ptional|[Ss]päter/.test(offenText)) {
    tips.push('- **Optional:** Grafiker-Tisch hat optionale Punkte (z. B. Texte kürzen) – nur wenn du dran willst.');
  }
  if (tips.length === 0) {
    tips.push('- Beim Wiedereinstieg: DIALOG-STAND + Grafiker-Tisch lesen, dann einen klaren nächsten Schritt wählen.');
  }
  return tips.join('\n');
}

/** Ankes verbindliche Prinzipien (immer im Briefing) */
function ankesPrinzipien() {
  return `- **Sportwagenprinzip (überall):** Eine Quelle, ein Standard, ein Ablauf pro Problemstellung. Kein „pro Modal anders“. Quelle: SPORTWAGEN-ROADMAP, PRODUKT-STANDARD-NACH-SPORTWAGEN.
- **Raumschiffprinzip (K2 Familie):** Qualität vor Abheben; nicht starten, bevor startklar. Qualitätsansprüche um ein Vielfaches höher. Quelle: K2-FAMILIE-GRUNDBOTSCHAFT.md (Raumschiff-Anspruch).`;
}

/** Kurzreferenz Georg (fest) */
function georgRef() {
  return `- Kurz antworten, sofort handeln, Erledigtes abhaken.
- Keine langen Texte; kein „fertig“ ohne Commit.
- Bei „ro“ / Session-Start: DIALOG-STAND + dieses Briefing lesen, dann weitermachen.`;
}

function main() {
  const dialog = read(DIALOG);
  const grafiker = read(GRAFIKER);
  const { block: standBlock, nextStep: standNextStep } = extractStand(dialog);
  const offenBlock = extractOffen(grafiker);

  let hasUncommitted = false;
  try {
    const { execSync } = require('child_process');
    const status = execSync('git status --porcelain', { cwd: ROOT, encoding: 'utf8' });
    hasUncommitted = status.trim().length > 0;
  } catch (_) {}

  const proaktiv = buildProaktiv(standNextStep, offenBlock, hasUncommitted);
  const datum = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });

  const md = `# Anke – Briefing – ${datum}

> Ankes Briefing für Session-Start. Generiert von \`npm run briefing\`. Stand, Offen, Proaktiv.

---

## Stand (wo wir stehen)

${standBlock || '(DIALOG-STAND.md lesen)'}

---

## Offen (vom Grafiker-Tisch / DIALOG)

${offenBlock || '(GRAFIKER-TISCH-NOTIZEN.md → Offene Wünsche lesen)'}

---

## Nächster Schritt (Hauptaufgabe für Anke)

- **Marketing-Strategie erarbeiten.** Quelle: **docs/AUFTRAG-MARKETING-STRATEGIE-ZWEI-ZWEIGE.md**. Daraus die Strategie erarbeiten – **Zweig 1: K2 Galerie** (weltweit, automatisierter Vertrieb), **Zweig 2: K2 Familie** (eigener Planungszweig, Raumschiff, Grundbotschaft, Datensouveränität). Output: z. B. **MARKETING-STRATEGIE-AUTOMATISIERTER-VERTRIEB.md** mit beiden Zweigen, oder separate Datei für den K2-Familie-Zweig. Auftrag ernst nehmen, direkt umsetzen.

---

## Proaktiv (Vorschläge)

${proaktiv}

---

## Ankes Prinzipien (verbindlich)

${ankesPrinzipien()}

---

## Georgs Präferenzen (Kurzreferenz)

${georgRef()}

---

*Mehr: docs/AGENT-KONZEPT.md – Abschnitt „So arbeitest du mit Anke (für Georg)“.*
`;

  fs.writeFileSync(OUT, md, 'utf8');
  console.log('Ankes Briefing geschrieben: docs/AGENTEN-BRIEFING.md');
}

main();
