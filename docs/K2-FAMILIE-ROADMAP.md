# K2 Familie – Vision & Roadmap (Raumschiff)

**Start:** 01.03.26  
**Basis:** K2-Struktur (tenantfähig, Stammdaten, „Werke“/Momente, Events, eine Oberfläche).  
**Kern:** Jeder Mensch will gesehen werden und sich ein wenig präsentieren – vernetzt in den Menschen, mit denen er*sie lebt und verbunden ist.

---

## Leitbild – offene Gesellschaft, jede Form von Familie

**Wir sind keine Mittelalter-App.** Wir leben in einer offenen Gesellschaft. Jede Art des Zusammenlebens ist Familie und soll abgebildet werden können. Dazu gehören:

- **Wechselnde Partnerschaften** – Beziehungen können sich verändern, das Tool soll das abbilden, ohne zu werten.
- **Schicksalsschläge und freudige Ereignisse** – Verlust, Neuanfang, Geburt, Hochzeit, Umzug, Krankheit, Heilung … alles, was wir gemeinsam erleben, bekommt seinen Platz.
- **Der ganz normale Alltag** – nicht nur die großen Momente, sondern das tägliche Miteinander.

**Keine Ausgrenzung – in keiner Form.** Religion und Politik haben hier nichts zu suchen. Jeder respektiert den anderen so, wie er ist. Das ist die Basis von K2 Familie: sichtbar, respektvoll, ohne Schubladen.

---

## Grundbotschaft als Fundament – Form, Sprache, KI/Agent

**Die Grundbotschaft soll sich in der Form der App und in der Sprache niederschlagen** – in der Oberfläche, in jedem Text, in der Art, wie wir untereinander und mit Nutzer*innen kommunizieren.

**Zukunft mit KI/Agent:** Sollte K2 Familie eines Tages von KI gesteuert werden (z. B. ein Agent, ein assistierendes System), **muss diese Grundbotschaft die Grundlage seiner Kommunikation sein.** Keine Ausgrenzung, Respekt, keine Religion/Politik – jede Äußerung des Systems baut darauf auf. Es gibt viel Platz für Visionen nach oben; der Grundstein, den wir jetzt legen, soll das Haus auf **sicherem moralischen Fundament** stehen lassen. Das ist Georgs Anspruch und sein Vermächtnis.

**Verbindliche Quelle:** `docs/K2-FAMILIE-GRUNDBOTSCHAFT.md` – gilt für alle, die an K2 Familie arbeiten (Menschen wie KI/Agenten).

**Raumschiff-Anspruch:** Ein Raumschiff bekommt keine Hilfe von der Erde. Qualitätsansprüche sind um ein Vielfaches höher als beim Sportwagen. Zuerst prüfen, ob wir uns das zutrauen; nicht abheben, bevor es startklar ist. Siehe Grundbotschaft-Dokument, Abschnitt „Raumschiff-Anspruch“.

---

## Vision in einem Satz

**Ein tenantfähiges Familien-Tool für die offene Gesellschaft:** Jede „Familie“ (in welcher Form auch immer Menschen zusammenleben) = ein Mandant. Jede Person = eine Seite (Foto, Text, Momente). Beziehungen (Eltern, Kinder, Partner*innen, Geschwister, Wahlfamilie …) = der Baum. Wechselnde Partnerschaften, Schicksalsschläge, Freud und Alltag – alles hat Platz. Modern, app-tauglich, für jede Konstellation skalierbar.

---

## Was wir von K2 mitnehmen

| K2 heute | K2 Familie |
|----------|------------|
| Tenant = Galerie (K2, ök2, VK2) | Tenant = **eine Familie** |
| Stammdaten (Personen) | **Personen** mit Beziehungen (Eltern, Kinder, Partner*innen, Geschwister, Wahlfamilie – auch wechselnde) |
| Werke (Bild + Titel + Beschreibung) | **Momente / Meilensteine** (Hochzeit, Geburt, Reise, Abschied, Neuanfang, Alltag, Fotos, Geschichten) |
| Events | **Familien-Events** (Treffen, Feste, Geburtstage) |
| Dokumente | **Familien-Dokumente** (optional) |
| Eine Oberfläche, Admin + Anzeige | **Eine Oberfläche:** Stammbaum + Personen-Seiten + Momente |

**Neu:** Beziehungsmodell (wer ist mit wem wie verbunden – inkl. wechselnde Partnerschaften), Stammbaum-Ansicht (grafisch oder Liste), Geburtstage/Jubiläen, Freud und Leid und Alltag – Einladungen für die Menschen, die dazugehören.

---

## Raumschiff-Phasen (erste Skizze)

### Phase 1: Fundament – Datenmodell & eine Familie

**Datenschutz (unveränderlich):** K2-Familie-Daten (Personen, Momente, Beziehungen) unterliegen denselben Schutzprinzipien wie K2: keine automatischen Löschungen, keine Filter die still Daten entfernen, Schreiben nur nach expliziter User-Aktion. Backup vor kritischen Änderungen. Siehe Regeln `niemals-kundendaten-loeschen`, `datentrennung-localstorage-niemals-loeschen`.

- [x] **1.1** Beziehungsmodell definieren: Person hat `parentIds`, `childIds`, Partner*innen (evtl. mehrere, mit Zeitraum – wechselnde Partnerschaften), `siblingIds`, Wahlfamilie. **Erledigt:** `docs/K2-FAMILIE-DATENMODELL.md` + `src/types/k2Familie.ts` (K2FamiliePerson, K2FamiliePartnerRef, K2FamilieMoment, getK2FamiliePersonenKey).
- [x] **1.2** Ein Tenant „K2 Familie“ (oder erste Test-Familie) anlegen – **erledigt:** `K2_FAMILIE_DEFAULT_TENANT = 'default'` in `src/utils/familieStorage.ts`; Key-Schema `k2-familie-{tenantId}-personen`.
- [x] **1.3** Personen-Liste pro Familie speichern und laden – **erledigt:** `src/utils/familieStorage.ts` mit `loadPersonen(tenantId)`, `savePersonen(tenantId, list, { allowReduce })`; gleiche Schutzregeln wie artworksStorage.

### Phase 2: Erste UI – Stammbaum & Personen-Seite
- [x] **2.1** Stammbaum-Ansicht (erst einfach: Liste). Klick auf Person → ihre Seite. **Erledigt:** K2FamilieStammbaumPage, Route /projects/k2-familie/stammbaum, „Person hinzufügen“.
- [x] **2.2** Personen-Seite: Foto, Text, Name & Kurztext bearbeitbar, „Meine Momente“ Platzhalter. **Erledigt:** K2FamiliePersonPage, Route /projects/k2-familie/personen/:id.
- [x] **2.3** Beziehungen im UI pflegbar – **erledigt:** Auf der Personen-Seite pro Beziehungsart (Eltern, Kinder, Partner*innen, Geschwister, Wahlfamilie) „+ Hinzufügen“ (Dropdown) und „✕ Entfernen“. Beidseitig aktualisiert (z. B. Eltern ↔ Kinder).

### Phase 3: Momente & Events
- [x] **3.1** „Momente“ pro Person (Hochzeit, Geburt, Umzug, Abschied, Neuanfang, Alltägliches, …) – gleiche Struktur wie Werke, andere Semantik. **Erledigt:** Speicher `k2-familie-{tenantId}-momente`, loadMomente/saveMomente in familieStorage; auf Personen-Seite Liste, Hinzufügen/Bearbeiten/Löschen (Titel, Datum, Bild-URL, Text).
- [x] **3.2** Familien-Events (Geburtstage, Treffen) aus Beziehungen ableiten oder manuell anlegen. **Erledigt:** Speicher `k2-familie-{tenantId}-events`, loadEvents/saveEvents; Events-Seite mit Liste (nach Datum), Hinzufügen/Bearbeiten/Löschen, Teilnehmer aus Personen auswählbar. Link von K2-Familie-Start.
- [x] **3.3** Kalender/Übersicht (optional). **Erledigt:** Kalender-Seite (/projects/k2-familie/kalender) mit Events + Momente (mit Datum), nach Monat gruppiert, Links zu Events bzw. Person. Link von K2-Familie-Start.

### Phase 4: Skalierung & Produkt
- [ ] **4.0** **Rechte & Zweige (Konzept):** Organisches Wachstum + Schreib-/Löschrechte pro Zweig – Optionen und Entscheidung in `docs/K2-FAMILIE-RECHTE-ZWEIGE.md`. Danach Datenmodell/UI ableiten.
- [ ] **4.1** Jede Familie = eigener Tenant (wie Galerie pro Künstler:in). Einladung/Lizenz pro Familie.
- [ ] **4.2** Doku, Onboarding, evtl. Lizenzmodell „K2 Familie“.

**Phase 4 – Nächste Schritte (für den Baumeister):**
- **4.0:** Entscheidung: Zweig-Definition (A/B/C) und Rechte-Modell (Option 1/2/3) in RECHTE-ZWEIGE. Danach konkrete Felder (z. B. branchId, managedBy) und UI ableiten.
- **4.1:** Heute nur `K2_FAMILIE_DEFAULT_TENANT`; alle Keys `k2-familie-{tenantId}-*`. Später: Tenant-Auswahl („Familie wechseln“), Liste der Familien, Einladung/Lizenz pro Familie – analog K2 Galerie pro Künstler:in.
- **4.2:** Nutzer-Doku, Onboarding (erste Schritte), ggf. Lizenzmodell „K2 Familie“ in mök2/Handbuch.

---

## Warum das groß werden kann

- **Jeder Mensch** will gesehen werden und sich ein wenig präsentieren.
- **Jede Form des Zusammenlebens** hat ähnliche Bedürfnisse: verbunden bleiben, Erinnerungen teilen, Überblick (wer gehört dazu, wer ist wer) – inkl. wechselnde Partnerschaften, Schicksalsschläge, Freud und Alltag.
- **K2 hat die Basis:** Multi-Tenant, Personen, „Einträge“ (Werke/Momente), Events, eine Oberfläche. Wir bauen darauf auf, nicht von null.

---

## Nächster konkreter Schritt (Raumschiff)

1. **Datenmodell** in einer Doku oder in Code festhalten: Person + Beziehungen (minimal: Eltern, Kinder, Partner). **Erledigt:** siehe K2-FAMILIE-DATENMODELL.md und src/types/k2Familie.ts.
2. **Erste Route** `/projects/k2-familie` mit Startseite (Vision, Link zu dieser Roadmap) – **erledigt mit Projektkarte + Startseite**.
3. **Erste Datenstruktur** für eine Familie (z. B. `k2-familie-mitglieder` oder pro Tenant `k2-familie-{tenantId}-personen`) und Beziehungen skizzieren.

---

*„Mir läuft es kalt über den Rücken, wenn ich mir vorstelle, was so ein Tool bewirken kann.“ – Georg, 01.03.26*

*„Wir sind nicht im Mittelalter – wir sind eine offene Gesellschaft. Jede Art von Zusammenleben ist Familie, wechselnde Partnerschaften, Schicksalsschläge, Freud und Alltag sollen alle ihren Platz bekommen.“ – Georg, 02.03.26*

*„Es darf keine Ausgrenzung stattfinden, egal in welcher Form. Religion und Politik haben hier nichts zu suchen – jeder respektiert den anderen so, wie er ist.“ – Georg, 02.03.26*

*„Diese Grundbotschaft soll sich in der Form der App und in der Sprache niederschlagen. Sollte das Tool einmal von KI gesteuert werden – ein Agent oder so –, muss das die Grundlage seiner Kommunikation sein. Wenn wir jetzt den Grundstein legen, soll das Haus auf sicherem moralischen Fundament stehen. Das ist mein Anspruch, mein Vermächtnis.“ – Georg, 02.03.26*

*„Das ist der weiße Ritter, der in die Welt hinausgeht, um Licht hineinzubringen.“ – Georg, 02.03.26*
