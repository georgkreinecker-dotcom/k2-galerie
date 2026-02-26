# Dialog-Stand

## Datum: 26.02.26

## Thema
Favoriten (max 5): Vorreihung in Galerie, Option beim Anlegen, VK2 wie gehabt

## Was zuletzt gemacht
- **Favoriten in der Galerie sichtbar + Filter nur belegte Kategorien:** (1) Auf jeder Werkkarte erscheint bei Favoriten (imVereinskatalog) ein Badge „★ Favorit“ oben links auf dem Bild – jeder Künstler hat bis zu 5 Favoriten (Martina und Georg je 5). (2) Die Filterleiste („Alle Werke“, Bilder, Keramik, …) zeigt nur Kategorien, in denen tatsächlich Werke vorkommen – bei nur 2 Kategorien nur 2 Buttons (war bereits über categoriesWithArtworks umgesetzt).
- **Zurück in die Dokumenten-Vorschau (Flyer & Werbedokumente):** Beim Öffnen eines Dokuments von „Hier sind deine Flyer und Werbedokumente …“ enthält die Rück-URL jetzt `tab=eventplan&eventplan=öffentlichkeitsarbeit`. Beim Admin-Start wird `eventplan` aus der URL gelesen → „← Zurück“ führt wieder genau auf die grüne Lupen-Vorschau, nicht in die Event-Übersicht.
- **Zurück landet auf der richtigen Seite:** (1) **Dokumente:** getAdminReturnUrl(activeTab, eventplanSubTab) – Rück-URL enthält Tab + Eventplan-Untertab. (2) **Galerie-Vorschau:** fromAdminTab/fromAdminContext → /admin?tab=einstellungen.
- **Premium im K2-Admin:** Statt klickbarer Karten nur noch ein **Hinweis**: „Vorerst noch nicht verfügbar – daran wird gearbeitet.“ Sektion „Erweiterte Funktionen (Premium)“ bleibt als Platzhalter.
- **Stand-Badge im VK2-Admin:** Beim Tippen auf „Stand“ hat doHardReload nur pathname + v= gesetzt, die URL-Parameter (z. B. context=vk2) gingen verloren → man landete in K2-Admin. **Fix:** doHardReload übernimmt die bestehenden Search-Parameter und hängt nur v= an (context=vk2 bleibt erhalten).
- **Favoriten (max 5):** Beim Erstellen/Bearbeiten eines Werks Option „Als Favorit“ (K2/ök2: „vorne in deiner Galerie“; VK2: „vorne in Galerie & Vereinskatalog“). Galerie- und Vorschau-Sortierung: Favoriten zuerst, dann neueste. Export (gallery-data.json) ebenfalls Favoriten zuerst → Besucher sehen dieselbe Reihenfolge. In der Werkliste: Favorit-Button für alle Kontexte (K2, ök2, VK2).
- **L3 / vermischte Daten:** Im VK2-Admin bei Werbematerial/Dokumenten ein Hinweis: „Falls ein Dokument noch K2-Daten enthält: Auf × klicken (aus Liste entfernen), dann Neu erstellen.“
- **Vereinskatalog:** Werke aus Lizenz-Galerien werden per `fetch(lizenzGalerieUrl/gallery-data.json)` geladen; nur Werke mit `imVereinskatalog`; lokale Werke bleiben Fallback.
- **VK2-Katalog als PDF:** Button „Als PDF drucken / herunterladen“ + Hinweis „Im Druckdialog ‚Als PDF speichern‘ wählen“.
- **Crash von gestern geprüft** – main.tsx + appBootstrap.tsx: Fehler-Reload-Buttons iframe-gesichert.
- **Dokumente sofort sichtbar (Focus)** – Beim Öffnen von Dokumenten (Newsletter, Presse, Flyer, Vita, PDF, Etikett, Druckfenster etc.) wird das neue Fenster/der neue Tab mit `.focus()` in den Vordergrund geholt. Du musst nicht mehr in der Menüleiste (Tab „L“) suchen – das Dokument erscheint direkt.
- **„Alle PR-Dokumente auf einen Blick“ öffnet immer** – Fallback aus Event bei fehlenden PR-Vorschlägen (Commit 1ad018f).
- **QR-Code Plakat nur in K2** – Im VK2-Admin ausgeblendet (Commit 574badd).
- **In-App-Dokument-Viewer bei blockiertem Pop-up** – Overlay im gleichen Tab (Commit 1c121cb).
- **Klare Trennung K2 | VK2 | ök2** – Doku, VK2/K2 ADMIN-Badge, Session aus URL, VK2-Labels (Commit a8ff7de).
- **Zurück / VK2-Design / Dokumente öffnen** – Admin-URL injiziert, helles VK2-Design, Blob + Fallback.

## Letzter Commit
- Premium-Platzierung: eigene Sektion „Erweiterte Funktionen (Premium)“ am Ende des Karten-Grids – Commit: 1d4c621 ✅ auf GitHub
- Stand-Badge: Kontext (context=vk2) beim Reload erhalten – Commit: 8d28384 ✅ auf GitHub

## Nächste Schritte (offen)
4. **Vor Veröffentlichung:** QS und Checkliste **docs/VOR-VEROEFFENTLICHUNG.md** noch einmal genau durchgehen (geplant mit Georg).

## Heute außerdem
- **Zurück aus Dokumenten:** goBack() in generierten Dokumenten nutzt Opener-URL inkl. context (Commit 192d544).
- **CI:** GitHub Actions führt jetzt vollen Build bei jedem Push (Commit f8f0a7c).

## Wo nachlesen
- `src/pages/Vk2GaleriePage.tsx` – Startseite + Eingangskarten-Komponente
- `src/pages/Vk2GalerieVorschauPage.tsx` – Mitglieder-Seite (noch anpassen)
- `components/ScreenshotExportAdmin.tsx` – Admin mit Datentrennung
- `.cursor/rules/k2-oek2-trennung.mdc` – Datentrennung-Regeln
