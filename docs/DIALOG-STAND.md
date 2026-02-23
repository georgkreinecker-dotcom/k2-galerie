# Dialog-Stand

| Feld | Inhalt |
|------|--------|
| **Datum** | 23.02.26 |
| **Thema** | VK2 Willkommensseite: 3 Bugs behoben |
| **Was zuletzt** | VK2 Willkommensseite: (1) Scroll-Problem behoben (overflowY: visible), (2) Impressum jetzt immer sichtbar auch ohne Stammdaten (Fallback-Text), (3) QR-Link/vercelGalerieUrl zeigt bei VK2 jetzt korrekt auf VK2-Route statt K2. Build ✅ Commit 044029f Push ✅ |
| **Nächster Schritt** | Auf Handy/Browser testen: VK2-Willkommensseite scrollen, Impressum unten sichtbar, QR-Code zeigt VK2-URL. Wenn Stammdaten eingetragen: Vereinsname + Vorstand im Impressum erscheinen. |
| **Wo nachlesen** | `src/pages/GaleriePage.tsx` – vercelGalerieUrl (Zeile ~747), Impressum-Block (Zeile ~3207), Root-Div overflowY (Zeile ~2063) |
