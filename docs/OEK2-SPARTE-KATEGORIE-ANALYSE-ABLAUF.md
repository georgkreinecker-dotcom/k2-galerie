# ök2: Sparte & Kategorie – Ablauf und Anpassungen für maximalen Nutzen

**Stand:** 19.03.2026  
**Kontext:** Eine Sparte in Stammdaten, Typ (Sparte) kommt fix daraus, nur Kategorie ist wählbar. Karten zeigen Typ + Kategorie.

---

## 1. Ablauf (aktuell umgesetzt)

| Schritt | Wo | Verhalten |
|--------|-----|-----------|
| **Stammdaten** | Admin → Stammdaten → „Meine Richtung“ | Eine Sparte wählen (Radio), gespeichert als `focusDirections: [id]`. |
| **Werke verwalten – Filter** | Tab Werke, Filterzeile | **Typ** = nur Anzeige (fix aus Stammdaten). **Kategorie** = Dropdown (Alle + Kategorien aus `getCategoriesForDirection(focusDirections[0])`). |
| **Filterlogik** | Liste der Werke | Nur Werke der festen Sparte: `getEffectiveDirectionFromWork(artwork) === galleryData.focusDirections[0]`. Zusätzlich Filter nach Kategorie. |
| **Karten (Admin)** | Werke-Kacheln | **Typ:** Sparte-Label (z. B. Food & Genuss). **Kategorie:** Feinzuordnung (z. B. Speise). |
| **Neues Werk (kompakt)** | Modal „Neues Werk“ (ök2) | Kein Typ-Dropdown. Nur **Kategorie**-Dropdown, Optionen aus `getCategoriesForDirection(galleryData?.focusDirections?.[0])`. Beim Speichern: `entryType = getEntryTypeForDirection(focusDirections[0])`, `category = gewählte Kategorie`. |

---

## 2. Noch anzupassen für maximalen Benefit

### 2.1 Admin – Bearbeiten (ausführliche Form)

- **Stelle:** `ScreenshotExportAdmin.tsx`, ca. Zeile 21789–21816 (ausführliches Formular beim Bearbeiten eines Werks).
- **Aktuell:** Es gibt weiterhin ein **Typ (Sparte)**-Dropdown für ök2 mit allen 6 Sparten – Nutzer kann die Sparte beim Bearbeiten ändern.
- **Soll:** Wie bei „Neues Werk“: **Typ (Sparte)** nur Anzeige (fix aus `galleryData?.focusDirections?.[0]`), **Kategorie**-Dropdown mit `getCategoriesForDirection(galleryData?.focusDirections?.[0])`. Kein Wechsel der Sparte im Bearbeiten-Modal.

**Nutzen:** Einheitliches Verhalten (eine Sparte, nur Kategorie wählbar), keine versehentliche „falsche“ Sparte beim Bearbeiten.

---

### 2.2 State `directionFilter` aufräumen

- **Stelle:** `ScreenshotExportAdmin.tsx`, Zeile 1723: `const [directionFilter, setDirectionFilter] = useState<string>('alle')`.
- **Aktuell:** Wird in der UI nicht mehr gesetzt (Typ ist nur noch Anzeige). Filter nutzt bereits `galleryData?.focusDirections?.[0]`.
- **Soll:** State `directionFilter` und `setDirectionFilter` entfernen, überall wo noch referenziert durch die feste Sparte ersetzen (falls noch irgendwo verwendet).

**Nutzen:** Weniger Verwirrung im Code, eine klare Quelle (Stammdaten).

---

### 2.3 GalerieVorschauPage (öffentliche Galerie ök2) – Kategorie-Filter

- **Stelle:** `GalerieVorschauPage.tsx`, `categoriesWithArtworks` (useMemo aus vorhandenen Werken) + Filter-Buttons.
- **Aktuell:** Filter-Buttons = alle **in den Werken vorkommenden** Kategorien, Label via `getCategoryLabel(id)` → für Food z. B. „Speise“, „Getränk“ korrekt.
- **Optional (mehr Benefit):** Für ök2 die **Reihenfolge** der Kategorie-Buttons an die Sparte anpassen: Richtung aus localStorage lesen (`k2-oeffentlich-stammdaten-galerie` → `focusDirections[0]`), dann `getCategoriesForDirection(direction)` als Reihenfolge nutzen und nur die Kategorien anzeigen, die auch in den Werken vorkommen (oder alle Kategorien der Sparte anzeigen, leere mit 0 Werken). So ist die Reihenfolge z. B. immer „Speise, Getränk, …“ statt zufällig nach erstem Vorkommen.

**Nutzen:** Konsistente, vorhersehbare Filter-Reihenfolge für Besucher.

---

### 2.4 GalerieVorschauPage – Neues Werk (mobil)

- **Stelle:** `GalerieVorschauPage.tsx`, ca. Zeile 3555: Kategorie-Dropdown im mobilen „Neues Werk“-Bereich.
- **Aktuell:** Immer `ARTWORK_CATEGORIES` (Malerei, Keramik, Grafik, …).
- **Soll:** Bei **musterOnly (ök2)** Richtung aus Stammdaten laden (`k2-oeffentlich-stammdaten-galerie` / `focusDirections[0]`) und **Kategorie**-Optionen aus `getCategoriesForDirection(focusDirections[0])`. Kein Typ wählbar (Sparte fix). Beim Speichern `entryType = getEntryTypeForDirection(focusDirections[0])`, `category = gewählte Kategorie`.

**Nutzen:** Nutzer legt auch mobil nur Kategorie fest, Sparte kommt aus Stammdaten – gleiche Logik wie Admin.

---

### 2.5 Stammdaten – Normalisierung auf eine Sparte

- **Stelle:** Beim **Laden** der Stammdaten (z. B. `galleryData` aus localStorage oder Merge).
- **Aktuell:** `focusDirections` kann theoretisch mehrere Einträge haben (alte Daten).
- **Soll:** Beim Lesen/Merge für ök2 normalisieren: `focusDirections: Array.isArray(fd) && fd.length > 0 ? [fd[0]] : []`. So wird bei alten Mehrfach-Wahlen nur die erste Sparte verwendet.

**Nutzen:** Keine Inkonsistenz durch alte Mehrfachauswahl; überall gilt „eine Sparte“.

---

### 2.6 Leere Liste / Hinweise

- **Stelle:** Admin „Werke verwalten“, wenn 0 Werke angezeigt werden (z. B. weil alle gefiltert sind oder wirklich leer).
- **Optional:** Kurzer Hinweis: „Deine Sparte steht in den Stammdaten (Meine Richtung). Hier siehst du nur Werke dieser Sparte; Kategorie filtert die Feinzuordnung.“

**Nutzen:** Nutzer versteht, warum nur bestimmte Werke erscheinen.

---

### 2.7 Shop / Etiketten / Export / Druck

- **Stelle:** ShopPage, Etiketten-Druck, Export-PDF etc.
- **Aktuell:** `getCategoryLabel(artwork.category)` wird genutzt → Labels sind korrekt (inkl. Food, Handwerk, etc.).
- **Soll:** Keine Änderung nötig. Optional: Bei ök2 auf Bon/Rechnung/Etikett zusätzlich Sparte anzeigen (z. B. „Food & Genuss · Speise“), wenn gewünscht.

**Nutzen:** Bereits konsistent; optional mehr Kontext auf Belegen.

---

## 3. Priorisierung

| Priorität | Punkt | Aufwand | Nutzen |
|-----------|--------|---------|--------|
| **Hoch** | 2.1 Bearbeiten (ausführliche Form) – Typ nur Anzeige | Klein | Einheitliche UX, keine Sparten-Wechsel beim Bearbeiten |
| **Mittel** | 2.2 directionFilter entfernen | Klein | Code klarer |
| **Mittel** | 2.4 Mobil Neues Werk – Kategorien aus Sparte | Mittel | Gleiche Logik wie Admin |
| **Niedrig** | 2.5 Normalisierung focusDirections auf [first] | Klein | Saubere Daten |
| **Niedrig** | 2.3 GalerieVorschau Filter-Reihenfolge | Klein | Schönere UX für Besucher |
| **Optional** | 2.6 Hinweis leere Liste, 2.7 Sparte auf Belegen | Klein | Mehr Kontext |

---

## 4. Kurzfassung

- **Bereits erledigt:** Stammdaten eine Sparte, Filter mit Typ (Anzeige) + Kategorie (wählbar), Karten mit Typ + Kategorie, Neues Werk (kompakt) nur Kategorie.
- **Als Nächstes:** Bearbeiten-Modal (ausführliche Form) auf feste Sparte umstellen (Typ nur Anzeige, Kategorie aus Stammdaten), dann `directionFilter` entfernen, dann optional Mobil und Filter-Reihenfolge/Leere-Liste.

Damit hat der User überall **eine Sparte aus Stammdaten** und **nur Kategorie** als Wahl – maximaler Benefit bei minimaler Verwirrung.
