-- Besucherzähler: dynamische Mandanten-IDs (Lizenz-URLs /g/:tenantId), gleiches Muster wie in der App.
ALTER TABLE visits DROP CONSTRAINT IF EXISTS visits_tenant_id_check;
ALTER TABLE visits ADD CONSTRAINT visits_tenant_id_check
  CHECK (tenant_id ~ '^[a-z0-9-]{1,64}$');
