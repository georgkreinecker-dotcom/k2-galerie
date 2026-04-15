# K2 Familie – Supabase einbauen (was sich ändert)

**Stand:** 05.03.26 – **umgesetzt.**  
**Zweck:** Übersicht, was sich ändert, wenn K2 Familie (Personen, Momente, Events) wie K2 Galerie über Supabase synchronisiert wird. Gleicher Ansatz wie bei Artworks: Supabase = Quelle, localStorage = Cache, Load mergt mit lokal, Save pusht nach Supabase.

**Hinweis (Edge-Funktion `familie`):** Synchronisiert werden **Personen, Momente, Events** und optional **Einstellungen**. Weitere Bereiche (z. B. Gaben, Beiträge, Zweige, Geschichten) liegen nur in **localStorage**, bis die API dafür erweitert wird – nicht verwechseln mit „alles in der Cloud“.

---

## 1. Aktuell (ohne Supabase)

| Was | Wo |
|-----|-----|
| **Personen** | localStorage `k2-familie-{tenantId}-personen` |
| **Momente** | localStorage `k2-familie-{tenantId}-momente` |
| **Events** | localStorage `k2-familie-{tenantId}-events` |
| **Schicht** | `src/utils/familieStorage.ts` – loadPersonen, savePersonen, loadMomente, saveMomente, loadEvents, saveEvents |
| **Aufrufer** | K2FamilieStammbaumPage, K2FamiliePersonPage, K2FamilieEventsPage, K2FamilieKalenderPage |

Nur lokal – kein Sync zwischen Geräten, kein zentraler Stand.

---

## 2. Was sich ändert (mit Supabase)

### Backend (Supabase)

- **Neue Tabelle(n):** z. B. eine Tabelle `k2_familie_data` mit `tenant_id`, `data_type` (personen | momente | events), `payload` (JSONB) – oder drei Tabellen `k2_familie_personen`, `k2_familie_momente`, `k2_familie_events` mit `tenant_id` und Spalten/JSONB.
- **Neue Edge Function:** z. B. `familie` – GET mit Query `tenantId` liefert `{ personen, momente, events }`; POST mit `{ tenantId, personen?, momente?, events? }` speichert. Analog zur Artworks-Edge-Function (CORS, Auth optional, RLS pro Tenant).

### Frontend

- **Neue Datei:** `src/utils/familieSupabaseClient.ts` (oder Erweiterung in `supabaseClient.ts`):
  - `loadFamilieFromSupabase(tenantId): Promise<{ personen, momente, events }>`
  - `saveFamilieToSupabase(tenantId, { personen, momente, events }): Promise<boolean>`
  - Beim Laden: Merge mit lokal (nach id), nur schreiben wenn merged.length >= local.length (wie bei Artworks).
- **familieStorage.ts:** Bleibt die **einzige** Schicht für Lesen/Schreiben. Entweder:
  - **Option A:** Die bestehenden `load*`/`save*` rufen intern bei konfiguriertem Supabase zuerst Supabase auf (Load: fetch → merge → write local → return merged; Save: write local → saveFamilieToSupabase), oder
  - **Option B:** Neue Funktionen `loadPersonenWithSupabase(tenantId)` etc., die die Seiten nutzen; alte `loadPersonen` bleiben rein lokal.
  Empfehlung: **Option A** – eine Schicht, gleiche API, Supabase transparent dahinter (wie bei Artworks).
- **Seiten:** Keine Signatur-Änderung nötig – sie rufen weiter `loadPersonen(tenantId)` / `savePersonen(...)`. Wenn Supabase konfiguriert ist, macht die Schicht Load/Sync und Push automatisch.

### Bilder (Personen-Foto, Moment-Bild)

- Optional: Supabase Storage Bucket (z. B. `familie-images`) für Fotos; beim Speichern Upload, URL in `person.photo` / `moment.image` – wie bei Artwork-Bildern. Sonst vorerst Data-URL/Vercel-Pfad wie bisher.

### Doku & Regeln

- **K2-FAMILIE-DATENMODELL.md:** Abschnitt „Speicher“ um „Bei Supabase konfiguriert: Supabase = Quelle, localStorage = Cache“ ergänzen.
- **Sync-Regel:** Merge-Logik für Familie (nach id, nicht nach number) – entweder wiederverwenden einer generischen Merge-Funktion oder kurze eigene Merge-Logik pro Liste (Server = Basis, lokale ohne Server-id behalten, Konflikt nach updatedAt).

---

## 3. Konkrete Schritte (wenn du einbaust)

1. **Supabase:** Tabelle(n) für Familie + Tenant anlegen; RLS so, dass nur eigener Tenant lesbar/schreibbar ist (später Auth pro Familie).
2. **Edge Function** `familie`: GET/POST, tenantId aus Query/Body, gleiche CORS-Liste wie artworks.
3. **familieSupabaseClient.ts:** loadFamilieFromSupabase, saveFamilieToSupabase; Merge beim Load (personen/momente/events je nach id).
4. **familieStorage.ts:** In `loadPersonen` (und loadMomente, loadEvents): wenn `isSupabaseConfigured()`, dann loadFamilieFromSupabase(tenantId) aufrufen, gemergte Listen in localStorage schreiben (wenn safe), zurückgeben. In `savePersonen` (und saveMomente, saveEvents): nach lokalem Schreiben `saveFamilieToSupabase` aufrufen (alle drei Listen mit aktuellen Werten).
5. **Tests:** Merge-Logik und „nicht mit weniger überschreiben“ für Familie testen (analog artworksStorage/syncMerge).
6. **Bilder:** Optional Schritt 2: Storage-Bucket für Familie, Upload bei Foto-Änderung.

---

## 4. Was gleich bleibt

- **Typen:** `K2FamiliePerson`, `K2FamilieMoment`, `K2FamilieEvent` unverändert.
- **Keys:** `k2-familie-{tenantId}-personen|momente|events` weiter für localStorage (Cache).
- **Seiten:** Keine Änderung der Aufrufe nötig, wenn Option A gewählt wird.
- **Datenschutz:** Keine automatischen Löschungen; Schreiben nur nach User-Aktion; Tenant-Isolation (pro Familie nur eigene Daten).

---

## Kurzfassung

**Backend:** Neue Tabelle(n) + Edge Function `familie` (GET/POST pro tenantId).  
**Frontend:** Eine Schicht (familieStorage) ruft bei Supabase Load/Save + Merge; Seiten laden mit Sync-on-Mount.  
**Optional:** Supabase Storage für Personen-/Moment-Bilder.  
**Ergebnis:** K2 Familie wie K2 Galerie „gut geschmiert“ – ein Stand, Sync über Geräte, Pro-Tarif nutzbar.

---

## Erledigt (05.03.26)

- **Migration:** `supabase/migrations/006_k2_familie_data.sql` – Tabelle `k2_familie_data` (tenant_id, data_type, payload).
- **Edge Function:** `supabase/functions/familie/index.ts` – GET ?tenantId=…, POST { tenantId, personen?, momente?, events? }.
- **Client:** `src/utils/familieSupabaseClient.ts` – loadFamilieFromSupabase (Merge nach id), saveFamilieToSupabase.
- **familieStorage:** Nach jedem savePersonen/saveMomente/saveEvents Push zu Supabase (dynamischer Import).
- **Seiten:** Stammbaum, Person, Events, Kalender – Sync-on-Mount (loadFamilieFromSupabase), danach Anzeige aus localStorage.

**Einmalig nötig:** Migration 006 im Supabase Dashboard ausführen; Edge Function `familie` deployen (Supabase CLI oder Dashboard).

### Edge Function `familie` – JWT am Gateway (wichtig für Handy nach QR-Scan)

Im Repo: `supabase/config.toml` mit **`[functions.familie] verify_jwt = false`**. Ohne das blockiert das Supabase-Gateway Aufrufe mit dem **publishable** Key (`sb_publishable_…`) oder liefert 401, bevor CORS greift – die App zeigt dann **„Cloud-Speicher nicht erreichbar“** (fetch wirft).

**Deploy** (im Projektordner, mit eingeloggtem Supabase-CLI):

`supabase functions deploy familie`

Damit wird die JWT-Einstellung mit ausgerollt. Alternativ im Dashboard unter Edge Functions → `familie` → **„Verify JWT with legacy secret“** deaktivieren (gleiche Wirkung; `config.toml` im Git ist die reproduzierbare Quelle).
