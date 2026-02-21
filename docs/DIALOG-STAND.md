# Dialog-Stand – nach Absturz hier weiter

**Zweck:** Nach Crash verliert die KI den Chat-Verlauf. Diese **eine** Datei ist der Anker: Du öffnest sie (oder sagst „weiter nach Absturz"), die KI liest sie und arbeitet genau hier weiter – ohne dass du lange im Konzept suchen musst.

**Regel für die KI:** Bei „Absturz", „weiter", „wo waren wir", „Gedächtnis verloren" **zuerst diese Datei lesen**. Bei jedem natürlichen Pause oder Ende einer Aufgabe **diese Datei aktualisieren** (Datum, Thema, was zuletzt, nächster Schritt).

---

## Letzte Session (zuletzt aktualisiert)

| Feld | Inhalt |
|------|--------|
| **Datum** | 21.02.26 |
| **Thema** | Video-Upload Virtueller Rundgang – fix und fertig |
| **Was war zuletzt dran** | ✅ Video-Upload: sofort lokal in setPageContentGalerie speichern (war vorher nur blob im State, ging verloren). ✅ Keine alert()-Dialoge mehr beim Upload – stattdessen Status-Anzeige direkt unter dem Button. ✅ ök2: Video wird ebenfalls gespeichert (Demo-Vorschau). ✅ Max-Größe auf 100 MB erhöht. Stand: 21.02.26 16:56. |
| **Nächster konkreter Schritt** | Video im Virtuellen Rundgang testen: Admin → Seitengestaltung → Video aufnehmen oder wählen → muss sofort im Admin und in „So sehen Kunden" sichtbar sein. |
| **Wo nachlesen** | `components/ScreenshotExportAdmin.tsx` (~Zeile 9130), `src/pages/GaleriePage.tsx` (displayImages.virtualTourVideo) |

---

## So nutzt du das

- **Nach Absturz:** Sag z. B. „weiter nach Absturz" oder „wo waren wir" – die KI liest diese Datei und macht beim nächsten Schritt weiter.
- **Oder:** Öffne diese Datei selbst – oben steht immer der letzte Stand und der nächste Schritt.

---

*Eine Datei, ein Anker. Kein Suchen im Konzept.*
