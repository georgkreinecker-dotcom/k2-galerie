# Dialog-Stand – nach Absturz hier weiter

**Zweck:** Nach Crash verliert die KI den Chat-Verlauf. Diese **eine** Datei ist der Anker: Du öffnest sie (oder sagst „weiter nach Absturz"), die KI liest sie und arbeitet genau hier weiter – ohne dass du lange im Konzept suchen musst.

**Regel für die KI:** Bei „Absturz", „weiter", „wo waren wir", „Gedächtnis verloren" **zuerst diese Datei lesen**. Bei jedem natürlichen Pause oder Ende einer Aufgabe **diese Datei aktualisieren** (Datum, Thema, was zuletzt, nächster Schritt).

---

## Letzte Session (zuletzt aktualisiert)

| Feld | Inhalt |
|------|--------|
| **Datum** | 21.02.26 |
| **Thema** | Admin-Bereich Umbau – aus einem Guss |
| **Was war zuletzt dran** | ✅ Sammeldruck selbsterklärend: Button „Etiketten drucken (X ausgewählt)", Hinweis „→ Hakerl bei Werken setzen, dann hier drucken" wenn nichts ausgewählt. ✅ Haken-Label bei Werken: „Zum Sammeldruck" → „🖨️ Etikett drucken". Build: 21.02.26 07:06. |
| **Nächster konkreter Schritt** | Im Browser testen (npm run dev → http://localhost:5177 → Admin). Wenn OK: commit + push zu Vercel. Dann weiter: **WillkommenPage** (`src/pages/WillkommenPage.tsx`) auf Nutzer-Logik prüfen. |
| **Wo nachlesen** | `components/ScreenshotExportAdmin.tsx`, `.cursor/rules/ux-user-first-logik.mdc` |

---

## So nutzt du das

- **Nach Absturz:** Sag z. B. „weiter nach Absturz" oder „wo waren wir" – die KI liest diese Datei und macht beim nächsten Schritt weiter.
- **Oder:** Öffne diese Datei selbst – oben steht immer der letzte Stand und der nächste Schritt.

---

*Eine Datei, ein Anker. Kein Suchen im Konzept.*
