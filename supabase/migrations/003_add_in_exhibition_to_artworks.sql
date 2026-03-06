-- „In Online-Galerie anzeigen“ – damit Galerie auf dem Handy dieselben Werke zeigt wie Admin-Vorschau
ALTER TABLE artworks ADD COLUMN IF NOT EXISTS in_exhibition BOOLEAN DEFAULT true;
