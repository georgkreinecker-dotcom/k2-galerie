# Dialog-Stand

## Datum: 22.02.26

## Thema: Etikettendruck – Anhaken-Weg gefixt

## Was zuletzt gemacht:
- `handleBatchPrintEtiketten` (Anhaken → Etikett drucken) komplett umgeschrieben
- Vorher: direktes `window.open + win.print()` → funktionierte nicht (3 Etiketten-Problem)
- Jetzt: gleicher Weg wie Einzeletikett → Teilen-Dialog → Drucker-App wählen
- Build ✅ – gepusht auf main

## Nächster Schritt:
- Testen: Werk anhaken → „Etiketten drucken" → Teilen-Menü erscheint → Drucker wählen
- Bei Bedarf: weitere Verfeinerungen am Etikett-Design

## Wo nachlesen:
- `components/ScreenshotExportAdmin.tsx` → `handleBatchPrintEtiketten`
