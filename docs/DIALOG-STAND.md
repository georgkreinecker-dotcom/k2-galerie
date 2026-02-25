# Dialog-Stand

## Datum: 25.02.26

## Thema
VK2 Mitglieder-Seite ans helle Design angepasst

## Was zuletzt gemacht
- **„Alle PR-Dokumente auf einen Blick“ öffnet immer** – Wenn keine PR-Vorschläge für das Event existieren, wird kein Alert mehr gezeigt; stattdessen wird ein PDF mit aus dem Event generierten Inhalten (Presse, Social, Newsletter, Flyer) geöffnet. Damit „lässt sich was öffnen“.
- **QR-Code Plakat nur in K2** – Im VK2-Admin ausgeblendet (Commit 574badd).
- **In-App-Dokument-Viewer bei blockiertem Pop-up** – Overlay im gleichen Tab (Commit 1c121cb).
- **Klare Trennung K2 | VK2 | ök2** – Doku, VK2/K2 ADMIN-Badge, Session aus URL, VK2-Labels (Commit a8ff7de).
- **Zurück / VK2-Design / Dokumente öffnen** – Admin-URL injiziert, helles VK2-Design, Blob + Fallback.

## Letzter Commit
- QR-Code Plakat nur K2, im VK2 ausgeblendet – Commit: 574badd ✅ auf GitHub

## Nächste Schritte (offen)
1. **L3 / vermischte Daten** – Bereits gespeichertes Dokument (z. B. Tab „L 3)“) enthält noch alte K2+VK2-Mischung. Abhilfe: Dieses Dokument in der Liste löschen und mit „Neu erstellen“ neu anlegen → dann nur VK2-Daten.
2. **Vereinskatalog** – Werke aus Lizenz-Galerien per `fetch()` laden (wenn `lizenzGalerieUrl` bei Mitglied gesetzt)
3. **VK2-Katalog als PDF-Download** direkt aus der App
4. **Vor Veröffentlichung:** QS und Checkliste **docs/VOR-VEROEFFENTLICHUNG.md** noch einmal genau durchgehen (geplant mit Georg).

## Heute außerdem
- **Zurück aus Dokumenten:** goBack() in generierten Dokumenten nutzt Opener-URL inkl. context (Commit 192d544).
- **CI:** GitHub Actions führt jetzt vollen Build bei jedem Push (Commit f8f0a7c).

## Wo nachlesen
- `src/pages/Vk2GaleriePage.tsx` – Startseite + Eingangskarten-Komponente
- `src/pages/Vk2GalerieVorschauPage.tsx` – Mitglieder-Seite (noch anpassen)
- `components/ScreenshotExportAdmin.tsx` – Admin mit Datentrennung
- `.cursor/rules/k2-oek2-trennung.mdc` – Datentrennung-Regeln
