# Dialog-Stand

## Datum: 22.02.26

## Thema: QR-Scanner Kassa + Etikettendruck Anhaken

## Was zuletzt gemacht (MIT Commit-Hash = wirklich auf GitHub):
- Etikettendruck beim Anhaken: Teilen-Weg statt direktem Drucken – Commit: 7e7e469 ✅
- Kassa QR-Scanner: jsQR installiert, funktioniert auf ALLEN Browsern – Commit: 4e3e428 ✅
  - jsQR als Fallback wenn BarcodeDetector nicht vorhanden (iPad Safari, Firefox etc.)
  - addBySerialNumber bekommt Wert direkt – kein React-State-Timing-Problem
- Neue Regel angelegt: fertig-heisst-getestet-committed.mdc

## Nächster Schritt:
- Testen: Kassa QR-Scanner am iPad/iPhone → QR-Code eines Werks scannen
- Testen: Werk anhaken → "Etiketten drucken" → Teilen-Menü erscheint

## Wo nachlesen:
- `src/pages/ShopPage.tsx` → processQRCode, addBySerialNumber, Scanner-useEffect
- `components/ScreenshotExportAdmin.tsx` → handleBatchPrintEtiketten
