# Marketing- und Vertriebsstrategie – zwei Zweige (K2 Galerie + K2 Familie)

**Stand:** 08.03.26  
**Zweck:** Verbindliche Strategie für weitgehend automatisierten Vertrieb (Zweig 1: K2 Galerie weltweit) und eigenständigen Planungszweig (Zweig 2: K2 Familie). Beide Zweige unter gemeinsamen Prinzipien; eine Quelle für Botschaften und Kampagnen. Für Kampagnen, vertriebliche Entscheidungen und mök2 heranziehen – zusammen mit Werbelinie (tenantConfig) und Marketing ök2.

**Referenz:** Auftrag und Spezifikation → **docs/AUFTRAG-MARKETING-STRATEGIE-ZWEI-ZWEIGE.md**.

---

## 1. Ausgangslage und Prinzipien (für beide Zweige)

### 1.1 Übergeordnete Prinzipien

| Prinzip | Bedeutung für Strategie |
|--------|--------------------------|
| **Sportwagenmodus** | Eine Quelle pro Thema, ein Standard pro Problemstellung. Bewährte Muster am Markt nutzen – Profi statt Dilettant. Kein zweites Rad erfinden; Normen, Komponenten und Kanäle zukaufen bzw. etablierte Wege nutzen. |
| **Kantisches Grundgesetz** | Nichts Halbes, niemandem schaden, ehrlich, Enkeln erklärbar. Keine Dark Patterns, keine aggressiven Marketing-Methoden, kein Datenmissbrauch. Qualität vor Geschwindigkeit. |
| **Team-Hebel** | Unternehmer + Persönlichkeit + KI – die Strategie soll erkennbar aus diesem Kontext kommen und etwas **Einzigartiges** ergeben (wie K2 selbst). Wiederbeschaffungswert und Lernkurve durch klare Ziele, Domänenwissen und Struktur. |
| **Ziel vor Anstrengung** | Erst das Ziel im Blick, dann die Anstrengung. Nicht „noch mehr richtig machen“, wenn die Richtung unklar ist. |

### 1.2 Gesetz: Kein direkter Kundenkontakt (K2 Galerie)

**Wir bauen bei K2 keinen direkten Kundenkontakt auf.** Bei den angestrebten Skalierungen ist das weder möglich noch sinnvoll.

- **Kein persönlicher Austausch** mit Lizenznehmern/Kunden als Standard (keine individuellen E-Mail-Antworten, kein Beziehungsaufbau pro Kunde).
- **Automatisch und sachlich:** Lizenzabschluss, Bestätigung, Abrechnung – über System (Stripe, Erfolgsseite, ausdruckbare Bestätigung). Druck hat etwas Verbindliches und Vertrauenserweckendes, ohne dass wir pro Kunde in Kontakt treten.
- **Skalierung:** Direkter Kundenkontakt skaliert nicht; deshalb von vornherein nicht als Kanal etablieren.

**Konsequenz für Strategie:** Alle Kanäle, Kampagnen und Texte bauen auf **systemgestützter Kommunikation**. Keine „Schreib uns eine E-Mail“-Aufforderungen als Hauptweg; keine Formulierungen, die Erwartung an persönliche Antwort wecken („wir melden uns“, „kontaktiere uns für …“ als Standard).

**Quelle:** .cursor/rules/k2-kein-direkter-kundenkontakt.mdc, docs/PRODUKT-VISION.md.

---

## 2. Zweig 1: K2 Galerie – weltweit, automatisierter Vertrieb

### 2.1 Kontext und Zielgruppe

- **Zielgruppe (Priorität):** Künstler:innen – Selbstvermarktung, eigene Werke, Ausstellungen, Webauftritt. Optional: Galerien.
- **Produkt:** Weltweit nutzbar (Windows, Android, macOS/iOS); Konfiguration statt Festverdrahtung; eine Instanz pro Künstler:in, Skalierung möglich.
- **Eine Werbelinie (verbindlich):** Quelle **src/config/tenantConfig.ts** – PRODUCT_WERBESLOGAN, PRODUCT_WERBESLOGAN_2. Beide Slogans auf **allen** Werbemaßnahmen (Presse, Flyer, Plakat, Web, Social, Prospekt).
- **USPs (aus mök2, eine Quelle):** Fotostudio in der App, Alles-in-einer-App (Galerie, Kassa, Events, Presse, Werbeunterlagen), Empfehlungsprogramm, Vereinsplattform (VK2), Werkkatalog. Aus Österreich – EU-Datenschutz, Rechtssicherheit, erreichbar.

### 2.2 Bewährte Muster für SaaS-/Lizenz-Vermarktung (zu unseren Prinzipien passend)

- **Self-Service und klare Customer Journey:** Demo (ök2) → Willkommensseite → Lizenz anfragen / Checkout → Erfolgsseite + druckbare Bestätigung. Kein Zwischenschritt „persönliches Gespräch“. Bewährt: Stripe Checkout, automatisierte E-Mails (Bestätigung, Rechnung), ein Klick zum Ziel.
- **Trust durch Transparenz:** AGB, Datenschutz, klare Preise (Basic, Pro, Pro+, VK2) auf der Lizenz-Seite und in mök2. Keine versteckten Kosten; keine Dark Patterns. Ehrliche Kommunikation entspricht dem Kantischen Grundgesetz.
- **Vertrieb durch Nutzer:innen (Empfehlungsprogramm):** Bewährtes Muster am Markt (Referral-Programme); wir setzen es branchenspezifisch um: 10 % Rabatt für Geworbene, 10 % Gutschrift für Empfehler, Empfehler-ID, ein Klick zum Teilen. In der Galerie-/Künstler:innen-Branche kaum vergleichbar – Alleinstellungsmerkmal.
- **Eine Quelle für alle Botschaften:** Werbelinie + USPs + Empfehlungsprogramm kommen aus **einer** konfigurierten Quelle (tenantConfig, mök2). Alle Kanäle bauen darauf auf; keine abweichenden „Sonder-Slogans“ pro Kanal.

### 2.3 Eine Quelle für Botschaften – Kanäle

| Kanal | Nutzung der einen Quelle |
|-------|---------------------------|
| **Web** | Willkommensseite, Galerie-öffentlich (ök2), LicencesPage – Werbelinie + USPs + „Lizenz anfragen“ / Stripe-Checkout. |
| **Galerie-Willkommen (Links)** | YouTube-, Instagram- und Highlight-Video-URLs kommen aus **Stammdaten** (Einstellungen → Stammdaten, Bereich Galerie) – **eine Quelle** für die öffentliche Galerie und für konsistente Verweise in Flyer, Visitenkarte oder Social-Bio; **nicht** im Design-Tab gepflegt. |
| **Demo ök2** | Gleiche Werbelinie, gleiche USPs; klarer nächster Schritt: „Lizenz anfragen“ oder Empfehlungslink teilen. |
| **QR** | QR führt auf Galerie oder Willkommensseite (je nach Kontext); Stand über Server + Cache-Bust (stand-qr-niemals-zurueck). |
| **Prospekt / erweiterte Mappe** | K2-GALERIE-PRAESENTATIONSMAPPE + Handbuch-Kapitel; Werbelinie oben, dann Funktionen, Technik, Lizenzen. Druckbar als PDF aus mök2. |
| **Social** | Kurzfassung Werbelinie + ein USP (z. B. „Alles in einer App“ oder „Empfehlungsprogramm – 10 % für dich und deine Freund:innen“). Kein eigener „Social-Slogan“. Die **sichtbaren Kanal-Links auf der Galerie** (YouTube/Instagram/Video) stammen aus Stammdaten – dieselben URLs in Bios und Posts nutzen, damit eine Linie bleibt. |
| **PR** | Pressearbeit (Medienstudio K2, PRESSEARBEIT-STANDARD) mit Werbelinie und USPs; Medienverteiler, keine individuelle Kundenansprache. |

Alle Strategiepapiere (docs, Handbuch Vision & Strategie, MARKETING-EROEFFNUNG-K2-OEK2) sind auf diese Werbelinie ausgerichtet. Quelle: docs/PRODUKT-STANDARD-NACH-SPORTWAGEN.md (Marketing-Werbelinie), mök2 → Sektion „Promotion für alle Medien“.

### 2.4 Empfehlungsprogramm als Motor der Automatisierung

- **Funktion:** Nutzer:innen werben mit persönlicher Empfehler-ID; 10 % Rabatt für den Geworbenen, 10 % Gutschrift für den Empfehler. Vertrieb durch die Community – ohne dass wir pro Kunde in Kontakt treten.
- **Ablauf (automatisiert):** ID in der App anzeigen/kopieren (Einstellungen / Empfehlungs-Programm) → Link teilen → Geworbene nutzt beim Lizenzabschluss die ID → System ordnet zu, Rabatt und Gutschrift werden angewendet. Rechtliches in AGB (Wer, wie, wann); Missbrauch vermeiden (keine Selbstempfehlung).
- **Kommunikation:** In mök2 und auf der Lizenz-/Willkommensseite klar sagen: „Empfiehl die K2 Galerie – 10 % für dich, 10 % für deine Freund:in.“ Ein Klick zum Teilen, keine komplexen Partner-Portale.

Quelle: mök2 (Empfehlungstool, Sektion Empfehlungsprogramm), docs/VERMARKTUNGSKONZEPT-EMPFEHLUNGSPROGRAMM.md, EMPFEHLUNGSKONZEPT-EINFACHER-WEG.md.

### 2.5 Lizenzen, Bestätigung, Abrechnung – durchgängig automatisiert

- **Lizenzabschluss:** Stripe Checkout (Kreditkarte/PayPal); Backend Webhook, Supabase-Tabellen (Lizenzen, Zahlungen, Gutschriften). Keine Kartendaten in der App.
- **Bestätigung:** Erfolgsseite nach Checkout + **ausdruckbare Bestätigung**. Druck = verbindlich und vertrauenserweckend, ohne persönlichen Kontakt.
- **Abrechnung:** Systemgenerierte Belege, Export für Steuer/Lizenznehmer; Gutschriften aus Empfehlungsprogramm systemseitig zugeordnet.
- **Kein „Schreib uns für Rückfragen“ als Hauptweg:** Rückfragen über FAQ, AGB, Datenschutz; technische Störung über klar definierten Support-Kanal (z. B. Kontaktformular mit automatischer Ticket-Erfassung), nicht „persönliche E-Mail an Georg“.

Quelle: docs/ZAHLUNGSSYSTEM-LIZENZEN-TECHNIK-PLAN.md, STRIPE-LIZENZEN-GO-LIVE.md, .cursor/rules/k2-kein-direkter-kundenkontakt.mdc.

### 2.6 Konkrete Kampagnen- und Maßnahmen-Bausteine (priorisiert)

**Priorität 1 – sofort umsetzbar:**

1. **Demo ök2 → Lizenz:** Klarer CTA auf Willkommensseite und nach Galerie-Besuch: „Lizenz anfragen“ / „Jetzt starten“ führt zu LicencesPage bzw. Stripe Checkout. Kein Umweg über E-Mail.
2. **Eine Werbelinie überall:** Sicherstellen, dass beide Slogans (PRODUCT_WERBESLOGAN, PRODUCT_WERBESLOGAN_2) auf jeder Außenkommunikation stehen – Web, Prospekt, Social, PR.
3. **Empfehlungstool sichtbar:** In App (Einstellungen) und in mök2 „So empfiehlst du die K2 Galerie“ – Kurz-Anleitung, Link mit Empfehler-ID kopieren, teilen. Trust-Checkliste (AGB, Datenschutz) erfüllt.

**Priorität 2 – nächste Schritte:**

4. **Prospekt/Handbuch als erweiterte Mappe:** K2-GALERIE-PRAESENTATIONSMAPPE + Handbuch-Kapitel (Vision, Strategie, Erste Schritte) als PDF aus mök2 druckbar; für Pitches, Partner, Messen. Eine Quelle, ein Layout.
5. **QR-Strategie:** QR-Codes für Galerie/Willkommen mit Server-Stand + Cache-Bust (bereits technisch umgesetzt); Nutzung in Flyern, Visitenkarten, Ausstellungen dokumentieren („QR auf deine Galerie – immer aktueller Stand“).
6. **Ansprache Künstler:innen/Vereine:** Zielgruppensatz festhalten („Künstler:innen, die gesehen werden wollen“ / „Kunstvereine mit gemeinsamer Galerie“); in mök2 und auf LicencesPage einheitlich. VK2 (ab 10 Mitgliedern für Verein kostenfrei) als eigener Baustein für Kunstvereine.

**Priorität 3 – erweitern:**

7. **Kanäle 2026:** Konkrete Kanäle (z. B. Google Business, Social Bio, Medienverteiler, eine Pilot-Kooperation) in mök2 eintragen und Customer Journey ausformulieren (Besucher → Demo → Lizenz → Erfolg).
8. **Erfolg messbar machen:** Lizenzabschlüsse, Empfehlungs-ID-Nutzung, Klicks auf „Lizenz anfragen“ – wo technisch möglich erfassen und auswerten, ohne personenbezogene Betreuung.

Alle Bausteine bauen auf **keinem direkten Kundenkontakt** auf; Skalierung durch Automatik und Sachlichkeit.

---

## 3. Zweig 2: K2 Familie – eigener Planungszweig

### 3.1 Kontext und Abgrenzung zu K2 Galerie

- **Anderes Produkt:** Familienraum, Stammbaum, Personen, Momente, Beziehungen. **Keine kommerzielle Verwertung der Familiendaten – für immer** (Genom, docs/K2-FAMILIE-GRUNDBOTSCHAFT.md).
- **Raumschiff-Anspruch:** Qualitätsansprüche um ein Vielfaches höher als beim Sportwagen. Nicht starten, bevor Architektur, moralisches Fundament und Zuverlässigkeit stehen.
- **Grundbotschaft:** Offene Gesellschaft, jede Form des Zusammenlebens = Familie; keine Ausgrenzung; Respekt; Daten gehören der Familie, nur dort Verwendung; kommerzielle Verwertung der Familiendaten **absolut ausgeschlossen**.
- **Zielgruppe:** Familien (in welcher Form auch immer Menschen zusammenleben); ein Mandant = eine Familie.
- **Datensouveränität:** Daten 100 % bei der Familie; Export/Ausdruck jederzeit; klar kommunizieren (docs/K2-FAMILIE-DATENSOUVERAENITAET.md, K2-FAMILIE-DATENSCHUTZ-SICHERHEIT.md).

### 3.2 Positionierung – sprachlich und konzeptionell

- **Gemeinsames Dach:** Beide Zweige (K2 Galerie, K2 Familie) teilen Werte (Kantisches Grundgesetz, eine Quelle, Sportwagenmodus), Doku-Struktur (docs, Handbuch, Ablage-Regel) und Prozess (Regeln, Vermächtnis). Kein widersprüchliches Auftreten.
- **Trennung:** K2 Galerie = „für Künstler:innen, die gesehen werden wollen“; Lizenzen, Vertrieb, Empfehlungsprogramm, weltweit. K2 Familie = „Raum für deine Familie – jede Form des Zusammenlebens“; keine kommerzielle Verwertung der Familiendaten; Vertrauen, Datensouveränität, Gedenkort, Momente. Keine Vermischung der Botschaften (z. B. kein „Empfehlungsprogramm“ für Familiendaten; kein „Lizenzverkauf“ der Familieninhalte).
- **Sprachliche Klarheit:** In allen Außendarstellungen klar benennen: „K2 Galerie“ vs. „K2 Familie“. Gemeinsam: „Aus demselben Haus – gleiche Werte, unterschiedliche Produkte.“

### 3.3 Botschaften und Kanäle für K2 Familie

- **Kernbotschaften:** (1) Jede Form des Zusammenlebens ist Familie. (2) Deine Daten gehören dir – Export und Ausdruck jederzeit; keine kommerzielle Verwertung, für immer. (3) Raumschiff-Qualität: Wir starten erst, wenn es startklar ist.
- **Erlaubt:** Vermarktung des **Produkts** K2 Familie (App, Nutzen, Vertrauen, Datensouveränität). **Verboten:** Vermarktung der **Daten** der Nutzer:innen (kein Verkauf, kein Training von KI mit Familieninhalten, kein Sharing mit Dritten).
- **Kanäle:** Eigenständige Kommunikation für K2 Familie – z. B. eigene Landing-Seite, eigene Texte (Grundbotschaft, Datensouveränität, Raumschiff), Vertrauens-Elemente (DSGVO, Export, „Daten verlassen den Familienraum nicht“). Keine Übernahme der K2-Galerie-Werbelinie für K2 Familie; eigene, inklusive und vertrauensorientierte Sprache.

### 3.4 Bewährte Muster für vertrauenssensible Familien-/Privatsphäre-Produkte

- **Transparenz vor Versprechen:** Ehrlich sagen, was wir tun (Verschlüsselung, Tenant-Isolation, kein Verkauf von Daten) und was wir nicht garantieren können („100 % unknackbar“). Quelle: docs/K2-FAMILIE-DATENSCHUTZ-SICHERHEIT.md.
- **Datensouveränität sichtbar:** Export und Ausdruck von Anfang an anbieten und in der App klar kommunizieren („Deine Daten gehören dir – jederzeit exportieren und ausdrucken“). Quelle: docs/K2-FAMILIE-DATENSOUVERAENITAET.md.
- **Keine Ausgrenzung in Form und Sprache:** UI und Texte inklusiv (Beziehungsmodelle, Ansprache); keine religiösen oder politischen Bewertungen. Entspricht Grundbotschaft und Kantischem Grundgesetz.
- **Branchenbeispiele:** Produkte, die Vertrauen durch Transparenz und Datenschutz-Klarheit aufbauen (z. B. EU-first, keine Weitergabe an Dritte, klare AGB), können als Orientierung dienen – ohne deren konkrete Kampagnen zu kopieren. Unser Alleinstellungsmerkmal: **Genom** (kommerzielle Verwertung für immer ausgeschlossen) + Grundbotschaft (offene Gesellschaft, jede Form Familie).

### 3.5 Einordnung in die K2-FAMILIE-ROADMAP – kein Marketing vor Produktreife

- **Raumschiff = nicht abheben, bevor startklar.** Vertriebs- und Kommunikationsmaßnahmen für K2 Familie ordnen sich den **Phasen der Roadmap** unter:
  - **Phase 1–3 (Fundament, UI, Momente & Events):** Kein breites Außen-Marketing. Interne Doku, Grundbotschaft, Datenschutz- und Datensouveränitäts-Konzepte stehen; Kommunikation nach außen nur, wenn Produkt und Botschaft konsistent sind.
  - **Phase 4 (Skalierung & Produkt):** Doku, Onboarding, ggf. Lizenzmodell „K2 Familie“ – dann erste klare Außendarstellung (Landing, Trust-Seiten, AGB/Datenschutz) möglich.
  - **Phase 5 und darüber:** Gedenkort, weitere Features – Kommunikation kann schrittweise erweitert werden, immer in Abstimmung mit „startklar“ (Architektur, moralisches Fundament, Zuverlässigkeit).
- **Kein „Marketing vor Produktreife“:** Keine großen Kampagnen oder Versprechen, solange das Raumschiff nicht abhebereif ist. Das schützt das Vermächtnis und die Glaubwürdigkeit.

Quelle: docs/K2-FAMILIE-ROADMAP.md, docs/K2-FAMILIE-GRUNDBOTSCHAFT.md (Raumschiff-Anspruch).

### 3.6 Gemeinsamkeiten und bewusste Trennung (Zweig 1 vs. Zweig 2)

| Aspekt | Gemeinsam | Getrennt |
|--------|-----------|----------|
| **Werte** | Kantisches Grundgesetz, Ziel vor Anstrengung, Profi statt Dilettant | – |
| **Struktur** | Eine Quelle pro Thema; docs, Handbuch, mök2-Ablage; gleiche Doku-Regeln | K2 Galerie: mök2, Lizenzen, Empfehlungsprogramm. K2 Familie: eigene Grundbotschaft, Genom, Datensouveränität. |
| **Zielgruppe** | – | Galerie: Künstler:innen, Vereine. Familie: Familien (jede Form). |
| **Botschaft** | Ehrlich, keine Dark Patterns, keine aggressiven Methoden | Galerie: Werbelinie, USPs, Empfehlungsprogramm. Familie: Grundbotschaft, Raumschiff, keine kommerzielle Verwertung der Familiendaten. |
| **Lizenzen / Daten** | – | Galerie: Lizenzmodell Basic/Pro/Pro+/VK2, Stripe, Abrechnung. Familie: Lizenzmodell evtl. später (mök2); **Familiendaten** nie kommerziell verwertet. |

---

## 4. Kurzfassung und nächste Schritte

- **Zweig 1 (K2 Galerie):** Weitgehend automatisierter Vertrieb weltweit. Eine Quelle für Werbelinie und USPs; Empfehlungsprogramm als Motor; Lizenzen/Bestätigung/Abrechnung über System; konkrete Kampagnen-Bausteine priorisiert. Kein direkter Kundenkontakt.
- **Zweig 2 (K2 Familie):** Eigenständiger Planungszweig mit eigener Positionierung, Grundbotschaft, Raumschiff-Anspruch und „keine kommerzielle Verwertung der Familiendaten“. Bewährte Muster für Vertrauen und Datensouveränität; Einordnung in K2-FAMILIE-ROADMAP (kein Marketing vor Produktreife). Gemeinsames Dach mit K2 Galerie (Werte, Struktur), bewusste Trennung bei Zielgruppe, Botschaft und Lizenzen/Daten.
- **Für Kampagnen und vertriebliche Entscheidungen:** Dieses Dokument zusammen mit mök2 (USPs, Lizenzen, Empfehlungstool, Promotion für alle Medien) und Werbelinie (tenantConfig) heranziehen. Bei K2 Familie zusätzlich: K2-FAMILIE-GRUNDBOTSCHAFT.md, K2-FAMILIE-ROADMAP.md, K2-FAMILIE-DATENSOUVERAENITAET.md, K2-FAMILIE-DATENSCHUTZ-SICHERHEIT.md.

---

**Quellen (Referenzen):** docs/AUFTRAG-MARKETING-STRATEGIE-ZWEI-ZWEIGE.md, docs/PRODUKT-VISION.md, docs/WIR-PROZESS.md, docs/STRUKTUR-HANDELN-QUELLEN.md, docs/PRODUKT-STANDARD-NACH-SPORTWAGEN.md, docs/K2-FAMILIE-GRUNDBOTSCHAFT.md, docs/K2-FAMILIE-ROADMAP.md, docs/K2-FAMILIE-DATENSOUVERAENITAET.md, docs/K2-FAMILIE-DATENSCHUTZ-SICHERHEIT.md, .cursor/rules/k2-kein-direkter-kundenkontakt.mdc, .cursor/rules/kantisches-grundgesetz.mdc, .cursor/rules/skalierungsprinzip.mdc, src/config/tenantConfig.ts, src/pages/MarketingOek2Page.tsx (mök2).
