# Supabase Storage – Werkbilder

Werkbilder können optional in **Supabase Storage** statt nur lokal/IndexedDB gespeichert werden. Dann wird im Werk `imageUrl` = öffentliche URL gesetzt; alle Geräte und Sync nutzen dieselbe URL.

- **Free Tier:** 1 GB Speicher – reicht für viele hundert komprimierte Bilder.
- **Beim echten Start:** Wechsel auf Pro geplant (mehr Speicher, weniger Limits).

## 1. Bucket anlegen (einmalig)

1. **Supabase Dashboard** → dein Projekt → **Storage** (linke Seite).
2. **New bucket** → Name: `artwork-images`.
3. **Public bucket:** aktivieren (Häkchen), damit die URLs ohne Auth abrufbar sind.
4. **Create bucket**.

## 2. Policy für Uploads

Ohne Policy können Uploads abgelehnt werden. Zwei Varianten:

### Option A: Anon-Upload (einfach für den Start)

- **Storage** → **Policies** (oder Bucket `artwork-images` → **Policies**).
- **New policy** → „For full customization“ (oder „Allow uploads“).
- **Policy name:** z. B. `Allow uploads artwork-images`.
- **Allowed operation:** `INSERT` (und ggf. `UPDATE` für upsert).
- **Target:** Bucket `artwork-images`.
- **WITH CHECK:** z. B. `true` (alle) oder nach Bedarf einschränken (z. B. nur Pfade `k2/*`).
- Speichern.

### Option B: Nur für eingeloggte Nutzer (Auth)

- **Allowed operation:** `INSERT`, `UPDATE`.
- **WITH CHECK:** z. B. `auth.role() = 'authenticated'`.
- Dann müssen Nutzer eingeloggt sein (Admin-Login mit Supabase Auth), damit Uploads funktionieren.

**Hinweis:** Die App nutzt denselben Supabase-Client wie für Auth (`getSupabaseAuthClient()`). Wenn du Auth-Login nutzt, kann Option B sinnvoll sein; sonst Option A zum schnellen Testen.

## 3. Code (bereits eingebaut)

- **Upload:** `src/utils/supabaseStorage.ts` – `uploadArtworkImageToStorage(imageDataUrl, artworkNumber)`.
- **Admin:** Beim Speichern eines Werks (ScreenshotExportAdmin) wird bei konfiguriertem Supabase zuerst in Storage hochgeladen; bei Erfolg ist `imageUrl` die öffentliche URL.
- **Artworks-Sync:** `image_url` wird wie bisher in der Edge Function/DB mitgegeben (supabaseClient.ts).

## 4. Environment

Gleiche Variablen wie für Supabase Auth/KV:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Kein zusätzliches Setup nötig – Storage nutzt denselben Client.

## 5. Kosten / Limits (Free Tier)

- **1 GB** Speicher pro Projekt.
- Komprimierte Werkbilder (z. B. ~50–150 KB pro Bild) → grob 7.000–20.000 Bilder möglich.
- Beim echten Start: **Pro**-Plan für mehr Speicher und höhere Limits geplant.
