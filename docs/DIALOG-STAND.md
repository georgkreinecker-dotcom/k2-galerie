# Dialog-Stand

| Feld | Inhalt |
|------|--------|
| **Datum** | 23.02.26 |
| **Thema** | VK2 Willkommensseite: 3 Bugs behoben |
| **Was zuletzt** | VK2 Willkommensseite 3 Bugs + Design-Vorschau: (1) Scroll fix, (2) Impressum immer sichtbar, (3) QR-Link auf VK2, (4) Design-Vorschau-Card zeigt jetzt echte defaultPageTexts statt hartkodierte Fallbacks. Commit 4772605 Push ✅ |
| **Nächster Schritt** | Auf Handy/Browser testen: VK2-Willkommensseite scrollen, Impressum unten sichtbar, QR-Code zeigt VK2-URL. Design-Tab im VK2-Admin: Vorschau-Card und editierbare Vorschau zeigen jetzt dieselben Texte. |
| **Wo nachlesen** | `src/pages/GaleriePage.tsx` – vercelGalerieUrl, Impressum. `components/ScreenshotExportAdmin.tsx` – VK2 Design-Vorschau-Card Zeile ~9695 |
