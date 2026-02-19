# Datenfluss verschlanken – Übersicht

**Grundregel:** `.cursor/rules/komprimierung-fotos-videos.mdc` – Fotos/Filme überall maximale Komprimierung.

## Bereits umgesetzt

| Bereich | Maßnahme |
|--------|----------|
| **Werke speichern (mobil)** | Starke Komprimierung (560 px, Qualität 0.5), max ~600 KB pro Bild → kurze Wartezeit |
| **Werke speichern (Desktop)** | 720 px / 0.6, max ~1,2 MB |
| **Export (gallery-data.json)** | Werke: große imageUrl werden auf ~250 KB komprimiert; Galerie-Bilder (Willkommen, Karte, Rundgang) komprimiert; Events/Dokumente: Bild-fileData komprimiert |
| **Git-Push-Script** | Prüft, dass Bilddaten in der Datei sind, bevor gepusht wird |

## Weitere Potenziale (bei Bedarf)

| Stelle | Idee |
|--------|------|
| **Event-Dokument hinzufügen** | Beim Hinzufügen eines Bildes zu einem Event: vor dem Speichern komprimieren (wie bei Werken), nicht Roh-Data-URL speichern |
| **ChatDialog (Bild an KI)** | Beim Drag&Drop Bild vor dem Senden an die API komprimieren → weniger Traffic |
| **Mobile-Sync (DevView)** | Aktuell alle 10 s wird gallery-data.json geladen; könnte auf „nur wenn nötig“ oder kleineren Endpoint umgestellt werden (Aufwand höher) |
| **localStorage-Größen** | Stammdaten (k2-stammdaten-galerie) haben 5 MB-Limit; Galerie-Bilder (welcomeImage etc.) beim Speichern im Admin komprimieren, nicht erst beim Export |

## Kurz

- **Export und mobiles Speichern** sind bereits verschlankt.
- **Nächste einfache Schritte:** Event-Dokumente (Bilder) beim Hinzufügen komprimieren; optional Chat-Bilder vor API-Send komprimieren.
