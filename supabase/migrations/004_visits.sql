-- Besucherzähler für K2 und ök2 (Admin-Anzeige).
-- API nutzt service_role: increment bei Besuch, read für Admin.

CREATE TABLE IF NOT EXISTS visits (
  tenant_id TEXT PRIMARY KEY CHECK (tenant_id IN ('k2', 'oeffentlich', 'vk2')),
  count BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Initiale Zeilen (optional – upsert in API legt an)
INSERT INTO visits (tenant_id, count) VALUES ('k2', 0), ('oeffentlich', 0), ('vk2', 0)
ON CONFLICT (tenant_id) DO NOTHING;

-- RLS: Nur über service_role schreibbar/lesbar (kein anon-Zugriff)
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visits nur service_role"
  ON visits FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
