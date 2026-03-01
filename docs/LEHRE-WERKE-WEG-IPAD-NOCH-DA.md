# Lehre: Werke am Mac weg – am iPad noch da (01.03.26)

**Was passiert ist:** Die Werke waren am Mac weg (localStorage überschrieben/leer), am iPad noch vorhanden. Ohne iPad wären sie verloren gewesen.

---

## Was wir daraus gelernt haben

1. **Nur ein Speicherort = Risiko.**  
   Wenn die Werke nur am Mac (localStorage) liegen und dort etwas schiefgeht (Bug, Überschreiben, leerer Merge), sind sie weg. Dass sie am iPad noch da waren, war Glück – kein Konzept.

2. **„Veröffentlichen“ / Server = Sicherung.**  
   „Daten an Server senden“ und Veröffentlichen sind nicht nur für die Webseite, sondern **Backup**: Werke liegen dann auf Vercel (Blob / gallery-data.json) und können mit „Werke aus Veröffentlichung wiederherstellen“ oder „Bilder vom Server laden“ zurückgeholt werden.

3. **Code darf nie „viele“ durch „wenige“ oder leer ersetzen** – außer durch klare User-Aktion (z. B. „Werk löschen“).  
   Bestehende Regeln (niemals-kundendaten-loeschen, Merge-Schutz, kein Überschreiben mit leerer Liste) strikt einhalten. Bei jedem Speicher-/Sync-Pfad prüfen: Kann hier versehentlich „leer“ oder „ein Werk“ über viele Werke geschrieben werden? Wenn ja → verhindern.

4. **Lehre festhalten.**  
   Damit es nicht vergessen wird: *Werke am Mac weg, am iPad noch da = Glück. Lehre: Veröffentlichen als Sicherung nutzen; Code nie mit leer/weniger überschreiben.*

---

## Konkret im Projekt

- **Regeln:** `.cursor/rules/niemals-kundendaten-loeschen.mdc`, Merge-Schutz in GaleriePage/Sync, `saveArtworksByKey` mit Schutz (nicht mit weniger überschreiben außer `allowReduce` bei expliziter Aktion).
- **Wiederherstellung:** Admin → Einstellungen → Backup & Wiederherstellung → „Werke aus Veröffentlichung wiederherstellen“ (lädt von Vercel und schreibt in k2-artworks).
- **Hinweis in der App:** Im Backup-Bereich steht, dass nach dem Bearbeiten veröffentlichen = Werke auf dem Server = bei Bedarf wiederherstellbar.

---

**Verweis:** docs/00-INDEX.md (K2 vs. ök2 & Daten / Deployment).
