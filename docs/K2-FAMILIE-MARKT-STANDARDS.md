# K2 Familie – Markt und Standards (Rad nicht zweimal erfinden)

**Stand:** 02.03.26  
**Frage:** Gibt es das, was wir machen, schon am Markt? Erfinden wir das Rad neu?

---

## Kurzfassung

**Es gibt am Markt bereits viel:** Stammbaum-Software für große Familien, einheitliche Austauschformate (GEDCOM), kostenlose APIs (FamilySearch). **Wir erfinden das Rad nicht neu**, wenn wir:

- **Standards nutzen:** GEDCOM-Export/Import für Personen und Beziehungen → Anschluss an Legacy, MacStammbaum, FamilySearch, Infinite Family Tree usw.
- **K2 Familie klar positionieren:** Nicht „noch eine Ahnenforschung mit Milliarden Records“, sondern **eine Familie, ein Raum** (Tenant), mit Momente, Events, Leitbild, Druckvorlagen – das Zusammenspiel und die Einfachheit sind unser Fokus.

---

## Was es schon gibt

### Standards (Datenformat)

| Standard | Beschreibung | Nutzen für uns |
|----------|--------------|----------------|
| **GEDCOM 7.0** | Etabliertes Austauschformat für Genealogie; in einer Datei, inkl. Multimedia (GedZip). | Export/Import: K2-Daten in andere Tools, Daten aus anderen Tools in K2. |
| **GEDCOM X** | FamilySearch-Modell, JSON/XML; moderne Erweiterung. | Option für API-Anbindung oder erweiterte Exporte. |

→ **Empfehlung:** GEDCOM-Export und -Import (mind. Personen + Beziehungen) einplanen. Dann nutzen wir den bestehenden Standard statt ein eigenes Format zu pflegen.

### Software für große Stammbäume

| Produkt | Typ | Besonderheit |
|---------|-----|--------------|
| **Legacy Family Tree 10** | Desktop (Windows), kostenlos | Große Datenbanken, GEDCOM, für hunderte Personen geeignet. |
| **Infinite Family Tree Explorer** | Mac-App | Speziell für **sehr große** Bäume (hunderte/tausende Personen), kompakte Darstellung, GEDCOM-Import. |
| **MacStammbaum / MacFamilyTree** | Mac, kostenpflichtig | Umfangreiche Genealogie, 3D, CloudTree, FamilySearch-Anbindung. |
| **FamilySearch Stammbaum** | App (iOS/Android), kostenlos | Sehr großer Dienst, Milliarden Records, Fotos, Geschichten; GEDCOM/Kollaboration. |
| **FamilySearch API** | API, kostenlos (nach Freischaltung) | Zugriff auf Bäume, historische Aufzeichnungen, OAuth; für Integration in eigene Apps. |

→ **Fazit:** Große Familien und große Bäume sind am Markt gut abgedeckt. Wir müssen nicht „noch ein Legacy Family Tree“ bauen.

---

## Wo K2 Familie anders liegt

**Leitlinie (Georg):** *„Wir nehmen, was zu uns passt – und machen etwas ganz Persönliches für jede einzelne Familie: originell und einzigartig.“*

K2 Familie ist **nicht** primär Ahnenforschung mit Milliarden Datensätzen, sondern:

- **Eine Familie = ein Tenant:** Klar abgegrenzt, eigene Inhalte (Personen, Momente, Events, Leitbild) – **jede Familie ihr eigener, persönlicher Raum.**
- **Originell und einzigartig:** Texte, Bilder, Momente, Leitbild pro Familie frei gestaltbar → kein Einheitslook, sondern das, was zu dieser Familie passt.
- **Momente + Events + Kalender:** Lebensmomente, Feste, Geburtstage – gebündelt und druckbar.
- **Leitbild, Grundbotschaft, Vermächtnis:** Inhaltliche Ausrichtung (keine Ausgrenzung, Respekt) und Nutzung als „Raumschiff“ für die Familie.
- **Einfache Bedienung, eine Aufgabe = ein Klick:** Zielgruppe auch Nicht-Genealogen.

Das **Rad, das wir nicht neu erfinden**, ist das **Datenformat und der Austausch**: GEDCOM (und ggf. GEDCOM X) nutzen. Das **Rad, das wir bewusst bauen**, ist das **persönliche, originelle** Zusammenspiel aus Stammbaum + Momente + Events + Leitbild – für jede Familie einzigartig.

---

## Konkrete Empfehlung

1. **GEDCOM-Export/Import** in die Roadmap (Phase „Skalierung“ oder eigener kleiner Schritt):
   - **Export:** Personen (Name, ggf. Geburts-/Todesdatum wenn wir das später abbilden) + Beziehungen (Eltern, Kinder, Partner) → GEDCOM-Datei.
   - **Import:** GEDCOM-Datei lesen → Personen und Beziehungen in K2 übernehmen (Tenant wählen, Konfliktbehandlung definieren).
   - Damit können Nutzer:innen bestehende Stammbäume aus Legacy, MacStammbaum, FamilySearch usw. **nach K2 holen** und K2-Daten **in diese Tools geben** – wir erfinden kein eigenes Weltformat.

2. **Kein Zwang zu FamilySearch-API** für die erste Version: Eigenständig nutzbar bleiben; API später optional (z. B. „Aus FamilySearch übernehmen“).

3. **Doku:** Diese Datei + Verweis in K2-FAMILIE-ROADMAP.md („Austausch: GEDCOM nutzen, nicht neu erfinden“).

---

## Quellen (Auswahl)

- GEDCOM 7: [gedcom.io](https://gedcom.io/)  
- GEDCOM X (FamilySearch): [developers.familysearch.org – GEDCOM X](https://developers.familysearch.org/main/docs/gedcom-x)  
- FamilySearch API: [developers.familysearch.org](https://developers.familysearch.org/)  
- Legacy Family Tree: [legacyfamilytree.com](https://legacyfamilytree.com/)  
- Infinite Family Tree Explorer: [arkluz.com](https://arkluz.com/)
