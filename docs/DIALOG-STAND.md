# Dialog-Stand

| Feld | Inhalt |
|------|--------|
| **Datum** | 23.02.26 |
| **Thema** | VK2 Willkommensseite: 3 Bugs behoben |
| **Was zuletzt** | VK2 komplett überarbeitet: Dummy-Verein "Kunstverein Muster" + 6 Mitglieder als Demo-Start. displayGalleryName zeigt Vereinsnamen aus Stammdaten statt "Vereinsplattform". Nicht-editierbare Design-Karte gelöscht. Commit 4d86b29 Push ✅ |
| **Nächster Schritt** | VK2-Seite auf Vercel testen: /projects/vk2/galerie – zeigt jetzt "Kunstverein Muster" als Titel, 6 Mitglieder sichtbar, Impressum mit Vereinsdaten. Stand-Badge tippen für Cache-Bypass. |
| **Wo nachlesen** | `src/config/tenantConfig.ts` – VK2_DEMO_STAMMDATEN, initVk2DemoStammdatenIfEmpty. `src/pages/GaleriePage.tsx` – displayGalleryName |
