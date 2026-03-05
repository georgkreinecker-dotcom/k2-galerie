-- K2 Familie: eine Tabelle pro Tenant und Datentyp (personen, momente, events)
-- payload = JSONB Array; eindeutig (tenant_id, data_type)

CREATE TABLE IF NOT EXISTS k2_familie_data (
  tenant_id TEXT NOT NULL,
  data_type TEXT NOT NULL CHECK (data_type IN ('personen', 'momente', 'events')),
  payload JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (tenant_id, data_type)
);

CREATE INDEX IF NOT EXISTS idx_k2_familie_data_tenant ON k2_familie_data(tenant_id);

ALTER TABLE k2_familie_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "k2_familie_data lesbar"
  ON k2_familie_data FOR SELECT USING (true);

CREATE POLICY "k2_familie_data insert"
  ON k2_familie_data FOR INSERT WITH CHECK (true);

CREATE POLICY "k2_familie_data update"
  ON k2_familie_data FOR UPDATE USING (true);

CREATE POLICY "k2_familie_data delete"
  ON k2_familie_data FOR DELETE USING (true);
