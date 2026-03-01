# Dialog-Stand

**Kernfrage bei Wiedereinstieg:** Woran haben wir in der letzten Viertelstunde gearbeitet? → Inhaltlicher Faden, nicht nur letzter Auftrag. Kontexte verbinden, abrufbar machen.

## Datum: 01.03.26

## Wo wir stehengeblieben (aktuell) – **HIER EINSTEIGEN**
- **Session-Ende 01.03.26:** Schreiben an Michael (Prozess + Kontrast + QR), mök2-Struktur gruppiert, druckbare Kapitelseiten. Alle Änderungen committed und gepusht. Nächste Session: DIALOG-STAND lesen, ggf. GRAFIKER-TISCH-NOTIZEN (Offen), dann weiterarbeiten.
- **Schreiben an Michael (01.03.26):** Eine Seite, ein Klick zur Galerie. Kontrast: heller Hintergrund, dunkle Schrift. QR „Adresse aufs Handy“ führt auf **diese** Seite (schreiben-michael), nicht auf die Galerie – in mök2 war vorher ein falscher QR (Galerie) entfernt. Georg: Link per WhatsApp an Michael → Michael tippt Link → tippt „Galerie öffnen“ → fertig.
- **mök2-Struktur gruppiert (01.03.26):** Sidebar in 5 Kapiteln: Kern, Vertrieb, Bewertung & Lizenzen, Konzepte, Praktisch. Quelle: `src/config/mok2Structure.ts`. Druck: A4, jede Kapitelseite mit eigener Titelseite (Kern, Vertrieb, …). Text unter „Als PDF drucken“ angepasst.
- **Start-Anleitung Piloten (Michael) in mök2 (01.03.26):** Eigene Rubrik in Marketing ök2: „Start-Anleitung Piloten (z.B. Michael)“ – Schreiben mit Schritt-für-Schritt-Anleitung zum Verschicken + QR-Code (zur **Seite** schreiben-michael). Sidebar Mok2Layout + Sektion MarketingOek2Page.
- **Tenant-Sync ök2/VK2 (01.03.26):** Veröffentlichen und „Bilder vom Server laden“ für alle Mandanten (K2, ök2, VK2). API GET/POST mit tenantId; Blob pro Mandant. Doku: docs/TENANT-SYNC-DOMAIN.md. Tests 38 grün, Build ✅.
- **Nächster Schritt:** Bei „ro“ DIALOG-STAND + GRAFIKER-TISCH-NOTIZEN lesen, dann weitermachen. Optional: mök2-Druck testen (Kapitelseiten), Schreiben an Michael mit Michael durchspielen.
- **Info (Georg):** Gestern mit Android + Chrome die Seiten geöffnet – funktioniert problemlos.
- **Vollkachelform / Bildverarbeitung:** Offene Punkte in docs/GRAFIKER-TISCH-NOTIZEN.md unter „Offene Wünsche“.

## Reopen – Code behalten, KI kann weitermachen
- **Bei „Reopen“ (evtl. mit Restore/Hackerl):** **Zuerst alle Dateien speichern** (Cmd+S oder File → Save All). Dann „Reopen“ lädt die gespeicherte Version.
- **Damit die KI weitermacht:** DIALOG-STAND.md lesen („Nächster Schritt“) und WEITERARBEITEN-NACH-ABSTURZ.md.

## (Weitere Kontexte – gekürzt, siehe Git-Historie)
- QR/Link „Schreiben an Michael“ – eine URL, eine Seite: `/schreiben-michael` (PILOT_SCHREIBEN_ROUTE).
- Merge-Schutz, Datentransport, Stand-Abgleich, Reopen-Fix (watcherExclude), Crash-Check-Routine unverändert.
- Vollkachelform umgesetzt; Faden Datentransport mobil erledigt.
- Session-Ende / iPad-Stand / Vercel: siehe VERCEL-CHECKLISTE-BEI-KEINEM-STAND.md bei Bedarf.
