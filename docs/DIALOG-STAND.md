# Dialog-Stand

## Datum: 22.02.26

## Thema: Werkkatalog – Filter, Tabelle, Drucken, neue Felder Technik/Maße

## Was zuletzt gemacht (Commit 8e10987):

### Werkkatalog – neuer Tab im Admin
- Neuer Tab "📋 Werkkatalog" im Admin-Hauptmenü
- Filter: Status (alle/Galerie/Verkauft/Lager), Kategorie, Suchtext, Preis von–bis, Datum von–bis
- Spalten frei wählbar per Checkbox: Nr., Titel, Kategorie, Künstler:in, Maße, Technik, Preis, Status, Erstellt, Käufer:in, Verkauft am, Standort
- Drucken als PDF (A4 quer, Tabelle mit Kopfzeile, gefilterte Werke)
- Sold-Status aus k2-sold-artworks automatisch eingemischt (buyer, soldAt, soldPrice)

### Neue Felder beim Werk-Bearbeiten
- Technik / Material (z.B. "Acryl auf Leinwand") → frei eingebbar
- Maße (z.B. "60×80 cm") → frei eingebbar
- Beide Felder werden beim Speichern im Werk gespeichert
- Beide Felder beim Bearbeiten vorgeladen
- updatedAt wird beim Speichern gesetzt

## Nächster Schritt:
- Werkkatalog auf Handy/Vercel testen: Admin → Werkkatalog aufrufen
- Felder Technik/Maße bei bestehenden Werken nachtragen (beim Bearbeiten)
- Optional: Käufer-Feld beim "Als verkauft markieren"-Dialog eintragen

## Offenes (optional):
- Käufer-Name beim Verkauf-Dialog eingeben (heute: soldAt wird gesetzt, buyer noch nicht)
- Export als CSV (optional, für Buchhaltung)
