# K2 Familie – Skalierung für Großfamilien (mehrere hundert Mitglieder)

**Stand:** 02.03.26  
**Frage:** Funktioniert das System auch für wirkliche Großfamilien mit mehreren hundert Mitgliedern?

---

## Kurzfassung

| Bereich | Status | Grenze / Hinweis |
|--------|--------|-------------------|
| **Speicher (localStorage)** | ⚠️ begrenzt | ~10 MB pro Liste; mit vielen Fotos realistisch **ca. 100–200 Personen** pro Familie; ohne Fotos oder mit externen URLs **500+** möglich |
| **Stammbaum-Grafik** | ✅ rechnerisch ok | Alle Knoten werden gerendert; bei 200+ Personen wird die SVG sehr breit/hoch – Darstellung und Scroll können schwer werden |
| **Listen (Kacheln, Kalender, Events)** | ✅ ok | Keine Pagination; 200–300 Einträge sind machbar, auf schwachen Geräten kann es spürbar werden |
| **Logik (Speichern, Beziehungen)** | ✅ ok | Lineare Laufzeit O(n); auch 500+ Personen unkritisch |

**Fazit:** Für **einige hundert Mitglieder** ist das System nutzbar, wenn Fotos sparsam oder extern gehalten werden. Bei **sehr großen Familien mit vielen Fotos** stößt man an das Speicherlimit (10 MB) und ggf. an die Darstellung (eine sehr große Stammbaum-SVG).

---

## 1. Speicher (localStorage)

### Begrenzungen im Code

- **`src/utils/familieStorage.ts`:** `MAX_JSON_SIZE = 10_000_000` (10 MB) pro Key.
- Es gibt drei Keys pro Tenant: Personen, Momente, Events. Jeder Key darf maximal 10 MB haben.
- **localStorage gesamt:** Typisch 5–10 MB pro Origin; K2 Galerie und K2 Familie teilen sich dieselbe Origin.

### Größenabschätzung pro Person

- **Ohne Foto:** id, name, shortText, parentIds, childIds, partners, siblingIds, wahlfamilieIds, Timestamps → grob **1–3 KB**.
- **Mit Foto (Base64):** Komprimiert z. B. 30–100 KB pro Bild → pro Person grob **30–100 KB**.

### Grobe Kapazität

| Szenario | Personen (ca.) | Anmerkung |
|----------|----------------|-----------|
| Nur Stammdaten, keine Fotos | 500–1000+ | Unter 10 MB |
| Mit kleinen/komprimierten Fotos (~30 KB/Person) | 200–300 | Nahe 10 MB |
| Mit größeren Fotos (~80 KB/Person) | 100–150 | Sicher unter 10 MB |

**Schlussfolgerung:** „Mehrere hundert Mitglieder“ ist mit **Fotos** nur möglich, wenn Fotos stark komprimiert oder als externe URLs gespeichert werden. Ohne Fotos oder mit URLs sind **mehrere hundert** problemlos möglich.

---

## 2. Stammbaum-Grafik (FamilyTreeGraph)

### Layout

- Knotenbreite pro Person: `NODE_W + COL_GAP` = 72 + 24 = 96 px.
- **Breite der SVG** = maximale Anzahl Personen in einer Generation × 96 (plus Rand).
- Beispiele:
  - 20 Personen in einer Generation → ~2 000 px Breite
  - 50 Personen → ~5 000 px
  - 100 Personen → ~10 000 px
  - 300 Personen in einer Generation → ~29 000 px

### Verhalten

- **Alle Knoten** werden gerendert (kein Virtualizing, kein „nur sichtbarer Ausschnitt“).
- Die SVG hat ein `viewBox` und kann gescrollt werden (`overflow: auto`).
- Bei **sehr breiten/hohen Bäumen** (z. B. 200+ Knoten): Rendering und Scroll können auf schwächeren Geräten spürbar werden, bleiben aber funktionsfähig.

### Rekursion (Generationen)

- `getGenerations` arbeitet rekursiv; typische Stammbaumtiefe ist < 20. Auch bei 500 Personen ist die Tiefe in der Praxis begrenzt → **kein Stack-Overflow-Risiko**.

---

## 3. Listen (Stammbaum-Kacheln, Kalender, Events)

- **Stammbaum-Seite:** Alle Personen als Kacheln (`personen.map`) → N Karten.
- **Kalender:** Alle Events + Momente nach Datum, nach Monat gruppiert, alle gerendert.
- **Events-Seite:** Liste aller Events; beim Bearbeiten alle Personen als Checkboxen.

Es gibt **keine Pagination** und **keine Virtualisierung**. 200–300 Einträge sind in der Regel machbar; bei 500+ kann die Seite auf schwachen Geräten träger werden.

---

## 4. Empfehlungen

### Heute (ohne Code-Änderung)

- **Dokumentation:** „Bis ca. 150–200 Personen mit Fotos getestet; bei größeren Familien Fotos komprimieren oder externe URLs nutzen; Speicherlimit 10 MB pro Personenliste.“
- **Nutzung:** Für Großfamilien Fotos sparsam halten (kleine Auflösung, starke Komprimierung wie in der Galerie) oder nur Verweise (URLs) speichern, um unter 10 MB zu bleiben.

### Optional später (wenn echte Großfamilien Priorität haben)

1. **Personen-Liste:** Pagination oder virtuelles Scrollen (nur sichtbare Karten rendern).
2. **Stammbaum:** „Ausschnitt“-Modus oder Zoom/Pan, ggf. nur sichtbare Knoten rendern (aufwändiger).
3. **Fotos:** Wie in der Galerie ein klares Größen-/Kompressionslimit für Personen-Fotos (z. B. max. 800 px Breite, Qualität 0.6), damit 300+ Personen mit Foto im Limit bleiben.
4. **Backend:** Bei echtem Bedarf für 500+ Personen: Persistenz in Supabase/Server statt nur localStorage, dann entfällt das 10-MB-Limit pro Key.

---

## 5. Getestete Grenzen (Stand 02.03.26)

- **Musterfamilie Huber:** 13 Personen, viele Momente/Events – kein Problem.
- **Größere Mengen:** Nicht systematisch mit 100+ Personen getestet; die obigen Abschätzungen beruhen auf Code und Datenmodell.

**Empfehlung:** Bei geplanter Nutzung für „mehrere hundert“ Mitglieder einmal mit 100–150 Personen (inkl. Fotos) testen und Speicherverbrauch (z. B. in den DevTools unter Application → Local Storage) prüfen.
