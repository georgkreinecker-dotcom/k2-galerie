# Dialog-Stand

## Datum: 22.02.26

## Thema: Werkkatalog – Werkkarte (Klick + Drucken)

## Was zuletzt gemacht (Commit af9ce2b):

### Werkkarte beim Klick auf ein Werk
- Klick auf eine Tabellenzeile im Werkkatalog → Modal öffnet sich
- Zeigt: Foto, Titel, Künstler:in, Status-Badge, alle Metadaten (Maße, Technik, Preis, Kategorie, Erstellt, Verkauft am, Käufer:in)
- Beschreibungstext wenn vorhanden
- Schließen per ✕-Button, Klick außerhalb oder "Schließen"-Button

### Werkkarte drucken (A5)
- Button "🖨️ Werkkarte drucken" im Modal
- Druckt als A5 (Querformat optional), inkl. Galerienamen oben, Foto, alle Felder, Fußzeile mit Datum
- Leer-Felder (z.B. kein Käufer) werden ausgelassen

### Vorher (Commit 8e10987):
- Werkkatalog mit Filter, Tabelle, Spalten-Auswahl, Drucken Gesamtliste
- Neue Felder Technik/Material + Maße beim Werk anlegen/bearbeiten

## Nächster Schritt:
- Auf Vercel testen: Admin → Werkkatalog → Werk anklicken → Werkkarte drucken
- Felder Technik/Maße bei bestehenden Werken nachtragen
- Optional: Käufer-Name beim "Als verkauft markieren"-Dialog eingeben

## Offenes (optional):
- Käufer-Name beim Verkauf-Dialog eingeben (buyer-Feld)
- Export als CSV (für Buchhaltung)
