# Crash – letzter Kontext (für „check the crash“)

**Zweck:** Wenn Georg sagt „check the crash“, zuerst diese Datei lesen – dann wissen wir, **wo** wir zuletzt dran waren und können gezielt dort + in neuen Stellen suchen.

---

## Letzte Session (wird bei jeder Antwort aktualisiert)

| Was | Inhalt |
|-----|--------|
| **Datum** | 02.03.26 |
| **Thema** | check the crash 5 |
| **Zuletzt geändert/geöffnet** | CRASH-BEREITS-GEPRUEFT, CRASH-LETZTER-KONTEXT, location.reload/replace/href, setInterval/setTimeout, write-build-info, index.html, VitaPage |
| **Hinweis von Georg** | „check the crash 5“ |
| **Ergebnis** | Reload/Replace/Href alle mit iframe-Check. Inject-Script (localhost + iframe) ✓. **Fix:** VitaPage – setTimeout(2000) für setSaved(false) ohne Cleanup → savedTimeoutRef + clearTimeout (Unmount + vor neuem Timeout). Eintrag in CRASH-BEREITS-GEPRUEFT.md. |

---

## Bei „check the crash“ – feste Routine

1. **Diese Datei lesen** (docs/CRASH-LETZTER-KONTEXT.md) → Was war zuletzt dran?
2. **CRASH-BEREITS-GEPRUEFT.md** lesen → Was ist schon geprüft? Nicht wieder von vorn.
3. **Gezielt suchen:** In den „zuletzt geändert“-Bereichen + im Repo nach **neuen** setInterval, setTimeout ohne Cleanup, location.reload/replace, useEffects ohne Cleanup, schwere Render-Lasten.
4. **Eintragen:** Gefundene Prüfung/Fix in CRASH-BEREITS-GEPRUEFT.md; diese Datei (Letzte Session) aktualisieren.

**Georg:** Wenn du beim Crash was bemerkt hast (z. B. „gerade gespeichert“, „nach deiner langen Antwort“), sag es kurz – dann trage ich es unter „Hinweis von Georg“ ein und suche dort zuerst.
