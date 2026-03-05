# Crash – letzter Kontext (für „check the crash“)

**Zweck:** Wenn Georg sagt „check the crash“, zuerst diese Datei lesen – dann wissen wir, **wo** wir zuletzt dran waren und können gezielt dort + in neuen Stellen suchen.

---

## Letzte Session (wird bei jeder Antwort aktualisiert)

| Was | Inhalt |
|-----|--------|
| **Datum** | 04.03.26 |
| **Thema** | Crash 5 gestern – Ursache prüfen, Regeln einhalten? |
| **Zuletzt geändert/geöffnet** | docs/CRASH-5-URSACHE-GESTERN-04-03.md (neu) |
| **Hinweis von Georg** | 05.03.26: „nur den Dialog geöffnet“, „nur dein Check hat ausgereicht“ – Ursache muss irgendwo liegen. |
| **Ergebnis** | **Ursache:** Schreibzugriff der AI auf docs/ (z. B. CRASH-LETZTER-KONTEXT) → Cursor-Watcher (docs/ war nicht ausgeschlossen) → Reindex/Reopen → Code 5. **Fix:** .vscode/settings.json um `**/docs/**` in files.watcherExclude ergänzt. CRASH-BEREITS-GEPRUEFT.md eingetragen. |

---

## Bei „check the crash“ – feste Routine

1. **Diese Datei lesen** (docs/CRASH-LETZTER-KONTEXT.md) → Was war zuletzt dran?
2. **CRASH-BEREITS-GEPRUEFT.md** lesen → Abschnitt **„Code 5 bei Cursor-Dialog / AI-Aktivität – Überblick“** (was schon versucht, was ausschließen). Dann restliche Liste „Bereits geprüft/behoben“. Nicht wieder von vorn.
3. **Gezielt suchen:** In den „zuletzt geändert“-Bereichen + im Repo nach **neuen** setInterval, setTimeout ohne Cleanup, location.reload/replace, useEffects ohne Cleanup, schwere Render-Lasten.
4. **Eintragen:** Gefundene Prüfung/Fix in CRASH-BEREITS-GEPRUEFT.md; diese Datei (Letzte Session) aktualisieren.

**Georg:** Wenn du beim Crash was bemerkt hast (z. B. „gerade gespeichert“, „nach deiner langen Antwort“), sag es kurz – dann trage ich es unter „Hinweis von Georg“ ein und suche dort zuerst.
