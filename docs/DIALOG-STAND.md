# Dialog-Stand

**Kernfrage bei Wiedereinstieg:** Woran haben wir in der letzten Viertelstunde gearbeitet? → Inhaltlicher Faden, nicht nur letzter Auftrag. Kontexte verbinden, abrufbar machen.

## Datum: 26.02.26

## Thema
Favoriten (max 5): Vorreihung in Galerie, Option beim Anlegen, VK2 wie gehabt

## Woran zuletzt gearbeitet (inhaltlicher Faden)
mök2 (Fähigkeiten-Mix, Wiederbeschaffung, Marktwert), Favoriten/VK2-Katalog, Veröffentlichungsvorbereitung. Crash-Check war Unterbrechung in diesem Strom.

## Was zuletzt gemacht
- **mök2: Fähigkeiten-Mix (Fakten):** Sektion „Was in einer Person das ermöglicht hat“ – Unternehmererfahrung, Domänenwissen, Arbeit mit AI, Struktur/Prozess, UX aus Nutzersicht, Pragmatismus; ausdrücklich als Aufzählung von Faktoren, keine Wertung.
- **mök2: Warum kostet Wiederbeschaffung so viel, wenn ein Laie es kann?** – Absatz ergänzt: Einkauf = Team mit mehreren Rollen, Stundensätzen, Prozess; Laie + AI = eine Person, Eigenzeit, keine Rechnung. Der Marktpreis für „bauen Sie mir das nach“ bleibt hoch; das Ergebnis kann gleichwertig sein.
- **mök2: Entwicklerkosten-Klarstellung:** Die Summe ist Wiederbeschaffungswert (was ein Profi-Team kosten würde), nicht „Verdienst“ des Erbauers – eigener Hinweis-Block + Anpassung im Hinweis-Text.
- **mök2: Geschätzte Entwicklerkosten-Rechnung und grobe Marktwertberechnung:** In der Sektion „Produktbewertung“ ergänzt: (1) Entwicklerkosten-Rechnung (Stunden nach Bereich, Stundensatz, Summe 188.000 – 498.000 €), (2) Marktwertberechnung (Zielgruppe, Vergleichspreise Basic 10–15 €/Monat / Pro 25–35 €/Monat, Szenarien Erlös/Jahr). Sidebar: „Entwicklerkosten (Schätzung)“ und „Marktwert (grober Ansatz)“ verlinken auf die Unterabschnitte. Mit „Als PDF drucken“ ausdruckbar.
- **Event-Flyer / alle orangen Sektoren kommen im grünen Bereich an:** (1) Beim Klick auf „← Zurück“ im In-App-Viewer wird die Dokumentenliste aus localStorage neu geladen → grüne/orange Bereiche sind nach dem Schließen des Dokuments aktuell. (2) Beim Erstellen („Jetzt erstellen – sofort fertig“) wird das Dokument **sofort** in die Liste eingetragen (Platzhalter mit leerem Inhalt), damit der grüne Bereich sofort erscheint; der eigentliche Inhalt wird asynchron nachgetragen. Gilt für Event-Flyer, Newsletter, Plakat, Presseaussendung, Social Media. (3) Presse/Social: Bug behoben, dass `const blob` im try das äußere `blob` überschattet hatte → Dokumente wurden nie gespeichert; jetzt wird das äußere `blob` gesetzt und die Liste sofort mit Platzhalter befüllt.
- **Prinzip „Ein Standard pro Problemstellung“ sichtbar gemacht:** Gleiche Aufgabe = eine Lösung; verschiedene Standards = Fehlerquellen (wie im Maschinenbau). Regel: `.cursor/rules/ein-standard-problem.mdc`. Jetzt auch in **docs/STRUKTUR-HANDELN-QUELLEN.md** (Regel + Siehe auch), **docs/00-INDEX.md** (Abschnitt „Prinzipien & Regeln“), **HAUS-INDEX.md** (Schnellfinder), **docs/GELOESTE-BUGS.md** (bei Regel für neue Bugs) – damit es überall auffindbar ist.
- **Ein Standard für alle Dokumente:** Alle Dokumente (Flyer, Presse, Einladung, Newsletter, QR-Plakat, Vita, gespeicherte HTML/PDF/Bilder) öffnen jetzt **ausschließlich im In-App-Viewer** (gleicher Tab, gleiche Leiste „← Zurück“, gleiches Verhalten). Keine eigenen Regeln mehr pro Dokumenttyp – eine Funktion `openDocumentInApp(html, title)`; handleViewEventDocument, openVitaDocument und alle generate* (Plakat, Presse, Social, …) nutzen sie.
- **Newsletter öffnet immer im gleichen Tab:** Kein neuer Tab mehr, der „oben im Browser-Balken hängt“ – Newsletter öffnet sofort im In-App-Viewer (Zurück, Format A4/A3/A5, Als PDF drucken, Speichern) im gleichen Fenster.
- **Dokumente-Chaos behoben:** (1) **Leeres druckfertiges Dokument:** iframe für Flyer/Presse-Einladung (documentUrl) nutzt jetzt **absolute URL** (origin + Pfad), damit der Inhalt lädt – bei blob-Seite löst sich `/flyer-k2-galerie` sonst falsch auf. (2) **Newsletter öffnet nicht:** Bei blockiertem Pop-up öffnet der Newsletter im **In-App-Viewer** (gleiches Format mit Zurück/Format/PDF/Speichern). (3) **Fokus:** Verzögerter zweiter Fokus (~180–200 ms) beim Öffnen von Dokumenten, damit der Tab in den Vordergrund kommt („erst Klick auf Leiste“). (4) Wenn Fenster für druckfertiges Doc nicht geöffnet werden kann → In-App-Viewer. Revoke-Timeout für blob-URLs auf 10 s erhöht.
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
- **Entdecken-Hub (otto, das ist deine Galerie): One-Click-Regel.** Drei Buttons („Meine Werke ansehen“, „Weiter“, „Galerie starten“) waren verwirrend. Jetzt: **eine** klare Hauptaktion pro Station – „[Station] öffnen →“ (öffnet Admin-Tab). „Nächste Station“ und „Galerie ansehen“ als kleine Text-Links darunter, damit keine konkurrierenden Aktionen. Commit: 5e137fd ✅
- **Druck-Fußzeilen (Seitenanzahl, Druckdatum, Dokumentenersteller):** (1) **App (alle App-Drucke):** #print-footer in App.tsx mit PRODUCT_BRAND_NAME + Druckdatum (de-AT), vor beforeprint aktualisiert; @page @bottom-right „Seite X von Y“ in index.css; #print-footer am Bildschirm ausgeblendet. (2) **Admin-Dokumente (In-App-Viewer):** wrapDocumentWithPrintFooter(html) injiziert in jedes geöffnete Dokument Style (@page margin-bottom, @bottom-right Seitenzahl, #doc-print-footer) + div + Script (Ersteller + Datum beim Laden). Commit: 4803154 ✅
- **Crash-Check (26.02.26):** index.html – „Laden …“-Klick und „Galerie lädt nicht“-Button nur noch Reload wenn window.self===window.top. Commit: 54191d2 ✅
- **Dokumente sofort sichtbar (Focus)** – Beim Öffnen von Dokumenten (Newsletter, Presse, Flyer, Vita, PDF, Etikett, Druckfenster etc.) wird das neue Fenster/der neue Tab mit `.focus()` in den Vordergrund geholt. Du musst nicht mehr in der Menüleiste (Tab „L“) suchen – das Dokument erscheint direkt.
- **„Alle PR-Dokumente auf einen Blick“ öffnet immer** – Fallback aus Event bei fehlenden PR-Vorschlägen (Commit 1ad018f).
- **QR-Code Plakat nur in K2** – Im VK2-Admin ausgeblendet (Commit 574badd).
- **In-App-Dokument-Viewer bei blockiertem Pop-up** – Overlay im gleichen Tab (Commit 1c121cb).
- **Klare Trennung K2 | VK2 | ök2** – Doku, VK2/K2 ADMIN-Badge, Session aus URL, VK2-Labels (Commit a8ff7de).
- **Zurück / VK2-Design / Dokumente öffnen** – Admin-URL injiziert, helles VK2-Design, Blob + Fallback.

## Letzter Commit
- **Admin-Startansicht im Hub-Design (Phase 1)** – 3 Spalten wie Entdecken, eine Hauptaktion, zielsicher. Commit: (gleich) ✅

## Nächste Schritte (offen)
- **Admin im Hub-Design (Phase 1):** Startansicht „Was möchtest du heute tun?“ durch 3-Spalten-Hub ersetzt – links Bereiche (Meine Werke, Werkkatalog, Events), Mitte Fokus-Karte + „↓ Direkt hier unten“, rechts Kassa/Einstellungen/Assistent + Galerie ansehen. K2/ök2/VK2 berücksichtigt.
4. **Vor Veröffentlichung:** Erster Durchgang in **docs/VOR-VEROEFFENTLICHUNG.md** erledigt (Stand-Tabelle für Georg). **Mit Georg:** Checkboxen durchgehen, npm audit + AGB/Impressum-Inhalte prüfen und abhaken.
5. **Praxis-Test gestartet (26.02.26):** Git-Teil erledigt (Commit 16283ea, Tag vor-praxistest-2026-02-26). Noch empfohlen: App-Vollbackup herunterladen; backupmicro Hard-Backup wenn angesteckt. **Ab jetzt:** Galerien befüllen + testen; weitere Änderungen wie bisher (commit, push, drei Regeln).

## Heute außerdem
- **Zurück aus Dokumenten:** goBack() in generierten Dokumenten nutzt Opener-URL inkl. context (Commit 192d544).
- **CI:** GitHub Actions führt jetzt vollen Build bei jedem Push (Commit f8f0a7c).

## Wo nachlesen
- `src/pages/Vk2GaleriePage.tsx` – Startseite + Eingangskarten-Komponente
- `src/pages/Vk2GalerieVorschauPage.tsx` – Mitglieder-Seite (noch anpassen)
- `components/ScreenshotExportAdmin.tsx` – Admin mit Datentrennung
- `.cursor/rules/k2-oek2-trennung.mdc` – Datentrennung-Regeln
