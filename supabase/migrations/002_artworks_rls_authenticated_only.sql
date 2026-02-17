-- RLS schärfen: Schreibzugriff nur für authentifizierte Nutzer (Produkt-Label Sicherheit).
-- Vor dem echten Veröffentlichen anwenden (siehe docs/VOR-VEROEFFENTLICHUNG.md).

-- Alte permissive Policies entfernen
DROP POLICY IF EXISTS "Artworks können geschrieben werden" ON artworks;
DROP POLICY IF EXISTS "Artworks können aktualisiert werden" ON artworks;
DROP POLICY IF EXISTS "Artworks können gelöscht werden" ON artworks;

-- Neue Policies: Nur eingeloggte Nutzer (Supabase Auth) dürfen schreiben
CREATE POLICY "Artworks INSERT nur authentifiziert"
  ON artworks FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Artworks UPDATE nur authentifiziert"
  ON artworks FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Artworks DELETE nur authentifiziert"
  ON artworks FOR DELETE
  USING (auth.role() = 'authenticated');

-- SELECT bleibt unverändert: "Artworks sind öffentlich lesbar" (USING true)
