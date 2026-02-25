# Dialog-Stand

## Datum: 25.02.26

## Thema
VK2 Mitglieder-Seite ans helle Design angepasst

## Was zuletzt gemacht
- **VK2-Dokumente ohne K2-Daten** – Im VK2-Admin erzeugte Newsletter, Event-Flyer und „ÜBER DIE AUSSTELLUNG“-Texte nutzen nur noch Vereinsdaten (Verein + Mitglieder). Keine Martina/Georg, kein info@kgm.at, kein K2-Kontakt mehr in VK2-Werbematerial. Angepasst: generateEmailNewsletterContent, generateEditableNewsletterPDF, generateNewsletterContent, generateEventFlyerContent.

## Letzter Commit
- VK2-Dokumente: nur Vereinsdaten – Commit: 12f3029 ✅ (noch pushen)

## Nächste Schritte (offen)
1. **Dokumente öffnen** – Bei Georg öffnen erstellte Dokumente (QR-Plakat, Newsletter) „noch nicht“; ggf. andere Code-Pfade oder VK2-spezifisch prüfen.
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
