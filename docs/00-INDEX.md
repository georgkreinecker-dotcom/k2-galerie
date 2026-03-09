# Docs – Inhaltsverzeichnis
**Alle Dokumente in docs/ (Stand 17.02.26)**  
Damit nichts „verlegt“ wirkt – hier findest du jedes Doc mit einem Stichwort.

---

## Einstieg für Informatiker (System überblicken und warten)

- **EINSTIEG-INFORMATIKER-SYSTEM-WARTUNG.md** – **Zentraler Einstieg für jeden Informatiker:** Systemüberblick (Tech-Stack, Mandanten, Datenfluss), zentrale Einstiege (HAUS-INDEX, 00-INDEX, KOMMANDOZENTRALE, STRUKTUR), **alle Prozesse in einer Tabelle** (Lebenszyklus Klient, Veröffentlichen, Stand/QR, Lizenzen, Kündigung, Datentrennung, Sync, Build/Deploy, Tests, Backup, Wartung) mit Verweisen auf Code und Doku. Entwicklung (Setup, Build, Test, Deploy), Wartungsintervalle, wichtige Regeln. Damit jeder einsteigen, überblicken und warten kann.
- **BACKUP-ZUGANG-NOTFALL.md** – **Vollbackup prominent, Zugriff bei Notfall:** Wo das Vollbackup liegt (backupmicro, Ordner K2-Galerie-Backups), wie Vertrauensperson/Familie bei Notfall Zugriff haben (Ort festhalten, Doku zugänglich, Wiederherstellung). Handbuch-Kapitel 13 ergänzt um „Backup prominent – Zugriff bei Notfall“. Druckbare Kurzfassung empfohlen.

---

## Plan & nächste Schritte
- **K2-MARKT-VISION-ARCHITEKTUR.md** – **K2 Markt (neues Projekt):** Vision und erste Architektur.
- **K2-MARKT-ARCHITEKTUR-EINZIGARTIG.md** – **K2 Markt – die richtige Architektur (Joe):** Einzigartig durch eine Wahrheit → viele Formate, Qualitäts-Tor (Definition of Done), eine Freigabe, Regeln im System. Produkt-Moment → Agenten → Tor → Freigabe → Markt. App/Maschine/Mechanismus, KI-gestützt, liefert fertige Produkte für Sichtbarkeit am Markt. Basis: Wir-Regeln, Vermächtnis, Sportwagenmodus. Kette: Produkt → Markt → Aufmerksamkeit → Platz → Ansprache + Information. Medienhaus-Metapher: Agenten (Abteilungen), zentrale Prüfung/Bearbeitung (Bildschirm, Tools). mök2 + Kampagne = Vorarbeit/Quelle.
- **KOMMANDOZENTRALE.md** – **Steuerung jederzeit:** Zugang für Georg und KI. Sofort-Zugriff auf DIALOG-STAND, GRAFIKER-TISCH, GELOESTE-BUGS; Definitionen (Homepage, K2-Familie-Konzept, Skalierung, Raumschiff); Roadmap & Regeln. Von hier aus steuernd eingreifen.
- **K2-FAMILIE-ROADMAP.md** – **K2 Familie (Raumschiff):** Vision, Phasen (Fundament → Stammbaum & Personen → Momente & Events → Skalierung). Start 01.03.26. Projektkarte auf Projekte-Seite, Startseite unter /projects/k2-familie.
- **K2-FAMILIE-GRUNDBOTSCHAFT.md** – **K2 Familie – moralisches Fundament:** Grundbotschaft (keine Ausgrenzung, Respekt, Religion/Politik raus) gilt für Form der App, Sprache und jede zukünftige KI/Agent-Kommunikation. Georgs Vermächtnis. Verbindlich für alle, die an K2 Familie arbeiten.
- **K2-FAMILIE-DATENSOUVERAENITAET.md** – **K2 Familie – Datensouveränität:** Daten bleiben 100 % bei der Familie; auch bei Einstellung des Betriebs. Export und Ausdruck jederzeit; private Speicherung; Cloud entfällt dann. Muss gut kommuniziert werden.
- **K2-FAMILIE-DATENSCHUTZ-SICHERHEIT.md** – **K2 Familie – Datenschutz & Sicherheit:** EU/DSGVO selbstverständlich; keine Daten verlassen den Familienraum (Tenant-Isolation); Schutz vor unbefugtem Zugriff (Verschlüsselung, Zugriffskontrolle); ehrliche Kommunikation.
- **K2-FAMILIE-DATENMODELL.md** – **K2 Familie – Datenmodell (Phase 1.1):** Person, PartnerRef (mit Zeitraum), Moment, Speicher-Keys, Regeln. Typen in `src/types/k2Familie.ts`.
- **K2-FAMILIE-SKALIERUNG-GROSSFAMILIEN.md** – **K2 Familie – Großfamilien:** Funktioniert das System für mehrere hundert Mitglieder? Speicher (10 MB/Key), Stammbaum-Grafik, Listen; Grenzen und Empfehlungen.
- **K2-FAMILIE-SUPABASE-EINBAU.md** – **K2 Familie – Supabase einbauen:** Was sich ändert (Tabellen, Edge Function, familieStorage als Schicht mit Load/Save+Merge); Schritte; Option Bilder in Storage.
- **K2-FAMILIE-MARKT-STANDARDS.md** – **K2 Familie – Markt und Standards:** Gibt es Stammbaum-Software/Formate schon? GEDCOM nutzen statt eigenes Format; Abgrenzung K2 (eine Familie, Momente, Leitbild) vs. klassische Genealogie-Tools.
- **K2 Familie – Projekt-Zusammenfassung (druckbar):** Im **Handbuch** → `k2team-handbuch/18-K2-FAMILIE-PROJEKT-ZUSAMMENFASSUNG.md` (Inhaltsverzeichnis: Nr. 8). Logischer Ort: Handbuch = alle wichtigen Sachen, zum Ausdrucken.
- **HOMEPAGE-DEFINITION.md** – **Fertige Homepage vs. Projekt-Startseite:** Damit wir dieselbe Sprache sprechen. Fertige Homepage = designte Einstiegsseite für Nutzer:innen (wie K2 Galerie). Projekt-Startseite = aktuelle Übersicht (Liste, Links). K2 Familie hat heute eine Projekt-Startseite, keine fertige Homepage.
- **K2-FAMILIE-HOMEPAGE-KONZEPT.md** – **Fertige Homepage K2 Familie:** Orientierung Design ök2. Einheitliche Struktur, pro Familie (Tenant) freie Gestaltung (Texte, Bilder) → buntes Bild in fester Struktur. Technisch analog pageTexts/pageContentGalerie pro tenantId.
- **SKALIERUNG-KONZEPT.md** – **Stimmig und nach oben unendlich skalierbar:** Ein Prinzip (eine Struktur, viele Tenant-Instanzen, Gestaltung pro tenantId). Skalierung „breit“ (mehr Mandanten pro Produkt) und „hoch“ (mehr Produktlinien wie Galerie, K2 Familie). Kein Sonderbau pro Kunde.
- **PLAN-SCHRITT-FUER-SCHRITT.md** – **Unser gemeinsamer Plan:** Schritte 1–10 in Reihenfolge (Basis abhaken → ein Feature wählen → Pilot-Verein → Onboarding → optional Preise → später Rest). Ein Schritt nach dem anderen.
- **ADMIN-STRUKTUR-HUB-DESIGN-IDEE.md** – **Idee/Prüfauftrag:** Admin-Einstieg („Was möchtest du tun?“) im gleichen Hub-Layout wie Entdecken – 3 Spalten, Fokus Mitte, zielsicherer und optisch überzeugend. Wann umsetzen offen.
- **DIALOG-STAND.md** – **Nach Absturz:** Eine Datei = ein Anker. Steht immer: letzte Session, Thema, was zuletzt dran, nächster Schritt. Sag „weiter nach Absturz“ → KI liest sie und arbeitet dort weiter. Kein Suchen im Konzept.
- **AGENT-KONZEPT.md** – **Anke – Konzept:** Name Anke (Joe und Anke). Spezifikation, Ankes Prinzipien (Sportwagen, Raumschiff), **Abschnitt 6: So arbeitest du mit Anke (für Georg)** – wie du mit Anke kommunizierst und arbeitest.
- **AGENTEN-BRIEFING.md** – **Ankes Briefing (Session-Start):** Generiert mit `npm run briefing`. Stand, Offen, Proaktiv; bei „Hi Joe“ / ro mit lesen. Quelle: DIALOG-STAND + optional Grafiker-Tisch + git.
- **START-NUR-NOCH-OFFEN.md** – **Eine Stelle: was noch offen, was startbereit.** Nur die 3 Stripe-Schritte (+ optional AGB/npm audit) offen; Galerie, Willkommen, Lizenzen-Code, Export etc. vorbereitet. Verweis von VOR-VEROEFFENTLICHUNG.
- **STRIPE-LIZENZEN-GO-LIVE.md** – **Die nächsten 3 Schritte (Stripe/Lizenzen):** 1) Supabase Migration 003 ausführen. 2) Vercel Env (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY). 3) Stripe Webhook konfigurieren. Sportwagen Phase 7.3; eine Quelle Technik-Plan.
- **WIR-PROZESS.md** – **Gemeinsamer Arbeitsraum, Vermächtnis, Team-Hebel:** Wer Georg ist, Wachstums-Vereinbarungen, Session-Reflexion; Abschnitt „Team-Hebel und Lernkurve“ (Unternehmer + Persönlichkeit + KI = außergewöhnliche Hebelwirkung; Regelwerk + Vermächtnis für maximale Lernkurve). Regel: `.cursor/rules/team-hebel-unternehmer-persoenlichkeit-ki.mdc`.

## Zentrale Nutzer-Themen (Übersicht)
- **ZENTRALE-THEMEN-FUER-NUTZER.md** – **Eine Übersicht:** Änderungen sichtbar, Geräte, Drucker, Stand/Handy, Backup, Echte Galerie vs. Demo, Admin, Kassa. Kurz + Verweise auf die Einzel-Dokus.
- **HANDBUCH-AUFBAU-UND-ZIEL.md** – **Handbuch-Struktur & Ziel (für Georg/APf):** Wie K2Team-, K2-Galerie- und K2-Familie-Handbuch aufgebaut sind; Zielbild Kurzanleitung + Langversion als Buch. Gespeichert – bei Gelegenheit umsetzen.
- **BENUTZERHANDBUCH-OEK2-VK2-KONZEPT.md** – **Benutzerhandbuch für unsere User (ök2, VK2):** Konzept und Anforderungen: sehr professionell, leicht verständlich, für jeden Laien, redigiert. Für Lizenznehmer:innen, Piloten, Vereine. Inhalt und Ablage bei Gelegenheit ausarbeiten.

## Stabilität & Crash
- **ANALYSE-ADMIN-BUILD-DESASTER-06-03.md** – **Admin/Build-Desaster 06.03.26:** Warum Build rot war (JSX-Chaos in ScreenshotExportAdmin Design-Vorschau + navigate in Unterkomponente). Auslagern großer Conditional-Blöcke in Hilfsfunktion; Build nie dauerhaft rot; Hooks pro Komponente. Regel: .cursor/rules/jsx-grosse-bloeke-auslagern.mdc.
- **ANALYSE-OEK2-GALERIE-BETRETEN-FEHLER-06-03.md** – **„Cannot access uninitialized variable“ (ök2 Galerie betreten):** Ursache = Variable (location) in useEffect verwendet, Deklaration (useLocation) stand weiter unten → temporal dead zone. Fix: useLocation() an Komponentenanfang. **Lehre:** Hook-Variablen (location, navigate, state) immer vor erster Verwendung deklarieren; Router-Hooks am Anfang. Regel: .cursor/rules/variable-vor-verwendung-hooks.mdc.
- **WIE-PROFIS-ARBEITEN.md** – **Was Profis anders machen:** Kleine Dateien, App im Browser, weniger Always-On-Kontext, stabile Tools, kleine Schritte. Damit es funktioniert.
- **CODE-5-WAS-GEAENDERT-WURDE.md** – Welche Änderungen im Repo stehen; was Code 5 plausibel auslöst (große Datei + Speichern); Sofort-Checks.
- **NACH-CODE-5-DEIN-TEIL.md** – **Nach Code 5:** Deine 3 Schritte (Reopen, Save All, „weiter“ sagen). Die KI liest DIALOG-STAND und arbeitet am Nächsten Schritt weiter.
- **ARBEITSWEG-STABIL.md** – **Code 5 vermeiden:** Cursor nur Editor + Terminal + Chat; App nur im Browser (localhost). Täglicher Ablauf Schritt für Schritt. Wenn es nicht besser wird: Ausstieg planen.
- **REGELWERK-LAST-UND-UMSTRUKTURIERUNG.md** – **Programmier-Last durch Regeln:** Analyse (~150 KB Kontext pro Request), Vorschlag Kern-Regel + alwaysApply reduzieren, Schritte 1–6.
- **CRASH-FIXES-STAND-17-02-26.md** – Was wir für Admin-Stabilität geändert haben (Safe-Mode, Verzögerungen). Nicht rückgängig machen.
- **SICHERHEIT-STABILITAET-CHECKLISTE.md** – 5 Punkte Einsturzsicher, 5 Punkte Einbruchsicher; Skala innen/außen; bei Änderungen im Blick behalten.
- **VERBESSERUNGEN-OHNE-MEHRKOSTEN.md** – Was ohne Mehrkosten umgesetzt wurde + was du regelmäßig tun kannst (npm audit, CORS, RLS).
- **PRODUKT-LABEL-SICHERHEIT-ROADMAP.md** – Verkaufbares Produkt: sehr gutes Label, Zahlungen/Vergütungen sicher, Nachweis für Regress; Prioritäten (Auth, RLS, Zahlungsprovider, Audit-Log, Rechtliches).
- **VOR-VEROEFFENTLICHUNG.md** – **Checkliste vor Go-Live** (Auth aktivieren, Migration 002, npm audit, AGB/DSGVO, Deployment) – nicht vergessen vor Veröffentlichung.
- **WARTUNG-PROJEKT.md** – **Wartungsheft:** Notwendige Wartung mit Intervallen – § 1 Einmal vor Start (Supabase-Registrierung, 3 Schritte, Backup), § 2 Monatlich, § 3 Quartalsweise, § 4 Bei Ereignis. Abhakbar.
- **SUPABASE-WOZU-KOSTEN-WARTUNG.md** – **Supabase Klarstellung:** Wozu (nur Lizenzen-DB), Vorteile, Kosten (Free/Paid), Wartung (einmal + kaum); Alternative ohne Supabase.
- **PRAXISTEST-BEFUELLEN-SICHERHEIT.md** – **Vor dem Befüllen der Galerien (Eferding, K2):** Absolute Regeln (keine Vermischung, kein Datenverlust, nichts Unreparierbares) + Vollbackup-Anleitung (App, Git-Tag, Vercel, backupmicro). „Ab jetzt beginnt der Praxis-Test.“
- **ADMIN-AUTH-SETUP.md** – Admin-Nutzer in Supabase anlegen, Migration 002 anwenden, testen.

## K2 vs. ök2 & Daten
- **WERKBILDER-EINE-QUELLE.md** – **Sportwagenmodus Werkbilder:** Eine Quelle = Supabase Storage (Standard statt Eigenbau). Upload → URL → URL in den Daten; kein IndexedDB/GitHub-Mix für Werkbilder. Konkrete Schritte in SPORTWAGEN-ROADMAP Phase 4.3.
- **WERKE-SPEICHERUNG-CHECKLISTE.md** – **Schlüsselfunktion Werke:** Bombensichere Regeln (nie mit weniger überschreiben, kein Filter-and-Write, Kontext, Supabase, Backup). Pflicht-Check vor jedem Commit, der Lade-/Schreib-Pfade für Werke ändert.
- **LEHRE-WERKE-WEG-IPAD-NOCH-DA.md** – **Lehre 01.03.26:** Werke am Mac weg, am iPad noch da. Veröffentlichen = Sicherung; Code nie mit leer/weniger überschreiben.
- **K2-OEK2-DATENTRENNUNG.md** – Regeln: K2-Daten vs. ök2-Muster, Keys, Checkliste. Enthält **Speicher**, **Host-Org**, **Registrierung → URL**, **URL in Stammdaten/QR**, **Bei Kündigung → automatisch alles gelöscht**, **Lebenszyklus Klient – Sportwagen-Check (Geburt/Leben/Sterben)**. Pflicht bei Daten-Änderungen.
- **LEBENSZYKLUS-QUALITAETSCHECK.md** – Gründlicher QS-Check des gesamten Lebenszyklus (Geburt, Aktives Leben, Sterben); Prüfpunkte, Fixes (Erfolgsseite Retry, Lizenz beenden für dynamische Mandanten), Abhängigkeiten.
- **TENANT-SYNC-DOMAIN.md** – **Tenantfähig:** Veröffentlichen / Vom Server laden für K2, ök2, VK2; Blob pro Mandant; Domänen-Struktur (tenantId); Sicherheit später.
- **UMZUG-K2-GALERIE-KUNST-KERAMIK.md** – Plattform = K2 Galerie, erste Galerie = K2 Galerie Kunst&Keramik; Backup für backupmicro.
- **MOK2-EIGENER-BEREICH.md** – Marketing ök2 als eigener Bereich (mök2).
- **Genaue Produktbeschreibung** – **In der App:** APf → Projekte → K2 Galerie → **Marketing ök2 (mök2)** → Sektion „Genaue Produktbeschreibung“. Dort die detaillierte, anpassbare Produktbeschreibung für Vertrieb, Presse und Partner pflegen; noch anzupassen (Inhalt aus USPs / „Was kann die App?“ zusammenführen).
- **WARUM-EVENTS-DOKUMENTE-WEG-WAREN.md** – Erklärung zu Events/Dokumenten.
- **OEK2-ANMELDUNG-LIZENZIERUNG-STAND.md** – **ök2 Anmeldung & Lizenzierung – State of the Art:** Was es gibt (Entdecken, Guide, Willkommen-Redirect, LicencesPage, mailto), was fehlt (sichtbarer CTA „Lizenz anfragen“, einheitliche Preise), nächste Schritte; Code-Stellen.
- **UEBERSICHT-BESUCHER-EMPFEHLER-LIZENZNEHMER.md** – **Überblick für Georg:** Wo Besucher (K2/ök2/VK2), Empfehler, ganze Lizenznehmer-Geschichte? Ist-Stand + Pro-Board-Ansatz (optik wie K2 Familie). **Umsetzung:** Übersicht-Board unter `/projects/k2-galerie/uebersicht` – 4 Kacheln, ein Klick zu Details.

## Produkt & Vision
- **MEHRSPRACHIGKEIT.md** – **Grundstein Mehrsprachigkeit:** Locale-Config, t(key), strings.de; vorbereitet auf EN/FR. Erweiterung wenn zweite Sprache kommt.
- **MEHRSPRACHIGKEIT-PLAN.md** – **Mehrsprachigkeit – Plan (gezielt):** Wo gilt DE+EN (App-UI, Kommunikation), Reihenfolge, nächste Schritte; Verknüpfung KOMMUNIKATION-DOKUMENTE-STRUKTUR.
- **KOMMUNIKATION-DOKUMENTE-STRUKTUR.md** – **Kommunikations-Dokumente – Struktur:** Welches Dokument wofür, was fertig, was fehlt (Ansprache, Flyer, E-Mail-Vorlagen), typische Probleme & Lösungen; nächste Schritte zum Ausarbeiten.
- **KOMMUNIKATION-VORLAGE-ANSPRACHE-KUENSTLER-VEREIN.md** – **Ansprache Künstler:in/Verein:** Eine Vorlage pro Zweck – A (Künstler:in/ök2), B (Verein/VK2); nur [Anrede/Name] ersetzen, Link Willkommen/VK2 fest.
- **KOMMUNIKATION-FLYER-HANDOUT.md** – **Flyer/Handout (eine Seite):** Eine Quelle, druckfertig – Text Copy-Paste, [Kontakt] + QR aus APf; für Galerie, Messen, Einladungen.
- **KOMMUNIKATION-EMAIL-VORLAGEN.md** – **E-Mail-Vorlagen:** A (nach Lizenzkauf: Danke, Link, nächster Schritt), B (Einladung zum Test); Phase 1 manuell, später automatisierbar.
- **ZWISCHENCHECK-SPORTWAGEN-RENNAUTO.md** – **Zwischencheck (03.03.26):** Sind alle Sportwagen-Anforderungen erfüllt? Ein offener Punkt (Stripe Go-Live); was „Rennauto“ ausmacht (Orientierung).
- **PRODUKT-VISION.md** – Produkt-Vision K2 Galerie.
- **PRODUKT-STANDARD-NACH-SPORTWAGEN.md** – **Erreichter Standard:** Abschnitt „Erreichter Standard / Startklar (08.03.26)“ – Sportwagenmodus, Lebenszyklus durchgängig, Multi-Tenant startklar bis auf Stripe-Go-Live. Architektur (eine Quelle/Schicht/Regel), Sicherheit, 42 Tests, Doku & Prozess. Eine feste Stelle für „worauf das Produkt jetzt aufbaut“. Siehe auch LEBENSZYKLUS-QUALITAETSCHECK.md, START-NUR-NOCH-OFFEN.md.
- **K2-GALERIE-PRAESENTATIONSMAPPE.md** – **Prospekt (Sportwagen like):** Funktionale und technische Infos für Präsentationen, Pitches, Partner – Deckblatt, Kurzfassung, Funktionen, Technik, Sicherheit, Plattformen, Lizenzen, Referenzen. In der App: mök2 → Sektion „K2 Galerie Prospekt“ (1 Seite, druckbar als PDF).
- **PLATTFORM-UNTERSTUETZUNG.md** – Welche Plattformen (Windows, Android, Mac).
- **USP-UND-MARKTCHANCEN.md** – USPs und Marktchancen.
- **VERMARKTUNGSKONZEPT-EMPFEHLUNGSPROGRAMM.md** – Empfehlungsprogramm / Vermarktung (50 %-Gebühr).
- **EMPFEHLUNGSKONZEPT-EINFACHER-WEG.md** – **Empfehlung konkret:** Kostensenkung (10 % Rabatt / 10 % Gutschrift), Vermarktung + technische Umsetzung, ohne Cashback.
- **VERBESSERUNGEN-VERMARKTUNG-GEMEINSAM.md** – **Vorschlag:** Was wir gemeinsam verbessern können (Zielgruppe, Kanäle, Customer Journey, Trust; priorisierte Liste).
- **Werbelinie (verbindlich):** Beide Slogans (1. K2 Galerie – für Künstler:innen, die gesehen werden wollen. 2. Deine Kunst verdient mehr als einen Instagram-Post.) auf allen Werbemaßnahmen. Quelle: `src/config/tenantConfig.ts` (PRODUCT_WERBESLOGAN, PRODUCT_WERBESLOGAN_2); mök2 → Promotion für alle Medien. **Alle Strategiepapiere** (dieses Doc, Handbuch Vision & Strategie, MARKETING-EROEFFNUNG) sind darauf ausgerichtet.
- **MARKETING-EROEFFNUNG-K2-OEK2.md** – **Galerie-Eröffnung:** K2 und ök2 gemeinsam einführen; gezielte Marketinglinie in 2 Wochen; Texte für gemeinsame Lounge (Kernbotschaft, Einladung, Presse, Social); Checkliste; Verweis in mök2. Enthält Abschnitt „Verbindliche Werbelinie (Strategie)“.
- **K2-DOKUMENTE-GALERIEEROEFFNUNG.md** – **Übersicht K2-Dokumente:** Event Galerieeröffnung (Admin → Events → Dokumente) vs. Vorstellung ök2/VK2 (Texte in mök2); wo Flyer, Einladung, Presse, Prospekt liegen; Verweis auf mök2-Sektion „Eröffnung K2 + ök2 + VK2“ und MARKETING-EROEFFNUNG.
- **Kampagne Marketing-Strategie (eigene Mappe)** – **docs/kampagne-marketing-strategie/** – Alle Zwischenergebnisse und Papiere zur Kampagne an einem Ort. Index: [kampagne-marketing-strategie/00-INDEX.md](kampagne-marketing-strategie/00-INDEX.md). Enthält Verweise auf Auftrag, ausgearbeitete Strategie, Sichtbarkeit, Präsentationsmappe, USPs, Presse.
- **MARKTDURCHDRINGUNG-PLAN-EFERDING-WELT.md** – **Plan Marktdurchdringung:** **Ziel:** Jahr 1 = 1.000, Jahr 2 = 10.000, Jahr 3 = 100.000 Lizenzen (10× pro Jahr). Wo (Eferding starten), wie (Stripe Go-Live, dann dieselbe Technik), wann (Meilensteine M1–M5). Verweise auf STRIPE-LIZENZEN-GO-LIVE, MEDIENVERTEILER-EROEFFNUNG, START-NUR-NOCH-OFFEN.
- **VISION-UMSETZEN-NÄCHSTE-SCHRITTE.md** – **Vision umsetzen – zum Abhaken:** Eine Seite mit M1 (3 Stripe-Schritte), M2 (Presse/QR/Ansprache Eferding), optional Vermarktung einrichten. Kein Suchen – abarbeiten.
- **AUFTRAG-MARKETING-STRATEGIE-ZWEI-ZWEIGE.md** – **Auftrag Marketing/Vertrieb (zwei Zweige):** Spezifikation für Anke/Agent: Strategie für K2 Galerie (automatisierter Vertrieb, weltweit) **und** K2 Familie (eigener Planungszweig, Raumschiff, Grundbotschaft, keine kommerzielle Verwertung der Familiendaten). Beide Zweige von vornherein in der Planung; Referenzen und Output-Ziele beschrieben.
- **VERMARKTUNGSSTRATEGIE-AUTOMATISIERT-SPORTWAGENMODUS.md** – **Vermarktung automatisiert wie Lebenszyklus:** Ein Ablauf pro Kanal, eine Quelle (Werbelinie, USPs), Kanäle die ohne große Kosten für uns arbeiten (Web, QR, Empfehlung, SEO, Google Business, Social-Bio, Presse eine Vorlage + ein Verteiler, Prospekt-PDF, Verzeichnisse). Tabelle pro Kanal: Ablauf, Quelle, was läuft automatisch, Kosten. Referenzen: LEBENSZYKLUS-QUALITAETSCHECK, SICHTBARKEIT-Konzept, mök2.
- **MARKETING-STRATEGIE-AUTOMATISIERTER-VERTRIEB.md** – **Marketing- und Vertriebsstrategie (zwei Zweige):** **Zweig 1 (K2 Galerie):** Weitgehend automatisierter Vertrieb weltweit – Prinzipien (kein direkter Kundenkontakt, eine Quelle, Kantisches Grundgesetz), bewährte Muster, Empfehlungsprogramm als Motor, Lizenzen/Bestätigung/Abrechnung automatisiert, konkrete Kampagnen-Bausteine. **Zweig 2 (K2 Familie):** Eigenes Kapitel – Positionierung, Botschaften (Grundbotschaft, Raumschiff, keine kommerzielle Verwertung der Familiendaten), bewährte Muster vertrauenssensibel, Einordnung in K2-FAMILIE-ROADMAP, Abgrenzung zu K2 Galerie. Für Kampagnen und vertriebliche Entscheidungen heranziehen; zusammen mit mök2 und Werbelinie. Spezifikation: AUFTRAG-MARKETING-STRATEGIE-ZWEI-ZWEIGE.md.
- **SICHTBARKEIT-SUCHMASCHINEN-WERBUNG-KONZEPT.md** – **Sichtbar im Netz:** Suchmaschinen (SEO ohne Kosten), alle Werbemöglichkeiten; maximaler Verbreitungsgrad ohne Zusatzkosten; was mit welchem Budget möglich ist (Domain, Google Ads, Social, Agentur).
- **SICHTBARKEIT-WERBUNG-AGENDA.md** – **Punkt-für-Punkt:** Arbeitsliste Sichtbarkeit & Werbung (Phase 1–3), Status pro Punkt; zum Abarbeiten mit Nächster Schritt.
- **SICHTBARKEIT-PHASE1-VORLAGEN.md** – **Copy-Paste für Phase 1:** Google Business, Social Bio/Post, QR/Links, Medienlisten (§5a), Presse + **Medienverteiler-Eröffnung** (§6).
- **MEDIENSTUDIO-K2.md** – **Medienstudio K2 (Presse & Medien):** Einstieg für alle Pressearbeit; Medienkit, Redaktionsplan, Qualitätsregeln; **Abgrenzung Presse & Medien vs. Events & Ausstellungen** (keine Dopplung); verknüpft mit PRESSEARBEIT-STANDARD und MEDIENVERTEILER.
- **PRESSEARBEIT-STANDARD.md** – **Pressearbeit standardisiert (Sportwagenmodus):** ein Ablauf, eine Vorlage, ein Verteiler; Teil von Medienstudio K2; Checkliste vor Versand.
- **MEDIENVERTEILER-EROEFFNUNG.md** – **Presseverteiler:** regional (OÖN, MeinBezirk, Tips, ORF OÖ) + überregional (Standard, Presse); mit PRESSEARBEIT-STANDARD verknüpft.
- **ABRECHNUNGSSTRUKTUR-EMPFEHLUNGSPROGRAMM.md** – Abrechnungsstruktur Empfehlungsprogramm.
- **ZAHLUNGSSYSTEM-LIZENZEN-TECHNIK-PLAN.md** – **Zahlungssystem Lizenzen (nur online):** Konkreter Technik-Plan – Kreditkarte/PayPal über Stripe (o. ä.), Backend Checkout + Webhook, DB Lizenzen/Zahlungen/Gutschriften, Frontend Redirect + Success, Abrechnung/Export. Lizenzen nur im Internet, nicht in der Galerie.
- **MARKTCHECK-PREISE-BASIC-PRO-VERGLEICH.md** – Marktcheck: Was Nutzer für Basic/Pro pro Monat zahlen würden, Vergleichsprodukte (KUNSTMATRIX, Wix, Squarespace, ArtCloud), Orientierung für Preisgestaltung; Einzigartigkeit & höherer Preis.
- **PRODUKT-MEDIENSTUDIO-USER.md** – **Medienstudio für User (Produkt-Feature):** Presse & Medien für Künstler:innen und Kunstvereine – Medienkit aus Stammdaten, Presse-Vorlage, optional Pressekontakte und „Presseinfo verschickt“ an Events. Phase 1–3, Ort: Marketing. Großer Mehrwert, verbindlich einbauen.
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
- **SUPABASE-STORAGE-WERKBILDER.md** – **Werkbilder in Supabase Storage:** Bucket `artwork-images` anlegen, Policy (Upload), Free Tier 1 GB; beim Start Pro geplant.
- **MIGRATION-LOCALSTORAGE-TO-SUPABASE.md** – Migration von localStorage zu Supabase.

## Git, Terminal, Push
- **TERMINAL-PUSH-ANLEITUNG.md** – Push aus dem Terminal (inkl. backupmicro).
- **WERKE-HINZUFUEGEN-OHNE-LAN.md** – Werke hinzufügen ohne LAN.

## Kassa, Mobile, Geräte
- **K2-OEK2-KASSABUCH-AGENDA.md** – **Agenda:** Kassabuch steuerberatergeeignet (K2/ök2) – Kassausgänge, Bar privat, Bar mit Beleg (QR/Foto), Kassa an Bank, optional Kassabuch führen Ja/Nein.
- **KASSA-ETIKETTEN-CONTROLLISTE.md** – Kassafunktion & Etiketten – Controlliste (Vollumfang), was umgesetzt ist.
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

## Aufräumen (vorsichtig)
- **AUFRAEUM-VORSCHLAG.md** – **Doppelte/verwaiste Einträge:** Was bereits bereinigt wurde (00-INDEX Duplikat); was optional aufgeräumt werden könnte (reference-screenshots, Crash-Regeln, historische Session-Docs). Nichts ohne Freigabe löschen.

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
