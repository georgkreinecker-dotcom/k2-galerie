# Crash-Fixes (Stand 17.02.26)

**Bitte zuerst alle Änderungen speichern und committen, bevor weiter aufgeräumt wird.**

## Was wurde für Fenster-Abstürze (Reopen-Crash) geändert

- **Admin (ScreenshotExportAdmin):**
  - Kein automatischer Safe-Mode-Check mehr beim Öffnen (localStorage-Prüfung/Cleanup war Auslöser).
  - Kein Auto-Sync (Supabase / gallery-data.json) mehr beim Admin-Start – nur noch Werke aus localStorage laden (nach 3 s Verzögerung).
  - Stammdaten-Laden: Verzögerung auf 1,5 s.
  - Werke-Laden: einziger Ladevorgang, 3 s nach Mount.
- **SafeMode.tsx:** Pro-Key try/catch beim Lesen der localStorage-Größe.
- **Figma:** allowedOrigins in public/sw.js und public/marketing-konzept.html auf K2/localhost umgestellt; in den übrigen HTML-Dateien im Projekt war Figma bereits ersetzt bzw. nur noch K2/localhost vorhanden.

## Nach dem Speichern/Commit

- Alle Änderungen committen (und optional pushen), damit nichts verloren geht.
- Crash-Logik (Verzögerungen, kein Auto-Sync, kein Safe-Mode beim Start) nicht zurückdrehen.
