# Dialog-Stand

## Datum: 25.02.26

## Thema
VK2 Mitglieder-Seite ans helle Design angepasst

## Was zuletzt gemacht
- **VK2 Mitglieder-Seite (GalerieVorschau)** – komplett ans helle Design angepasst: gleiche Farbpalette (C.bg, C.text, C.accent), Nav wie Startseite, Eingangskarten mit hellem Platzhalter, Mitglieder-Karten hell mit Rahmen, Vita/Detail aufgeklappt hell, Footer #f2ede6. Event `vk2-karten-updated` für Karten-Reload ergänzt. ✅

## Letzter Commit
- (gleich nach diesem Stand) VK2 Mitglieder-Seite: helles Design wie Startseite ✅

## Nächste Schritte (offen)
1. **Vereinskatalog** – Werke aus Lizenz-Galerien per `fetch()` laden (wenn `lizenzGalerieUrl` bei Mitglied gesetzt)
2. **VK2-Katalog als PDF-Download** direkt aus der App

## Wo nachlesen
- `src/pages/Vk2GaleriePage.tsx` – Startseite + Eingangskarten-Komponente
- `src/pages/Vk2GalerieVorschauPage.tsx` – Mitglieder-Seite (noch anpassen)
- `components/ScreenshotExportAdmin.tsx` – Admin mit Datentrennung
- `.cursor/rules/k2-oek2-trennung.mdc` – Datentrennung-Regeln
