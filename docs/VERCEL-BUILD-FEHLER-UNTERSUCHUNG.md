# Vercel Build-Fehler – systematische Untersuchung

**Stand:** 13.03.26  
**Auslöser:** Deployments (z. B. Commit 9869f8f „An Server senden: Fortschritt …“) zeigen auf Vercel **Error**; lokal läuft `npm run build` erfolgreich.

---

## 1. Sofort prüfen

1. **Vercel Build-Log öffnen**  
   Vercel Dashboard → Projekt → Deployments → fehlgeschlagenes Deployment → **Build Logs** (oder „View build log“). Dort steht die genaue Fehlermeldung (z. B. TypeScript, fehlender Import, API-Syntax).

2. **Lokal denselben Stand bauen**  
   ```bash
   git fetch origin
   git checkout main   # oder den Branch, der deployed wurde
   npm run build
   ```  
   Wenn es lokal grün ist, aber auf Vercel rot: Unterschiede (Node-Version, Umgebung, fehlende Dateien).

3. **Typische Vercel-Ursachen**
   - **Node-Version:** Vercel nutzt ggf. andere Node-Version als lokal. In Projekt-Settings „Node.js Version“ prüfen (z. B. 18.x); `package.json` hat `"engines": { "node": ">=18" }`.
   - **API-Routen:** `api/*.js` mit ESM (`import`) – Vercel unterstützt das; wenn Fehler „Unexpected token“ oder „require is not defined“, ggf. auf CommonJS umstellen oder Dateiendung `.mjs` prüfen.
   - **Fehlende Abhängigkeit:** z. B. `@vercel/blob` nur in dependencies (nicht devDependencies), damit es im Vercel-Build verfügbar ist (ist der Fall).
   - **Build-Befehl:** In Vercel steht `buildCommand: "npm run build"` (vercel.json). Kein Override in den Vercel-Projekt-Settings, der einen anderen Befehl nutzt.

---

## 2. Nach Fehlerart vorgehen

| Log-Meldung / Anzeichen | Wahrscheinliche Ursache | Maßnahme |
|-------------------------|--------------------------|----------|
| `Cannot find module '…'` / Import error | Fehlender Import oder Pfad nur lokal vorhanden | Import/Pfad prüfen; prüfen ob Datei committed ist. |
| `Unexpected token` / Syntax | ESM vs. CommonJS in API oder Config | API-Datei auf require() umstellen oder Node/ESM-Settings prüfen. |
| TypeScript error (tsc) | Typfehler in neuem Code | Lokal `npm run build` (läuft tsc); betroffene Stelle im Log fixen. |
| Test failed | Ein Test schlägt in CI durch | Lokal `npm run test`; Test anpassen oder Ursache beheben. |
| Timeout / Out of memory | Build zu schwer für Vercel | Chunk-Größen, dynamische Imports prüfen; ggf. Build-Optionen anpassen. |
| **No more than 12 Serverless Functions … Hobby plan** | Zu viele `api/*.js`-Dateien (jede = 1 Function) | Zwei oder mehr APIs in **eine** Datei zusammenführen (Dispatch per Query-Param), Rewrites in vercel.json; alte Dateien entfernen. Siehe 13.03.26: visit + build-info → `api/visit-and-build.js`, Rewrites `/api/visit` und `/api/build-info` dorthin. |
| **store has been suspended** (beim „An Server senden“ / iPad) | Vercel Blob Store wurde pausiert (Limits überschritten oder durch Vercel) | **Nicht im Code lösbar.** Vercel Dashboard → **Storage** → **Blob** prüfen; bei falscher Pausierung: Support https://vercel.com/help. App zeigt nun verständliche Meldung „Blob-Speicher pausiert“ + Hinweis. |

---

## 3. Nützliche Befehle (lokal)

```bash
npm run test          # Tests
npm run build         # Vollbuild (Test + write-build-info + check-exports + tsc + vite build)
node -v               # Node-Version (Vercel ggf. gleiche wählen)
```

---

## 4. Nach dem Fix

- **Immer vor Push:** `npm run build` lokal durchlaufen lassen (Regel: build-fehler-systematisch-vermeiden, qs-standard-vor-commit).
- **Nach erfolgreichem Deploy:** Auf dem iPad/Handy Stand prüfen (Stand-Badge tippen oder QR neu scannen), damit die neue Version ankommt.

---

**Kurz:** Die genaue Fehlerzeile aus dem **Vercel Build Log** ist nötig, um gezielt zu fixen. Dieses Doc ist die Checkliste dafür.
