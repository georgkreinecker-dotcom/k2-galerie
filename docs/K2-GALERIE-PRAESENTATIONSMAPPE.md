# K2 Galerie – Prospekt

**Stand:** März 2026 · Sportwagen-Standard (eine Quelle, eine Schicht, eine Regel)

Dieser Prospekt fasst funktionale und technische Informationen für Präsentationen, Pitches und Partner zusammen. Quelle für alle Außendarstellungen.

---

## 1. Titel / Deckblatt

**K2 Galerie**  
*Multifunktionale Arbeitsplattform für Künstler:innen und Galerien*

- Galerie, Admin, Kassa, Events, Presse und Werbeunterlagen aus einer Hand
- Multi-Tenant: K2 (Galerie), ök2 (Demo), VK2 (Vereinsplattform)
- Windows, Android, macOS, iOS – Browser und PWA
- Lizenzmodell: Basic, Pro, Pro+, Kunstvereine (VK2)

---

## 2. Kurzfassung (Elevator Pitch)

Die **K2 Galerie** ist keine reine Galerie-App, sondern eine **Arbeitsplattform**: Werke verwalten, Galerie öffentlich zeigen, Verkauf vor Ort (Kasse), Kassabuch, Events planen, Presse und Werbematerial (Flyer, Newsletter, Plakat, Social) aus denselben Stammdaten – einheitlich, sofort nutzbar. Ein Klick zum Ziel. Für Künstler:innen und Kunstvereine; skalierbar, ohne direkten Kundenkontakt (Lizenz, Bestätigung, Abrechnung über System). Technisch: Sportwagen-Standard – eine Quelle pro Thema, klare Schichten, Kundendaten geschützt, 38 Tests, Stand und QR zuverlässig.

---

## 3. Funktionen (Überblick)

| Bereich | Inhalt |
|--------|--------|
| **Galerie** | Werke mit Foto, Titel, Preis, Kategorie; Vorschau; Veröffentlichen; gleicher Stand auf allen Geräten (Mac, iPad, Handy). |
| **Admin** | Werke hinzufügen/bearbeiten, Aussehen & Design, Einstellungen (Stammdaten, Backup, Lizenz), Schritt-für-Schritt-Assistent, Kassa/Lager/Listen/Werkkatalog, Events & Ausstellungen, Presse & Medien. |
| **Kassa & Kassabuch** | Verkauf erfassen (Shop oder „Als Kasse öffnen“); ab Pro: Kassabuch (Eingänge); ab Pro+: Kassausgänge, Bar, Beleg (QR/Foto), PDF-Export. Basic: keine Kassa. |
| **Events & Ausstellungen** | Events anlegen, Einladungen, Flyer, Presseaussendung pro Event, Social Media – aus Stammdaten und Event-Daten. |
| **Presse & Medien** | Medienkit (Kontakt, Galerie, Kurzporträt), Presse-Vorlage, Einladung an Journalist:innen; Abgrenzung zu Event-spezifischer Presse. |
| **Werbeunterlagen** | Newsletter, Plakat, Flyer, PR-Vorschläge, QR-Plakat – aus einer Quelle, Galerie-Design, druckbar. |
| **Lizenzen** | Basic (15 €/Monat), Pro (35 €/Monat), Pro+ (45 €/Monat), VK2 (Kunstvereine, ab 10 Mitgliedern kostenfrei). Stripe-Checkout, Bestätigung druckbar, keine Kartendaten in der App. |
| **Multi-Tenant** | **K2** = echte Galerie (Stammdaten, Werke). **ök2** = öffentliche Demo (Musterwerke, Mustertexte). **VK2** = Vereinsplattform (Mitglieder, Vereinsgalerie, eigene Stammdaten). Keine Vermischung. |

---

## 4. Technik (Sportwagen-Standard)

| Thema | Standard |
|-------|----------|
| **Stack** | React, TypeScript, Vite, Tailwind CSS; Supabase (Auth, KV, Lizenzen/Zahlungen); Vercel (Hosting, Serverless); Stripe (Checkout, Webhook). |
| **Architektur** | **Eine Quelle:** Tenant-Context (K2 \| ök2 \| VK2). **Eine Schicht pro Typ:** Artworks, Stammdaten, Events, Dokumente – Lesen/Schreiben nur über diese Schichten. **Sync:** Eine Regel (SYNC-REGEL.md), eine Merge-Funktion. **API:** Ein API-Client (Retry, Timeout). **Reload:** safeReload (iframe-Check zentral). |
| **Deployment** | Build → Vercel; gallery-data.json für öffentliche Galerie; build-info.json + Stand-Badge; QR mit Server-Stand + Cache-Bust (stand-qr-niemals-zurueck). |
| **Daten** | localStorage pro Mandant (k2-artworks, k2-stammdaten-*, k2-events, k2-documents; ök2: k2-oeffentlich-*; VK2: k2-vk2-*). Kein automatisches Löschen; Schichten schreiben nur bei User-Aktion. |

---

## 5. Sicherheit & Qualität

- **Kundendaten:** Kein automatisches Löschen oder Überschreiben. Geschützte Keys (k2-artworks, k2-stammdaten-*, k2-vk2-stammdaten, …) nur bei expliziter User-Aktion ändern. Regel: niemals-kundendaten-loeschen.
- **Datentrennung:** K2, ök2, VK2 strikt getrennt (Keys, Kontext). Checkliste: docs/K2-OEK2-DATENTRENNUNG.md.
- **Stand & QR:** Server-Stand + Cache-Bust; keine alte Version nach Scan. Regel: stand-qr-niemals-zurueck.
- **Tests:** 38 Tests (Datentrennung, Merge, Persistenz, Bild-Upload, Kundendaten-Schutz). QS vor Commit: test + build. Kein Deployment mit roten Tests.
- **Doku & Prozess:** Eine Stelle pro Thema; GELOESTE-BUGS, CRASH-BEREITS-GEPRUEFT; Regeln in .cursor/rules.

---

## 6. Plattformen

| Plattform | Browser | PWA |
|-----------|---------|-----|
| Windows | ✅ Edge, Chrome, Firefox | ✅ „App installieren“ |
| Android | ✅ Chrome, Firefox | ✅ „Zum Home-Bildschirm“ |
| macOS | ✅ Safari, Chrome, Firefox | ✅ |
| iOS | ✅ Safari, Chrome | ✅ „Zum Home-Bildschirm“ |

Web-App plattformneutral; keine produktive Funktion setzt einen Mac voraus. Quelle: docs/PLATTFORM-UNTERSTUETZUNG.md.

---

## 7. Lizenzen & Preise (Kurz)

| Stufe | Preis | Umfang |
|-------|-------|--------|
| Basic | 15 €/Monat | Galerie, Werke, Design; keine Kassa. |
| Pro | 35 €/Monat | + Kassa (Verkauf erfassen), Kassabuch nur Eingänge. |
| Pro+ | 45 €/Monat | + Volles Kassabuch (Eingänge + Ausgänge), gesamter Marketingbereich (Events, Flyer, Presse, Social). |
| VK2 (Kunstvereine) | ab 10 Mitgliedern kostenfrei | Vereinsplattform, Mitglieder, Vereinsgalerie; Lizenzmitglied 50 % Lizenz. |

Quelle: src/config/licencePricing.ts. Kein direkter Kundenkontakt; Bestätigung und Abrechnung über System (Stripe, Druck).

---

## 8. Erweiterte Präsentationsmappe

Zur **erweiterten Präsentationsmappe** gehören:

1. **Dieser Prospekt** (eine Seite, in der App: mök2 → K2 Galerie Prospekt / Präsentationsmappe, „Als PDF drucken“).
2. **Benutzerhandbuch** – für Lizenznehmer:innen, Piloten und Vereine. Inhalt: Kurzanleitung (alle Bereiche auf einen Blick), detailliertes Inhaltsverzeichnis, 7 Kapitel (Erste Schritte, Galerie gestalten, Admin im Überblick, Häufige Fragen, Vereinsplattform VK2, Demo und Lizenz ök2, Eventplanung & Werbung). Zum Nachschlagen, in der App lesbar und druckbar. **Quelle:** `public/benutzer-handbuch/*.md`. **In der App:** Route `/benutzer-handbuch` bzw. Projekte → K2 Galerie → Benutzerhandbuch.

Für Pitches und Partner: Prospekt (1 Seite) beilegen oder zeigen; auf Wunsch zusätzlich Link zum Handbuch oder Handbuch als PDF mitgeben.

---

## 9. Referenzen (Doku)

| Thema | Dokument |
|-------|----------|
| Produkt-Standard (Sportwagen) | docs/PRODUKT-STANDARD-NACH-SPORTWAGEN.md |
| Sportwagen-Roadmap | docs/SPORTWAGEN-ROADMAP.md |
| Produkt-Vision | docs/PRODUKT-VISION.md |
| Sync-Regel | docs/SYNC-REGEL.md |
| K2/ök2-Datentrennung | docs/K2-OEK2-DATENTRENNUNG.md |
| Stripe/Lizenzen Go-Live | docs/STRIPE-LIZENZEN-GO-LIVE.md |
| Plattform-Unterstützung | docs/PLATTFORM-UNTERSTUETZUNG.md |
| Docs-Index | docs/00-INDEX.md |
| Benutzerhandbuch (Quelle) | public/benutzer-handbuch/00-INDEX.md, 01–07 |

---

**Ende des Prospekts.**
Druck: In der App unter **mök2 → K2 Galerie Prospekt** „Als PDF drucken“ wählen.
