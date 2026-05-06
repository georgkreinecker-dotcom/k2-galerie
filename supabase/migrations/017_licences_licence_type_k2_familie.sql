-- K2 Familie: Stripe-Checkout schreibt licence_type familie_monat | familie_jahr.
-- Ohne diese Werte schlägt der Webhook-Insert fehl oder ältere Constraints blockieren.

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
