# Strategie: Promotion-Prozess im Sportwagenprinzip

**Stand:** 17.03.26 · **Kontext:** Alle Themen unter „7. Promotion“ (mök2) sind zusammengefasst. Dieses Dokument denkt das Sportwagenprinzip im **gesamten** Promotion-Prozess konsequent zu Ende: automatisieren, One-Click, Muster, nichts zweimal machen.

---

## 1. Zielbild

- **Eine Quelle** pro Information (Werbelinie, Sweet-Spot, Zielgruppe, Stammdaten) – keine doppelte Pflege.
- **One-Click** wo möglich: ein Klick = Aufgabe erledigt oder nächster sinnvoller Schritt klar (z. B. „Presse-Paket kopieren“, „PDF Werbeunterlagen drucken“).
- **Muster/Templates** überall: ein Template pro Dokumenttyp; alle Generatoren speisen sich aus derselben Quelle.
- **Nichts zweimal machen:** Kein zweiter Ablauf für dieselbe Problemstellung; keine zweite Liste, kein zweiter Text-Block für dasselbe Ziel.

---

## 2. Eine Quelle – wo was liegt

| Information | Einzige Quelle | Verwendung |
|-------------|-----------------|------------|
| **Werbelinie (2 Slogans)** | `tenantConfig.ts`: PRODUCT_WERBESLOGAN, PRODUCT_WERBESLOGAN_2 | Presse, Flyer, Plakat, Web, Social, Prospekt, mök2 Sektion 7 |
| **Sweet-Spot (Positionierung)** | `tenantConfig.ts`: PRODUCT_POSITIONING_SWEET_SPOT; Doku: docs/POSITIONIERUNG-SWEET-SPOT-MARKT.md | Prospekt, Presse (1b Produkt-Story), Medienstudio, mök2 |
| **Zielgruppe, Botschaften, Social-Positionierung** | `tenantConfig.ts`: PRODUCT_ZIELGRUPPE, PRODUCT_BOTSCHAFT_2, PRODUCT_POSITIONING_SOCIAL, PRODUCT_KERN_EIGENER_ORT | mök2 Sektion 7, alle PR-Texte, Werbeunterlagen |
| **Stammdaten (Kontakt, Adresse, Galerie)** | Admin → Stammdaten; Keys k2-stammdaten-* / k2-vk2-stammdaten / Kontext ök2 | Presse, Newsletter, Flyer, Plakat, Einladung – alle Generatoren lesen von hier |
| **Presse-Verteiler (Medienspiegel)** | docs/MEDIENVERTEILER-EROEFFNUNG.md + Medienspiegel im Admin (Key pro Kontext) | Keine Ad-hoc-Liste; eine Liste, Auswahl per Häkchen |
| **Presse-Vorlage / Betreff-Format** | docs/PRESSEARBEIT-STANDARD.md; Vorlage: SICHTBARKEIT-PHASE1-VORLAGEN.md §6 bzw. mök2 Sichtbarkeit | Jede Presseaussendung: gleiche Struktur, nur Variablen ersetzen |
| **Inhalte Sektion 7 (Promotion für alle Medien)** | mök2 → Sektion 7 (liest aus tenantConfig); Werbeunterlagen-Page liest dieselben Konstanten | Kein Copy-Paste in zweite Datei; App/Doku referenzieren die Quelle |

**Regel:** Wenn etwas an zwei Orten gepflegt wird, ist einer davon überflüssig. Entweder eine technische Quelle (tenantConfig, Stammdaten) oder eine Doku-Quelle (mök2, docs) – und alle anderen **lesen** daraus oder verlinken darauf.

---

## 3. One-Click – was ein Klick erledigen kann

| Aktion | Heute | Ziel (One-Click) |
|--------|-------|-------------------|
| **Presse-Text + Betreff kopieren** | Event wählen → Presse → ggf. Variante 1a/1b → „In Zwischenablage“; Betreff ggf. separat | Ein Klick „Presse-Paket kopieren“: Betreff (Format aus Standard) + Fließtext in Zwischenablage, fertig zum Einfügen in E-Mail |
| **Medienspiegel BCC** | Medienspiegel öffnen → Häkchen setzen → „E-Mail-Adressen kopieren“ | Bleibt; optional: beim Presse-Dokument Link „BCC-Adressen kopieren (Medienspiegel)“ – ein Klick, dann BCC einfügen |
| **PR-Vorschläge alle (Event)** | Ein Klick existiert bereits (Newsletter, Presse, Plakat, Social, Flyer) – erzeugt Platzhalter-Dokumente | Beibehalten; sicherstellen, dass alle aus **einer** Event- + Stammdaten- + tenantConfig-Quelle gefüllt werden |
| **Werbeunterlagen als PDF** | Werbeunterlagen öffnen → „Als PDF drucken“ pro Sektion oder Seite | Ein Klick „Gesamte Werbeunterlagen als PDF“ (eine Druckfunktion für die ganze Seite) – optional |
| **Standard-Texte für Pitch/Web** | Aus mök2 Sektion 7 kopieren | Optional: Button „Kernbotschaften kopieren“ (Slogan 1+2, Zielgruppe, Sweet-Spot in definierter Reihenfolge) – eine Quelle, ein Klick |
| **Event → alle Dokumente** | Event anlegen → unten PR-Vorschläge; einzeln Newsletter, Presse, … klicken | Bereits nahe One-Click: „PR-Vorschläge (alle)“ erzeugt alle Typen; prüfen ob ein Klick „Alle generieren und in Liste legen“ reicht |

**Priorität:** Höchster Nutzen: (1) Presse-Paket kopieren (Betreff + Text in einem Format), (2) klare Absenden-Anleitung (ein Satz im UI), (3) optional Kernbotschaften-Kopieren-Button in mök2/Admin.

---

## 4. Muster / Templates – ein Standard pro Dokumenttyp

| Dokumenttyp | Template / Generator | Quelle der Daten |
|-------------|----------------------|-------------------|
| Presseaussendung | generatePresseaussendungContent(event); Vorlage PRESSEARBEIT-STANDARD | Event (Titel, Datum, Ort) + Stammdaten (Kontakt, Galerie) + tenantConfig (Werbelinie); 1b = + Sweet-Spot |
| Newsletter | generateNewsletterContent(event) | Wie Presse; gleiche Stammdaten, gleiche Werbelinie |
| Social (Instagram, Facebook, WhatsApp) | generateSocialMediaContent(event) | Wie Presse; Kurzfassung, Link |
| Plakat / Flyer / Event-Flyer | generatePlakatContent, Flyer-Content | Event + Stammdaten + Werbelinie; QR/Link automatisch (docs/OEFFENTLICHKEITSARBEIT-QR-UND-LINK-REGEL) |
| Prospekt / Werbeunterlagen | WerbeunterlagenPage, MarketingOek2Page (Sektion 7) | tenantConfig (Slogans, Zielgruppe, Botschaften); keine zweite Text-Quelle |
| Medienspiegel | Liste aus MEDIENVERTEILER-EROEFFNUNG + vordefinierte AT/DE-Medien | Eine Liste pro Kontext; Auswahl → „E-Mail-Adressen kopieren“ |

**Regel:** Jeder neue „Dokumenttyp“ oder neue Kanal nutzt **dasselbe** Datenmodell (Event, Stammdaten, tenantConfig) und **eine** Generatoren-Funktion bzw. ein Template. Kein eigener Text-Block für „Presse mal anders“ oder „Social mal anders“.

**Bereits umgesetzt (Referenz):** docs/PRESSEARBEIT-STANDARD.md – ein Ablauf, eine Vorlage, ein Verteiler. docs/ABLAUF-DOKUMENT-OEFFENTLICHKEITSARBEIT.md – ein Flow (Generierung → Anlegen → Zwischenlagern → Absenden). .cursor/rules/ein-standard-problem.mdc – Tabelle „Dokument aus Admin öffnen“ = openDocumentInApp.

---

## 5. Nichts zweimal machen – Doppelungen vermeiden

| Was oft doppelt vorkommt | Eine Lösung |
|--------------------------|-------------|
| Werbelinie in Doku und in Code | Nur in tenantConfig; mök2 und alle Generatoren **importieren** oder lesen daraus |
| Presse-Verteiler („neue Liste für nächste Aktion“) | Immer MEDIENVERTEILER-EROEFFNUNG.md + Admin Medienspiegel; eine Liste, pflegen statt neu anlegen |
| Stammdaten für „Presse-Kontakt“ vs. „Galerie-Kontakt“ | Eine Stammdaten-Quelle; Presse/Newsletter/Flyer alle daraus |
| Mehrere „Copy“-Buttons für fast gleichen Inhalt | Ein Button pro logischer Einheit (z. B. „Presse-Paket“, „Kernbotschaften“); dahinter eine Funktion, die aus einer Quelle füllt |
| PR-Dokument-HTML (afterprint, goBack, cleanup) pro Typ anders | Gemeinsame Shell/Hilfsfunktion (z. B. buildPrDocumentShell) – siehe ABLAUF-DOKUMENT-OEFFENTLICHKEIT-VERBESSERUNGSPOTENZIALE §6.1 |
| „Story“ 1a (Human Interest) vs. 1b (Produkt/Sweet-Spot) | Beide Varianten aus **einer** Stelle (z. B. Texte in ScreenshotExportAdmin oder tenantConfig); nur eine Auswahl (presseStoryVariante), kein zweiter Text-Block |

**Checkliste bei neuen Promotion-Inhalten:** Wird diese Information schon woanders gepflegt? Wenn ja → verlinken oder aus Quelle lesen. Wenn nein → **eine** Stelle festlegen (tenantConfig, mök2, docs, Stammdaten) und alle anderen darauf verweisen.

---

## 6. Automatisierung – was ohne manuelle Entscheidung laufen kann

| Bereich | Automatik (bereits oder Ziel) |
|---------|-------------------------------|
| **Werbelinie auf allen Materialien** | Bereits: Generatoren und Werbeunterlagen lesen aus tenantConfig; kein manuelles Einfügen nötig |
| **QR/Link auf Plakaten, Flyern, Newsletter** | Bereits: Regel OEFFENTLICHKEITSARBEIT-QR-UND-LINK-REGEL – Plakate/Flyer/Newsletter automatisch mit User-/Vereins-QR; keine Extra-Eingabe |
| **Weiterverbreiten-Block** | Bereits: Presse/Newsletter/Flyer enthalten „WEITERVERBREITEN“ + Link – automatisch eingebaut |
| **Betreff Presse** | Format fest: „Presseinformation – [Anlass], [Datum], [Ort]“ – kann beim „Presse-Paket kopieren“ automatisch gesetzt werden (Variablen aus Event) |
| **Speichern nach Bearbeitung** | Bereits: Ein Schreibweg documentsStorage; „Gespeichert“-Bestätigung; Speichern-Button im geöffneten Presse-Fenster (postMessage) |
| **Kontext (K2/ök2/VK2)** | Bereits: Stammdaten, Dokumente, Medienspiegel pro Kontext; Generatoren nutzen aktuellen Kontext – keine doppelte Auswahl |

**Nicht automatisieren (bewusste Entscheidung):** E-Mail-Versand aus der App (Skalierung, keine direkte Kundenbindung). Absenden = Nutzer kopiert/druckt und versendet selbst. Automatisierung endet bei „fertiges Paket in Zwischenablage“ bzw. „PDF drucken“.

---

## 7. Konkrete nächste Schritte (priorisiert)

| Nr. | Maßnahme | Kategorie | Aufwand (grob) |
|-----|----------|-----------|----------------|
| 1 | **Presse-Paket kopieren:** Ein Klick liefert Betreff (Format aus PRESSEARBEIT-STANDARD) + Fließtext in Zwischenablage (z. B. „Betreff: … \n\n [Text]“ oder zwei Blöcke nacheinander) | One-Click | Gering |
| 2 | **Absenden-Anleitung im UI:** Ein Satz bei Presse „In Zwischenablage“: „Tipp: E-Mail-Adressen für BCC unter Eventplanung → Medienspiegel“ (oder Link) | One-Click / Führung | Gering |
| 3 | **Prüfen: Alle PR-Generatoren lesen aus tenantConfig + Stammdaten** (kein Hardcoding von Slogan/Zielgruppe) | Eine Quelle | Gering |
| 4 | **Optional: Button „Kernbotschaften kopieren“** (mök2 Sektion 7 oder Admin): Slogan 1+2, Zielgruppe, Sweet-Spot – eine Reihenfolge, ein Klick | One-Click | Gering |
| 5 | **Gemeinsame Shell für PR-Dokument-HTML** (buildPrDocumentShell o. ä.) – afterprint, goBack, cleanup einmal, alle Typen nutzen | Muster | Mittel |
| 6 | **Doku: Diese Strategie in 00-INDEX und STRUKTUR-HANDELN-QUELLEN verlinken**; bei neuen Promotion-Features hier prüfen | Reproduzierbarkeit | Gering |

**Prüfung PR-Generatoren (ohne Code zu ändern):** generatePresseaussendungContent nutzt lokale Konstanten (STORY_1B_PRODUKT_PRESSE, EROEFFNUNG_LOUNGE_TEXT) – inhaltlich mit Sweet-Spot/Werbelinie abgestimmt. Optional später: Texte aus tenantConfig oder zentraler Texte-Quelle lesen; keine Änderung in dieser Umsetzung, um keine bestehenden Funktionen zu stören.

---

## 8. Verknüpfung mit bestehenden Regeln und Doku

| Thema | Wo nachlesen |
|-------|---------------|
| Ein Standard pro Problem | .cursor/rules/ein-standard-problem.mdc (Tabelle: Dokument öffnen, Veröffentlichen, etc.) |
| Ablauf Dokument Öffentlichkeitsarbeit | docs/ABLAUF-DOKUMENT-OEFFENTLICHKEIT-ARBEIT.md |
| Verbesserungspotenziale (Schreibweg, Speichern, Bestätigung) | docs/ABLAUF-DOKUMENT-OEFFENTLICHKEIT-VERBESSERUNGSPOTENZIALE.md |
| Presse-Standard | docs/PRESSEARBEIT-STANDARD.md |
| Werbelinie & Strategie | docs/MARKETING-EROEFFNUNG-K2-OEK2.md; mök2 Sektion 7 |
| Sweet-Spot | docs/POSITIONIERUNG-SWEET-SPOT-MARKT.md; tenantConfig PRODUCT_POSITIONING_SWEET_SPOT |
| QR/Link-Regel | docs/OEFFENTLICHKEITSARBEIT-QR-UND-LINK-REGEL.md |

---

## 9. Kurzfassung

- **Eine Quelle:** Werbelinie, Sweet-Spot, Zielgruppe, Stammdaten, Verteiler – jeweils **ein** Ort; alle anderen lesen oder verlinken.
- **One-Click:** Presse-Paket (Betreff + Text) kopieren; optional Kernbotschaften kopieren; klare Absenden-Anleitung im UI.
- **Muster:** Ein Template pro Dokumenttyp; alle Generatoren aus Event + Stammdaten + tenantConfig; gemeinsame PR-Dokument-Shell wo sinnvoll.
- **Nichts zweimal:** Keine doppelte Pflege von Texten oder Listen; bei neuem Inhalt zuerst prüfen: gibt es die Quelle schon?

Damit gilt das Sportwagenprinzip im gesamten Promotion-Prozess – von der Botschaft bis zum Absenden (Kopieren/Drucken + Versand durch den Nutzer).
