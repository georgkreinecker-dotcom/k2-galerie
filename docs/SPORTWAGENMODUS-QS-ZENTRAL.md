# Sportwagenmodus QS – zentraler Sicherungsprozess

Stand: 24.03.26

## Ziel

Ein fester, reproduzierbarer Ablauf, damit bei Stand-/Cache-/Deploy-Problemen keine Sucherei mehr nötig ist.

## Zentraler Befehl

`npm run qs:sportwagen`

Dieser Ablauf ist der verbindliche QS-Kern:

1. `npm run guard:all`
2. `npm run diagnose:stand`
3. `npm run build`

## Was damit abgesichert ist

- Kritische Tests (Datentrennung, Merge, Publish, Storage, Backup, Routen)
- Live-Guards (build-info, api/build-info, api/gallery-data, Blob-API, Cache-Header)
- Diagnose-Ampel für GitHub/Vercel/Cache/API in einem Lauf
- Build-Fähigkeit des aktuellen Stands

## APf-Diagnose (Ampel)

In der APf (`DevViewPage`) prüft die **Ampel** den Vercel-Stand und die kritischen Endpunkte:

- Beim Start: automatische Ampel-Prüfung
- **Jetzt prüfen:** Stand vergleichen + volle Endpunkt-Diagnose (mit Ergebnis-Dialog)
- **Vercel öffnen:** Dashboard direkt
- **Escape:** blockierende Overlays im eingebetteten Admin schließen (Notfall)

Ziel: Mit einem klaren Ort wieder handlungsfähig sein – ohne extra Buttons in der Leiste.

## CI-Pflicht

GitHub Actions führt den zentralen Ablauf verpflichtend aus:

- Workflow: `.github/workflows/tests.yml`
- Schritt: `npm run qs:sportwagen`

Damit ist der Sportwagen-QS nicht optional, sondern fester Bestandteil jedes Push/PR.

## Kurzfassung

Ein Standard, ein Ablauf, ein Klick:
`qs:sportwagen` ist der zentrale Sicherheitsprozess.
