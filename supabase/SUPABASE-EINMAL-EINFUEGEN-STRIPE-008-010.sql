-- =============================================================================
-- EINMAL in Supabase SQL Editor: alles markieren (Cmd+A), kopieren, einfügen, Run
-- Voraussetzung: Migrationen 003 und 007 sind bei dir schon erfolgreich gelaufen.
-- Enthält: 008 (licence_type propplus) + 016 (marketing_attribution_events) + 017 (K2 Familie) + 010 (stripe_session_id)
-- =============================================================================

-- ----- 008: Lizenzstufe Pro++ (propplus) erlauben -----
ALTER TABLE licences
  DROP CONSTRAINT IF EXISTS licences_licence_type_check;

ALTER TABLE licences
  ADD CONSTRAINT licences_licence_type_check
  CHECK (licence_type IN ('basic', 'pro', 'proplus', 'propplus'));

-- ----- 016: Marketing-Attribution (ök2/VK2/Familie – Landings + conversion_licence) -----
CREATE TABLE IF NOT EXISTS marketing_attribution_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  visitor_anon_id text NOT NULL,
  surface text NOT NULL CHECK (surface IN ('oeffentlich', 'vk2', 'k2_familie')),
  tenant_visit_key text NOT NULL CHECK (tenant_visit_key ~ '^[a-z0-9-]{1,64}$'),
  event_kind text NOT NULL CHECK (event_kind IN ('landing', 'conversion_licence')),
  campaign_key text CHECK (campaign_key IS NULL OR (char_length(campaign_key) BETWEEN 1 AND 128)),
  referrer_host text CHECK (referrer_host IS NULL OR char_length(referrer_host) <= 200),
  path text CHECK (path IS NULL OR char_length(path) <= 512)
);

CREATE INDEX IF NOT EXISTS idx_marketing_attr_created ON marketing_attribution_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_attr_campaign_surface ON marketing_attribution_events (campaign_key, surface);

ALTER TABLE marketing_attribution_events ENABLE ROW LEVEL SECURITY;

-- ----- 017: K2 Familie (familie_monat | familie_jahr) – sonst Webhook/Heal schlägt fehl -----
ALTER TABLE licences
  DROP CONSTRAINT IF EXISTS licences_licence_type_check;

ALTER TABLE licences
  ADD CONSTRAINT licences_licence_type_check
  CHECK (
    licence_type IN (
      'basic',
      'pro',
      'proplus',
      'propplus',
      'familie_monat',
      'familie_jahr'
    )
  );

-- ----- 010: Keine doppelte Lizenz/Zahlung bei gleicher Stripe-Session -----
CREATE UNIQUE INDEX IF NOT EXISTS idx_licences_stripe_session_unique
  ON licences (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL AND btrim(stripe_session_id) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_stripe_session_unique
  ON payments (stripe_session_id);
