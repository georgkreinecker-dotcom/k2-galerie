# Analyse: Warum 1–29 kein Problem sind, 30+ schon (nur Analyse – nichts löschen, nichts ändern)

**Datum:** 11.03.26  
**Auftrag:** Prüfen, was bei den anderen Fotos (ab 30) anders ist als bei 1–29. **Unter keinen Umständen löschen oder etwas ändern** – das wäre fatal.

---

## Kurzfassung

| Bereich | 1–29 | 30–39 | 40+ |
|--------|------|-------|-----|
| **Statische Repo-Dateien** | ✅ Es gibt `public/img/k2/werk-K2-K-0001.jpg` … `werk-0029.jpg` | ❌ Absichtlich kein Fallback (Bereinigung alter Dateien) | ❌ Es gab nie Repo-Dateien |
| **Fallback-URL beim Anzeigen** | ✅ Wenn kein imageRef/Bild: Vercel-URL `/img/k2/werk-…` wird genutzt → Bild lädt | ❌ Keine Fallback-URL (kein 404, nur „Kein Bild“) | ❌ Keine Fallback-URL |
| **„An Server senden“ (Export)** | Bild kann aus IndexedDB kommen ODER Repo-URL reicht | Bild **muss** aus IndexedDB kommen → Upload zu Supabase → https-URL | Gleich wie 30–39 |

**Folge:** Bei 1–29 reicht entweder die Repo-Datei oder ein früherer Upload. Ab 30 gibt es **keine** Repo-Datei – die **einzige** Quelle für eine Bild-URL beim Veröffentlichen ist: Bild in IndexedDB finden → zu Supabase Storage hochladen → URL in den Payload. Schlägt der Upload fehl (Supabase nicht konfiguriert, Netz, Timeout), entsteht **keine** URL → Meldung „X Werke konnten keine Bild-URL erstellt werden“.

---

## 1. Wo im Code der Unterschied festgelegt ist

- **`src/utils/artworkImageStore.ts`**
  - `STATIC_FALLBACK_ALLOWED_RANGE = [1, 29]` → Repo-Fallback-URL nur für 1–29.
  - `STATIC_FALLBACK_EXCLUDE_RANGE = [30, 39]` → 30–39 bekommen bewusst **keine** alte Repo-URL (Bereinigung).
  - Für 1–29: Wenn kein Bild in IndexedDB, wird trotzdem `https://k2-galerie.vercel.app/img/k2/werk-{id}.jpg` gesetzt → Datei existiert im Repo → Bild sichtbar.
  - Für 30+: Kein solcher Fallback → Bild nur sichtbar, wenn echte URL (z. B. von Supabase) oder Bild aus IndexedDB aufgelöst wird.

- **Export / „An Server senden“** (`resolveImageUrlForSupabase` in `supabaseClient.ts`):
  - Bild aus IndexedDB (oder bestehende https-URL) → Upload zu **Supabase Storage** → zurück kommt https-URL.
  - Wenn Supabase nicht konfiguriert ist oder der Upload fehlschlägt: **keine** URL → Werk landet in `artworkNumbersWithoutImageUrl`.
  - Für 1–29: Oft schon früher hochgeladen oder Repo-URL genutzt; viele Werke haben daher bereits eine URL.
  - Für 30+: **Kein** Repo-Fallback beim Export – ohne erfolgreichen Supabase-Upload gibt es keine URL.

---

## 2. Warum es bei 1–29 „keine Probleme“ gab

- Die ersten Fotos (1–29) wurden früher angelegt.
- Entweder:
  - Die Bilder liegen als **statische Dateien** im Repo (`public/img/k2/werk-…`), **oder**
  - Sie wurden damals erfolgreich zu Supabase (oder einem anderen Speicher) hochgeladen und haben eine **https-URL**.
- Beim „An Server senden“ haben diese Werke daher bereits eine URL oder bekommen sie über den Repo-Pfad. Der Export braucht für sie keinen neuen Upload.

---

## 3. Warum ab 30 das Problem anfing

- Ab **30** gilt im Code:
  - **Kein** Fallback auf `/img/k2/werk-…` (30–39 bewusst ausgenommen, 40+ gab es nie).
  - Die **einzige** Möglichkeit, eine Bild-URL für den Export zu bekommen, ist:
    1. Bild in **IndexedDB** finden (über imageRef/Varianten),
    2. Bild zu **Supabase Storage** hochladen,
    3. Zurückbekommen: **https-URL** → diese kommt in den Payload.
- Wenn auf dem Handy/iPad:
  - Supabase **nicht** konfiguriert ist (z. B. keine `VITE_SUPABASE_*` im Build), **oder**
  - der Upload fehlschlägt (Netz, Timeout, CORS, Bucket-Policy),
  dann gibt es **keine** URL für diese Werke → „X Werke konnten keine Bild-URL erstellt werden“ und beim anderen Gerät erscheinen Platzhalter.

---

## 4. Was nicht geändert wurde (Auftrag einhalten)

- **Nichts gelöscht** – weder Daten noch Code.
- **Nichts an der Logik geändert** – 1–29 / 30–39 / 40+ Verhalten unverändert.
- **Nur diese Analyse** angelegt, um den Unterschied zwischen 1–29 und 30+ klar zu haben.

---

## 5. Was das für uns praktisch heißt (umgesetzt 11.03.26)

**Ziel:** Damit es bei 30+ genauso funktioniert wie bei 1–29 („An Server senden“ vom Handy/iPad liefert Bild-URLs).

**Umsetzung:**

1. **Fallback-Upload zu Vercel Blob**
   - Wenn Supabase **nicht** konfiguriert ist oder der Upload fehlschlägt, wird das Bild **zusätzlich** an unsere eigene API geschickt: `POST /api/upload-artwork-image` mit `{ artworkNumber, dataUrl }`.
   - Die API speichert das Bild in Vercel Blob unter `artwork-images/k2/{Nummer}-{Zeitstempel}.jpg` und gibt die öffentliche URL zurück.
   - In `resolveImageUrlForSupabase` (supabaseClient.ts): Nach `uploadArtworkImageToStorage` – wenn keine URL zurückkommt, wird dieser Fallback aufgerufen. **Nichts** an 1–29 oder an bestehenden Daten wird geändert oder gelöscht.

2. **Ergebnis**
   - Handy/iPad: „An Server senden“ findet die Bilder in IndexedDB, versucht zuerst Supabase; wenn das nichts liefert, Upload zu Vercel Blob → URL kommt in den Payload → andere Geräte bekommen die Bilder beim „Aktuellen Stand holen“.
   - 1–29: Unverändert (Repo-Fallback + ggf. Supabase wie bisher).

3. **Optional (weiterhin möglich)**
   - Supabase einrichten (VITE_SUPABASE_* in Vercel), dann werden 30+ primär über Supabase bedient; der Vercel-Blob-Fallback greift nur, wenn Supabase fehlt oder fehlschlägt.

---

## 6. Was das für die zukünftige Skalierfähigkeit heißt

**Heute:** Ein Blob-Store (Vercel), ein Fallback-Pfad. Bilder 30+ können **ohne** Supabase-Installation funktionieren – wichtig für neue Mandanten/Piloten, die erst mal ohne Supabase starten.

**Skalierung (mehr Mandanten, mehr Galerien):**

| Thema | Heute | Für Skalierung |
|--------|--------|------------------|
| **Speicherort** | Vercel Blob (Fallback) + optional Supabase | Pro Mandant getrennte Pfade: z. B. `artwork-images/{tenantId}/…` statt nur `artwork-images/k2/`. Dann skaliert jeder Mandant ohne Überschneidung. |
| **Abhängigkeit** | Nicht mehr **nur** Supabase für Bild-URLs | Klar: **Eine** primäre Quelle für Werkbild-URLs (z. B. Vercel Blob für alle), Supabase optional. Kein „funktioniert nur mit Supabase“. |
| **Kosten/Limits** | Vercel Blob: Free Tier, danach nutzungsbasiert | Bei vielen Mandanten: Speicher und Traffic im Blick, ggf. Nutzung pro Mandant begrenzen oder abrechnen. |
| **Regel** | Ein Standard pro Problem (Sportwagenmodus) | Bild-URL für Export = **ein** Ablauf (z. B. „erst Supabase, sonst Vercel Blob“), bei Skalierung: gleicher Ablauf, nur Pfade/Keys pro Mandant. |

**Fazit:** Die Lösung (Fallback zu Vercel Blob) **unterstützt** Skalierbarkeit: Kein Zwang zu Supabase, eine klare zweite Quelle für URLs. Bei wachsender Mandantenzahl: Blob-Pfade pro Mandant (`tenantId`) einführen, gleiche Logik beibehalten.

---

**Ende der Analyse. Keine Änderung an Daten; nur ergänzender Fallback für URL-Erzeugung bei 30+.**
