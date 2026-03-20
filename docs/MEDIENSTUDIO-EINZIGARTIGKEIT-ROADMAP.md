# Medienstudio – Status & Roadmap „Einzigartigkeit“

**Stand:** 20.03.26 · **Ziel (Georg):** Ein Medientool, das Medienmenschen neidisch macht – Journalist:innen sollen denken: *Warum habe ich das noch nicht?*  
**Kommunikation = Erfolgshebel** (siehe docs/PRODUKT-VISION.md, Abschnitt Medientool/KI).

---

## 1. Was ihr heute schon habt (Ist-Stand)

| Bereich | Inhalt |
|--------|--------|
| **Struktur & Prozess** | Medienstudio als Konzept: Standardablauf, ein Verteiler, Medienkit, klare Trennung *Presse & Medien* vs. *Event → Presseaussendung* (docs/MEDIENSTUDIO-K2.md, PRESSEARBEIT-STANDARD.md). |
| **Admin – Presse & Medien** | Boilerplate, Produkt-Story, persönliche Story, Einladung an Medien (ök2 testen), Presse-Vorlage – kopierbar, event-unabhängig. |
| **Admin – Events / Öffentlichkeitsarbeit** | Pro Event: Flyer, Plakat, Presseaussendung, Newsletter, Einladung, Social – **Split-Ansicht** (bearbeiten + Vorschau), Dokumente speichern/öffnen/drucken. |
| **Design-Werbelinie** | Eine CSS-Quelle (`marketingWerbelinie.ts`): Farben aus Galerie-Design, PR-Dokumente, Plakat, PDF-Erfassung für html2canvas – **Sportwagenmodus**. |
| **Verteilung** | Newsletter-Empfänger-Liste, Medienspiegel-Logik, mailto + PDF/Teilen; Weiterverbreiten-Block für Social in Texten (PRESSEARBEIT-STANDARD). |
| **Doku** | Medienverteiler (regional/überregional), Marketing-Eröffnung, Sichtbarkeit-Vorlagen. |
| **KI im Projekt** | OpenAI in **Control-Studio** / Chat-Dialog – **noch nicht** fest mit Presse/Flyer/Social-Generatoren im Medien-Tab verbunden. |

**Kurz:** Ihr seid schon über dem Niveau „Word-Vorlage + E-Mail“ – ihr habt **integrierte Kette** Event → Texte → Druck/PDF → Versand mit **einheitlicher Marke**.

---

## 2. Wo „alle anderen“ oft hängen bleiben

- Getrennte Tools: Canva, Mail, Excel-Verteiler, Dropbox für Bilder – **kein roter Faden**.
- Kein sauberer **Medienkit** pro Anlass aus **einer** Datenquelle (Stammdaten, Event, Werke).
- Pressefotos und **Bilduntertitel / Alt-Texte** werden vergessen.
- Kein **Paket für Redaktionen** (alles in einem Rutsch: Text + Bilder + Bildunterschriften + Social-Snippets).
- **Kein** schneller Sprach-/Längen-Wechsel (Presse vs. Instagram vs. Newsletter).

Genau hier kann K2 **unerreichbar wirken**, wenn ihr es konsequent zu Ende denkt.

---

## 3. Sinnvolle Erweiterungen (priorisiert)

### A) „Journalist:innen-Koffer“ (sehr hoher Wow-Faktor)

**Eine Aktion:** Export als **ordentliches Paket** (ZIP oder klar benannte Downloads):

- `Presseinfo.pdf` + `Presseinfo.txt` (OTS/Copy-Paste-freundlich)
- `Social_Instagram.txt` / `Social_Facebook.txt` (Zeichenzahl sichtbar)
- Ordner `Pressebilder/` mit **Web** (E-Mail-tauglich) + optional **Print** (höhere Auflösung, einheitlich benannt)
- `Bildlegende.txt` oder eingebettete Captions (wer, was, wo, Credit)

*Warum einzigartig:* Redaktionen bekommen das, was sie brauchen, **ohne fünf Mails**.

### B) KI **im** Medienstudio (nicht nur im Control-Studio)

**Mit eurem bestehenden API-Key (opt-in):**

- Aus **Event + Stammdaten + 1–2 Werken:** **3 Varianten** Presse-Lead (sachlich / emotional / „Sweet Spot“-Positionierung).
- **5 Interview-Leitfragen** für den Termin vor Ort.
- **Headline-Vorschläge** (max. 3, unterschiedliche Winkel).
- **Alt-Text** für das gewählte Pressebild (Barriere + SEO).

*Regeln:* Nur mit klarer Quelle (keine erfundenen Fakten), Nutzer bestätigt vor Versand – passt zu euren Datenschutz- und Qualitätsregeln.

### C) „Redaktions-Ansicht“

Kurze Checkliste **im UI**: Wer? Was? Wann? Wo? Warum relevant? Kontakt? Bild verfügbar?  
Wenn etwas fehlt → **Ampel** (nicht stilles Versenden). Das ist Profi-Pressestelle.

### D) Format-Vorschau ohne Extra-Tools

- Zeichenzahl / „passt in einen Post“ für Instagram/Facebook
- Optional: einfache **Link-Vorschau-Karte** (Titel + Beschreibung + URL), wie sie in Messengern erscheint

### E) Embargo / Sperrfrist

Ein Feld **„Embargo bis“** – automatisch in Kopfzeile der Presseinfo und in Dateinamen. Für Journalist:innen Standard, für viele Kulturakteure neu.

### F) Österreich-Spezifisch

- **OTS/APA:** Extra Absatz oder reines Textfeld im „Copy für OTS“-Format (Überschrift, Lead, Fließtext getrennt) – spart Zeit bei Agentur-Meldungen.
- Medienverteiler **pro Mandant** konfigurierbar (nicht nur K2-Eferding-Liste) – Skalierung für Lizenznehmer.

### G) Leichtes „CRM für Aussendungen“

Nach Versand: **Datum, Anlass, Medium (optional)** in einer einfachen Liste – kein Salesforce, nur **Nachweis** und Planung der nächsten Aussendung.

---

## 4. Was bewusst *nicht* der erste Schritt sein sollte

- Vollautomatischer Versand an 50 Redaktionen ohne Review (Qualität + Spam-Risiko).
- KI, die Fakten erfindet oder K2/ök2-Daten vermischt (gegen eure eisernen Regeln).

---

## 5. Nächster sinnvoller technischer Schritt (Empfehlung)

1. **Journalist:innen-Koffer (ZIP/Paket)** aus bestehendem Event + Dokumenten + Bildern – maximaler Effekt, nutzt vorhandene Daten.
2. **KI-Assistenz** nur an **einer** Stelle anbinden (z. B. „Presse-Lead aus Event generieren“) mit festem System-Prompt und Quellen-Pflicht.
3. **Redaktions-Checkliste** als kleines UI-Modul über dem Versand-Button.

---

## Verknüpfung

- Einstieg Presse: **docs/MEDIENSTUDIO-K2.md**
- Vision: **docs/PRODUKT-VISION.md** (Medientool, KI, Kommunikation)
- Standard: **docs/PRESSEARBEIT-STANDARD.md**
