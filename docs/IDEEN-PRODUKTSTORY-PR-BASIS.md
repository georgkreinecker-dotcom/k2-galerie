# Produktstory & zündende Ideen – eine Story-Quelle für alle Sparten (PR-Basis)

**Eingefallen:** 19.03.26 (Georg)  
**Ergänzt:** 19.03.26 – Story von anderer KI einfügen; dann haben wir für PR alles.

---

## Kern der Idee

- **Vita** ist nur für **Künstler:innen** relevant – Kurzbiografie, Werdegang, Ausstellungen. Bleibt wie jetzt (Stammdaten, VitaPage, druckfertig).
- **Andere Sparten** (Food, Design, Handwerk, Mode, Dienstleister): Hier braucht es **Produktstorys** und **zündende Ideen** – keine klassische Vita. Was steckt hinter dem Produkt? Warum gibt es uns? Was macht uns aus?
- **Eine Quelle für PR:** Egal ob Vita (Kunst) oder Produktstory/Ideen-Story (andere Sparten) – **ein** zentraler, gespeicherter „Story“-Text pro Person/Richtung. Alle PR-Generatoren (Presse, Flyer, Einladung, Newsletter, Social) lesen **diese eine Quelle**. Dann haben wir für PR alles, was wir brauchen.

---

## Story von anderer KI einfügen

- Wir bauen **keine eigene KI**. Nutzer:innen können ihre Story **woanders** ausformulieren lassen (z. B. ChatGPT, Claude, andere Tools): „Schreib mir eine kurze Produktstory für meine Manufaktur …“, „Fasse meine Idee in drei knackige Sätze …“.
- In der App: **„Story einfügen“** / **„Text von anderer KI einfügen“** – ein Feld (oder Bereich in Stammdaten), in das der User den generierten Text **einfügt** (Copy & Paste), speichert. Fertig.
- **Ergebnis:** Eine gespeicherte Story pro Richtung/Person; PR-Generatoren nutzen sie als Rohstoff. Presse, Flyer, Social – alles aus einer Quelle, ohne doppelt zu tippen. **Damit haben wir für die PR alles, was wir brauchen.**

---

## Technisch / UX (für Umsetzung)

- **Kunst (Meine Richtung = Kunst & Galerie):** Wie heute – **Vita** (Person 1/2), gleiche Oberfläche, gleiche Speicherung. Label „Vita“.
- **Andere Sparten (Food, Design, Handwerk, …):** Gleicher **technischer** Ort (z. B. Stammdaten, eine „Story“ pro Person oder pro Galerie), aber **Label** je nach Richtung: „Produktstory“, „Meine Story“, „Idee-Story“ – oder ein neutrales „Deine Story für Presse & PR“. Inhalt = das, was User von anderer KI einfügt oder selbst tippt.
- **Einfügen-Hilfe:** Button/Link **„Text von ChatGPT (oder anderer KI) einfügen“** – öffnet oder fokussiert das Story-Feld; kurzer Hinweis: „Story woanders schreiben lassen, hier einfügen und Speichern – dann nutzen Presse, Flyer und Social diese Quelle.“

---

## Einordnung

- **Vision:** VISION-WERKE-IDEEN-PRODUKTE.md, PLAN-OEK2-WERKE-IDEEN-PRODUKTE-UMSETZUNG.md
- **PR/Dokumente:** ABLAUF-DOKUMENT-OEFFENTLICHKEITSARBEIT.md, STRATEGIE-PROMOTION-SPORTWAGEN.md
- **Stammdaten-Richtung:** „Meine Richtung“ (ök2) liefert schon Typ/Kategorie; Story-Feld ist die logische Ergänzung – bei Kunst = Vita, bei anderen = Produktstory/Ideen-Story.
- **Vita-Detail:** VITA-BESTER-NUTZEN-VORSCHLAG.md (Vita nur für Kunst; hier: Gesamtbild Vita + Story für alle Sparten).

---

## Zusammenfassung (Georg)

- **Vita** = nur für Künstler:innen.
- **Andere Sparten** = **Produktstory / zündende Idee** – gleiche Rolle wie Vita, anderes Label.
- **Story von anderer KI einfügen** (Copy & Paste) → speichern → **für PR haben wir alles.**

---

## Was wir zur Umsetzung brauchen

### 1. Datenmodell & Speicher

- **Galerie-Stammdaten** (K2/ök2): Neues Feld **`story`** (optional, string).  
  - Bei **Kunst** (Meine Richtung = kunst): wird nicht genutzt; PR nutzt weiter **martina/georg.vita** (und bio).  
  - Bei **anderen Sparten** (food, handwerk, design, mode, dienstleister): **`gallery.story`** = die eine „Produktstory / Idee-Story“.
- **Stammdaten-Schicht:**  
  - `mergeStammdatenGallery`: **story** aufnehmen (wie andere optionale Felder – leer nicht überschreiben).  
  - Defaults/Leer: `story: ''` in K2_STAMMDATEN_DEFAULTS.gallery und in getEmptyOeffentlich für gallery.

### 2. UI im Admin (ök2 + später Lizenznehmer)

- **Ort:** Stammdaten-Tab, nahe „Meine Richtung“ (oder eigener Block „Deine Story für Presse & PR“).
- **Wenn Meine Richtung = Kunst:**  
  - Wie bisher: Link/Button „Vita (Martina/Georg)“ → VitaPage. Keine Änderung.
- **Wenn Meine Richtung ≠ Kunst:**  
  - Ein **Textfeld** (textarea) mit Label z. B. **„Produktstory / Meine Story“** oder **„Deine Story für Presse & PR“**.  
  - Kurzer Hinweis: *„Story z. B. in ChatGPT schreiben lassen, hier einfügen und Speichern – dann nutzen Presse, Flyer und Social diese Quelle.“*  
  - Optional: Button **„Text von ChatGPT (oder anderer KI) einfügen“** – fokussiert das Feld (keine eigene KI, nur Copy & Paste).
- **Speichern:** Wert geht in **galleryData.story** und wird mit `persistStammdaten('oeffentlich', 'gallery', { ...galleryData, story })` gespeichert (K2 braucht das Feld erst, wenn wir Lizenznehmer mit anderen Sparten haben).

### 3. Eine Quelle für PR – Hilfsfunktion

- **Funktion** (z. B. in tenantConfig oder stammdatenStorage):  
  **`getStoryForPr(tenant, galleryData, martinaData?, georgData?): string`**  
  - Wenn **focusDirections[0] === 'kunst'** (oder kein focusDirections): Rückgabe = **martinaData.vita || martinaData.bio** (oder kombiniert für beide Personen, je nachdem wie Presse heute arbeitet).  
  - Wenn **focusDirections[0] !== 'kunst'**: Rückgabe = **galleryData.story** (Produktstory).  
- So haben Presse, Flyer, Einladung, Newsletter, Social **eine** Stelle, die sie aufrufen – und bekommen immer den richtigen Text (Vita vs. Produktstory).

### 4. PR-Generatoren anbinden

- **Stellen, die heute vita/bio nutzen:**  
  - z. B. **PressemappeTab** (personStammdaten.vita || bio), **ScreenshotExportAdmin** (Presse-Einladung, Flyer, Dokumente mit Künstlertext).  
- Dort: Statt direkt **person.vita / person.bio** zu lesen, **getStoryForPr(…)** verwenden, wenn Kontext = ök2 (oder Lizenznehmer) und **focusDirections[0] !== 'kunst'**.  
- Sonst unverändert: Kunst-Kontext = weiter Vita/Bio aus martina/georg.

### 5. VitaPage (ök2)

- **Option A:** Bei ök2 und Meine Richtung ≠ Kunst: Link „Vita“ in der Galerie durch **„Unsere Story“** ersetzen (zeigt **gallery.story** nur an, Bearbeitung im Admin).  
- **Option B:** Vita-Links nur bei Kunst anzeigen; bei anderen Sparten keinen Vita-Link, nur das Story-Feld im Admin.  
- Beides möglich – entscheidend ist: **eine** gespeicherte Story-Quelle, PR liest sie über getStoryForPr.

### 6. Reihenfolge (Vorschlag)

1. Datenmodell: **story** in gallery (mergeStammdatenGallery, Defaults).  
2. **getStoryForPr** bauen und an den bestehenden PR-Stellen (z. B. PressemappeTab) einhängen – zunächst mit Fallback „wie bisher vita/bio“, damit nichts bricht.  
3. UI: Story-Textarea im Admin (ök2) bei „Meine Richtung ≠ Kunst“ + Speichern in gallery.story.  
4. Optional: Hinweis „Text von anderer KI einfügen“, VitaPage-Anpassung (Option A oder B).

**Damit haben wir für die PR alles, was wir brauchen** – eine Quelle, ein Feld zum Einfügen, keine eigene KI.
