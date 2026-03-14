# Plan: „Für Künstler gedacht – für jede Idee und jedes Produkt gebaut“ in ök2 umsetzen

**Ziel:** Die Vision (Werke = Oberbegriff: Kunstwerk / Produkt / Idee) in der **ök2-Demo** sichtbar und erlebbar machen – ohne Sonderbau, mit **einem** Modell und **einer** Schicht überall.

**Referenz:** docs/VISION-WERKE-IDEEN-PRODUKTE.md

---

## 1. Was schon da ist (nicht doppelt bauen)

| Bereich | Status | Wo |
|--------|--------|-----|
| **Feld entryType** | ✅ | Jedes Werk hat `entryType`: artwork / product / idea |
| **Konfiguration** | ✅ | `tenantConfig.ts`: ENTRY_TYPES, getEntryTypeLabel() |
| **Admin (K2 + ök2 + VK2)** | ✅ | ScreenshotExportAdmin: Dropdown „Typ“ in Neues Werk + Werk bearbeiten (alle Kontexte) |
| **Mobil Neues Werk** | ✅ | GalerieVorschauPage: neues Werk mit entryType: 'artwork' |
| **Sync/Export** | ✅ | Feld wird mitgeführt |

**Regel:** Dieselbe Logik für K2, ök2, VK2 – keine zweite UI oder zweites Modell für ök2.

---

## 2. Wo und was in ök2 konkret umsetzen

### 2.1 Musterdaten – ök2 zeigt auch „Produkt“ und „Idee“

**Ziel:** Besucher der Demo sehen nicht nur Kunstwerke, sondern 1–2 Einträge als **Produkt** bzw. **Idee**, damit die Botschaft „für jede Idee und jedes Produkt gebaut“ klar wird.

| Schritt | Was | Wo (Datei / Stelle) |
|--------|-----|----------------------|
| 1 | MUSTER_ARTWORKS um **entryType** ergänzen | `src/config/tenantConfig.ts` – Array MUSTER_ARTWORKS (ca. Zeile 790) |
| 2 | Zwei Musterwerke als Typ **product** und **idea** kennzeichnen (Rest artwork) | Z. B. K1 = product (Vase als Produkt), O1 = idea („Kleines Feld“ als Idee/Konzept); oder 1× product, 1× idea nach deiner Wahl |
| 3 | Typ-Interface prüfen | Artwork-Objekt hat optionales `entryType`; MUSTER_ARTWORKS sind Artwork-ähnlich – Feld ergänzen, Rückwärtskompatibilität bleibt (fehlend = artwork) |

**Hinweis:** Alle Stellen, die MUSTER_ARTWORKS laden oder anzeigen, behandeln fehlendes entryType bereits wie „artwork“ (getEntryTypeLabel, Admin). Kein weiterer Code nötig, nur Daten anreichern.

---

### 2.2 Anzeige auf Karten (Galerie öffentlich + Vorschau) – optional

**Ziel:** Auf jeder Werkkarte in der Galerie (ök2 wie K2) optional ein kleines **Badge/Label** „Kunstwerk“ / „Produkt“ / „Idee“, damit der Typ sofort sichtbar ist.

| Schritt | Was | Wo (Datei / Stelle) |
|--------|-----|----------------------|
| 1 | Herausfinden, wo die **Werkkarten** gerendert werden | GaleriePage.tsx, GalerieVorschauPage.tsx – Suche nach der Stelle, an der die Liste der Werke (displayArtworks / artworks) zu Karten gemappt wird (Grid/Liste mit Bild, Titel, Nummer) |
| 2 | Pro Karte **getEntryTypeLabel(artwork.entryType)** anzeigen | Kleines Badge (z. B. oben rechts auf der Karte oder unter der Kategorie) – nur wenn gewünscht; sonst Schritt weglassen |
| 3 | Einheitlich für K2 und ök2 | Dieselbe Karten-Komponente / dasselbe Markup – Kontext (musterOnly) nicht für Typ-Anzeige missbrauchen; **ein** Standard |

**Priorität:** Kann nach 2.1 und 2.3 kommen; DIALOG-STAND nannte es „optional, evtl. nach Georgs Feedback“.

---

### 2.3 Texte / Botschaft „für Künstler gedacht, für jede Idee und jedes Produkt gebaut“

**Ziel:** Die Kernbotschaft in der **ök2-Demo** an mindestens einer gut sichtbaren Stelle zeigen (Willkommen, Tagline oder kurzer Intro-Text).

| Schritt | Was | Wo (Datei / Stelle) |
|--------|-----|----------------------|
| 1 | **Tagline oder Willkommenstext** für ök2 anpassen | **Option A:** `src/config/tenantConfig.ts` – TENANT_CONFIGS.oeffentlich.tagline oder MUSTER_TEXTE.welcomeText so formulieren, dass „für Künstler gedacht“ und „für jede Idee und jedes Produkt gebaut“ vorkommt. **Option B:** Nur **welcomeIntroText** (Seitentexte Galerie) – Default für ök2 in `src/config/pageTexts.ts` getOeffentlichGalerieDefaults(): welcomeIntroText aus MUSTER_TEXTE oder neuer Default-String. |
| 2 | Eine Quelle | Entweder MUSTER_TEXTE.welcomeText (wird in pageTexts für ök2 welcomeIntroText genutzt) **oder** eigener Key z. B. MUSTER_TEXTE.visionLine – nicht an beiden Stellen unterschiedliche Texte. |
| 3 | Formulierung (Vorschlag) | „Für Künstler:innen gedacht – gebaut für jede Idee und jedes Produkt. Eine Galerie, ein Modell: Kunstwerke, Produkte, Ideen.“ (kann gekürzt oder anders formuliert werden) |

**Konkret:**

- **tenantConfig.ts:** MUSTER_TEXTE.welcomeText oder neues Feld (z. B. visionLine) setzen; TENANT_CONFIGS.oeffentlich.tagline optional anpassen.
- **pageTexts.ts:** getOeffentlichGalerieDefaults() – welcomeIntroText so setzen, dass er die neue Botschaft nutzt (aus MUSTER_TEXTE oder fest für ök2).

Wo der Text erscheint: Auf der **Galerie-Seite** (ök2) unter „Willkommen bei [Galerie Muster]“ – Absatz **Willkommenstext** (welcomeIntroText). Besucher sehen die Botschaft direkt beim Einstieg.

---

### 2.4 mök2 / Marketing (Vertrieb)

**Ziel:** Die Botschaft für Vertrieb und Lizenzgespräche festhalten – eine Quelle, keine Duplikate.

| Schritt | Was | Wo (Datei / Stelle) |
|--------|-----|----------------------|
| 1 | Sektion oder Absatz in **Marketing ök2** | `src/pages/MarketingOek2Page.tsx` – bestehende Sektion (z. B. USPs oder „Was kann die App“) um einen Absatz ergänzen: „Für Künstler:innen gedacht – für jede Idee und jedes Produkt gebaut. Kunst = Träger der Idee; der ganze Markt hat Platz.“ Oder eigene kleine Unterüberschrift „Vision: Werke = Ideen & Produkte“. |
| 2 | Verweis auf Vision-Doku | Link oder Verweis auf docs/VISION-WERKE-IDEEN-PRODUKTE.md, damit Vertrieb und Nachfolge die volle Begründung haben. |

---

### 2.5 SEO / Beschreibung ök2

**Ziel:** Suchmaschinen und Vorschau-Texte (z. B. Link-Vorschau) transportieren die gleiche Botschaft.

| Schritt | Was | Wo (Datei / Stelle) |
|--------|-----|----------------------|
| 1 | Meta-Beschreibung für ök2-Galerie | `src/config/seoPageMeta.ts` – Eintrag für `/projects/k2-galerie/galerie-oeffentlich` (und ggf. galerie-oeffentlich-vorschau): description so anpassen, dass „für Künstler gedacht“ und „Ideen & Produkte“ vorkommt. |

---

## 3. Reihenfolge (Empfehlung)

1. **2.1 Musterdaten** – MUSTER_ARTWORKS mit entryType (product/idea) ergänzen → sofort sichtbar in der Demo.
2. **2.3 Texte** – welcomeIntroText / tagline / MUSTER_TEXTE anpassen → Botschaft beim ersten Blick.
3. **2.4 mök2** – einen Absatz in MarketingOek2Page → für Vertrieb.
4. **2.5 SEO** – Meta-Beschreibung → für Auffindbarkeit.
5. **2.2 Badge auf Karten** – optional, nach deinem Feedback.

---

## 4. Was wir nicht tun (Sportwagen)

- **Kein** eigener „Produkt“- oder „Idee“-Bereich in der Navigation – alles bleibt unter „Werke“ / Galerie, Typ nur als Feld.
- **Kein** zweites Datenmodell – dieselbe artworksStorage, dieselbe Liste, dieselbe Merge-Logik.
- **Keine** unterschiedliche UX für ök2 vs. K2 beim Anlegen/Bearbeiten – Admin ist bereits einheitlich.

---

## 5. Checkliste vor „Fertig“

- [ ] MUSTER_ARTWORKS haben entryType (mind. 1× product, 1× idea).
- [ ] ök2 Willkommenstext oder Tagline enthält die Botschaft „für Künstler gedacht – für jede Idee und jedes Produkt gebaut“ (oder deine Formulierung).
- [ ] mök2 hat einen Absatz zur Vision (Werke = Ideen & Produkte).
- [ ] SEO-Beschreibung ök2 angepasst.
- [ ] Optional: Badge auf Karten nur wenn gewünscht.
- [ ] Build grün, Tests grün, Commit + Push.

---

**Kurzfassung:** Daten anreichern (2.1), Texte setzen (2.3), mök2 + SEO (2.4, 2.5), optional Karten-Badge (2.2). Alles mit **einer** Schicht, **einem** Modell – kein Sonderbau für ök2.
