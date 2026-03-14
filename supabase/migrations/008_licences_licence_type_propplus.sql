-- Lizenzstufe Pro++ (Rechnung § 11 UStG) in erlaubte licence_type Werte aufnehmen.
-- Bestehender CHECK erlaubt nur 'basic', 'pro', 'proplus' – Webhook/Checkout würden bei propplus sonst scheitern.

ALTER TABLE licences
  DROP CONSTRAINT IF EXISTS licences_licence_type_check;

ALTER TABLE licences
  ADD CONSTRAINT licences_licence_type_check
  CHECK (licence_type IN ('basic', 'pro', 'proplus', 'propplus'));
