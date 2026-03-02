# K2 Familie – Projekt-Zusammenfassung (zum Ausdrucken)

**Stand:** 02.03.26 · **Druck:** Diese Seite als PDF oder A4 drucken (Browser: Drucken / Als PDF speichern).

---

## Was ist K2 Familie?

**Ein tenantfähiges Familien-Tool für die offene Gesellschaft.**  
Jede „Familie“ (in welcher Form auch immer Menschen zusammenleben) = ein Mandant (Tenant). Jede Person = eine Seite mit Foto, Text, Momente. Beziehungen (Eltern, Kinder, Partner*innen, Geschwister, Wahlfamilie) = der Stammbaum. Wechselnde Partnerschaften, Schicksalsschläge, Freud und Alltag – alles hat Platz. Modern, app-tauglich, für jede Konstellation skalierbar.

**Leitlinie:** *„Wir nehmen, was zu uns passt – und machen etwas ganz Persönliches für jede einzelne Familie: originell und einzigartig.“*

---

## Grundbotschaft (moralisches Fundament)

1. **Offene Gesellschaft** – Jede Art des Zusammenlebens ist Familie.
2. **Wechselnde Partnerschaften, Schicksalsschläge, Freud und Alltag** – alles bekommt seinen Platz, ohne zu werten.
3. **Keine Ausgrenzung – in keiner Form.** Religion und Politik haben hier nichts zu suchen.
4. **Jeder respektiert den anderen so, wie er ist.**

Diese Grundbotschaft gilt für die Form der App, die Sprache und jede zukünftige KI/Agent-Kommunikation. Verbindliche Quelle: `docs/K2-FAMILIE-GRUNDBOTSCHAFT.md`.

---

## Was K2 Familie heute kann

| Bereich | Inhalt |
|--------|--------|
| **Homepage** | Pro Familie (Tenant) gestaltbar: Willkommenstext, Bild, Buttons (Stammbaum, Events, Kalender), Leitbild & Vision. |
| **Stammbaum** | Grafik (SVG) mit Generationen, Linien Eltern–Kinder und Partner; jede Person klickbar. Kacheln mit allen Personen. **Druck:** Als Plakat (A4/A3/Poster), mit oder ohne Fotos, optionaler Titel. |
| **Personen** | Pro Person: Foto, Name, Kurztext; Beziehungen (Eltern, Kinder, Partner*innen, Geschwister, Wahlfamilie) bearbeitbar; Momente (Titel, Datum, Bild, Text). |
| **Events** | Familien-Events (Treffen, Feste, Geburtstage) mit Datum und Teilnehmern aus der Personenliste. |
| **Kalender** | Events + Momente (mit Datum) nach Monat gruppiert, Links zu Event/Person. |
| **Mehrere Familien** | Jede Familie = eigener Tenant; Auswahl per Dropdown, „Neue Familie“ anlegbar. |

**Skalierung:** Für Großfamilien nutzbar (mit Fotos ca. 100–200 Personen, ohne Fotos 500+); Austausch mit anderen Tools geplant (GEDCOM). Doku: `docs/K2-FAMILIE-SKALIERUNG-GROSSFAMILIEN.md`, `docs/K2-FAMILIE-MARKT-STANDARDS.md`.

---

## Phasen (Roadmap) – Stand

- **Phase 1:** Fundament (Datenmodell, eine Familie, Speicher) ✅  
- **Phase 2:** Stammbaum-UI, Personen-Seite, Beziehungen bearbeitbar ✅  
- **Phase 3:** Momente, Events, Kalender ✅  
- **Phase 4:** Skalierung & Produkt – 4.1 Tenant pro Familie ✅, 4.2 Doku/Onboarding ✅; 4.0 Rechte & Zweige (Konzept) offen; GEDCOM-Export/Import eingeplant.

Vollständige Roadmap: `docs/K2-FAMILIE-ROADMAP.md`.

---

## Raumschiff-Anspruch

K2 Familie ist ein „Raumschiff“ – Qualitätsansprüche hoch, kein Abheben, bevor es startklar ist. Gegenseitige Kontrolle (Georg + KI), alles dokumentieren, Nachvollziehbarkeit.

---

## Technik (kurz)

- **Basis:** K2-Struktur (React, TypeScript, Multi-Tenant).  
- **Speicher:** localStorage pro Tenant (`k2-familie-{tenantId}-personen`, `-momente`, `-events`); gleiche Schutzregeln wie K2 Galerie (keine stillen Löschungen).  
- **Routen:** `/projects/k2-familie` (Homepage), `/stammbaum`, `/personen/:id`, `/events`, `/kalender`, `/uebersicht` (Leitbild & Vision).

---

*„Das Haus soll auf sicherem moralischen Fundament stehen. Das ist mein Anspruch, mein Vermächtnis.“* – Georg, 02.03.26
