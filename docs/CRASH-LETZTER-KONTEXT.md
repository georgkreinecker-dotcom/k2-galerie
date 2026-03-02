# Crash – letzter Kontext (für „check the crash“)

**Zweck:** Wenn Georg sagt „check the crash“, zuerst diese Datei lesen – dann wissen wir, **wo** wir zuletzt dran waren und können gezielt dort + in neuen Stellen suchen.

---

## Letzte Session (wird bei jeder Antwort aktualisiert)

| Was | Inhalt |
|-----|--------|
| **Datum** | 02.03.26 |
| **Thema** | ro check crash |
| **Zuletzt geändert/geöffnet** | K2 Familie (Start, Stammbaum, Person, Events, Kalender), FamilieTenantContext, DIALOG-STAND, CRASH-BEREITS-GEPRUEFT.md |
| **Hinweis von Georg** | „ro check crash“ |
| **Ergebnis** | K2-Familie-Seiten + alle *familie* durchsucht: kein setInterval/setTimeout/reload/addEventListener. useEffects nur sync load/setState. Kein neuer Fix. Eintrag in CRASH-BEREITS-GEPRUEFT.md. |

---

## Bei „check the crash“ – feste Routine

1. **Diese Datei lesen** (docs/CRASH-LETZTER-KONTEXT.md) → Was war zuletzt dran?
2. **CRASH-BEREITS-GEPRUEFT.md** lesen → Was ist schon geprüft? Nicht wieder von vorn.
3. **Gezielt suchen:** In den „zuletzt geändert“-Bereichen + im Repo nach **neuen** setInterval, setTimeout ohne Cleanup, location.reload/replace, useEffects ohne Cleanup, schwere Render-Lasten.
4. **Eintragen:** Gefundene Prüfung/Fix in CRASH-BEREITS-GEPRUEFT.md; diese Datei (Letzte Session) aktualisieren.

**Georg:** Wenn du beim Crash was bemerkt hast (z. B. „gerade gespeichert“, „nach deiner langen Antwort“), sag es kurz – dann trage ich es unter „Hinweis von Georg“ ein und suche dort zuerst.
