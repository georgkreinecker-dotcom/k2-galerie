-- K2 Galerie: Artworks Tabelle
-- Professionelle Datenbankstruktur für Werke

CREATE TABLE IF NOT EXISTS artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT UNIQUE NOT NULL, -- z.B. "K2-M-0001" oder "K2-K-0001"
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('malerei', 'keramik')),
  image_url TEXT,
  preview_url TEXT,
  price DECIMAL(10, 2),
  description TEXT,
  location TEXT, -- z.B. "Regal 1" oder "Bildfläche 2"
  in_shop BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_on_mobile BOOLEAN DEFAULT false,
  updated_on_mobile BOOLEAN DEFAULT false,
  tenant_id TEXT DEFAULT 'k2-galerie' -- Für Multi-Tenant Support
);

-- Index für schnelle Suche
CREATE INDEX IF NOT EXISTS idx_artworks_number ON artworks(number);
CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_tenant ON artworks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON artworks(created_at DESC);

-- Updated_at automatisch aktualisieren
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_artworks_updated_at
  BEFORE UPDATE ON artworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) aktivieren
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- Policy: Alle können lesen (öffentliche Galerie)
CREATE POLICY "Artworks sind öffentlich lesbar"
  ON artworks FOR SELECT
  USING (true);

-- Policy: Nur authentifizierte Nutzer können schreiben
-- TODO: Später mit echten Auth-Usern erweitern
CREATE POLICY "Artworks können geschrieben werden"
  ON artworks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Artworks können aktualisiert werden"
  ON artworks FOR UPDATE
  USING (true);

CREATE POLICY "Artworks können gelöscht werden"
  ON artworks FOR DELETE
  USING (true);
