# K2 Markt – Analyse: Grundlage Presse, Öffentlichkeitsarbeit & Eventplanung (10.03.26)

**Frage:** Haben wir bereits die Grundlage für das K2-Markt-Projekt – speziell Presse, **Öffentlichkeitsarbeit und Eventplanung**?

**Kurzantwort:** **Ja.** Die **zwei zentralen Bereiche** im Admin sind die Grundlage:

1. **Presse & Medien** (Tab `presse`) – Medienkit, Presse-Vorlage, zwei Story-Texte, Medienspiegel.
2. **Öffentlichkeitsarbeit & Eventplanung** (Tab `eventplan`) – **Veranstaltungen** (Events anlegen, Termine) und **Flyer & Werbematerial** (Einladungen, Flyer, Presse, Social Media, PR-Vorschläge, Dokumente pro Event). Kein separates „Modal“, sondern ein eigener Admin-Tab mit zwei Unterbereichen (Events | Öffentlichkeitsarbeit).

Beide sind aus K2 direkt erreichbar (APf + mök2). Was noch fehlt, ist die **automatisierte Ableitung** (Agenten aus Produkt-Moment → Formate); die **Formate und Quellen** sind da.

---

## 1. K2-Markt-Architektur (Erinnerung)

Laut **K2-MARKT-VISION-ARCHITEKTUR.md**:

- **Quelle:** mök2, Kampagne, Stammdaten, Regeln
- **Produkt-Moment:** eine Wahrheit pro Kampagne/Event
- **Agenten:** leiten daraus Formate ab (Flyer, E-Mail, **Presse**, …)
- **Tor:** Definition of Done pro Format, eine Freigabe
- **Anbindung:** „mök2 = Quelle für Texte und Botschaften“, „Kommunikations-Vorlagen, Fertige Beispiele = Vorlage für Ausgabeformate“

---

## 2. Was bereits als Grundlage existiert

### 2.1 Quelle: Texte und Botschaften (mök2)

| Was | Wo | Rolle für K2 Markt |
|-----|-----|---------------------|
| Presse-Vorlage (Kurz) | mök2 → Sichtbarkeit & Werbung | Vorlage für Presse-Format |
| **Zwei Story-Texte (1a Human Interest, 1b Produkt-Story)** | mök2 gleiche Sektion + Admin Presse & Medien | **Ausgangspunkt Presse** – eine Quelle, zwei Varianten |
| Leitvision K2 Markt | mök2 → Leitvision K2 Markt | Ausrichtung Kreativprozess |
| USPs, Lizenzen, Werbeunterlagen | mök2 (weitere Sektionen) | Quelle für Botschaften |

→ **mök2 = Quelle** ist umgesetzt; Presse-Stories sind explizit als „Ausgangspunkt“ benannt.

### 2.2 Ausgabe-Format: Presse

| Was | Wo | Rolle für K2 Markt |
|-----|-----|---------------------|
| Medienkit | Admin Tab **Presse & Medien** (`/admin?tab=presse`) | Bereitstellung für Presse |
| Presse-Vorlage (Datum/Anlass/Ort) | ebd. | Füllbare Vorlage = ein Format |
| Beide Story-Texte (1a/1b) kopierbar | ebd. | Gleicher Inhalt wie mök2 – **eine Quelle, in der App nutzbar** |
| Medienspiegel | ebd. | Nachverfolgung / Kanal |

→ **Presse** ist als **nutzbares Format** da; Kontext K2 oder ök2 je nach Aufruf. Einstieg „Presse & Medien (K2)“ von APf/mök2 = direkt in K2 testen.

### 2.3 Bereich: Öffentlichkeitsarbeit & Eventplanung (Admin Tab `eventplan`)

**Das ist der zweite zentrale Bereich** – kein separates Modal, sondern ein eigener Admin-Tab mit Überschrift „📢 Öffentlichkeitsarbeit & Eventplanung“ und zwei Unterbereichen:

| Unterbereich | Inhalt | Rolle für K2 Markt |
|--------------|--------|---------------------|
| **Veranstaltungen** | Events anlegen, bearbeiten, Termine; Event-Typ (Vernissage, Galerieeröffnung, Öffentlichkeitsarbeit, …) | Eventplanung = Grundlage für alle Werbe-Dokumente |
| **Flyer & Werbematerial** (SubTab `eventplan=öffentlichkeitsarbeit`) | Pro Event: Flyer, Presse-Einladung, PR-Vorschläge (Newsletter, Plakat, Presse, Social Media), eigene Dokumente – aus Stammdaten erzeugt, ansehen & drucken | **Öffentlichkeitsarbeit** = Marktauftritt, fertige Formate pro Event |

**URL:** `/admin?tab=eventplan` (landet im Bereich; dann wählbar: Veranstaltungen | Flyer & Werbematerial). Direkt in Öffentlichkeitsarbeit: `/admin?tab=eventplan&eventplan=öffentlichkeitsarbeit`.

→ **Eventplanung + Öffentlichkeitsarbeit** = eine zusammengehörige Grundlage für K2 Markt (Events als „Rubriken“, darunter alle Werbe-Werkzeuge).

### 2.4 Kreativ-Schicht (K2MarktSchichtPage)

| Was | Wo | Rolle |
|-----|-----|--------|
| Quellen | mök2-Ideen, Kampagne (Dropdown) | Eingabe für Produkt-Moment |
| Erzeugen | „Erzeugen“ → Moment + Flyer-Entwurf | Erster Agent (Flyer) |
| **Ausgabe (rechte Seite)** | **Links: Presse, Markt (Öffentlichkeitsarbeit), Eventplan** | Verweis auf genau die Admin-Tabs oben |

→ Die Schicht nutzt **Presse** und **Öffentlichkeitsarbeit** bereits als **Ausgabe-Ziele**; die rechte Spalte „Ausgabe“ führt gezielt dorthin.

### 2.5 Einstiege zum Testen (K2)

| Einstieg | Wo | Zweck |
|----------|-----|--------|
| **Presse & Medien (K2)** | APf (PlatformStartPage) | Ein Klick → Admin Presse in K2 – testen mit echten Daten |
| **Presse … in K2 öffnen (zum Testen)** | mök2 → Sichtbarkeit & Werbung | Gleicher Tab aus mök2 |
| Presse / Markt / Eventplan | K2MarktSchichtPage (rechte Spalte) | Aus der Kreativ-Schicht in die Formate springen |

---

## 3. Lücke (laut K2-MARKT-STAND-ZIEL-NOETIG)

- **Grundlage da:** Quellen (mök2, Stories, Vorlagen), Formate (Presse, Öffentlichkeitsarbeit), Schicht mit Links, Tor für Flyer.
- **Noch nicht da:** **Automatisierte Ableitung** – z. B. „Produkt-Moment + DoD Presse → Presse-Entwurf“ durch einen Agenten; derzeit nutzt du Presse/Medien **manuell** (Vorlage ausfüllen, Stories kopieren). Das ist die gewollte **kreative/automatisierte Schicht** (KI/Agenten), die aus dem Moment **neu erzeugen**.

---

## 4. Fazit

| Frage | Antwort |
|--------|--------|
| **Grundlage für K2 Markt vorhanden?** | **Ja** – (1) **Presse & Medien** (Tab presse), (2) **Öffentlichkeitsarbeit & Eventplanung** (Tab eventplan: Veranstaltungen + Flyer & Werbematerial), mök2 als Quelle, Schicht mit Ausgabe-Links. |
| **Presse und Eventplan/Öffentlichkeitsarbeit aus K2 testbar?** | **Ja** – APf: zwei Karten (Presse, Öffentlichkeitsarbeit & Eventplanung); mök2: zwei Links. Beide öffnen den jeweiligen Admin-Bereich in K2. |
| **Passt das zur K2-Markt-Vision?** | **Ja** – mök2 = Quelle; Presse und Eventplan/Öffentlichkeitsarbeit = Ausgabeformate und -kanäle; nächster Schritt ist Ableitung aus Produkt-Moment (Agent), nicht fehlende Grundlage. |

**Verknüpfung:** K2-MARKT-VISION-ARCHITEKTUR.md (§8 Anbindung), K2-MARKT-STAND-ZIEL-NOETIG.md (Lücke §4), K2MarktSchichtPage (Ausgabe-Links).
