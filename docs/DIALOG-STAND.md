# Dialog-Stand

## Datum: 25.02.26

## Thema
VK2 Mitglieder-Seite ans helle Design angepasst

## Was zuletzt gemacht
- **Kurz- und Langvita für alle Dummy-Künstler:innen** – Jeder der 6 Dummies hat jetzt eine **Kurzvita** (1–2 Sätze für Presse/Einladung/Flyer) und eine **Langvita** (strukturierter Text mit Name, Sparte, Stationen). Struktur in `Vk2Mitglied`: bio (ein Satz), kurzVita, vita. Beim Laden von „Kunstverein Muster“ werden fehlende kurzVita/vita aus den Dummy-Daten nachgefüllt.
- **Kurzinformationen in der Öffentlichkeitsarbeit** – Presse, Einladung und Flyer zeigen unter der Überschrift „Die Künstler:innen“ pro Person Name (mit Typ) + Kurzvita. Ohne Kurzvita wird die Bio verwendet.

## Letzter Commit
- (gleich) VK2: Kurz- und Langvita für Dummies, Kurzinformationen in Presse/Einladung/Flyer ✅

## Nächste Schritte (offen)
1. **Vereinskatalog** – Werke aus Lizenz-Galerien per `fetch()` laden (wenn `lizenzGalerieUrl` bei Mitglied gesetzt)
2. **VK2-Katalog als PDF-Download** direkt aus der App

## Wo nachlesen
- `src/pages/Vk2GaleriePage.tsx` – Startseite + Eingangskarten-Komponente
- `src/pages/Vk2GalerieVorschauPage.tsx` – Mitglieder-Seite (noch anpassen)
- `components/ScreenshotExportAdmin.tsx` – Admin mit Datentrennung
- `.cursor/rules/k2-oek2-trennung.mdc` – Datentrennung-Regeln
