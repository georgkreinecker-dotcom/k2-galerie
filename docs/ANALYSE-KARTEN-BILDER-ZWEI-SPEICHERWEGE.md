# Analyse: Karten und Bilder – zwei Speicherwege

**Hintergrund:** Georg: „Bei dieser Kombination Karten/Bilder geht das System zwei verschiedene Speicherwege und findet dann oft nicht zusammen.“ Das hat fast den ganzen Tag beschäftigt; befriedigende Lösung fehlt noch. Diese Analyse dokumentiert die Architektur und mögliche Fehlerquellen – inkl. Prüfung, ob die jüngsten Änderungen (Ref-Varianten, iPad-Block bei Bildverlust) eine neue Fehlerquelle eingebaut haben.

---

## 1. Die zwei Speicherwege

| Weg | Inhalt | Wo |
|-----|--------|-----|
| **Karten/Liste** | Werk-Metadaten (number, title, category, **imageRef**, imageUrl, …) | localStorage, Key z. B. `k2-artworks` |
| **Bilder** | Bilddaten (data URL oder Referenz) | **IndexedDB** (Store `k2-artwork-images`), Key = **imageRef** (z. B. `k2-img-0031`, `k2-img-K2-K-0031`) |

**Verbindung:** Das Feld **imageRef** in der Liste ist der **IndexedDB-Key** für das Bild. Wenn die Liste `imageRef: "k2-img-0031"` hat, muss in IndexedDB ein Eintrag mit `id: "k2-img-0031"` existieren, sonst „finden sie nicht zusammen“ → Platzhalter.

---

## 2. Wo der Link (imageRef ↔ IndexedDB) entstehen kann

- **Beim Speichern (Neu/Bearbeiten):** `prepareArtworksForStorage` nimmt die Liste, legt data-URL-Bilder in IndexedDB ab unter `ref = a.imageRef || getArtworkImageRef(a)` und setzt in der Liste `imageRef: ref`. Ein Standard – Liste und IndexedDB werden in einem Durchgang konsistent gemacht.
- **Regel:** Immer wenn Werke **mit Bilddaten** (data-URL oder neu) geschrieben werden: **saveArtworksByKeyWithImageStore** / **prepareArtworksForStorage** verwenden. Nie nur `saveArtworksByKey` mit einer Liste, die imageRef „irgendwoher“ hat, ohne dass das Bild unter genau diesem Ref in IndexedDB liegt.

---

## 3. Wo der Link brechen kann (Fehlerquellen)

### 3.1 Nummernformat unterschiedlich (0031 vs. K2-K-0031)

- Bild wurde abgelegt, als die Liste `number: "K2-K-0031"` hatte → Ref = `k2-img-K2-K-0031`, Bild in IndexedDB unter diesem Key.
- Später kommt vom Server oder aus Merge `number: "0031"`. Wenn irgendwo **imageRef neu aus number** gesetzt wird (z. B. `imageRef = getArtworkImageRef(item)` → `k2-img-0031`), **ohne** das Bild in IndexedDB unter `k2-img-0031` zu speichern, dann zeigt die Liste `k2-img-0031`, IndexedDB hat aber nur `k2-img-K2-K-0031` → **nicht zusammen**.

### 3.2 imageRef durch URL ersetzt

- **fillArtworkImageUrlsFromSupabase** setzt bei Treffer: `imageUrl: fromSupabase, imageRef: fromSupabase` (also imageRef = https-URL). Das ist für **Anzeige** ok (Bild kommt von URL), aber die **IndexedDB-Ref** ist dann weg. Wenn später wieder mit „nur imageRef“ gearbeitet wird und die URL weg ist, findet man das Bild nicht mehr in IndexedDB. Für die 19 Werke ohne Supabase-URL bleibt imageRef aber die lokale Ref (z. B. k2-img-K2-K-0031) – da ist der Link erhalten.

### 3.3 „Stand holen“ speichert ohne erneutes prepareArtworksForStorage mit Bilddaten

- Nach Merge + preserveLocalImageData hat die Liste teils **imageRef** aus lokal (z. B. k2-img-K2-K-0031), teils **imageUrl** (https) vom Server. Beim Speichern wird **saveArtworksByKeyWithImageStore** aufgerufen → **prepareArtworksForStorage** läuft. Dort werden nur Einträge mit **data:image** in IndexedDB geschrieben; Einträge mit bereits vorhandener https-URL oder nur imageRef werden nicht umgeschrieben. Es wird **kein** neuer Ref aus `getArtworkImageRef(item)` erzwungen. Damit bleibt der erhaltene imageRef (k2-img-…) erhalten → **kein neuer Bruch durch diese Stelle**.

### 3.4 Nur eine Schreibstelle nutzt ImageStore nicht

- Jede Stelle, die eine Werkliste **mit Bilddaten (data-URL)** in localStorage schreibt, muss **prepareArtworksForStorage** bzw. **saveArtworksByKeyWithImageStore** nutzen. Sonst: Liste hat imageRef oder data-URL, IndexedDB wurde nie befüllt oder unter anderem Key befüllt → **nicht zusammen**. (Checkliste: werke-bilder-immer-imagestore.mdc, ein-standard-problem.mdc.)

---

## 4. Prüfung der jüngsten Änderungen (11.03.26)

### 4.1 Ref-Varianten (getArtworkImageRefVariants + resolveImageUrlForSupabase)

- **Was:** Beim Export („An Server senden“) werden mehrere mögliche Refs ausprobiert (`k2-img-0031`, `k2-img-K2-K-0031`, …), bis ein Bild in IndexedDB gefunden wird.
- **Eingriff in Speicher:** **Kein Schreiben** in Liste oder IndexedDB. Es wird nur **gelesen** (getArtworkImage(ref)).
- **Fazit:** **Keine neue Fehlerquelle.** Reduziert eher das „finden nicht zusammen“, wenn die Liste unter einer anderen Schreibweise (z. B. 0031) geführt wird, das Bild aber unter K2-K-0031 in IndexedDB liegt.

### 4.2 iPad-Block: „Mehr Werke als Server“

- **Was:** Wenn auf dem iPad mehr Karten lokal sind als der Server hat → „Aktuellen Stand holen“ wird abgebrochen.
- **Eingriff in Speicher:** Kein Schreiben, nur Abbruch vor dem Merge/Speichern.
- **Fazit:** **Keine neue Fehlerquelle.**

### 4.3 iPad-Block: „Mehr Bilder als Server liefert“

- **Was:** Wenn nach Merge `savedWithImageCount < localWithImageCount` (lokal mehr Werke mit Bild als der Merge liefern würde) → auf dem iPad Abbruch, keine Frage „Trotzdem laden?“.
- **Eingriff in Speicher:** Kein Schreiben, nur Abbruch.
- **Fazit:** **Keine neue Fehlerquelle.** Verhindert, dass 19 lokale Bilder durch Server-Stand ersetzt werden.

---

## 5. Empfehlung (kein Code-Change in dieser Doku)

- **Eine verbindliche Regel:** Immer dann, wenn ein Werk **neu** mit Bild (data-URL) gespeichert oder **bearbeitet** wird, muss die **gleiche** Logik laufen: Bild in IndexedDB unter **einem** Ref ablegen und **diesen** Ref in der Liste setzen. Ref muss aus **demselben** Werk (number/id) abgeleitet werden wie beim späteren Lookup (getArtworkImageRef / getArtworkImageRefVariants).
- **Nummernformat:** Wo immer number/id zwischen 0031 und K2-K-0031 wechselt (Merge, Server, Admin), **imageRef nicht** durch einen neu aus number berechneten Ref ersetzen, **außer** das Bild wird in derselben Aktion unter genau diesem Ref in IndexedDB gelegt (prepareArtworksForStorage).
- **Doku:** Diese Datei und die Verweise (prozesssicherheit-veroeffentlichen-laden.mdc, PROZESS-VEROEFFENTLICHEN-LADEN.md, werke-bilder-immer-imagestore.mdc) bei Änderungen an Karten/Bilder-Speicherung beachten.

---

## 6. Kette wieder am gleichen Glied (11.03.26 – umgesetzt)

**Georg:** „Wir müssen 100 % sicherstellen, dass diese Kette von Werken mit Bildern auch wenn sich einmal eine Trennung ergibt beim Speichern nachher wieder am gleichen Glied trifft – wie in der Mechanik.“

**Umsetzung in `artworkImageStore.ts`:**

- **Kanonischer Ref pro Werk:** `getCanonicalImageRef(artwork)` = `getArtworkImageRef(artwork)` (ein Glied: number/id → z. B. `k2-img-0031`).
- **Beim Speichern (`prepareArtworksForStorage`):**  
  - Mit frischem data:image → Bild unter **kanonischem Ref** in IndexedDB, Liste `imageRef = kanonischer Ref`.  
  - Ohne data:image, aber mit imageRef/number/id → Bild unter **Varianten** suchen (`getArtworkImageByRefVariants`); wenn gefunden → unter **kanonischem Ref** speichern, Liste `imageRef = kanonischer Ref`. So rastet die Kette nach einer Trennung (Bild unter k2-img-K2-K-0031, Liste hatte k2-img-0031) beim nächsten Speichern wieder ein.
- **Beim Anzeigen (`resolveArtworkImages`):** Wenn unter gespeichertem Ref kein Bild → unter Varianten suchen; Anzeige funktioniert bis zum nächsten Speichern, dann wird vereinheitlicht.

**Neue Hilfsfunktion:** `getArtworkImageByRefVariants(refs)` – sucht in IndexedDB unter mehreren Refs, gibt erstes gefundenes Bild + Ref zurück.

---

**Stand:** 11.03.26 – Analyse nach Georgs Hinweis „zwei Speicherwege finden oft nicht zusammen“; Abschnitt 6: Kette wieder am gleichen Glied umgesetzt.
