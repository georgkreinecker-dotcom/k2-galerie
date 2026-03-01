# Crash – letzter Kontext (für „check the crash“)

**Zweck:** Wenn Georg sagt „check the crash“, zuerst diese Datei lesen – dann wissen wir, **wo** wir zuletzt dran waren und können gezielt dort + in neuen Stellen suchen.

---

## Letzte Session (wird bei jeder Antwort aktualisiert)

| Was | Inhalt |
|-----|--------|
| **Datum** | 01.03.26 |
| **Thema** | Code 5 nach langer Session – Check Ursache |
| **Zuletzt geändert/geöffnet** | ScreenshotExportAdmin (soldArtworksDisplayDaysK2 State + useEffect für „Verkaufte Werke X Tage“), CRASH-BEREITS-GEPRUEFT.md |
| **Hinweis von Georg** | „check crash … ganz lange super gearbeitet … was war der Grund für Fehler 5“ |
| **Ergebnis** | Neuer useEffect (K2 soldArtworksDisplayDays) mit isMounted-Cleanup abgesichert. Kein setInterval/reload. Wahrscheinliche Ursache: lange Session (Speicher/HMR) oder Cursor Preview – Workaround: Preview zu, App im Browser. |

---

## Bei „check the crash“ – feste Routine

1. **Diese Datei lesen** (docs/CRASH-LETZTER-KONTEXT.md) → Was war zuletzt dran?
2. **CRASH-BEREITS-GEPRUEFT.md** lesen → Was ist schon geprüft? Nicht wieder von vorn.
3. **Gezielt suchen:** In den „zuletzt geändert“-Bereichen + im Repo nach **neuen** setInterval, setTimeout ohne Cleanup, location.reload/replace, useEffects ohne Cleanup, schwere Render-Lasten.
4. **Eintragen:** Gefundene Prüfung/Fix in CRASH-BEREITS-GEPRUEFT.md; diese Datei (Letzte Session) aktualisieren.

**Georg:** Wenn du beim Crash was bemerkt hast (z. B. „gerade gespeichert“, „nach deiner langen Antwort“), sag es kurz – dann trage ich es unter „Hinweis von Georg“ ein und suche dort zuerst.
