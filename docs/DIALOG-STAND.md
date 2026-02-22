# Dialog-Stand – Letzter Arbeitsschritt

| Feld | Inhalt |
|---|---|
| **Datum** | 22.02.26 |
| **Thema** | Kassa QR-Scanner + Etikett-Fixes |
| **Was war zuletzt dran** | ✅ Kassa: „📷 QR-Code scannen" öffnet jetzt sofort die echte Rückkamera mit Zielrahmen + automatischem Scan (BarcodeDetector). Fallback: manuelle Texteingabe. Etikett: Zeilenumbruch wenn Künstlername >12 Zeichen (Martina Kreinecker → zwei Zeilen). Build ✅, Push ✅. Stand: 22.02.26 11:05 |
| **Nächster konkreter Schritt** | Kassa testen: QR-Scan Button → Kamera öffnet → QR-Code halten → Werk wird direkt gefunden. Etikett testen: Martina Kreinecker auf zwei Zeilen |
| **Wo nachlesen** | `src/pages/ShopPage.tsx` (scannerVideoRef, showScanner useEffect), `components/ScreenshotExportAdmin.tsx` Zeile ~7180 (Footer Zeilenumbruch) |
