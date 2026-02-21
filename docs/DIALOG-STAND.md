# Dialog-Stand – nach Absturz hier weiter

**Zweck:** Nach Crash verliert die KI den Chat-Verlauf. Diese **eine** Datei ist der Anker: Du öffnest sie (oder sagst „weiter nach Absturz"), die KI liest sie und arbeitet genau hier weiter – ohne dass du lange im Konzept suchen musst.

**Regel für die KI:** Bei „Absturz", „weiter", „wo waren wir", „Gedächtnis verloren" **zuerst diese Datei lesen**. Bei jedem natürlichen Pause oder Ende einer Aufgabe **diese Datei aktualisieren** (Datum, Thema, was zuletzt, nächster Schritt).

---

## Letzte Session (zuletzt aktualisiert)

| Feld | Inhalt |
|------|--------|
| **Datum** | 21.02.26 |
| **Thema** | UX-Verbesserungen: Speichern = fertig, nutzerfreundliche Meldungen, ök2-Bilder-Bug behoben |
| **Was war zuletzt dran** | ✅ Speichern-Button löst jetzt automatisch Veröffentlichen + Git Push aus – kein zweiter Schritt. ✅ Alle technischen Fehlermeldungen (Terminal, git push, etc.) durch einfache Nutzer-Texte ersetzt. ✅ Bug behoben: ök2-Galerie las Bilder aus falschem Key → jetzt korrekt aus k2-oeffentlich-page-content-galerie. Stand: 21.02.26 11:33. |
| **Nächster konkreter Schritt** | ök2 Aussehen testen: Fotos einfügen → Speichern → „So sehen Kunden" – Fotos müssen jetzt sofort sichtbar sein. |
| **Wo nachlesen** | `components/ScreenshotExportAdmin.tsx`, `src/pages/GaleriePage.tsx`, `src/config/pageContentGalerie.ts` |

---

## So nutzt du das

- **Nach Absturz:** Sag z. B. „weiter nach Absturz" oder „wo waren wir" – die KI liest diese Datei und macht beim nächsten Schritt weiter.
- **Oder:** Öffne diese Datei selbst – oben steht immer der letzte Stand und der nächste Schritt.

---

*Eine Datei, ein Anker. Kein Suchen im Konzept.*
