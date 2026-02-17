# Admin-Auth einrichten (Supabase)

**Vor dem echten Veröffentlichen:** Damit /admin nur mit echtem Login erreichbar ist und die Datenbank nur von eingeloggten Nutzern beschrieben werden kann.

---

## 1. Admin-Nutzer in Supabase anlegen

1. **Supabase Dashboard** öffnen: https://supabase.com/dashboard → dein Projekt.
2. **Authentication** → **Users** → **Add user** → **Create new user**.
3. **E-Mail** und **Passwort** eintragen (mind. 6 Zeichen). Das ist dein Admin-Login für die K2 Galerie.
4. **Create user** klicken.

Optional: Weitere Admins anlegen (z. B. für Martina).

---

## 2. Migration 002 anwenden (RLS schärfen)

Erst wenn du bereit bist, Schreibzugriff nur für eingeloggte Nutzer zu erzwingen:

**Option A – Supabase Dashboard (SQL Editor):**

1. **SQL Editor** → **New query**.
2. Inhalt von `supabase/migrations/002_artworks_rls_authenticated_only.sql` einfügen.
3. **Run** ausführen.

**Option B – Supabase CLI (wenn eingerichtet):**

```bash
supabase db push
```

oder die Migration manuell ausführen.

**Wichtig:** Nach der Migration können **nur noch** eingeloggte Nutzer Werke in Supabase speichern/löschen. Ohne Login funktioniert weiterhin: Galerie **lesen** (öffentlich), Admin **ohne** Supabase (localStorage-Modus).

---

## 3. Testen

1. App starten (`npm run dev`), zu **/admin** gehen.
2. Wenn Supabase konfiguriert ist (`.env` mit `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY`): Login-Seite erscheint.
3. Mit der angelegten E-Mail und dem Passwort anmelden → Admin sollte sich öffnen.
4. Ein Werk speichern/ändern → sollte funktionieren (Token wird mitgeschickt).
5. Abmelden (falls Abmelde-Button eingebaut) und erneut zu /admin → wieder Login.

---

## 4. Ohne Supabase (Fallback)

Wenn **keine** Supabase-URL/Anon-Key in `.env` stehen: Es wird **kein** Login angezeigt. Du kommst wie bisher direkt in den Admin (localStorage, bestehendes Passwort/Unlock). Das bleibt so, damit lokale/offline Nutzung weiter funktioniert.

---

*Verknüpfung: docs/VOR-VEROEFFENTLICHUNG.md (Checkliste vor Go-Live).*
