# Plan wohin – Überkategorien (Sportwagenprinzip)

**Ziel vor Anstrengung.** Erst das Ziel, dann die Schritte. Ein Standard pro Problem – eine Konfiguration, eine Karte, alle Stellen speisen sich daraus.

---

## 1. Das Ziel (aus Vision)

**ök2 = lebendige Referenz:** „Kunst trägt, ganzer Markt hat Platz.“ Eine Galerie, ein Modell – Kunstwerke, Produkte, Ideen mit **passenden** Kategorien und Begriffe für jeden Typ. Kein Bruch, keine zweite App.

**Referenz:** docs/VISION-OEK2-GROSSES-ZIEL.md

---

## 2. Nächster Meilenstein: Überkategorien

| Was | Wozu |
|-----|------|
| **Kategorien pro entryType** | Kunstwerk → ARTWORK_CATEGORIES (wie heute). Produkt → PRODUCT_CATEGORIES. Idee → IDEA_CATEGORIES. Eine Quelle: `getCategoriesForEntryType(entryType)`. |
| **Nummernlogik pro Typ** | Kunstwerk: M/K/G/S/O aus Kategorie. Produkt: P1, P2, … Idee: I1, I2, … Eine Funktion: `getCategoryPrefixLetter(entryType, category)`. |
| **Admin** | Kategorie-Dropdown und nächste Nummer hängen am **entryType** – ein Modell, konfigurierbar. |
| **Labels (optional später)** | „Künstler:in“ vs „Anbieter“ vs „Urheber“ aus Konfiguration – kann Phase 2 sein, wenn Kategorien + Nummern stehen. |

**Sportwagen:** Eine Liste (Artworks), eine Karte, eine Speicher-Schicht. Nur **Konfiguration** (Kategoriemengen, Präfix P/I) hängt am entryType. Keine zweiten Datenmodelle, keine zweite UI-Schiene.

---

## 3. Umsetzungsschritte (Reihenfolge)

| # | Schritt | Wo | Regel |
|---|--------|-----|-------|
| 1 | **Konfiguration** PRODUCT_CATEGORIES, IDEA_CATEGORIES; getCategoriesForEntryType(entryType) | tenantConfig.ts | Eine Quelle für alle Kategorie-Listen |
| 2 | **Nummernlogik** getCategoryPrefixLetter(entryType, category) → P / I / M|K|G|S|O | tenantConfig.ts | Eine Funktion, Aufrufer passen sich an |
| 3 | **Admin: Kategorie-Dropdown** je nach entryType die passende Kategorie-Liste anzeigen | ScreenshotExportAdmin.tsx | Kein zweiter Ablauf – gleiche Komponente, andere Datenquelle |
| 4 | **Admin: Nächste Nummer** bei Neues Werk / Duplikat: Präfix und Zähler aus entryType + bestehende Werke | ScreenshotExportAdmin.tsx | Eine Logik (nächste Nummer pro Präfix), entryType liefert Präfix |
| 5 | **GalerieVorschauPage (mobil)** Kategorie-Dropdown bei Neues Werk: getCategoriesForEntryType(entryType) | GalerieVorschauPage.tsx | Gleicher Standard wie Admin |
| 6 | **Rückwärtskompatibilität** Fehlendes entryType = artwork; bestehende category-IDs (malerei, …) weiter gültig; Produkt/Idee mit alter category → beim Laden/Speichern Kategorie aus passender Menge übernehmen oder Default | überall | Kein Datenverlust, keine Brüche |

---

## 4. Verweise

- **Vision großes Ziel:** docs/VISION-OEK2-GROSSES-ZIEL.md  
- **Überkategorien-Analyse:** docs/UEBERLEGUNG-UEBERKATEGORIEN-WERKKARTEN.md  
- **Ein Standard pro Problem:** .cursor/rules/ein-standard-problem.mdc  
- **Ziel vor Anstrengung:** .cursor/rules/ziel-vor-anstrengung.mdc  

---

**Kurzfassung:** Ziel = ök2 als Referenz mit typgerechten Kategorien. Nächster Meilenstein = Überkategorien + Nummernlogik in **einer** Konfiguration, **ein** Aufruf pro Stelle. Umsetzung in dieser Reihenfolge, dann Test und Commit.
