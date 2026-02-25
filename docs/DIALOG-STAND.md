# Dialog-Stand

## Datum: 25.02.26

## Thema
VK2 Mitglieder-Seite ans helle Design angepasst

## Was zuletzt gemacht
- **Meine Notizen am Smart Panel** – Die Standardliste „Diverses“ im Smart Panel enthält jetzt Georgs Notizen: „Georgs Notizen (Übersicht)“ → Notizen-Seite, „Brief an August“ → /notizen-georg/diverses/brief-an-august.md, plus „Für meine Freunde“. Neue Nutzer sehen diese Einträge sofort; bestehende behalten ihre gespeicherte Liste.

## Letzter Commit
- (noch nicht committed: SmartPanel Diverses um Georgs Notizen ergänzt)

## Nächste Schritte (offen)
1. **Vereinskatalog** – Werke aus Lizenz-Galerien per `fetch()` laden (wenn `lizenzGalerieUrl` bei Mitglied gesetzt)
2. **VK2-Katalog als PDF-Download** direkt aus der App

## Wo nachlesen
- `src/pages/Vk2GaleriePage.tsx` – Startseite + Eingangskarten-Komponente
- `src/pages/Vk2GalerieVorschauPage.tsx` – Mitglieder-Seite (noch anpassen)
- `components/ScreenshotExportAdmin.tsx` – Admin mit Datentrennung
- `.cursor/rules/k2-oek2-trennung.mdc` – Datentrennung-Regeln
