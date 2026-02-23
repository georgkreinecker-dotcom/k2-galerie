# Dialog-Stand

| Feld | Inhalt |
|------|--------|
| **Datum** | 23.02.26 |
| **Thema** | VK2 Willkommensseite: 3 Bugs behoben |
| **Was zuletzt** | 4 hartkodierte VK2-Stellen behoben: (1) GaleriePage h1 „VK2 Vereinsplattform" → displayGalleryName, (2) welcomeSubtext hartkodiert → galerieTexts, (3) Admin-Vorschau Brand-Label „K2 Galerie" → VK2 Vereinsplattform im VK2-Kontext, (4) GalerieVorschauPage K2-Daten-useEffects ohne vk2-Schutz. Commit 4419c3e Push ✅ |
| **Nächster Schritt** | Nach Vercel-Deploy testen: VK2-Willkommen zeigt „Kunstverein Muster", Admin-Vorschau zeigt oben „VK2 Vereinsplattform", Mitglieder-Seite zeigt 6 Karten. Stand-Badge tippen für Cache-Bypass. |
| **Wo nachlesen** | `src/pages/GaleriePage.tsx` Zeile 2504, `components/ScreenshotExportAdmin.tsx` Zeile 9699, `src/pages/GalerieVorschauPage.tsx` Zeile 800+1297 |
