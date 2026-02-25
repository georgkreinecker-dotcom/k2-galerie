# Dialog-Stand

## Datum: 25.02.26

## Thema
VK2 Mitglieder-Seite ans helle Design angepasst

## Was zuletzt gemacht
- **Muster-Vereinsaktivität + Öffentlichkeitsarbeit** – Ein Muster-Event „Gemeinschaftsausstellung im Vereinshaus Muster“ (Datum in einem Monat) mit allen 6 Dummy-Künstlern wird automatisch angelegt, wenn VK2-Admin mit Kunstverein Muster geöffnet wird und noch keine Events existieren. Dazu drei Muster-Dokumente: Presse, Einladung, Flyer (im gleichen Stil wie die Muster-Vereinsgalerie: warm, hell, Georgia, Terrakotta). Beim Öffnen eines dieser Dokumente im VK2-Admin wird das HTML aus Vereinsdaten + Mitgliedern generiert. ✅

## Letzter Commit
- (gleich) VK2: Muster-Event Gemeinschaftsausstellung + Presse/Einladung/Flyer für Öffentlichkeitsarbeit ✅

## Nächste Schritte (offen)
1. **Vereinskatalog** – Werke aus Lizenz-Galerien per `fetch()` laden (wenn `lizenzGalerieUrl` bei Mitglied gesetzt)
2. **VK2-Katalog als PDF-Download** direkt aus der App

## Wo nachlesen
- `src/pages/Vk2GaleriePage.tsx` – Startseite + Eingangskarten-Komponente
- `src/pages/Vk2GalerieVorschauPage.tsx` – Mitglieder-Seite (noch anpassen)
- `components/ScreenshotExportAdmin.tsx` – Admin mit Datentrennung
- `.cursor/rules/k2-oek2-trennung.mdc` – Datentrennung-Regeln
