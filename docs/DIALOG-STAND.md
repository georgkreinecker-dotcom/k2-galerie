# Dialog-Stand – Letzter Arbeitsschritt

| Feld | Inhalt |
|---|---|
| **Datum** | 22.02.26 |
| **Thema** | ök2 Willkommen: Rundgang-Bereich jetzt sichtbar + Unsplash-Bilder |
| **Was war zuletzt dran** | ✅ Virtueller Rundgang wird jetzt auch auf ök2 angezeigt (war per !musterOnly ausgeblendet). ök2 nutzt eigenes virtualTourImage (Unsplash) ohne K2-Video-Fallback. Unsplash-URLs auf ?auto=format korrigiert. Build ✅, Push ✅. Stand: 22.02.26 06:37 |
| **Nächster konkreter Schritt** | In ~2 Min Stand-Badge tippen und ök2-Willkommen prüfen: Sieht man jetzt 2 Karten? (Galerie-Karte + Rundgang-Karte mit Unsplash-Innenraum-Foto?) |
| **Wo nachlesen** | `src/pages/GaleriePage.tsx` (Rundgang-Bereich, musterOnly-Logik), `src/config/tenantConfig.ts` (OEK2_WILLKOMMEN_IMAGES) |
