# Supabase RLS – Sicherheit

**Stand:** 17.02.26  
**Zweck:** Übersicht, was aktuell gilt und wie du RLS später schärfen kannst.

---

## Aktueller Stand

- **Tabelle `artworks`:** RLS ist **aktiviert** (`ALTER TABLE artworks ENABLE ROW LEVEL SECURITY`).
- **Policies:** Derzeit sehr offen:
  - **SELECT:** `USING (true)` – alle können lesen (passt für öffentliche Galerie).
  - **INSERT / UPDATE / DELETE:** `WITH CHECK (true)` bzw. `USING (true)` – jeder mit gültigem Anon-Key kann schreiben.

Das bedeutet: Wer den **Anon-Key** kennt (z. B. aus dem Frontend), kann über die Supabase-API auf die Tabelle zugreifen. Für eine reine K2/Demo-App mit einem Anon-Key pro Projekt ist das oft so gewollt; für striktere Absicherung brauchst du **Auth** (z. B. Supabase Auth) und schärfere Policies.

---

## Später schärfen (wenn Auth da ist)

1. **Nur eingeloggte Nutzer dürfen schreiben**
   - In der Supabase-Dashboard → Table Editor → `artworks` → Policies:
   - INSERT/UPDATE/DELETE z. B. mit `USING (auth.role() = 'authenticated')` oder `auth.uid() IS NOT NULL`.

2. **Tenant-Trennung**
   - Wenn mehrere Mandanten in derselben Tabelle liegen: Policy z. B. `USING (tenant_id = current_setting('app.tenant_id', true))` (wenn du den Tenant im JWT oder per Setting setzt).

3. **Neue Migration statt direkte Änderung**
   - Änderungen an Policies am besten als neue Migration (z. B. `002_tighten_artworks_rls.sql`) anlegen, dann mit `supabase db push` oder über Dashboard anwenden.

---

## Kurz

- RLS ist an, die Policies sind bewusst offen (Anon darf lesen/schreiben).
- Wenn du später echte Login-Nutzer hast: Policies auf `auth.uid()` / `auth.role()` umstellen und in einer Migration dokumentieren.
