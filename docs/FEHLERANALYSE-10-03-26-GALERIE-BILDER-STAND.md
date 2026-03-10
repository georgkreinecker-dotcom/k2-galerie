# Fehleranalyse 10.03.26 – Galerie-Bilder fehlen, Stand mobil (~5 Stunden)

**Zweck:** Die Fehlerkette und Lösungen dieser Session festhalten, damit dieselben Muster nicht wieder Stunden kosten.

---

## Ausgangslage

Nach den Fixes für „Bilder 0030–0039 bereinigen“ (BUG-024) traten zwei neue Probleme auf:

1. **„In der Galerie fehlen auch Fotos, die in den Werken vorhanden sind“** (z. B. K2-K-0013, K2-K-0014)
2. **„In der Galerie fehlen noch viele Keramik-Bilder“**
3. **Stand bei Mobil war zeitweise falsch** (wurde im Lauf der Session mit korrektem Stand abgeschlossen)

---

## Ursachen (Kette)

### 1. Galerie zeigt „Kein Bild“ trotz Bild in den Werken (Admin)

- **Symptom:** Werkkarten in der Galerie-Vorschau zeigten „Kein Bild“, obwohl dieselben Werke im Admin (Werke verwalten) ein Bild hatten.
- **Ursache A:** In `resolveArtworkImages` (artworkImageStore): Im **catch**-Zweig (z. B. IndexedDB-Fehler) wurde das Werk unverändert gepusht (`out.push(a)`) → ohne `imageUrl`. Die Galerie bekam also Werke mit `imageRef` aber ohne aufgelöste URL.
- **Ursache B:** In `loadArtworksResolvedForDisplay` (GalerieVorschauPage): Fallback-URL wurde nur gesetzt, wenn **imageRef** vorhanden war. Fehlte imageRef, blieb nur der Platzhalter.

**Lösung:**  
- artworkImageStore: Im catch ebenfalls Vercel-Fallback-URL für Nicht-30–39 setzen (wie im try).  
- GalerieVorschauPage: Wenn nach resolve noch kein Bild, aber imageRef vorhanden → Vercel-URL aus imageRef bauen (`werk-${id}.jpg`).

### 2. Viele Keramik-Bilder fehlen (ohne imageRef)

- **Symptom:** Besonders viele Keramik-Werke (K2-K-…) zeigten in der Galerie kein Bild.
- **Ursache:** Diese Werke hatten in den Daten **keinen imageRef** (z. B. nach Merge, älterem Export oder anderem Datenstand). Der Fallback griff nur bei vorhandenem imageRef; ohne imageRef wurde sofort der Platzhalter gesetzt.
- **Tatsache:** In `public/img/k2/` liegen Dateien wie `werk-K2-K-0013.jpg`, `werk-K2-K-0014.jpg` – die Bilder sind also auf Vercel vorhanden, nur die Anzeige-Logik nutzte sie nicht, wenn imageRef fehlte.

**Lösung:**  
- **resolveArtworkImages:** Im **else**-Zweig (kein imageRef): Wenn Werk eine gültige Nummer im Format K2-X-NNNN hat und **nicht** im Bereich 30–39 liegt → Vercel-Fallback-URL aus **number/id** bauen (`getVercelFallbackIdFromArtwork`), damit Werke ohne imageRef trotzdem das Bild von Vercel bekommen.  
- **loadArtworksResolvedForDisplay:** Zusätzlicher Schritt: Wenn noch kein imageUrl und number/id im Format K2-X-NNNN → gleiche Vercel-URL aus number bauen.

### 3. Stand bei Mobil „jetzt richtig“

- Der **Stand** (Build/Daten) auf dem Handy war über die Session hinweg ein Thema; am Ende war er korrekt.
- Relevante, bereits vorhandene Absicherungen: QR mit **Server-Stand + Cache-Bust** (buildQrUrlWithBust, useQrVersionTimestamp), keine statische Datei als primäre Quelle beim Laden (API/Blob zuerst), no-cache für index.html und build-info.json (vercel.json). Siehe .cursor/rules/stand-qr-niemals-zurueck.mdc.

---

## Erkenntnisse (für künftige Sessions)

| Muster | Lehre |
|--------|--------|
| **Fallback nur bei imageRef** | Wenn Bilder auf Vercel existieren (public/img/k2/werk-*.jpg), die Anzeige aber von imageRef/IndexedDB abhängt: Immer auch **Fallback aus number/id** vorsehen, damit Werke ohne imageRef (z. B. nach Merge) trotzdem ein Bild bekommen. |
| **Catch-Zweig = gleiche Fallback-Logik** | In resolveArtworkImages: Im catch nicht nur `out.push(a)` – für Nicht-30–39 dieselbe Vercel-Fallback-URL setzen wie im try. |
| **Eine Fehlerklasse, mehrere Stellen** | „Galerie zeigt kein Bild“ kann an resolveArtworkImages, an loadArtworksResolvedForDisplay oder an fehlendem imageRef liegen – alle drei Pfade prüfen und absichern. |
| **Stand mobil** | Regel stand-qr-niemals-zurueck.mdc und PROZESS-VEROEFFENTLICHEN-LADEN beibehalten; API vor statischer Datei; QR mit Server-Timestamp. |

---

## Betroffene Dateien (Fixes dieser Session)

- `src/utils/artworkImageStore.ts`: getVercelFallbackIdFromArtwork; resolveArtworkImages (catch + else mit Fallback aus number/id)
- `src/pages/GalerieVorschauPage.tsx`: loadArtworksResolvedForDisplay (Fallback aus imageRef; Fallback aus number/id)

---

## Verknüpfung

- **Bekannte Fehlerklasse:** Merge/Export ohne Bilddaten, Anzeige abhängig von imageRef → FEHLERANALYSEPROTOKOLL.md (Galerie-Fallback aus number/id).
- **Regel:** Ein Standard pro Problem – Bildauflösung für Galerie: resolveArtworkImages + loadArtworksResolvedForDisplay mit einheitlicher Fallback-Logik (imageRef + number/id), nur 30–39 ausgenommen.
