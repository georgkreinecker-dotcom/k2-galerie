-- Robust: CHECK auf data_type neu setzen (Constraint-Namen können je nach DB variieren).
-- Tabelle muss existieren (sonst zuerst 006_k2_familie_data.sql im SQL Editor ausführen).

DO $$
DECLARE
  r RECORD;
BEGIN
  IF to_regclass('public.k2_familie_data') IS NULL THEN
    RAISE EXCEPTION 'Tabelle public.k2_familie_data fehlt – zuerst Migration 006 (CREATE TABLE) ausführen.';
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
