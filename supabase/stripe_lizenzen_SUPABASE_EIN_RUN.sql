-- =============================================================================
-- Stripe-Lizenzen für Supabase – ALLES IN EINEM
-- =============================================================================
-- Einfach: Diese Datei komplett kopieren → Supabase → SQL Editor → einfügen → EINMAL „Run“.
-- Enthält die gleiche Logik wie Migrationen 003 + 007 + 008 + 010 (Reihenfolge stimmt).
-- WICHTIG: Erste Tabelle heißt **licences** (nicht stripe_lizenzen). Webhook schreibt dorthin.
-- =============================================================================

-- ----- Teil 1: Tabellen + RLS (ehemals 003) -----
CREATE TABLE IF NOT EXISTS licences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  licence_type TEXT NOT NULL CHECK (licence_type IN ('basic', 'pro', 'proplus')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  empfehler_id TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_licences_email ON licences(email);
CREATE INDEX IF NOT EXISTS idx_licences_stripe_session ON licences(stripe_session_id);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  licence_id UUID NOT NULL REFERENCES licences(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  amount_eur DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  stripe_session_id TEXT NOT NULL,
  empfehler_id TEXT,
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_licence_id ON payments(licence_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments(stripe_session_id);

CREATE TABLE IF NOT EXISTS empfehler_gutschriften (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empfehler_id TEXT NOT NULL,
  amount_eur DECIMAL(10, 2) NOT NULL,
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  licence_id UUID NOT NULL REFERENCES licences(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_empfehler_gutschriften_empfehler ON empfehler_gutschriften(empfehler_id);

ALTER TABLE licences ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE empfehler_gutschriften ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Licences SELECT nur authentifiziert" ON licences;
CREATE POLICY "Licences SELECT nur authentifiziert"
  ON licences FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Payments SELECT nur authentifiziert" ON payments;
CREATE POLICY "Payments SELECT nur authentifiziert"
  ON payments FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Empfehler_gutschriften SELECT nur authentifiziert" ON empfehler_gutschriften;
CREATE POLICY "Empfehler_gutschriften SELECT nur authentifiziert"
  ON empfehler_gutschriften FOR SELECT
  USING (auth.role() = 'authenticated');

-- ----- Teil 2: tenant_id + galerie_url (ehemals 007) -----
ALTER TABLE licences
  ADD COLUMN IF NOT EXISTS tenant_id TEXT,
  ADD COLUMN IF NOT EXISTS galerie_url TEXT;

CREATE INDEX IF NOT EXISTS idx_licences_tenant_id ON licences(tenant_id);

-- ----- Teil 3: Pro++ erlauben (ehemals 008) -----
ALTER TABLE licences
  DROP CONSTRAINT IF EXISTS licences_licence_type_check;

ALTER TABLE licences
  ADD CONSTRAINT licences_licence_type_check
  CHECK (licence_type IN ('basic', 'pro', 'proplus', 'propplus'));

-- ----- Teil 4: eindeutige Stripe-Session (ehemals 010) -----
CREATE UNIQUE INDEX IF NOT EXISTS idx_licences_stripe_session_unique
  ON licences (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL AND btrim(stripe_session_id) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_stripe_session_unique
  ON payments (stripe_session_id);

-- =============================================================================
-- Fertig. Als Nächstes: Vercel-Env + Stripe-Webhook (siehe STRIPE-ANBINDUNG-…)
-- =============================================================================
