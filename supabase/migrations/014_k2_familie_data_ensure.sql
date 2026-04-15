-- K2 Familie: Tabelle + Policies sicherstellen (idempotent, Remote ohne frühere Migrationen).
-- Inhalt = docs/sql/supabase-k2-familie-tabelle-einmal.sql (bei Änderung dort und hier spiegeln).

CREATE TABLE IF NOT EXISTS public.k2_familie_data (
  tenant_id TEXT NOT NULL,
  data_type TEXT NOT NULL CHECK (data_type IN ('personen', 'momente', 'events', 'einstellungen')),
  payload JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tenant_id, data_type)
);

DO $$
DECLARE
  r RECORD;
BEGIN
  IF to_regclass('public.k2_familie_data') IS NULL THEN
    RAISE EXCEPTION 'Tabelle public.k2_familie_data fehlt.';
  END IF;

  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    INNER JOIN pg_class t ON c.conrelid = t.oid
    INNER JOIN pg_namespace n ON t.relnamespace = n.oid
    WHERE n.nspname = 'public'
      AND t.relname = 'k2_familie_data'
      AND c.contype = 'c'
  LOOP
    EXECUTE format('ALTER TABLE public.k2_familie_data DROP CONSTRAINT %I', r.conname);
  END LOOP;

  EXECUTE $c$
    ALTER TABLE public.k2_familie_data ADD CONSTRAINT k2_familie_data_data_type_check
    CHECK (data_type IN ('personen', 'momente', 'events', 'einstellungen'))
  $c$;
END $$;

CREATE INDEX IF NOT EXISTS idx_k2_familie_data_tenant ON public.k2_familie_data(tenant_id);

ALTER TABLE public.k2_familie_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "k2_familie_data lesbar" ON public.k2_familie_data;
DROP POLICY IF EXISTS "k2_familie_data insert" ON public.k2_familie_data;
DROP POLICY IF EXISTS "k2_familie_data update" ON public.k2_familie_data;
DROP POLICY IF EXISTS "k2_familie_data delete" ON public.k2_familie_data;

CREATE POLICY "k2_familie_data lesbar"
  ON public.k2_familie_data FOR SELECT USING (true);

CREATE POLICY "k2_familie_data insert"
  ON public.k2_familie_data FOR INSERT WITH CHECK (true);

CREATE POLICY "k2_familie_data update"
  ON public.k2_familie_data FOR UPDATE USING (true);

CREATE POLICY "k2_familie_data delete"
  ON public.k2_familie_data FOR DELETE USING (true);

NOTIFY pgrst, 'reload schema';
