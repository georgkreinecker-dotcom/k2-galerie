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

## APf-Ein-Klick

In der APf (`DevViewPage`) ist der Diagnoseweg als Ein-Klick-Ablauf eingebaut:

- Button: `🩺 Ein-Klick Diagnose`
- Bei Rot: automatische Fehlersuche startet
- Direkter Weg: `Vercel öffnen`

Ziel: Auch nach Wochen ohne Details im Kopf mit einem Klick wieder handlungsfähig sein.

## CI-Pflicht

GitHub Actions führt den zentralen Ablauf verpflichtend aus:

- Workflow: `.github/workflows/tests.yml`
- Schritt: `npm run qs:sportwagen`

Damit ist der Sportwagen-QS nicht optional, sondern fester Bestandteil jedes Push/PR.

## Kurzfassung

Ein Standard, ein Ablauf, ein Klick:
`qs:sportwagen` ist der zentrale Sicherheitsprozess.
