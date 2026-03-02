# K2 Familie – Erste Schritte

Kurzanleitung für Nutzer:innen. Stand: 02.03.26.

---

## Was ist K2 Familie?

Ein Tool, um Zusammenleben sichtbar zu machen – Stammbaum, Personen, Beziehungen, Momente (Hochzeit, Geburt, Reise, …) und Events (Geburtstage, Treffen). Jede Form von Familie hat Platz; wechselnde Partnerschaften, Freud und Leid und Alltag.

---

## Erste Schritte

1. **Familie wählen** (oben auf der Startseite)  
   - **Standard** = die erste/aktuelle Familie.  
   - **Neue Familie** = neuer, leerer Stammbaum (z. B. für eine zweite Familie oder einen Test).  
   - Über das Dropdown wechseln Sie zwischen den angelegten Familien.

2. **Stammbaum**  
   - Liste aller Personen.  
   - **Person hinzufügen** → neue Person anlegen.  
   - Klick auf eine Person → ihre **Personen-Seite**.

3. **Personen-Seite**  
   - **Name & Kurztext** bearbeiten, optional **Foto**.  
   - **Beziehungen:** Eltern, Kinder, Partner*innen, Geschwister, Wahlfamilie – per „+ Hinzufügen“ und „✕“ pflegen. Beidseitig gespeichert (z. B. Eltern ↔ Kinder).  
   - **Meine Momente:** Hochzeit, Geburt, Umzug, Reise, Abschied, Neuanfang – Titel, Datum, optional Bild und Text. Hinzufügen, Bearbeiten, Löschen.

4. **Events** (Geburtstage, Treffen, Feste)  
   - Titel, Datum, **Teilnehmer** (aus der Familie auswählen), optional Notiz.  
   - Liste nach Datum; Hinzufügen, Bearbeiten, Löschen.

5. **Kalender & Übersicht**  
   - Alle Events und Momente mit Datum, nach Monat gruppiert.  
   - Links zu Events bzw. zur Personen-Seite.

---

## Wo was liegt

| Bereich        | Inhalt                                      |
|----------------|---------------------------------------------|
| **Start**      | Vision, Leitbild, Erste Schritte, Links     |
| **Stammbaum**  | Alle Personen, Person hinzufügen, Familie wechseln |
| **Events**     | Geburtstage, Treffen, Feste                 |
| **Kalender**   | Übersicht nach Datum                        |
| **Personen-Seite** | Pro Person: Profil, Beziehungen, Momente |

---

## Technik (für Team)

- **Speicher:** localStorage, pro Familie (Tenant) getrennt: `k2-familie-{tenantId}-personen`, `-momente`, `-events`.  
- **Tenant-Liste:** `k2-familie-tenant-list`; aktueller Tenant: sessionStorage `k2-familie-current-tenant`.  
- **Roadmap & Architektur:** `docs/K2-FAMILIE-ROADMAP.md`, `docs/K2-FAMILIE-RECHTE-ZWEIGE.md`.

---

*Projekt gestartet 01.03.26. Phase 1–4.1 umgesetzt.*
