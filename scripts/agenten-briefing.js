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

/** Oben aus DIALOG-STAND: Letzter Stand, Was wir JETZT tun, Einordnung, Nächster Schritt */
function extractStand(dialog) {
  const parts = { letzterStand: '', wasJetzt: '', einordnung: '', nextStep: '' };
  const lines = dialog.split(/\r?\n/);
  for (let i = 0; i < lines.length && i < 35; i++) {
    const line = lines[i];
    const t = line.trimStart().trimEnd();
    const idxColon = t.indexOf(':');
    if (idxColon === -1) continue;
    const afterColon = t.slice(idxColon + 1).trim();
    if (t.indexOf('**Letzter Stand**') === 0) {
      parts.letzterStand = afterColon;
      const nx = parts.letzterStand.indexOf('**Nächster Schritt**');
      if (nx !== -1) {
        const afterLabel = parts.letzterStand.indexOf(':', nx) + 1;
        parts.nextStep = parts.letzterStand.slice(afterLabel).trim();
      }
      continue;
    }
    if (t.indexOf('**Was wir JETZT tun**') === 0) {
      parts.wasJetzt = afterColon;
      continue;
    }
    if (t.indexOf('**Einordnung**') === 0) {
      parts.einordnung = afterColon;
      continue;
    }
    if (t.indexOf('**Nächster Schritt**') === 0 && !parts.nextStep) {
      parts.nextStep = afterColon;
      continue;
    }
    if (parts.letzterStand && t.indexOf('**Vorher:**') === 0) break;
  }
  const block = [
    '### Letzter Stand',
    parts.letzterStand || '(DIALOG-STAND lesen)',
    '',
    '### Was wir JETZT tun (aktueller Fokus)',
    parts.wasJetzt || '(noch nicht gesetzt – DIALOG-STAND prüfen)',
    '',
    '### Einordnung (bisherige Aufgaben, Gesamtprojekt, warum so)',
    parts.einordnung || '(in DIALOG-STAND ergänzen)'
  ].join('\n');
  return { block, nextStep: parts.nextStep };
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

/** Ankes verbindliche Prinzipien (immer im Briefing) – fundamentale Aufgaben */
function ankesPrinzipien() {
  return `- **Mustererkennung (überall):** Bei jeder Aufgabe alle Muster mitdenken: (1) Verhalten, Gewohnheiten, Vision/Idee; (2) Technik/Fehler (gleiche Problemstellung, vergangene Bugs); (3) Internet = Musterlösungen (passende für Sportwagen nutzen). Quelle: .cursor/rules/mustererkennung-kernstaerke.mdc.
- **Sportwagenprinzip (überall):** Eine Quelle, ein Standard, ein Ablauf pro Problemstellung. Kein „pro Modal anders“. Quelle: SPORTWAGEN-ROADMAP, PRODUKT-STANDARD-NACH-SPORTWAGEN.
- **Raumschiffprinzip (K2 Familie):** Qualität vor Abheben; nicht starten, bevor startklar. Qualitätsansprüche um ein Vielfaches höher. Quelle: K2-FAMILIE-GRUNDBOTSCHAFT.md (Raumschiff-Anspruch).
- **QS vor Commit:** Vor jedem Commit Test + Build (npm run test, npm run build). Quelle: .cursor/rules/qs-standard-vor-commit.mdc.
- **Bei Fehlermeldung:** Zuerst GELOESTE-BUGS + FEHLERANALYSEPROTOKOLL prüfen (gleiches Muster? Wiederholung?), dann fixen + eintragen. Quelle: qualitaet-bei-fehlermeldung.mdc.
- **Session-Ende:** DIALOG-STAND aktualisieren, WIR-PROZESS Reflexion, Commit+Push, kurze Meldung an Georg („Raum ist bereit“).
- **Kundendaten:** Niemals still löschen/überschreiben; kein Filter+setItem. Quelle: .cursor/rules/niemals-kundendaten-loeschen.mdc.`;
}

/** Kurzreferenz Georg (fest) */
function georgRef() {
  return `- Kurz antworten, sofort handeln, Erledigtes abhaken.
- Keine langen Texte; kein „fertig“ ohne Commit.
- Bei „ro“ / Session-Start: DIALOG-STAND + dieses Briefing lesen, dann weitermachen.`;
}

function main() {
  let dialog = read(DIALOG);
  if (!dialog.trim() || !dialog.includes('Letzter Stand')) {
    const fallback = path.join(process.cwd(), 'docs', 'DIALOG-STAND.md');
    if (fallback !== DIALOG) {
      const d2 = read(fallback);
      if (d2 && d2.includes('Letzter Stand')) dialog = d2;
    }
  }
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

## Nächster Schritt (aus DIALOG-STAND – aktuell halten)

${standNextStep ? '- ' + standNextStep : '- (In DIALOG-STAND unter **Nächster Schritt:** eintragen. Wenn „von Georg festlegen“: auf Georg warten, nicht einen anderen Schritt unterstellen.)'}

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
