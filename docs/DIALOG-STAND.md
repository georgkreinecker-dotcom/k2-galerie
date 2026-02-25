# Dialog-Stand

## Datum: 25.02.26

## Thema
VK2 Mitglieder-Seite ans helle Design angepasst

## Was zuletzt gemacht
- **Dokumente in der App öffnen** – Beim Klick auf ein Dokument in der Werbematerial-Liste: (1) Gespeichertes HTML wird zuerst als Blob mit openPDFWindowSafely geöffnet (kein leeres Fenster mehr). (2) Wenn kein gespeicherter Inhalt, aber Event vorhanden: Inhalt aus Event + Typ neu erzeugen und öffnen (wie „Neu erstellen“). (3) Bei allen Dokument-Karten wird `event` an handleViewEventDocument übergeben (QR-Plakat, Newsletter, Plakat, Event-Flyer, Presse, Social).
- **VK2-Dokumente ohne K2-Daten** – Bereits umgesetzt (generateEmailNewsletterContent, generateEditableNewsletterPDF, generateNewsletterContent, generateEventFlyerContent).

## Letzter Commit
- (noch nicht committed – Dokumente in App öffnen + event überall)

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
