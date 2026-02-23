# Dialog-Stand

| Feld | Inhalt |
|------|--------|
| **Datum** | 23.02.26 19:21 |
| **Thema** | Automatische Tests (Vitest) eingerichtet – 21 Tests grün |
| **Was zuletzt** | Vitest-Framework eingerichtet. 3 Test-Dateien mit 21 Tests für die kritischsten Bugs: (1) `datentrennung.test.ts` – K2/ök2/VK2 Datentrennung. (2) `kundendaten-schutz.test.ts` – Kundendaten niemals löschen. (3) `bild-upload.test.ts` – Vercel-Pfad statt Base64. `npm run build` führt jetzt Tests automatisch vor jedem Build aus. Commit ausstehend. |
| **Nächster Schritt** | Morgen: `npm run test` ausführen – muss 21 grün zeigen. Dann `npm run build` testen. |
| **Wo nachlesen** | `src/tests/`, `vitest.config.ts`, `docs/GELOESTE-BUGS.md` |
