# K2 Markt – Produkt-Moment (Modell)

**Stand:** 09.03.26  
**Zweck:** Die **eine** strukturierte Quelle pro „Sache, die wir sagen“ (Kampagne, Event, Ansprache). Alle Formate (Flyer, E-Mail, Presse, …) leiten daraus ab – keine zweite Wahrheit.

---

## 1. Was ein Produkt-Moment ist

**Ein** strukturierter Kern pro Aussage. Enthält alles, was alle Ausgabeformate brauchen. Wird **einmal** gepflegt (oder aus mök2, Kampagne, Stammdaten gespeist). Agenten **lesen** ihn; sie **erfinden** nicht neu.

---

## 2. Felder (Vorschlag – Phase 1)

| Feld | Beschreibung | Beispiel / Quelle |
|------|--------------|-------------------|
| **id** | Eindeutige Kennung (z. B. Kampagne- oder Event-ID) | `kampagne-xyz`, `event-2026-03` |
| **titel** | Kurzer Titel der Aussage / Kampagne | „Galerie eröffnet“, „Frühjahrsausstellung“ |
| **botschaft** | Kernbotschaft (1–3 Sätze) | Was soll ankommen? |
| **zielgruppe** | An wen richtet sich die Aussage? | Besucher, Presse, Kunden, … |
| **kontakt** | Ansprechpartner, E-Mail, Telefon | Aus Stammdaten oder fest pro Moment |
| **links** | Relevante URLs (Galerie, Anmeldung, …) | 1–3 Links |
| **medien** | Bilder, Logo, evtl. Video (Referenzen) | Pfade oder IDs – keine Duplikate |
| **kernargumente** | 2–5 Stichpunkte / Argumente | USPs, Gründe, Fakten |
| **gültigVon / gültigBis** | Optional: Zeitraum der Gültigkeit | Für Events, Aktionen |

**Quellen:** mök2-Texte, Kampagne, Stammdaten (Galerie, Martina/Georg) – beim Anlegen eines Moments werden Felder daraus befüllt, dann **eine** Quelle.

---

## 3. Was noch offen ist (Phase 1)

- **Speicherort:** Wo leben Produkt-Momente? (z. B. JSON in Repo, Supabase-Tabelle, Datei in k2-markt – nach Sportwagenmodus: bestehende Infrastruktur nutzen.)
- **Definition of Done** pro erstes Format (z. B. Flyer): Was muss im Entwurf enthalten sein? (Text, Kontakt, QR, kein Platzhalter, …) → eigenes Doc oder Abschnitt hier.

---

## 4. Nächster Schritt

DoD für **ein** Format (z. B. Flyer) festlegen – dann kann der erste Agent (Phase 2) darauf aufbauen.

---

*Verknüpfung: [Vision und Architektur](K2-MARKT-VISION-ARCHITEKTUR.md) §5 Säule 1, [Für die Planer](K2-MARKT-FUER-PLANER.md) Phase 1.*
