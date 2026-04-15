-- K2 Familie: Stripe-Subscription-ID für Abo-Verlängerungen (invoice.paid) zuordnen
ALTER TABLE licences
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_licences_stripe_subscription_id
  ON licences (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL AND btrim(stripe_subscription_id) <> '';
