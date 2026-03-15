# Werkkatalog – Prüfung gegen „Für die Kunst gedacht, für den Markt gemacht“

**Stand:** 15.03.26  
**Geprüft:** Filter, Spalten, Druck/PDF, Konsistenz mit Werke verwalten und Produkt-Vision.

---

## 1. Anforderungen (Quellen)

| Quelle | Anforderung |
|--------|-------------|
| **PRODUKT-VISION.md** | Fokus = gesamter Markt (Ideen oder Produkte professionell zeigen). Kunstmarkt = Unterkategorie. „Für den Markt gemacht“ = vermarktbar, eine Konfiguration. |
| **PLAN-GESCHAEFTSFELDER-TYP-KATEGORIE.md** | Werkkatalog: **gleiche Filter-Logik** wie Werke verwalten – Typ (Kunstwerk/Produkt/Idee) + Kategorie. Eine Quelle, keine Sonderbehandlung. |
| **tenantConfig** | ENTRY_TYPES (artwork/product/idea), getCategoriesForEntryType(entryType), getEntryTypeLabel, getCategoryLabel. |

---

## 2. Ist-Zustand (WerkkatalogTab)

| Bereich | K2 (echte Galerie) | ök2 (Demo) |
|---------|---------------------|------------|
| **Filter „Typ“** | ❌ Nicht sichtbar (nur Kategorie + Status + Suche + Preis + Datum) | ✅ Sichtbar: Typ (Alle / Kunstwerk / Produkt / Idee), dann Kategorie dynamisch |
| **Filter „Kategorie“** | ARTWORK_CATEGORIES (Bilder, Keramik, Grafik, Skulptur, Sonstiges) | Dynamisch je nach Typ (getCategoriesForEntryType) |
| **Spalte „Typ“** | ❌ Es gibt keine Spalte „Typ“ (nur Kategorie) | ❌ Ebenfalls keine Spalte „Typ“ |
| **Druck/PDF** | Keine Typ-Spalte, nur Kategorie | Keine Typ-Spalte |
| **Werkkarte (Detail)** | Zeigt Kategorie, nicht Typ | Zeigt Kategorie, nicht Typ |

**Fazit:** In **K2** fehlt der Typ-Filter komplett. In **ök2** ist der Typ-Filter vorhanden, aber die **Spalte „Typ“** fehlt in Tabelle und Druck in beiden Kontexten.

---

## 3. Lücken (gegen die Anforderungen)

1. **Filter überall gleich (PLAN-GESCHAEFTSFELDER):** Im Werkkatalog soll dieselbe Logik wie in „Werke verwalten“ gelten. In Werke verwalten (ök2) gibt es Typ + Kategorie. Im Werkkatalog **K2** gibt es nur Kategorie (ohne Typ) → **nicht gleich**.
2. **Für den Markt gemacht:** Sichtbare Unterscheidung „Kunstwerk / Produkt / Idee“ ist für die Positionierung wichtig. Ohne **Spalte „Typ“** in Tabelle und Druck sieht man im Katalog nicht, was ein Eintrag ist (Kunstwerk vs. Produkt vs. Idee).
3. **Eine Quelle:** Filter-Logik ist in ök2 bereits an Typ + Kategorie gekoppelt; in K2 bleibt der Werkkatalog beim alten reinen Kategorie-Modell (ohne entryType).

---

## 4. Änderungsvorschläge

### A) Spalte „Typ“ (für K2 und ök2)

- **Was:** In `ALLE_SPALTEN` eine neue Spalte `{ id: 'typ', label: 'Typ' }` aufnehmen (z. B. nach „Kategorie“).
- **Tabelle:** Bei `typ` Zelle `getEntryTypeLabel(a.entryType)` anzeigen (Fallback `'Kunstwerk'` wenn kein entryType).
- **Druck/PDF:** In colHeaders und in den Zeilen die Typ-Spalte mit ausgeben.
- **Werkkarte (Detail-Modal / Druck):** Optional „Typ“ mit anzeigen (z. B. „Kunstwerk“ / „Produkt“ / „Idee“).
- **Konfiguration:** Bereits vorhanden (getEntryTypeLabel, entryType an Werken). Kein neues Modell.

**Priorität:** Hoch – macht „Kunst gedacht, für den Markt gemacht“ im Katalog sichtbar.

---

### B) Filter „Typ“ auch im K2-Werkkatalog anbieten

- **Was:** Im Werkkatalog **nicht** nur bei `isOeffentlich` den Typ-Filter und die dynamische Kategorie anzeigen, sondern **auch bei K2** (gleiche Filter-Leiste wie in Werke verwalten).
- **Hinweis (k2-echte-galerie-eisernes-gesetz):** K2 ist „fertig“, nichts ohne dezidierte Anordnung ändern. **Vorschlag:** Diese Änderung nur umsetzen, **wenn Georg es ausdrücklich anordnet**. Alternativ: nur in **ök2** und künftigen Mandanten den Typ-Filter haben; K2 weiter nur mit Kategorie-Filter lassen.
- **Wenn umgesetzt:** In WerkkatalogTab den Block „Typ“-Dropdown und die Kategorie-Dropdown-Logik (getCategoriesForEntryType bei gewähltem Typ) auch rendern, wenn `isOeffentlich === false`. Dazu im Admin die State-Variablen `entryTypeFilter` und `categoryFilter` auch für K2 an den Werkkatalog übergeben (bereits der Fall); in WerkkatalogTab die Bedingung `isOeffentlich` für die Anzeige von Typ + dynamischer Kategorie entfernen oder um einen Konfigurations-Flag erweitern.

**Priorität:** Mittel – für vollständige „eine Quelle“-Konsistenz. Wegen K2-Eisernes-Gesetz: nur auf Anordnung.

---

### C) Erklärungstext unter den Filtern (optional)

- **Was:** Kurzer Hinweis wie in ök2: „**Typ** = Art des Eintrags (Kunstwerk, Produkt oder Idee). **Kategorie** = Feinzuordnung dazu.“ Diesen Text auch anzeigen, wenn der Typ-Filter sichtbar ist (also in ök2 bereits da; bei K2 nur, wenn B) umgesetzt wird).

**Priorität:** Gering – UX-Klarheit.

---

### D) Standard-Spalten um „Typ“ erweitern

- **Was:** In ScreenshotExportAdmin das initiale `katalogSpalten` um `'typ'` ergänzen (z. B. nach `'kategorie'`), damit die Typ-Spalte standardmäßig sichtbar ist, sobald A) umgesetzt ist.

**Priorität:** Abhängig von A.

---

## 5. Kurzfassung

| Vorschlag | Inhalt | K2 | ök2 |
|-----------|--------|-----|-----|
| **A** | Spalte „Typ“ in Tabelle, Druck, Werkkarte | ✅ | ✅ |
| **B** | Filter „Typ“ + dynamische Kategorie auch im K2-Werkkatalog | Nur bei dezidierter Anordnung (Eisernes Gesetz) | Bereits umgesetzt |
| **C** | Erklärungstext Typ/Kategorie | Nur wenn B | Bereits umgesetzt |
| **D** | „Typ“ in Standard-Spalten | ✅ (wenn A) | ✅ (wenn A) |

**Empfehlung:** **A und D** umsetzen (Spalte „Typ“ + Standard-Spalten). **B** nur auf ausdrückliche Anordnung für K2; für „für den Markt gemacht“ reicht ök2 + künftige Mandanten mit Typ-Filter, plus überall die sichtbare **Typ-Spalte** (A).

---

*Referenz: components/tabs/WerkkatalogTab.tsx, docs/PLAN-GESCHAEFTSFELDER-TYP-KATEGORIE.md, docs/PRODUKT-VISION.md, .cursor/rules/k2-echte-galerie-eisernes-gesetz.mdc*
