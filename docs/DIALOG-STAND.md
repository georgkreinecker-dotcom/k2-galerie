# Dialog-Stand

## Datum: 25.02.26

## Thema
VK2 Mitglieder-Seite ans helle Design angepasst

## Was zuletzt gemacht
- **QR-Code Plakat nur in K2** – Das Dokument „QR-Code Plakat“ (K2 GALERIE, Martina & Georg, Homepage/Virtueller Rundgang) ist K2-spezifisch und wird im **VK2-Admin nicht mehr angeboten** (Karte in der Werbematerial-Übersicht nur bei K2, bei VK2 ausgeblendet).
- **In-App-Dokument-Viewer bei blockiertem Pop-up** – Overlay im gleichen Tab bei blockiertem Fenster (Commit 1c121cb).
- **Klare Trennung K2 | VK2 | ök2** – Doku, VK2/K2 ADMIN-Badge, Session aus URL, VK2-Labels (Commit a8ff7de).
- **Zurück / VK2-Design / Dokumente öffnen** – Admin-URL injiziert, helles VK2-Design, Blob + Fallback.

## Letzter Commit
- In-App-Viewer bei blockiertem Pop-up – Commit: 1c121cb ✅ auf GitHub

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
