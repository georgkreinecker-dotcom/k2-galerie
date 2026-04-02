-- Idempotenz: Stripe kann dasselbe Event mehrfach senden; parallele Requests dürfen keine doppelte Lizenz/Zahlung erzeugen.
-- Vor dem Lauf prüfen: SELECT stripe_session_id, count(*) FROM licences WHERE stripe_session_id IS NOT NULL GROUP BY 1 HAVING count(*) > 1;
-- (bei Duplikaten zuerst bereinigen, sonst schlägt der Index fehl)

CREATE UNIQUE INDEX IF NOT EXISTS idx_licences_stripe_session_unique
  ON licences (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL AND btrim(stripe_session_id) <> '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_stripe_session_unique
  ON payments (stripe_session_id);
