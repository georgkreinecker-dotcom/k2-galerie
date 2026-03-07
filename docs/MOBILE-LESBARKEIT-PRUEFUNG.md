# Mobile-Lesbarkeit – Prüfung aller Seiten (Handy)

Stand: 07.03.26. Alle relevanten Seiten wurden auf Lesbarkeit am Handy geprüft und angepasst.

## Globale Anpassungen (index.css)

- **html:** `overflow-x: hidden` – verhindert horizontalen Scroll der gesamten Seite.
- **@media (max-width: 768px):**
  - `html { font-size: 16px; }` – 1rem = 16px für lesbare Texte auf dem Handy.
  - `body { overflow-x: hidden; -webkit-text-size-adjust: 100%; }` – keine Mini-Schrift auf iOS.

Viewport ist in index.html bereits korrekt: `width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes`.

## Angepasste Seiten

| Seite | Änderung |
|-------|----------|
| **AGBPage** | Padding mobil reduziert, Container `width: 100%`, `boxSizing: border-box`. |
| **KassabuchPage** | Bereits zuvor: Tabelle in Container mit `overflowX: 'auto'`, `WebkitOverflowScrolling: 'touch'`, `minWidth: 480` für Tabelle. |
| **K2FamilieHandbuchPage** | Tabellen in Wrapper mit `overflowX: 'auto'`, `WebkitOverflowScrolling: 'touch'`; Tabelle `minWidth: 320`. |
| **K2TeamHandbuchPage** | `.handbuch-table-wrap` um `-webkit-overflow-scrolling: touch` ergänzt (bereits overflow-x: auto). |
| **WerbeunterlagenPage** | Flex-Container: `minWidth: 200` → `minWidth: 0`, damit auf schmalen Screens kein Overflow. |
| **KundenPage** | Padding mobil reduziert, Container `width: 100%`. |

## Bereits mobiltauglich (geprüft, keine Änderung nötig)

- **KassaEinstiegPage:** maxWidth 320px, width 100%, flex column.
- **WillkommenPage:** clamp-Padding, maxWidth mit width 100%.
- **LizenzErfolgPage:** maxWidth 480, padding 1rem.
- **KassausgangPage:** Formular-Layout passt.

## Bei neuen Seiten prüfen

- Container: `width: 100%` oder `maxWidth` + `width: 100%`.
- Tabellen: Wrapper mit `overflowX: 'auto'`, `WebkitOverflowScrolling: 'touch'`; Tabelle ggf. `minWidth` für Scroll.
- Keine festen `minWidth` > Viewport auf Flex-Items (besser `minWidth: 0`).
- Fließtext mind. 0.9rem (besser 1rem) auf kleinen Screens; index.css setzt auf 768px bereits 16px Basis.
