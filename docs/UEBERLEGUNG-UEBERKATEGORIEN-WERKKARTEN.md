# Überlegung: Überkategorien – sind die Werkkarten zu sehr auf Kunst eingegrenzt?

**Ausgangsfrage (Georg):** Ob wir mit den bestehenden Werkkarten nicht zu sehr auf Kunst eingegrenzt sind – ob wir nicht andere **Überkategorien** brauchen, in jede Richtung (Idee, Produkt) gedacht. Hier liege der Schlüssel und die Quelle für alle weiteren Schritte.

**Kurzantwort:** Du siehst das **richtig**. Wenn Kategorien, Nummern und Begriffe nur Kunstsparten abdecken, bleiben Idee und Produkt „Gäste“ im Kunst-System. Gleichberechtigung braucht **pro Typ (entryType) passende Überkategorien und Begriffe** – dann ist das die Quelle für Karten, Kassa, Etiketten, Filter, Export.

---

## 1. Was heute fest „Kunst“ ist

| Element | Heute | Wirkung |
|--------|--------|--------|
| **Kategorien** | ARTWORK_CATEGORIES: Bilder, Keramik, Grafik, Skulptur, Sonstiges | Jedes Werk muss eine Kunstsparte wählen. Produkt „Vase“ steckt in „Keramik“, Idee „Workshop“ in „Sonstiges“ – fachlich möglich, aber die **Oberkategorie** ist immer Kunst. |
| **Werknummer** | M/K/G/S/O aus Kategorie (malerei→M, keramik→K, …) | Nummer = Kunstsparten-Buchstabe. Für Produkte/Ideen nur „Sonstiges“ = O oder Zwang zu Kunstsparte. |
| **Felder / Labels** | artist, inExhibition, inShop | „Künstler:in“, „In Ausstellung“, „Im Shop“ – alles Kunst-Vokabular. Produkt hat eher „Anbieter/Hersteller“, „Lager“, „Verfügbar“; Idee hat eher „Thema“, „Status“ (Idee / in Arbeit / umgesetzt). |
| **Eine Karte** | Dieselben Felder für alle | Die **Karte** kann alles abbilden (Titel, Bild, Beschreibung, Preis), aber die **Kategorien und Begriffe** sind kunstgeprägt. |

**Fazit:** entryType (Kunstwerk/Produkt/Idee) haben wir – aber die **Überkategorien** (welche Kategorien gelten für welchen Typ?) und die **Begriffe** (welches Label für „Urheber“? Ausstellung vs. Verfügbar?) sind noch kunst-zentriert. Das begrenzt, wie natürlich sich Ideen und Produkte anfühlen und wie sie in Kassa, Etiketten und Filtern genutzt werden.

---

## 2. Was pro Richtung sinnvoll sein könnte

### Kunstwerk (artwork)

- **Kategorien:** wie heute (Bilder, Keramik, Grafik, Skulptur, Sonstiges) – Kunstsparten.
- **Nummer:** M/K/G/S/O + Ziffer (z. B. M1, K2).
- **Begriffe:** Künstler:in, In Ausstellung, Im Shop, Preis.
- **Keine Änderung nötig** – das ist der heutige Standard.

### Produkt (product)

- **Kategorien:** andere **Überkategorien** – z. B. Produktart: Druck/Repro, Serie/Edition, Merchandise, Buch, Keramik-Serie, Sonstiges – **konfigurierbar** pro Mandant oder global.
- **Nummer:** eigene Logik (z. B. P1, P2 oder SKU-ähnlich), nicht M/K/G/S/O.
- **Begriffe:** Anbieter/Hersteller (statt Künstler:in), Verfügbar/Lager (statt In Ausstellung), Im Shop, Preis; evtl. SKU, Mindestmenge.
- **Karte:** gleiche Grundstruktur (Titel, Bild, Beschreibung, Preis), aber **Labels und ggf. Kategorie-Dropdown** kommen aus Konfiguration für entryType product.

### Idee (idea)

- **Kategorien:** andere **Überkategorien** – z. B. Thema/Konzept: Projekt, Kooperation, Dienstleistung, Konzept, Sonstiges – **konfigurierbar**.
- **Nummer:** z. B. I1, I2 oder freie Bezeichnung; kein Zwang zu Kunstsparten-Buchstabe.
- **Begriffe:** Urheber/Thema (statt Künstler:in), Status (Idee / in Arbeit / umgesetzt) statt In Ausstellung; Preis optional oder „Unkostenbeitrag“.
- **Karte:** gleiche Grundstruktur, **Labels und Kategorien** aus Konfiguration für entryType idea.

---

## 3. Zwei mögliche Wege (ohne sofort Sonderbau)

### Option A: Kategorien pro entryType (Überkategorien)

- **Eine** Artwork-Liste, **ein** Karten-Rendering.
- **Kategorien:** nicht mehr eine feste ARTWORK_CATEGORIES für alle, sondern z. B.:
  - `ARTWORK_CATEGORIES` (wie heute),
  - `PRODUCT_CATEGORIES` (konfigurierbar: z. B. Druck, Serie, Merchandise, …),
  - `IDEA_CATEGORIES` (konfigurierbar: z. B. Projekt, Kooperation, Konzept, …).
- Beim Anzeigen/Bearbeiten: **entryType** entscheidet, welche Kategorie-Liste und welches Nummern-Präfix (M/K/G/S/O vs. P vs. I) genutzt wird.
- **Labels:** pro entryType konfigurierbar („Künstler:in“ / „Anbieter“ / „Urheber“; „In Ausstellung“ / „Verfügbar“ / „Status“). Entweder in tenantConfig (z. B. LABELS_BY_ENTRY_TYPE) oder aus derselben Konfiguration wie die Kategorien.

**Quelle für alle weiteren Schritte:** Kassa, Etiketten, Export und Filter nutzen entryType + diese Kategorien und Labels – eine Quelle, keine zweite Datenwelt.

### Option B: Erst nur Labels, Kategorien später

- Kategorien vorerst **unverändert** (alle nutzen ARTWORK_CATEGORIES), aber **Anzeige-Labels** pro entryType (z. B. „Künstler:in“ vs. „Anbieter“ vs. „Urheber“).
- Nummer: für Produkt/Idee optional anderes Präfix (P1, I1) oder weiter O für „Sonstiges“, bis wir Option A umsetzen.
- Schneller umsetzbar, aber die **Überkategorien** (eigene Kategoriemengen für Produkt/Idee) fehlen weiterhin – Georgs „Schlüssel“ wäre nur teilweise gedreht.

---

## 4. Bewertung

- **Du siehst das nicht falsch.** Die Werkkarten und ihr zugrunde liegendes Modell (Kategorien + Begriffe) sind die **Quelle** für:
  - Darstellung in der Galerie,
  - Admin (Neues Werk, Bearbeiten),
  - Kassa (welche Felder, welche Bezeichnungen),
  - Etiketten, Export, Filter („nur Kunstwerke“, „nur Produkte“, „nur Ideen“).
- Wenn wir hier **Überkategorien und Typ-spezifische Begriffe** sauber abbilden (Option A), fließt das überall ein – **ein** Modell, **eine** Schicht, aber **konfigurierbar pro entryType**. Dann sind wir nicht mehr „Kunst mit Gästen“, sondern „eine Galerie für Kunstwerke, Produkte und Ideen“ mit je passenden Kategorien und Labels.
- **Sportwagen bleibt gewahrt:** Eine Liste, eine Karte, eine Speicher-Schicht – nur **Konfiguration** (Kategoriemengen, Labels, Nummernlogik) hängt am entryType.

---

## 5. Nächste Schritte (zur Klärung)

1. **Entscheidung:** Option A (Kategorien + Labels pro entryType) vs. Option B (erst nur Labels) – oder schrittweise: zuerst Labels, dann Kategorien pro Typ.
2. **Konkretisierung:** Welche **ersten** PRODUCT_CATEGORIES und IDEA_CATEGORIES sollen rein (Beispiele für Demo und spätere Skalierung)?
3. **Doku/Plan:** Sobald entschieden, in VISION-WERKE-IDEEN-PRODUKTE.md oder PLAN-OEK2-WERKE-IDEEN-PRODUKTE-UMSETZUNG.md Abschnitt „Überkategorien“ ergänzen und Umsetzung (Konfiguration, UI) daraus ableiten.

---

**Kurzfassung:** Die bestehenden Werkkarten sind heute stark kunst-geprägt (Kategorien, Nummern, Begriffe). Für echte Gleichberechtigung von Idee und Produkt brauchen wir **Überkategorien** – pro entryType passende Kategoriemengen und Labels. Das ist der Schlüssel; alles Weitere (Kassa, Etiketten, Filter, Export) baut darauf auf. Du siehst das richtig.
