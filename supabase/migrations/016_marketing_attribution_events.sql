-- Werbe-Korrelation: pseudonyme Landings (Besucher-ID pro Tab-Session) × Kampagne × Oberfläche.
-- Schreiben nur über Vercel-API (Service Role). Keine PII: kein Name/E-Mail in dieser Tabelle.

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
