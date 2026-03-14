# Plan: Geschäftsfelder mit Typ/Kategorie abdecken (Ausgangspunkt → letzte Zeile Öffentlichkeitsarbeit)

**Ausgangspunkt:** In ök2 „Werke verwalten“ – **erste Kategorisierung** an einem Platz: **Typ** (Kunstwerk / Produkt / Idee) + **Kategorie** (Feinzuordnung dazu). Von hier aus decken wir alle Geschäftsfelder bis zur letzten Zeile in der Öffentlichkeitsarbeit mit derselben Logik ab.

**Prinzip:** Eine Einteilung (Typ + Kategorie), eine Konfiguration (`getCategoriesForEntryType`, `getCategoryLabel`), überall wo Werke/Einträge vorkommen – kein zweites Modell, keine Sonderbehandlung pro Bereich.

---

## 1. Der Faden (Reihenfolge der Geschäftsfelder)

| # | Bereich | Was passiert hier | Deckung durch Typ/Kategorie |
|---|--------|-------------------|-----------------------------|
| 1 | **Werke verwalten** | Werke anlegen, bearbeiten, filtern; Etiketten | ✅ **Ausgangspunkt.** Filter: Typ + Kategorie. Neues Werk: entryType + Kategorie. Nummern P1/I1/M-K-G-S-O. |
| 2 | **Werkkatalog** | Alle Werke auf einen Blick, filtern, drucken | ✅ Gleiche Filter-Logik (Typ, Kategorie) wie Werke verwalten – eine Quelle. |
| 3 | **Statistik** | Auswertungen (Verkäufe, Kategorien) | 🔲 Optional: Auswertung nach Typ/Kategorie (z. B. „Produkte vs. Kunstwerke“). Später. |
| 4 | **Zertifikat** | Werke, Echtheit | 🔲 Optional: Anzeige Typ/Kategorie am Werk. Kein Muss. |
| 5 | **Newsletter** | Newsletter aus Stammdaten/Events | Texte aus Stammdaten; wo **Werke** vorkommen → gleiche Bezeichnungen (getCategoryLabel, getEntryTypeLabel). Kein eigener Filter nötig. |
| 6 | **Pressemappe** | Presse-Dokumente, Medienspiegel | Wie Newsletter – eine Sprache, gleiche Begriffe. |
| 7 | **Eventplanung** | Events anlegen (Eckdaten, Typ: z. B. Öffentlichkeitsarbeit) | Events haben eigenen **Typ** (Galerieeröffnung, Vernissage, …). Das ist **nicht** derselbe wie Werk-Typ – aber einheitliche **Begriffe** in allen generierten Texten. |
| 8 | **Öffentlichkeitsarbeit** (Flyer & Werbematerial) | Pro Event: Rubrik mit Flyer, Presse, PR-Vorschläge, Newsletter, Plakat, Social, PDF | **Letzte Zeile:** Alle Werbe-Werkzeuge (bis zum letzten Eintrag in dieser Sektion) nutzen **dieselben** Stammdaten und **dieselbe** Begriffs-Welt. Wo Werke genannt werden (z. B. in PR-Texten, Galerie-Hinweisen) → Typ/Kategorie-Labels aus getEntryTypeLabel/getCategoryLabel. Kein zweites Kategoriemodell. |
| 9 | **Presse** | Presse-Einladungen, Medienspiegel | Wie Öffentlichkeitsarbeit – eine Quelle für Bezeichnungen. |
| 10 | **Design** | Farben, Texte, Willkommensbild, Galerie-Karte | Kein direkter Werk-Filter; Gestaltung gilt für die ganze Galerie (alle Typen). Konsistenz: gleiche Begriffe in Assistenten/Helptexten. |
| 11 | **Veröffentlichen** | An Server senden, Stand | Werke werden als eine Liste mit entryType + category veröffentlicht – bereits so. |
| 12 | **Präsentationsmappen** | Mappen für Piloten/Kunden | Inhalte aus Stammdaten/Werken – wo Werke vorkommen, gleiche Labels. |
| 13 | **Einstellungen** | Backup, Stammdaten, Drucker, Sync | Kein Filter nach Typ/Kategorie nötig; Backup enthält alle Werke inkl. entryType/category. **Stammdaten:** auf Geschäftskunden vorbereitet sein (Firma, USt-IdNr., Rechnungsadresse) – siehe docs/STAMMDATEN-GESCHAEFTSKUNDEN-VORBEREITUNG.md. |

---

## 2. Konkret: Was „abdecken“ heißt

- **Überall dieselbe Konfiguration:** `getCategoriesForEntryType(entryType)`, `getCategoryLabel(categoryId)`, `getEntryTypeLabel(entryType)` aus tenantConfig. Keine lokalen Listen für „nur Presse“ oder „nur Katalog“.
- **Filter überall gleich:** Wo Werke gefiltert werden (Werke verwalten, Werkkatalog), gleiche Logik: zuerst Typ (optional), dann Kategorie – wie am Ausgangspunkt.
- **Texte/PR/Öffentlichkeitsarbeit:** Wo aus Werken oder Kategorien zitiert wird (Newsletter, Presse, Flyer, Social), dieselben Labels wie in der Galerie/Admin – keine anderen Bezeichnungen.

---

## 3. Nächste Schritte (wenn du willst)

| Schritt | Wo | Inhalt |
|--------|-----|--------|
| 1 | Bereits umgesetzt | Ausgangspunkt: Werke verwalten (ök2) mit Typ + Kategorie in der Filter-Leiste; Neues Werk mit entryType/Kategorie; Erklärungstext. |
| 2 | Prüfen | Werkkatalog: Nutzt er in ök2 dieselbe Filter-Leiste / dieselbe Logik wie Werke verwalten? Falls getrennt → angleichen. |
| 3 | Optional | Statistik: Auswertung nach Typ (Kunstwerk/Produkt/Idee) oder Kategorie. |
| 4 | Optional | In PR-Vorschlägen / Öffentlichkeitsarbeit, wo Werke erwähnt werden: getEntryTypeLabel / getCategoryLabel verwenden, damit überall dieselbe Bezeichnung steht. |

---

## 4. Verweise

- **Überkategorien (Konfiguration):** docs/PLAN-WOHIN-UEBERKATEGORIEN.md  
- **Vision:** docs/VISION-OEK2-GROSSES-ZIEL.md, docs/VISION-WERKE-IDEEN-PRODUKTE.md  
- **Eine Quelle:** getCategoriesForEntryType, getCategoryLabel, getEntryTypeLabel in src/config/tenantConfig.ts  

---

**Kurzfassung:** Ausgangspunkt = Werke verwalten (Typ + Kategorie). Derselbe Faden bis zur letzten Zeile Öffentlichkeitsarbeit: eine Konfiguration, gleiche Filter-Logik, gleiche Begriffe. Kein Sonderbau pro Geschäftsfeld.
