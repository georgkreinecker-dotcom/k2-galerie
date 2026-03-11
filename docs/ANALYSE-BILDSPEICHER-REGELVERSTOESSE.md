# Analyse: Bildspeicher-Prozess vs. Regeln (Selbstcheck)

**Stand:** 11.03.26  
**Auftrag:** Den ganzen Bildspeicher-Prozess analysieren und prüfen, gegen wie viele Regeln verstoßen wurde (bzw. wo Verstöße bestehen).

---

## 1. Ablauf Bildspeicher (Kurzüberblick)

| Phase | Standard / Regel | Wo im Code |
|-------|------------------|-------------|
| **Bild einfügen** | `runBildUebernehmen` (ein Ablauf) | ScreenshotExportAdmin, überall wo Bild übernommen wird |
| **Werke mit Bild speichern** | Immer ImageStore: `prepareArtworksForStorage` oder `saveArtworksByKeyWithImageStore` | artworksStorage, artworkImageStore |
| **Veröffentlichen** | Nur `publishGalleryDataToServer` (resolve → export → POST) | publishGalleryData.ts, Aufrufer: DevView, GalerieVorschau, Admin |
| **Laden vom Server** | Immer `mergeServerWithLocal` + `preserveLocalImageData` (bzw. `applyServerDataToLocal`) | syncMerge.ts, GaleriePage, GalerieVorschauPage, Admin |

---

## 2. Regelquellen (geprüft)

- **ein-standard-problem.mdc** – eine Lösung pro Problemstellung; Tabelle „Werke mit Bilddaten“, „Veröffentlichen“, „Laden“
- **werke-bilder-immer-imagestore.mdc** – Werke mit data-URL nur über prepareArtworksForStorage / *WithImageStore speichern
- **prozesssicherheit-veroeffentlichen-laden.mdc** – nur publishGalleryDataToServer; nur merge + preserveLocalImageData beim Laden
- **PROZESS-VEROEFFENTLICHEN-LADEN.md** – Ablauf Doku
- **WERKE-SPEICHERUNG-CHECKLISTE.md** – allowReduce, kein Filter-and-Write, ImageStore-Pflicht
- **bild-einfuegen-ein-standard.mdc** – runBildUebernehmen überall

---

## 3. Verstöße und Schwachstellen

### 3.1 Verstoß: Fallback in saveArtworksByKeyWithImageStore schreibt data-URLs

**Regel:** werke-bilder-immer-imagestore.mdc – „Niemals saveArtworksByKey aufrufen, wenn toSave Werke mit imageUrl = lange data-URL enthält.“

**Code:** `src/utils/artworksStorage.ts` (Zeilen 122–133):

```ts
try {
  const prepared = await prepareArtworksForStorage(...)
  return saveArtworksByKey(key, prepared, options)
} catch (e) {
  console.warn('prepareArtworksForStorage failed, saving without image store:', e)
  return saveArtworksByKey(key, toSave, options)  // ← Verstoß: toSave kann data-URLs enthalten
}
```

**Bewertung:** Wenn prepareArtworksForStorage wirft, wird die **unvorbereitete** Liste (mit data-URLs) in localStorage geschrieben → Speicherproblem, Verstoß gegen ImageStore-Pflicht.

**Empfehlung:** Im catch entweder (a) nicht schreiben und false zurückgeben, oder (b) toSave vor dem Schreiben durch stripBase64FromArtworks o. ä. bereinigen (ohne Base64 schreiben), oder (c) prepareArtworksForStorage pro Werk in try/catch und nur vorbereitete Werke schreiben.

---

### 3.2 Verstoß: compressAllArtworkImages schreibt data-URLs ohne ImageStore

**Regel:** Werke mit Bilddaten speichern = immer ImageStore (prepareArtworksForStorage oder *WithImageStore).

**Code:** `src/utils/autoSave.ts` (Zeilen 640–667).  
`compressAllArtworkImages` liest Werke, komprimiert data-URLs in-place (kleinere data-URL), schreibt dann mit **saveArtworksByKey(storageKey, updated, …)**. Die Liste enthält weiterhin data-URLs (nur komprimiert) → kein ImageStore, kein prepareArtworksForStorage.

**Bewertung:** Klarer Verstoß: Es wird direkt in den Key geschrieben, obwohl die Liste Bilddaten (data-URL) enthält.

**Empfehlung:** Nach Komprimierung entweder (a) prepareArtworksForStorage(updated) aufrufen und dann saveArtworksByKey mit der vorbereiteten Liste, oder (b) saveArtworksByKeyWithImageStore nutzen (dann wird ohnehin prepareArtworksForStorage ausgeführt – Komprimierung könnte vorher oder in prepareArtworksForStorage integriert werden).

---

### 3.3 Möglicher Verstoß: Supabase – Backup in localStorage mit möglichen data-URLs

**Regel:** Kein Schreiben von Listen mit data-URL ohne ImageStore.

**Code:** `src/utils/supabaseClient.ts`:  
- Nach Supabase-Erfolg: `saveArtworksByKey('k2-artworks', toStore, …)` mit `toStore = filterK2ArtworksOnly(validArtworks)`.  
- `validArtworks` ist die **Eingabeliste** zum Speichern in Supabase; sie kann noch imageUrl = data-URL enthalten (wir haben nur for the DB `withResolvedUrls` gebaut, für localStorage wird validArtworks geschrieben).

**Bewertung:** Wenn Aufrufer von saveArtworksToSupabase eine Liste mit data-URLs übergibt, landet diese im „Backup“ in localStorage → Verstoß. Wenn Aufrufer immer bereits vorbereitete Listen übergeben, OK. Caller-Check: GalerieVorschauPage ruft saveArtworksToSupabase mit `prepared` (nach prepareArtworksForStorage) auf – dort OK. Andere Aufrufer prüfen.

**Empfehlung:** Vor saveArtworksByKey in Supabase-Code entweder stripBase64FromArtworks(toStore) oder prepareArtworksForStorage(toStore) anwenden, oder explizit nur mit listen schreiben, die garantiert keine data-URLs haben (z. B. withResolvedUrls statt validArtworks für das lokale Backup, dann nur URLs).

---

### 3.4 Doku nicht ganz aktuell (preserveLocalImageData)

**Regel:** PROZESS-VEROEFFENTLICHEN-LADEN.md und Prozessregeln sollen den einzigen Ablauf beschreiben.

**Stand Code (nach BUG-028, BUG-029):**  
- preserveLocalImageData: Wenn **Server** eine echte URL hat → immer Server nehmen.  
- Nur wenn **lokal kein Bild und Server kein Bild** → Merged-Item ohne Bild.  
- Wenn lokal kein Bild, aber Server hat URL → Server-URL übernehmen (Mac blockiert 30–39 nicht mehr).

**Stand Doku (PROZESS Abschnitt 2, 6):**  
- „Wenn lokal ein Bild existiert und Server keins hat, bleibt das lokale Bild.“  
- „Wenn lokal bewusst kein Bild → Merged ohne Bild.“  
- Die **Priorität „Server-URL wenn vorhanden“** und die **Ausnahme „lokal leer, Server hat URL“** sind in der Doku nicht klar nachgezogen.

**Bewertung:** Kein Code-Verstoß, aber Doku-Verstoß gegen „eine Quelle, ein Ablauf“ – wer nur die Doku liest, kennt die aktuelle preserveLocalImageData-Logik nicht vollständig.

**Empfehlung:** PROZESS-VEROEFFENTLICHEN-LADEN.md Abschnitt 2 und 6 anpassen: Server-URL hat Vorrang; nur bei „lokal leer und Server leer“ Merged ohne Bild; sonst Server-URL übernehmen wenn vorhanden.

---

### 3.5 Doku: „Bei Fehler statische gallery-data.json“ / „Few-Works-Fallback“

**Regel:** Prozesssicherheit – nur ein Lade-Ablauf; API = einzige Quelle (kein Fallback auf statische Datei mehr).

**Stand Code:** Bereits gefixt (nur API, kein Fallback auf statische Datei, BUG-023).  
**Stand Doku:** PROZESS Abschnitt 2 Schritt 1 erwähnt noch „bei Fehler statische gallery-data.json“ und „Few-Works-Fallback (statische Datei nutzen wenn mehr Werke)“.

**Bewertung:** Doku beschreibt alten Ablauf → Verstoß gegen „Doku = einzige Quelle der Wahrheit“.

**Empfehlung:** In PROZESS-VEROEFFENTLICHEN-LADEN.md Formulierung anpassen: Bei API-Fehler keine statische Datei, keine Ersetzung der API-Antwort; Hinweis „Verbindung prüfen / erneut tippen“.

---

### 3.6 Ein Standard – Veröffentlichen / Laden (erfüllt)

- **Veröffentlichen:** Nur publishGalleryDataToServer; keine weiteren Fetches zu write-gallery-data. ✅  
- **Laden:** GaleriePage, GalerieVorschauPage, Admin nutzen applyServerDataToLocal bzw. merge + preserveLocalImageData. ✅  
- **Bild einfügen:** runBildUebernehmen zentral genutzt. ✅  

---

### 3.7 ImageStore-Pflicht – Aufrufer (überwiegend erfüllt)

- GalerieVorschauPage, GaleriePage, Admin (ScreenshotExportAdmin), DevViewPage, autoSave (normale Speicherpfade), PlatzanordnungPage: nutzen **saveArtworksByKeyWithImageStore** oder **saveArtworksForContextWithImageStore** bzw. prepareArtworksForStorage vor save. ✅  
- Ausnahmen (Verstöße): siehe 3.1 (catch in WithImageStore), 3.2 (compressAllArtworkImages), ggf. 3.3 (Supabase Backup).

---

## 4. Zusammenfassung: Anzahl der Verstöße

| Nr | Thema | Art | Schwere |
|----|--------|-----|--------|
| 3.1 | saveArtworksByKeyWithImageStore catch schreibt toSave mit data-URL | Code | Hoch (Speicher/Regel) |
| 3.2 | compressAllArtworkImages nutzt saveArtworksByKey mit data-URL-Liste | Code | Hoch |
| 3.3 | Supabase Backup: validArtworks mit data-URL möglich | Code | Mittel (abhängig von Aufrufer) |
| 3.4 | Doku preserveLocalImageData nicht angepasst | Doku | Mittel |
| 3.5 | Doku API/statische Datei/Few-Works veraltet | Doku | Mittel |

**Gezählt:** **2 klare Code-Verstöße** (3.1, 3.2), **1 möglicher Code-Verstoß** (3.3), **2 Doku-Verstöße** (3.4, 3.5).  
**Gesamt:** **5** Stellen, an denen gegen die geprüften Regeln verstoßen wurde bzw. wird.

---

## 5. Nächste Schritte (Empfehlung)

1. **3.1:** In artworksStorage.ts im catch von saveArtworksByKeyWithImageStore nicht `saveArtworksByKey(key, toSave)` aufrufen; stattdessen false zurückgeben oder stripBase64FromArtworks(toSave) anwenden und dann speichern (ohne große Base64 in localStorage).
2. **3.2:** compressAllArtworkImages so umbauen, dass nach Komprimierung prepareArtworksForStorage genutzt wird und dann saveArtworksByKey mit vorbereiteter Liste, oder saveArtworksByKeyWithImageStore aufrufen.
3. **3.3:** In supabaseClient beim Schreiben in localStorage nach Supabase-Erfolg/Fehler nur listen ohne data-URL schreiben (z. B. withResolvedUrls für Backup oder stripBase64FromArtworks).
4. **3.4 + 3.5:** PROZESS-VEROEFFENTLICHEN-LADEN.md aktualisieren (preserveLocalImageData-Logik, API einzige Quelle, kein statischer Fallback).

---

**Erstellt:** 11.03.26, Selbstcheck gegen .cursor/rules und docs.
