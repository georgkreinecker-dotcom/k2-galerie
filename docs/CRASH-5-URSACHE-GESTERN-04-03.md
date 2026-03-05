# Crash 5 – Ursache des massiven Auftretens (04.03.26)

**Zweck:** Nachvollziehen, was den „massiven Attack“ gestern ausgelöst hat und ob alle Regeln eingehalten wurden.

---

## 1. Identifizierte Ursachen (und Fixes)

| # | Ursache | Wirkung | Fix (04.03.26) |
|---|---------|---------|----------------|
| **1** | **main.tsx importierte App, createRoot, BrowserRouter am Top-Level** | Beim Laden von main.tsx (auch in der Preview/iframe) lud Vite das **komplette App-Bundle** (~1.6 MB). Preview = iframe → trotzdem wurde der schwere Chunk geladen → Speicher/CPU-Spitze → Code 5. | Imports aus main.tsx entfernt. Nur index.css + safeReload. App lädt nur per `import('./appBootstrap')` wenn **nicht** in iframe. In Preview jetzt nur ~7 KB. |
| **2** | **DevViewPage: ScreenshotExportAdmin statisch importiert** | Beim Öffnen der APf (Mission Control/DevView) wurde die schwere Admin-Komponente sofort mitgeladen, auch wenn man nur Galerie o.ä. anzeigte. | Admin in DevViewPage per `lazy()` – Chunk lädt nur, wenn Admin-Tab geöffnet wird **und** nicht in iframe. |
| **3** | **AdminPreviewPlaceholder in DevViewPage nicht definiert** | In iframe beim Klick auf Admin-Tab: Referenz auf nicht existierende Komponente → **ReferenceError** → Crash. | `AdminPreviewPlaceholder` in DevViewPage definiert; in iframe wird nur dieser Platzhalter gerendert. |

**Zusammenhang:** Wenn die Preview offen war (oder Cursor die App in einem iframe lud), reichte schon das **Laden von main.tsx** für Ursache 1. Zusätzlich: Öffnen der APf lud den Admin (2); Klick auf Admin-Tab in der Preview führte zu (3). Mehrere Faktoren gleichzeitig = „massiver“ Effekt.

---

## 2. Regeln-Check (eingehalten?)

| Regel | Inhalt | Eingehalten? |
|-------|--------|--------------|
| **Missetäter (write-build-info)** | write-build-info **niemals** am Ende einer AI-Antwort ausführen. Nur beim Commit-Push (im Build) oder wenn Georg explizit „Stand aktualisieren“ sagt. | ✅ In der gestrigen Session wurde write-build-info nicht am Ende einer Antwort ausgeführt. Stand kommt mit Build beim Push. |
| **Kein automatischer Reload** | Kein automatischer Reload (z. B. „Server neuer“ → reload). Nur Badge/Button, Nutzer tippt. | ✅ Keine neuen Auto-Reloads eingebaut. |
| **Reload/Redirect nur wenn !inIframe** | location.reload/replace/href nur wenn `window.self === window.top`. | ✅ Bestehende Stellen geprüft; env.safeReload, GaleriePage, SmartPanel etc. mit iframe-Check. |
| **Pflichtregel vor Fix prüfen** | Vor Fix zu Crash/Reopen in .cursorrules und .cursor/rules nach bestehenden Pflichtregeln suchen; Regel umsetzen, keine „Ausnahme“ erfinden. | ✅ Bei den Fixes wurde auf bestehende Regeln (iframe, kein write-build-info am Ende) geachtet; Fix = Ursache beheben (main.tsx kein App-Import), keine neue Ausnahme. |
| **Crash-Doku** | Nach Untersuchung CRASH-BEREITS-GEPRUEFT.md und ggf. CRASH-LETZTER-KONTEXT aktualisieren. | ✅ Einträge für main.tsx App-Import, DevViewPage Admin/Placeholder, Check Crash 5 ergänzt. |

**Fazit:** Die relevanten Regeln wurden eingehalten. Die **Ursache** des massiven Auftretens war der **Code-Zustand** (main.tsx mit App-Import, statischer Admin-Import in DevViewPage, fehlender Placeholder), nicht ein Regelverstoß in der Session (z. B. write-build-info am Ende).

---

## 3. Was du tun kannst

- **Preview in Cursor zu lassen:** Dann lädt nur noch der leichte Einstieg („Im Browser öffnen“). Kein App-Bundle, kein Admin in der Preview.
- **App im Browser nutzen:** `npm run dev` → http://localhost:5177 im Browser – dort volle App ohne Cursor-Preview-Last.
- **Nach Commit/Push:** Stand kommt mit dem Build; **nicht** manuell `node scripts/write-build-info.js` am Ende einer Aufgabe ausführen (Missetäter-Regel).

---

*Erstellt: 05.03.26 (Überprüfung „Crash 5 gestern – Ursache und Regeln“).*
