# Crash – letzter Kontext (für „check the crash“)

**Zweck:** Wenn Georg sagt „check the crash“, zuerst diese Datei lesen – dann wissen wir, **wo** wir zuletzt dran waren und können gezielt dort + in neuen Stellen suchen.

---

## Letzte Session (wird bei jeder Antwort aktualisiert)

| Was | Inhalt |
|-----|--------|
| **Datum** | 04.03.26 |
| **Thema** | Crash 5 – „zu große Datensätze / läuft gar nichts im Hintergrund“ |
| **Zuletzt geändert/geöffnet** | components/ScreenshotExportAdmin.tsx (allArtworks in iframe leicht, Backup/Auto-Save volle Daten) |
| **Hinweis von Georg** | „check the crash 5 wieso haben wir jetzt ständig wieder das problem machst du zu grosse datensätze denn es läuft gar nichts im hintergrund“ |
| **Ergebnis** | Admin hielt volle Werkeliste inkl. Base64 im State → in Cursor Preview Speicherlast. Fix: In iframe nur „leichte“ Werke (ohne data:-Bilder); Backup und Auto-Save nutzen weiter loadArtworks(tenant). CRASH-BEREITS-GEPRUEFT.md ergänzt. |

---

## Bei „check the crash“ – feste Routine

1. **Diese Datei lesen** (docs/CRASH-LETZTER-KONTEXT.md) → Was war zuletzt dran?
2. **CRASH-BEREITS-GEPRUEFT.md** lesen → Was ist schon geprüft? Nicht wieder von vorn.
3. **Gezielt suchen:** In den „zuletzt geändert“-Bereichen + im Repo nach **neuen** setInterval, setTimeout ohne Cleanup, location.reload/replace, useEffects ohne Cleanup, schwere Render-Lasten.
4. **Eintragen:** Gefundene Prüfung/Fix in CRASH-BEREITS-GEPRUEFT.md; diese Datei (Letzte Session) aktualisieren.

**Georg:** Wenn du beim Crash was bemerkt hast (z. B. „gerade gespeichert“, „nach deiner langen Antwort“), sag es kurz – dann trage ich es unter „Hinweis von Georg“ ein und suche dort zuerst.
