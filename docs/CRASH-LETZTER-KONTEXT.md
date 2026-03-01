# Crash – letzter Kontext (für „check the crash“)

**Zweck:** Wenn Georg sagt „check the crash“, zuerst diese Datei lesen – dann wissen wir, **wo** wir zuletzt dran waren und können gezielt dort + in neuen Stellen suchen.

---

## Letzte Session (wird bei jeder Antwort aktualisiert)

| Was | Inhalt |
|-----|--------|
| **Datum** | 01.03.26 |
| **Thema** | Code-5-Check („crash again“) – nur neue Stellen geprüft |
| **Zuletzt geändert/geöffnet** | SeitengestaltungPage.tsx (setTimeout-Cleanup), CRASH-BEREITS-GEPRUEFT.md, CRASH-LETZTER-KONTEXT.md |
| **Hinweis von Georg** | „code 5 check crash again“ |
| **Ergebnis** | Neue Prüfung: ImageCropModal ✓, env.ts ✓. **Fix:** SeitengestaltungPage – handleSave setTimeout(1800) für setSaved(false) mit Ref + clearTimeout im useEffect-Cleanup (kein setState nach Unmount bei HMR/Navigation). |

---

## Bei „check the crash“ – feste Routine

1. **Diese Datei lesen** (docs/CRASH-LETZTER-KONTEXT.md) → Was war zuletzt dran?
2. **CRASH-BEREITS-GEPRUEFT.md** lesen → Was ist schon geprüft? Nicht wieder von vorn.
3. **Gezielt suchen:** In den „zuletzt geändert“-Bereichen + im Repo nach **neuen** setInterval, setTimeout ohne Cleanup, location.reload/replace, useEffects ohne Cleanup, schwere Render-Lasten.
4. **Eintragen:** Gefundene Prüfung/Fix in CRASH-BEREITS-GEPRUEFT.md; diese Datei (Letzte Session) aktualisieren.

**Georg:** Wenn du beim Crash was bemerkt hast (z. B. „gerade gespeichert“, „nach deiner langen Antwort“), sag es kurz – dann trage ich es unter „Hinweis von Georg“ ein und suche dort zuerst.
