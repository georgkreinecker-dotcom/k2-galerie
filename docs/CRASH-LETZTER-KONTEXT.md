# Crash – letzter Kontext (für „check the crash“)

**Zweck:** Wenn Georg sagt „check the crash“, zuerst diese Datei lesen – dann wissen wir, **wo** wir zuletzt dran waren und können gezielt dort + in neuen Stellen suchen.

---

## Letzte Session (wird bei jeder Antwort aktualisiert)

| Was | Inhalt |
|-----|--------|
| **Datum** | 01.03.26 |
| **Thema** | Code-5-Check (Georg: „check crash fehler 5“) |
| **Zuletzt geändert/geöffnet** | PilotStartPage.tsx (neu), MarketingOek2Page (Pilot-Rubrik, QR für Handy), navigation.ts (pilotStart), App.tsx (Route), CRASH-BEREITS-GEPRUEFT.md |
| **Hinweis von Georg** | „check crash fehler 5“ |
| **Ergebnis** | PilotStartPage + MarketingOek2Page QR-useEffects geprüft: alle mit `cancelled`-Cleanup, kein setInterval/reload. Eintrag in CRASH-BEREITS-GEPRUEFT.md. Kein neuer Fix. |

---

## Bei „check the crash“ – feste Routine

1. **Diese Datei lesen** (docs/CRASH-LETZTER-KONTEXT.md) → Was war zuletzt dran?
2. **CRASH-BEREITS-GEPRUEFT.md** lesen → Was ist schon geprüft? Nicht wieder von vorn.
3. **Gezielt suchen:** In den „zuletzt geändert“-Bereichen + im Repo nach **neuen** setInterval, setTimeout ohne Cleanup, location.reload/replace, useEffects ohne Cleanup, schwere Render-Lasten.
4. **Eintragen:** Gefundene Prüfung/Fix in CRASH-BEREITS-GEPRUEFT.md; diese Datei (Letzte Session) aktualisieren.

**Georg:** Wenn du beim Crash was bemerkt hast (z. B. „gerade gespeichert“, „nach deiner langen Antwort“), sag es kurz – dann trage ich es unter „Hinweis von Georg“ ein und suche dort zuerst.
