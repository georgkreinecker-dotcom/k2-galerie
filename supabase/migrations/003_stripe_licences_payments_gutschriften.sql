-- Stripe Lizenzen, Zahlungen, Empfehler-Gutschriften (Phase C Technik-Plan)
-- Webhook schreibt mit service_role (bypasses RLS); Admin liest bei Bedarf (authenticated).

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

-- RLS: Nur authentifizierte Nutzer dürfen lesen (Admin); Schreiben nur über service_role (Webhook)
ALTER TABLE licences ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE empfehler_gutschriften ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Licences SELECT nur authentifiziert"
  ON licences FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Payments SELECT nur authentifiziert"
  ON payments FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Empfehler_gutschriften SELECT nur authentifiziert"
  ON empfehler_gutschriften FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT/UPDATE/DELETE: Keine Policy für anon/authenticated → nur service_role (Webhook) kann schreiben
-- Service role bypasses RLS, daher reicht das.
