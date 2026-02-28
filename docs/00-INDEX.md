# Docs – Inhaltsverzeichnis
**Alle Dokumente in docs/ (Stand 17.02.26)**  
Damit nichts „verlegt“ wirkt – hier findest du jedes Doc mit einem Stichwort.

---

## Plan & nächste Schritte
- **PLAN-SCHRITT-FUER-SCHRITT.md** – **Unser gemeinsamer Plan:** Schritte 1–10 in Reihenfolge (Basis abhaken → ein Feature wählen → Pilot-Verein → Onboarding → optional Preise → später Rest). Ein Schritt nach dem anderen.
- **ADMIN-STRUKTUR-HUB-DESIGN-IDEE.md** – **Idee/Prüfauftrag:** Admin-Einstieg („Was möchtest du tun?“) im gleichen Hub-Layout wie Entdecken – 3 Spalten, Fokus Mitte, zielsicherer und optisch überzeugend. Wann umsetzen offen.
- **DIALOG-STAND.md** – **Nach Absturz:** Eine Datei = ein Anker. Steht immer: letzte Session, Thema, was zuletzt dran, nächster Schritt. Sag „weiter nach Absturz“ → KI liest sie und arbeitet dort weiter. Kein Suchen im Konzept.
- **WIR-PROZESS.md** – **Gemeinsamer Arbeitsraum, Vermächtnis, Team-Hebel:** Wer Georg ist, Wachstums-Vereinbarungen, Session-Reflexion; Abschnitt „Team-Hebel und Lernkurve“ (Unternehmer + Persönlichkeit + KI = außergewöhnliche Hebelwirkung; Regelwerk + Vermächtnis für maximale Lernkurve). Regel: `.cursor/rules/team-hebel-unternehmer-persoenlichkeit-ki.mdc`.

## Zentrale Nutzer-Themen (Übersicht)
- **ZENTRALE-THEMEN-FUER-NUTZER.md** – **Eine Übersicht:** Änderungen sichtbar, Geräte, Drucker, Stand/Handy, Backup, Echte Galerie vs. Demo, Admin, Kassa. Kurz + Verweise auf die Einzel-Dokus.

## Stabilität & Crash
- **CRASH-FIXES-STAND-17-02-26.md** – Was wir für Admin-Stabilität geändert haben (Safe-Mode, Verzögerungen). Nicht rückgängig machen.
- **SICHERHEIT-STABILITAET-CHECKLISTE.md** – 5 Punkte Einsturzsicher, 5 Punkte Einbruchsicher; Skala innen/außen; bei Änderungen im Blick behalten.
- **VERBESSERUNGEN-OHNE-MEHRKOSTEN.md** – Was ohne Mehrkosten umgesetzt wurde + was du regelmäßig tun kannst (npm audit, CORS, RLS).
- **PRODUKT-LABEL-SICHERHEIT-ROADMAP.md** – Verkaufbares Produkt: sehr gutes Label, Zahlungen/Vergütungen sicher, Nachweis für Regress; Prioritäten (Auth, RLS, Zahlungsprovider, Audit-Log, Rechtliches).
- **VOR-VEROEFFENTLICHUNG.md** – **Checkliste vor Go-Live** (Auth aktivieren, Migration 002, npm audit, AGB/DSGVO, Deployment) – nicht vergessen vor Veröffentlichung.
- **PRAXISTEST-BEFUELLEN-SICHERHEIT.md** – **Vor dem Befüllen der Galerien (Eferding, K2):** Absolute Regeln (keine Vermischung, kein Datenverlust, nichts Unreparierbares) + Vollbackup-Anleitung (App, Git-Tag, Vercel, backupmicro). „Ab jetzt beginnt der Praxis-Test.“
- **ADMIN-AUTH-SETUP.md** – Admin-Nutzer in Supabase anlegen, Migration 002 anwenden, testen.

## K2 vs. ök2 & Daten
- **K2-OEK2-DATENTRENNUNG.md** – Regeln: K2-Daten vs. ök2-Muster, Keys, Checkliste. Pflicht bei Daten-Änderungen.
- **UMZUG-K2-GALERIE-KUNST-KERAMIK.md** – Plattform = K2 Galerie, erste Galerie = K2 Galerie Kunst&Keramik; Backup für backupmicro.
- **MOK2-EIGENER-BEREICH.md** – Marketing ök2 als eigener Bereich (mök2).
- **WARUM-EVENTS-DOKUMENTE-WEG-WAREN.md** – Erklärung zu Events/Dokumenten.

## Produkt & Vision
- **PRODUKT-VISION.md** – Produkt-Vision K2 Galerie.
- **PRODUKT-STANDARD-NACH-SPORTWAGEN.md** – **Erreichter Standard (28.02.26):** Architektur (eine Quelle/Schicht/Regel), Sicherheit (Kundendaten, Datentrennung, Stand/QR), Tests (38), Doku & Prozess. Eine feste Stelle für „worauf das Produkt jetzt aufbaut“.
- **PLATTFORM-UNTERSTUETZUNG.md** – Welche Plattformen (Windows, Android, Mac).
- **USP-UND-MARKTCHANCEN.md** – USPs und Marktchancen.
- **VERMARKTUNGSKONZEPT-EMPFEHLUNGSPROGRAMM.md** – Empfehlungsprogramm / Vermarktung (50 %-Gebühr).
- **EMPFEHLUNGSKONZEPT-EINFACHER-WEG.md** – **Empfehlung konkret:** Kostensenkung (10 % Rabatt / 10 % Gutschrift), Vermarktung + technische Umsetzung, ohne Cashback.
- **VERBESSERUNGEN-VERMARKTUNG-GEMEINSAM.md** – **Vorschlag:** Was wir gemeinsam verbessern können (Zielgruppe, Kanäle, Customer Journey, Trust; priorisierte Liste).
- **ABRECHNUNGSSTRUKTUR-EMPFEHLUNGSPROGRAMM.md** – Abrechnungsstruktur Empfehlungsprogramm.
- **MARKTCHECK-PREISE-BASIC-PRO-VERGLEICH.md** – Marktcheck: Was Nutzer für Basic/Pro pro Monat zahlen würden, Vergleichsprodukte (KUNSTMATRIX, Wix, Squarespace, ArtCloud), Orientierung für Preisgestaltung; Einzigartigkeit & höherer Preis.
- **FEATURES-ABHEBUNG-ZIELGRUPPE.md** – **Feature-Ideen:** Was die Zielgruppe (Künstler:innen mit Verkauf) noch mehr anspricht und uns abhebt; Priorität, Aufwand, empfohlene Reihenfolge zum Einbauen.
- **KUNSTVEREINE-MULTIPLIKATOREN.md** – **Kunstvereine als Multiplikatoren:** Warum eindruckvolles Angebot lohnt; was wir haben (VK2); was eindruckvoll wirkt; nächste Schritte (Satz „Für Kunstvereine“, Pilot, Onboarding).

## Deployment, Vercel, Stand
- **DATENTRANSPORT-IPAD-MAC-VERCEL.md** – **Eine Quelle:** API write-gallery-data, gallery-data.json, iPad↔Mac↔Vercel; GITHUB_TOKEN; „Daten an Server senden“ / „Bilder vom Server laden“.
- **SCHRITT-FUER-SCHRITT-STAND-AKTUELL.md** – **Stand überall aktuell:** 6 Schritte (pushen → Vercel Current prüfen → ggf. Promote/Redeploy → build-info prüfen → iPad refresh/QR → Kontrolle).
- **WAS-AB-13-26-BEI-VERCEL.md** – Was ab 13:26 bei Vercel passiert ist; Schlussfolgerung (Ursache im Dashboard, nicht im Repo).
- **BERICHT-ISTZUSTAND-SYNC-VERCEL-27-02-26.md** – **Analytischer Bericht (27.02.26):** Istzustand Datenchaos & Vercel (2 Fotos Sync Mac↔iPad, Stand hängt bei 13:26), Ursachen, Weg zur Lösung (Vercel reparieren → Sync stabilisieren).
- **VERCEL-CHECKLISTE-BEI-KEINEM-STAND.md** – **Wenn kein neuer Stand:** Vercel Dashboard (Deployments, Production Branch), Build-Fehler, **Vercel CLI** (direkt vom Mac deployen), danach refresh.html/QR.
- **VERCEL-DEPLOY-HOOK-ANLEITUNG.md** – Deploy Hook (URL aufrufen) + **Vercel CLI Schritt-für-Schritt** (Login, `npx vercel --prod`, Link zu k2-galerie) – für nächstes Vercel-Problem parat.
- **SYNC-ABLAUF-MAC-IPAD.md** – Sync eine Quelle (Vercel); Speichern → Vercel, anderes Gerät lädt von dort.
- **WERKE-OEFFENTLICH-SICHTBAR.md** – **Zentral:** Änderungen (Werke, Design, Stammdaten, …) → öffentlich sichtbar (in jedem Netz). Veröffentlichen + Git Push.
- **VERCEL-STAND-HANDY.md** – Warum Handy alten Stand zeigt (Branch, Cache).
- **STAND-QR-SO-BLEIBT-ES.md** – Stand & QR richtig halten.
- **VERCEL-BENACHRICHTIGUNGEN.md** – Vercel-Benachrichtigungen.
- **VEROEFFENTLICHEN-VOLLSTAENDIG.md** – Vollständig veröffentlichen.

## Supabase
- **ADMIN-AUTH-SETUP.md** – Admin-Nutzer anlegen (Supabase Auth), RLS Migration 002, Verhalten ohne Supabase.
- **SUPABASE-RLS-SICHERHEIT.md** – RLS-Status, aktuelle Policies, wie du später schärfen kannst.
- **SUPABASE-SETUP.md** – Supabase einrichten.
- **SUPABASE-SETUP-PROFESSIONELL.md** – Professionelles Setup.
- **SUPABASE-INTEGRATION-COMPLETE.md** – Integration abgeschlossen.
- **MIGRATION-LOCALSTORAGE-TO-SUPABASE.md** – Migration von localStorage zu Supabase.

## Git, Terminal, Push
- **TERMINAL-PUSH-ANLEITUNG.md** – Push aus dem Terminal (inkl. backupmicro).
- **WERKE-HINZUFUEGEN-OHNE-LAN.md** – Werke hinzufügen ohne LAN.

## Kassa, Mobile, Geräte
- **NUTZUNG-VERSCHIEDENE-GERAETE.md** – **Zentral:** Nutzung auf Mac, Windows, Android, iOS – klare Anweisungen und Tipps pro Gerät; was wo geht, Veröffentlichen nur am Mac.
- **DRUCKER-BROTHER-HINWEISE.md** – **Zentral:** Brother-Etikettendruck – gleiches Netz (Pflicht), Checkliste, Zwei-Netze-Problem, Hilfestellung Mac/iPad/Android, Schnell-Check.
- **KASSA-MAC-VS-MOBILE.md** – Kassa am Mac vs. Mobile.
- **ZWEITER-MAC-SETUP.md** – Zweiter Mac einrichten.
- **USB-VERBINDUNG-ZWEITER-MAC.md** – USB-Verbindung zweiter Mac.
- **iPad-Etikett-Druck-Anleitung.md** – Etikettendruck vom iPad.
- **Print-Bridge-Setup-Anleitung-fuer-Helfer.md** – Print-Bridge für Helfer.

## Konzepte & Masken
- **KUNDENERFASSUNG-KONZEPT.md** – Konzept Kundenerfassung.
- **STAMMDATEN-NEU-EINGEBEN.md** – Stammdaten neu eingeben.
- **MASKEN-EVENT-FELDER.md** – Event-Felder in Masken.

## Prinzipien & Regeln (Fehlerquellen vermeiden)
- **Profi statt Dilettant – Rad nicht zweimal erfinden** – Was andere schon erfunden haben, nicht neu bauen; Normen kennen, zukaufen/auslagern, am Markt beste Lösungen nutzen. Vor dem Bauen: „Gibt es das schon?“ Verbindlich: **.cursor/rules/profi-statt-dilettant-rad-nicht-zweimal.mdc**.
- **Ein Standard pro Problemstellung** – Gleiche Aufgabe = eine Lösung; verschiedene Standards = automatische Fehlerquellen. Verbindlich: **.cursor/rules/ein-standard-problem.mdc**. Siehe auch **STRUKTUR-HANDELN-QUELLEN.md** (Abschnitt Regel).
- **ANALYSE-HANDWERK-VS-STANDARD-KOMPONENTEN.md** – **Zeit Fehlersuche/Behebung** (aus GELOESTE-BUGS, CRASH-Doku) + **handwerklich gebaute Bereiche** (Sync/Merge, localStorage, Kontext, Reload, API) und **empfohlene Standard-Komponenten**; Priorisierung für Refactoring (Profi statt Dilettant).
- **SPORTWAGEN-ROADMAP.md** – **Prototyp → Sportwagen:** Systematische Durchführung des gesamten Programms ohne vergessene Aspekte. 9 Phasen (Fundament Daten/Kontext → Sync/Merge → UI/Reload/Theming → Medien → Admin/Galerie → APf → Build/Stand → Sicherheit → Tests/Doku); pro Bereich Prototyp-Zustand, Sportwagen-Ziel, konkrete Schritte, Erledigt-Checkbox. **Erreichter Standard:** siehe **PRODUKT-STANDARD-NACH-SPORTWAGEN.md**.
- **SYNC-REGEL.md** – **Verbindliche Sync-Regel (Phase 2.1):** Server = Quelle; lokale Neu-Anlagen geschützt; Konflikt: Mobile > neuer. Eine Funktion `syncMerge.mergeServerWithLocal`. Alle Merge-Aufrufer (GaleriePage, GalerieVorschauPage) nutzen sie.

## Setup & Qualität
- **SETUP-ANLEITUNG.md** – Projekt-Setup.
- **QUALITAETSSICHERUNG.md** – Qualitätssicherung; **QS-Standard vor Commit** (Tests + Build immer) ist dort verbindlich festgelegt.
- **QS-VERGLEICH-PROFIS.md** – Wo unser QS-Standard im Vergleich zu Profi-Teams steht (was wir haben, was optional wäre).
- **LICENCE-STRUKTUR.md** – Lizenzstruktur.
- **LIZENZMODELL-BASIC-PRO-ENTERPRISE.md** – Stufen Basic/Pro/Enterprise, Limits, Feature-Matrix, Aufstufung.

## Session & Heute
- **SESSION-17-02-26-MOK2-LIZENZEN-REGELN.md** – Was wir heute gemacht haben (mök2, Lizenzen, Vergütung, Regeln, Crash-Fixes).

## Status / Abschluss-Dokus
- **NEXT-STEPS.md** – Nächste Schritte.
- **FERTIG-README.md** – Fertig-README.
- **IMPLEMENTATION-COMPLETE.md** – Implementierung abgeschlossen.
- **MOBILE-SYNC-COMPLETE.md** – Mobile-Sync abgeschlossen.

## Druckversionen (HTML in docs/)
- **Print-Bridge-Setup-Druckversion.html** – Print-Bridge Setup zum Drucken.
- **iPad-Anleitung-Druckversion.html** – iPad-Anleitung zum Drucken.

---

**Projekt-Übersicht (Keller bis Dachboden):** Siehe im Root **HAUS-INDEX.md**.
