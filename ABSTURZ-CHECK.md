# 🔍 Absturz-Check (Cursor-Crash prüfen)

**Wenn du "absturz check" schreibst**, ist damit gemeint: **Warum ist Cursor wieder neu gestartet / abgestürzt – und was kann man dagegen tun?**

---

## ✅ Checkliste beim Absturz-Check

1. **Cursor-Logs** (nach Absturz):
   - `~/Library/Application Support/Cursor/logs/<neuester Ordner>/main.log`
   - Am Ende der Datei nach Fehlern suchen.

2. **Crashpad** (echte Crash-Dumps):
   - `~/Library/Application Support/Cursor/Crashpad/new/`
   - `~/Library/Application Support/Cursor/Crashpad/pending/`
   - Wenn hier Dateien liegen → Cursor hat einen echten Crash gehabt.

3. **Bekannte Auslöser prüfen** (siehe unten).

4. **Workaround einhalten** (siehe `CURSOR-CRASH-WORKAROUND-FINAL.md`).

---

## ⚠️ Bekannte Cursor-Absturz-Auslöser (bei uns)

| Auslöser | Was tun |
|----------|--------|
| **Preview in Cursor** (Galerie/App in Cursor öffnen) | ❌ Nicht nutzen. Im **Browser** testen: `http://localhost:5178/` |
| **Galerieseite in Cursor öffnen** | ❌ Vermeiden. Nur Code in Cursor, Test im Browser |
| **Automatische Reloads im Code** | ✅ Bereits entfernt (siehe `CRASH-FIX-STABIL.md`) |

---

## 📄 Weitere Docs

- **Cursor-Workaround (wichtig):** `CURSOR-CRASH-WORKAROUND-FINAL.md`
- **Stabilität Code:** `CRASH-FIX-STABIL.md`
- **Autostart-Mac:** `CRASH-FIX.md`

---

## 📋 Letzter Check (wann auch immer)

- **Crashpad:** new/pending/completed leer → kein neuer Crash-Dump gefunden.
- **Logs:** In `main.log` nach "crash", "error", "fatal" suchen, wenn es wieder passiert ist.

**Empfehlung:** Cursor nur für Code; Galerie/App immer im separaten Browser testen.
