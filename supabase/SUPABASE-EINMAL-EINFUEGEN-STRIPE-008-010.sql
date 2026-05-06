-- =============================================================================
-- EINMAL in Supabase SQL Editor: alles markieren (Cmd+A), kopieren, einfügen, Run
-- Voraussetzung: Migrationen 003 und 007 sind bei dir schon erfolgreich gelaufen.
-- Enthält: 008 (licence_type propplus) + 010 (eindeutige stripe_session_id)
-- =============================================================================

-- ----- 008: Lizenzstufe Pro++ (propplus) erlauben -----
ALTER TABLE licences
  DROP CONSTRAINT IF EXISTS licences_licence_type_check;

ALTER TABLE licences
  ADD CONSTRAINT licences_licence_type_check
  CHECK (licence_type IN ('basic', 'pro', 'proplus', 'propplus'));

-- ----- 010: Keine doppelte Lizenz/Zahlung bei gleicher Stripe-Session -----
CREATE UNIQUE INDEX IF NOT EXISTS idx_licences_stripe_session_unique
  ON licences (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL AND btrim(stripe_session_id) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_stripe_session_unique
  ON payments (stripe_session_id);
