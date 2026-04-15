-- K2 Familie: Edge Function familie speichert auch data_type 'einstellungen' (JSON-Objekt).
-- Migration 006 erlaubte nur personen | momente | events → Upsert schlug mit 500 fehl.

ALTER TABLE k2_familie_data DROP CONSTRAINT IF EXISTS k2_familie_data_data_type_check;

ALTER TABLE k2_familie_data ADD CONSTRAINT k2_familie_data_data_type_check
  CHECK (data_type IN ('personen', 'momente', 'events', 'einstellungen'));
