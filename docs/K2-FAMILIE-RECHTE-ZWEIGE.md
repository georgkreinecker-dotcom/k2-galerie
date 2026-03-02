# K2 Familie – Organisches Wachstum & Rechte pro Zweig

**Stand:** 02.03.26  
**Zweck:** Konzept, wie eine Familie wachsen kann und wer in welchem „Zweig“ schreiben/löschen darf. **Wir arbeiten an der Architektur – der Baumeister (konkrete Umsetzung) kommt später.** Erst Struktur und Entscheidungen, dann bauen.

---

## Ausgangsfrage

- **Organisches Wachstum:** Die Familie wird größer – neue Personen, neue Partnerschaften, neue Haushalte. Der Stammbaum wächst.
- **Rechte:** Wer darf in welchem Teil des Baums **Personen anlegen, bearbeiten, löschen**? Nicht jeder soll alles können; ein „Zweig“ soll von bestimmten Menschen verwaltet werden können.

---

## Was ist ein „Zweig“?

Drei mögliche Definitionen (eine davon wählen oder kombinieren):

| Variante | Bedeutung | Beispiel |
|----------|-----------|----------|
| **A – Abstammung** | Eine Person + alle ihre Nachkommen (Kinder, Enkel, …) | „Zweig Georg“ = Georg + seine Kinder + deren Kinder |
| **B – Haushalt / Einheit** | Menschen, die sich als eine Einheit verstehen (z. B. Paar + Kinder, Wahlfamilie) | Ein Haushalt = ein Zweig, Verwalter z. B. eine Person daraus |
| **C – Verwalteter Bereich** | Beliebig: „Diese Gruppe von Personen wird von Person X verwaltet.“ | Explizit: „Martina verwaltet diese 5 Personen“ |

**Empfehlung für den Start:** C ist am flexibelsten (passt zu jeder Familienform). A und B können später als **Regeln** auf C aufsetzen (z. B. „Zweig = alle Nachkommen von X“ und dafür einen Verwalter festlegen).

---

## Drei Lösungsrichtungen für Rechte

### Option 1: Ein Tenant pro Zweig

- **Idee:** Jeder „Zweig“ = eigener Tenant (eigener Speicher, eigene Einladung). Wer Zugang zum Tenant hat, kann in diesem Zweig schreiben/löschen.
- **Wachstum:** Neuer Zweig = neuer Tenant. Verknüpfung zwischen Tenants z. B. über eine „Überperson“ oder Link (Person in Tenant A ist Kind von Person in Tenant B).
- **Vorteil:** Klar getrennt, Rechte = Zugang zum Tenant. Skaliert wie K2 Galerie (eine Galerie pro Künstler:in).
- **Nachteil:** Stammbaum ist über mehrere Tenants verteilt; gemeinsame Ansicht braucht Verknüpfung oder Aggregation.

### Option 2: Eine Familie (ein Tenant), Rechte pro Person

- **Idee:** Alle Personen leben in **einem** Tenant. Zusätzlich: Jede Person kann eine **Rolle** haben (z. B. „Verwalter“, „nur lesen“). Ein „Zweig“ wird definiert (z. B. „alle Nachkommen von Person X“ oder „diese IDs“); Verwalter-Rechte gelten für „ihren“ Zweig.
- **Wachstum:** Neue Personen werden wie bisher angelegt; beim Anlegen wird entschieden, zu welchem Zweig sie gehören und wer sie verwalten darf.
- **Vorteil:** Ein Baum, eine Quelle. Übersicht und Suche einfach.
- **Nachteil:** Rechte-Logik und „Zweig-Definition“ müssen im Datenmodell und in der UI sauber abgebildet werden.

### Option 3: Eine Familie, „Verwalter pro Zweig“ (Zweig = Menge von Personen)

- **Idee:** Eine Familie (ein Tenant). Zusätzlich: **Zweig = Liste von Personen-IDs** (oder „Wurzel-Person + alle Nachkommen“). Pro Zweig: eine oder mehrere Personen als **Verwalter** (dürfen in diesem Zweig anlegen/bearbeiten/löschen). Wer keiner Zweig-Verwaltung zugeordnet ist, kann z. B. nur lesen oder nur „eigene Person“ bearbeiten.
- **Wachstum:** Neue Person wird einem Zweig zugeordnet (beim Anlegen auswählen). Neuer Zweig = neue Verwalter-Zuordnung.
- **Vorteil:** Organisches Wachstum ohne neue Tenants; Rechte klar pro Bereich.
- **Nachteil:** Zweig-Grenzen müssen gepflegt werden (z. B. bei Scheidung: Person wechselt den Zweig?).

---

## Kurzvergleich

| | Option 1 (Tenant = Zweig) | Option 2 (Rolle pro Person) | Option 3 (Verwalter pro Zweig) |
|---|---------------------------|-----------------------------|----------------------------------|
| **Ein Baum** | Nein, mehrere Tenants | Ja | Ja |
| **Rechte** | Zugang = Recht | Rolle + Zweig-Definition | Verwalter pro Zweig |
| **Wachstum** | Neuer Tenant pro Zweig | Neue Person, Zweig zuordnen | Neue Person, Zweig zuordnen |
| **Komplexität** | Mittlere (Verknüpfung) | Höhere (Rollen + Zweig) | Mittlere (Zweig = Menge + Verwalter) |

---

## Events betreffen immer nur einen Teil (Äste/Zweige)

**Realität bei großen Familien:** Ein Event (Geburtstag, Treffen, Fest) informiert oder betrifft **nicht** die ganze Familie, sondern immer nur einen **Teil** – einen Ast, einen Zweig, eine bestimmte Gruppe. Die anderen Äste bekommen davon nichts mit oder sind bewusst nicht dabei.

**Konsequenz für die App:**

1. **Teilnehmer = betroffener Kreis:** Schon heute: Ein Event hat `participantIds` – das *ist* der Teil, der informiert/dabei ist. Die übrigen Personen (andere Äste) sind nicht Teilnehmer und brauchen das Event nicht zu sehen.
2. **Sichtbarkeit (später):** Wenn wir Sichtbarkeit pro Person/Zweig einführen: Nur Events anzeigen, bei denen man Teilnehmer ist (oder zu einem betroffenen Zweig gehört). Nicht „alle Events der ganzen Familie“ für alle.
3. **Beim Anlegen (später):** Statt 30 Einzelpersonen zu wählen: „Zweig auswählen“ (z. B. „alle Nachkommen von Person X“) oder eine gespeicherte Gruppe – dann sind automatisch die richtigen Leute Teilnehmer. Skaliert für große Familien.

**Kurz:** Events sind von vornherein „teilbezogen“. Wer Phase 4 (Zweige/Rechte) umsetzt, kann Sichtbarkeit und Auswahl (Zweig/Gruppe) daran anbinden.

---

## Nächster Schritt (Entscheidung)

1. **Definition „Zweig“** festlegen: A (Abstammung), B (Haushalt) oder C (verwalteter Bereich) – oder Kombination.
2. **Rechte-Modell** wählen: Option 1, 2 oder 3 – abhängig davon, ob ihr einen gemeinsamen Baum wollt (2 oder 3) oder strikt getrennte Zweige (1).
3. **Dann:** In Roadmap Phase 4 (Skalierung) konkrete Datenfelder und UI-Schritte ableiten (z. B. `branchId`, `managedBy`, oder neuer Tenant pro Zweig).

Bis dahin bleibt es bei **einem Tenant, alle dürfen (wer Zugang hat)** – wie jetzt. Keine automatischen Löschungen, Schreiben nur nach User-Aktion (unveränderlich).

---

**Quelle:** Diskussion „organisches Wachstum + Schreib-/Löschrechte pro Zweig“. Roadmap: `docs/K2-FAMILIE-ROADMAP.md` Phase 4.
