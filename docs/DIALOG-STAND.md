# Dialog-Stand

**Kernfrage bei Wiedereinstieg:** Woran haben wir in der letzten Viertelstunde gearbeitet? → Inhaltlicher Faden, nicht nur letzter Auftrag. Kontexte verbinden, abrufbar machen.

## Datum: 27.02.26

## Thema
mök2: Entwicklungskosten, Marktwert und realistische Lizenzgebühren überarbeitet

## Woran zuletzt gearbeitet (inhaltlicher Faden)
mök2/Preisgestaltung: Wie hoch sollen die Lizenzgebühren realistisch sein?

## Was zuletzt gemacht
- **Einfache Kassa & Lagerhaltung (5 Punkte):** (1) Druck-Button „Verkaufs- & Lagerstatistik“ immer sichtbar (auch bei 0 Verkäufen). (2) **Verkauf stornieren:** In Verkaufsliste Button „Stornieren“ → Eintrag aus k2-sold-artworks entfernt, Stückzahl +1. (3) **CSV-Export:** Button „📥 CSV exportieren“ lädt verkaufsliste-YYYY-MM-DD.csv (Datum;Nr.;Titel;Preis; Gesamtumsatz). (4) **Galerie/Lager-Toggle:** Im Werkkatalog in der Status-Spalte Buttons „→ Lager“ / „→ Galerie“ – ein Klick wechselt ohne Werk zu bearbeiten. (5) **Umsatz heute:** Kachel „Umsatz heute“ in der Statistik. Commit: 787f57d ✅
- **mök2 – Produkt- & Branchenvergleich:** Neue Sektion „Warum ök2?“ nach USPs: Am Markt (Kasse 15–35 €/Monat, Galerie/Events/Etiketten getrennt, mehrere hundert €/Jahr) vs. ök2 (eine Oberfläche, eine Datenbasis, Kasse & Lager integriert, ein Stand). Kernvorteil-Satz + Link in Promotion Sektion 7. Sidebar + Struktur-Liste ergänzt. Commit: 9f2df3c ✅
- **USP vereinsfähig herausgestrichen:** (1) USPs: neuer Bullet „Vereinsfähig – die Plattform für Kunstvereine und Gruppen (VK2)“ mit Vereinsgalerie, Vereinskatalog, ab 10 Mitgliedern kostenfrei. (2) „Was kann die App?“: VK2-Box mit Untertitel „Die Plattform für Kunstvereine und Gruppen“, Punkt „Ab 10 Mitgliedern für den Verein kostenfrei“. (3) Produkt- & Branchenvergleich: Bullet Vereinsfähig (VK2) + Kernvorteil um „für Kunstvereine und Gruppen (VK2)“ ergänzt. (4) Marktchancen Stärken: „Vereinsfähig als Alleinstellungsmerkmal“. (5) Herausforderungen Wettbewerb: Differenzierung inkl. Vereinsfähigkeit. (6) Promotion Sektion 7 „Was macht den Unterschied“: Bullet Vereinsfähig (VK2). Commit: 46b13fa ✅ (Push: 51687cb)
- **USP Empfehlungsprogramm als einzigartig:** (1) USPs: neuer Bullet „Empfehlungsprogramm – einzigartig“ (10 % Rabatt/Gutschrift, Vertrieb durch Community, in dieser Branche kaum vergleichbar). (2) Produkt- & Branchenvergleich: Bullet Empfehlungsprogramm + Kernvorteil-Satz um „plus Empfehlungsprogramm (Vertrieb durch die Community)“ ergänzt. (3) Marktchancen Stärken: „Empfehlungsprogramm als Alleinstellungsmerkmal“. (4) Herausforderungen Wettbewerb: Differenzierung inkl. Empfehlungsprogramm. (5) Sektion 7 „Was kann die App?“ / „Was macht den Unterschied“ / „Wodurch zeichnet“: je Bullet Empfehlungsprogramm. Commit: f06ed81 ✅
- **Entwicklungskosten & Marktwert überarbeitet (realistische Lizenzgebühren):** (1) Sektionstitel + Einleitung: Fokus auf „wie hoch die Lizenzgebühren realistisch sein sollen“. (2) Entwicklerkosten: Klarstellung Wiederbeschaffungswert, nicht Preisvorlage; Lizenzgebühren leiten sich aus Markt/Zahlungsbereitschaft ab. (3) Marktwert: Vergleichspreise (KUNSTMATRIX, Wix, ArtCloud), Zielgruppe begrenztes Budget. (4) Neue Unterüberschrift „Realistische Lizenzgebühren (Orientierung)“: Tabelle Basic 10–15 €/Monat, Pro 25–35 €/Monat (Kernkorridor), mit USP-Kommunikation Pro 35–50 €; VK2 wie Pro, ab 10 Mitgliedern kostenfrei; Begründung pro Stufe. Fazit + Beispielrechnung Erlöspotenzial. (5) Lizenz-Pakete für Außen: Link auf Produktbewertung + realistische Korridore. Commit folgt.
- **Virtueller Rundgang (K2 + ök2):** Unter dem Rundgang-Text Hinweis ergänzt: „Eigenes Video (z. B. Atelier- oder Galerie-Rundgang) mit maximaler Länge in den Einstellungen unter Design → Seitengestaltung einbinden und positionieren.“ Der Block ist für ök2 bereits sichtbar (Bild/Video aus Seitengestaltung).
- **PWA-Icon-Hinweis (Galerie + Vorschau):** Auf Mobile erscheint oben ein schließbarer Hinweis: „Das Icon legt sich nicht von selbst auf deinen Bildschirm – du musst es einmal aktiv hinzufügen.“ Kurzanleitung iOS (Teilen → Zum Home-Bildschirm) bzw. Android (Menü → Zum Startbildschirm hinzufügen). Nur wenn nicht schon als PWA geöffnet; einmal „OK“ = Hinweis weg (localStorage k2-pwa-icon-hint-closed).
- **PR-Dokumente (Newsletter, Plakat, …) grün statt orange:** Wenn Dokumente schon Inhalt hatten, blieben die Balken „Noch nicht erstellt“. Ursache: eventId-Vergleich (String vs. Zahl nach JSON). Jetzt typensicher: String(d.eventId) === String(event.id); gleiche Logik in getNextWerbematerialVorschlagName. Commit: 8c5e846 ✅
- **Admin-Hub „Was möchtest du heute tun?“:** Mittlere Galerie-Guide-Karte entfernt (Doppelfunktion). Nur noch zwei Spalten mit allen Bereichen (Meine Werke, Werkkatalog, Events, Aussehen & Design | Kassa, Einstellungen, Schritt-für-Schritt); je Icon + kurze Funktionsinfo (beschreibung), Icons größer (clamp 1.75rem–2.1rem). One-Click pro Bereich. hubHoveredTab-State entfernt. Commit: 2edf426 ✅
- **LicencesPage 10 %-Rabatt sichtbar:** Bei gültiger Empfehler-ID: Label „Du erhältst 10 % Rabatt“, Hinweis „✓ Empfehlungs-Rabatt: 10 %“ und Preiszeile (z. B. 99 € → 89,10 €). URL-Prefill ?empfehler= und addGutschrift beim Speichern bereits vorhanden.
- **mök2/App auf 10 % umgestellt:** MarketingOek2Page, EmpfehlungstoolPage, VerguetungPage – alle Empfehlungs-„50 %“ durch „10 % Rabatt“ / „10 % Gutschrift“. VK2-Lizenzmitglieder 50 % unverändert.
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
- **Crash-Check (26.02.26):** doHardReload() (Stand-Badge) + VK2 Stand-Badges (Vk2GaleriePage, Vk2GalerieVorschauPage) – Reload/Redirect nur wenn window.self===window.top (kein Reload in Cursor Preview). Commit: 380c228 ✅
- **Admin K2/ök2:** „Aussehen & Design“ war im Haupt-Hub („Was möchtest du heute tun?“) nur bei VK2 als Icon in der linken Spalte – bei K2 und ök2 fehlte es. **Fix:** linksBereiche für K2/ök2 um Eintrag „✨ Aussehen & Design“ ergänzt (wie bei VK2). Commit: 01069ee ✅
- **Galerie – Event-Dokument-Icons (📎):** Klick auf „Einladung zur Vernissage“ / „Presseinformation“ unter „Aktuelles aus den Eventplanungen“ hat oft nichts getan (doc ohne fileData). **Fix:** openEventDocument nutzt Fallback aus eventDocuments (ev.documents + eventDocuments mit eventId); bei fehlendem Inhalt und bei blockiertem Pop-up klare Hinweise. Commit: 4946bef ✅
- **Dokumente sofort sichtbar (Focus)** – Beim Öffnen von Dokumenten (Newsletter, Presse, Flyer, Vita, PDF, Etikett, Druckfenster etc.) wird das neue Fenster/der neue Tab mit `.focus()` in den Vordergrund geholt. Du musst nicht mehr in der Menüleiste (Tab „L“) suchen – das Dokument erscheint direkt.
- **„Alle PR-Dokumente auf einen Blick“ öffnet immer** – Fallback aus Event bei fehlenden PR-Vorschlägen (Commit 1ad018f).
- **QR-Code Plakat nur in K2** – Im VK2-Admin ausgeblendet (Commit 574badd).
- **In-App-Dokument-Viewer bei blockiertem Pop-up** – Overlay im gleichen Tab (Commit 1c121cb).
- **Klare Trennung K2 | VK2 | ök2** – Doku, VK2/K2 ADMIN-Badge, Session aus URL, VK2-Labels (Commit a8ff7de).
- **Zurück / VK2-Design / Dokumente öffnen** – Admin-URL injiziert, helles VK2-Design, Blob + Fallback.

## Letzter Commit
- **Admin-Hub: Mittlere Karte entfernt, nur Icons + Kurzinfo, zwei Spalten, größere Icons, One-Click.** Commit: 2edf426 ✅ auf GitHub

## Was gerade gemacht (ök2: 7 fertige Musterdokumente)
- **ök2 zeigt jetzt 7 fertige Musterdokumente:** 2 unter „Druckfertige Dokumente“ (Einladung, Presse aus MUSTER_EVENTS) + 5 PR-Dokumente (Newsletter, Plakat, Event-Flyer, Presseaussendung, Social Media) aus getOek2MusterPrDocuments(). Alle mit MUSTER_TEXTE (Lena Berg, Paul Weber, Galerie Muster, info@galerie-muster.example) und einheitlichem Design (#6b9080).
- **tenantConfig:** getMusterNewsletterDataUrl(), getMusterPlakatDataUrl(), getMusterEventFlyerDataUrl(), getMusterPresseaussendungDataUrl(), getMusterSocialDataUrl() + getOek2MusterPrDocuments(). loadDocuments() in ök2 liefert diese 5 statt [].

## Zuvor (K2 / VK2 / ök2: je Kontext nur eigene Daten)
- **Gleiches Prinzip für alle drei:** K2 nutzt nur k2-events, k2-documents, k2-stammdaten-*; VK2 nur k2-vk2-* und vk2Stammdaten (Verein, Mitglieder); ök2 nur MUSTER_EVENTS und State (Muster).
- **VK2-Dokumente:** Social Media PDF, PR-Vorschläge PDF, Plakat, Flyer-Content, Presse-Content, Social-Content, Presse-Export nutzen im VK2-Kontext ausschließlich vk2Stammdaten (Verein name/address/email/website, Mitglieder). Kein K2 galleryData/martinaData/georgData mehr in VK2-Dokumenten.
- **K2:** Unverändert – lädt nur k2-events, k2-documents; Stammdaten aus k2-stammdaten-* (State); Generatoren nutzen State.
- **ök2:** Unverändert – Events/Docs nur Muster; State = MUSTER_TEXTE.

## Nächster Schritt (für nächste Session)
- **Test:** Admin-Hub am Handy/Browser – zwei Spalten, größere Icons, Kurzinfo, ein Klick pro Bereich; keine mittlere Karte mehr.
- Optional: 📎-Icons unter „Aktuelles aus den Eventplanungen“ durchklicken (Einladung/Presse).

## Was zuvor (Event-Flyer-Icon)
- **Vk2GaleriePage:** Bei „VEREINSTERMINE & EVENTS“ hat jedes Event ein klickbares 📄-Icon; Klick öffnet den Flyer (gespeichertes HTML oder minimal generiert) in einem Modal.
- **GaleriePage (K2, ök2, VK2):** In der Event-Sektion „Demnächst bei uns“ erscheint pro Event ein 📄-Icon, wenn ein Flyer-Dokument existiert; Klick öffnet den Flyer in neuem Fenster.
- Flyer-Dokument = PR-Dokument mit `eventId` und Flyer/Einladung-Typ; K2/ök2/VK2 nutzen jeweils den passenden Dokument-Key.

## Nächste Schritte (offen)
- **Test:** Event-Flyer-Icon auf VK2-Galerie und Galerie (K2/ök2) durchklicken – Flyer öffnet.
- **Admin-Hub (erledigt 27.02.26):** Zwei Spalten, Icons + Kurzinfo, größere Icons, keine mittlere Karte – One-Click. Commit 2edf426.
4. **Vor Veröffentlichung:** Erster Durchgang in **docs/VOR-VEROEFFENTLICHUNG.md** erledigt (Stand-Tabelle für Georg). **Mit Georg:** Checkboxen durchgehen, npm audit + AGB/Impressum-Inhalte prüfen und abhaken.
5. **Praxis-Test gestartet (26.02.26):** Git-Teil erledigt (Commit 16283ea, Tag vor-praxistest-2026-02-26). Noch empfohlen: App-Vollbackup herunterladen; backupmicro Hard-Backup wenn angesteckt. **Ab jetzt:** Galerien befüllen + testen; weitere Änderungen wie bisher (commit, push, drei Regeln).

## Heute außerdem
- **Zurück aus Dokumenten:** goBack() in generierten Dokumenten nutzt Opener-URL inkl. context (Commit 192d544).
- **CI:** GitHub Actions führt jetzt vollen Build bei jedem Push (Commit f8f0a7c).

## Session-Ende 27.02.26
- **Code:** Commit 2edf426 gepusht (Admin-Hub: Mittlere Karte weg, Icons + Kurzinfo, zwei Spalten, größere Icons). Stand 27.02.26 05:39.
- **Nächste Session:** DIALOG-STAND lesen → Admin-Hub am Handy testen; optional 📎-Icons Eventplanung.

## Session-Ende 26.02.26
- **Code:** Commit 4946bef gepusht (Event-Dokument-Icons + Stand 20:06). Vercel baut automatisch.
- **Nächste Session:** DIALOG-STAND lesen → Faden: Event-Icons testen, ggf. Kontext-Test ök2/VK2/K2.

## Wo nachlesen
- `src/pages/Vk2GaleriePage.tsx` – Startseite + Eingangskarten-Komponente
- `src/pages/Vk2GalerieVorschauPage.tsx` – Mitglieder-Seite (noch anpassen)
- `components/ScreenshotExportAdmin.tsx` – Admin mit Datentrennung
- `.cursor/rules/k2-oek2-trennung.mdc` – Datentrennung-Regeln
- `docs/PRAXISTEST-BEFUELLEN-SICHERHEIT.md` – Backup-Checkliste vor Praxis-Test
