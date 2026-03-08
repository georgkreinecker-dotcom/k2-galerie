-- Geburtskette: tenant_id und galerie_url pro Lizenz (nach Checkout automatisch gesetzt).
-- Webhook checkout.session.completed schreibt diese Felder.

ALTER TABLE licences
  ADD COLUMN IF NOT EXISTS tenant_id TEXT,
  ADD COLUMN IF NOT EXISTS galerie_url TEXT;

CREATE INDEX IF NOT EXISTS idx_licences_tenant_id ON licences(tenant_id);
