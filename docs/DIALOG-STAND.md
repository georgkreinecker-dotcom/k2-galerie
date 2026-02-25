# Dialog-Stand

## Datum: 25.02.26

## Thema
VK2 Mitglieder-Seite ans helle Design angepasst

## Was zuletzt gemacht
- **Zurück aus Dokumenten (QR-Plakat etc.)** – goBack() in allen generierten Dokument-HTMLs nutzt jetzt die Admin-URL vom **Opener** inkl. Query (`?context=vk2` oder `?context=oeffentlich`). Beim Klick „Zurück“ landest du wieder im gleichen Kontext (VK2/ök2), nicht mehr in K2. Alle 9 goBack()-Varianten in ScreenshotExportAdmin.tsx angepasst.

## Letzter Commit
- (wird nach diesem Fix committed)

## Nächste Schritte (offen)
1. **Dokumente öffnen** – Bei Georg öffnen erstellte Dokumente (QR-Plakat, Newsletter) „noch nicht“; ggf. andere Code-Pfade oder VK2-spezifisch prüfen.
2. **Vereinskatalog** – Werke aus Lizenz-Galerien per `fetch()` laden (wenn `lizenzGalerieUrl` bei Mitglied gesetzt)
3. **VK2-Katalog als PDF-Download** direkt aus der App
4. **Vor Veröffentlichung:** QS und Checkliste **docs/VOR-VEROEFFENTLICHUNG.md** noch einmal genau durchgehen (geplant mit Georg).

## Heute außerdem
- **CI:** GitHub Actions führt jetzt vollen Build bei jedem Push (Commit f8f0a7c).

## Wo nachlesen
- `src/pages/Vk2GaleriePage.tsx` – Startseite + Eingangskarten-Komponente
- `src/pages/Vk2GalerieVorschauPage.tsx` – Mitglieder-Seite (noch anpassen)
- `components/ScreenshotExportAdmin.tsx` – Admin mit Datentrennung
- `.cursor/rules/k2-oek2-trennung.mdc` – Datentrennung-Regeln
