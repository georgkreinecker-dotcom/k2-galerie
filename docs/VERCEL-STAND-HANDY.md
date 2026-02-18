# Warum das Handy nach QR-Scan noch Stand 9:24 zeigt

**→ Damit es immer funktioniert: Ein Branch (main). Siehe `docs/DEPLOYMENT-EIN-BRANCH.md`.**

---

## ✅ Damit der Stand überall stimmt (Checkliste – unbedingt einhalten)

- **Ein Branch:** Nur **main** verwenden. Vercel Production Branch = **main**. Immer auf main pushen. Details: **`docs/DEPLOYMENT-EIN-BRANCH.md`**.
- **vercel.json:** Gültiges JSON, **keine** überzählige `}` am Ende (sonst Vercel: „Invalid vercel.json“ → Build Failed).
- **Push:** `git push origin main` → Vercel baut. In Vercel Deployments prüfen: neues Deployment **Ready** und **Current**.
- **QR scannen** erst, wenn Vercel **Ready** ist (oder auf dem Mac „Bereit für Mobile“ angezeigt wird). Siehst du am Handy noch alte Zeit → **unten links auf „Stand“ tippen** (lädt neu).
- **Build:** `package.json` → Script `build` mit `write-build-info.js --inject-html`. Repo: index.html mit `<!-- BUILD_TS_INJECT -->`, keine doppelten Exports in buildInfo.generated.ts, nur ein `<div id="root">` in index.html.

---

## „Die letzten Deployments waren vor 2 Tagen“ – nichts kommt mehr an

**Ursache:** Vercel baut nur den **Production Branch**. Wenn du auf einen anderen Branch pushst als den, der in Vercel als Production eingestellt ist, erscheinen keine neuen Production-Deployments.

**Reparieren (nur im Vercel Dashboard, nicht im Repo):**

1. **Vercel Dashboard** → Projekt **k2-galerie** → **Settings** → **Git**.
2. **Production Branch** ansehen. Steht dort z. B. `main`?
3. **Entweder:** Auf den Branch stellen, auf den du wirklich pushst (z. B. `main-fresh`), **oder** im Git auf genau diesen Branch wechseln und von dort pushen (z. B. `git push origin main`).
4. Nach dem nächsten Push sollte ein neues Deployment starten („Building“ → „Ready“).

Der Production-Branch wird **nur** in Vercel gesetzt – nicht im Code. Im Repo kann man das nicht ändern.

---

## Häufigste Ursache: Falscher Branch = Production wird nicht aktualisiert

**Du pushst auf `main-fresh`, aber Vercel „Production“ baut von Branch `main`.**

- Dann: Jeder Push zu **main-fresh** erzeugt nur eine **Preview**-URL.
- Die **normale Vercel-URL** (die der QR-Code nutzt) = **Production** = letzter Stand von **main**.
- Wenn auf **main** seit Tagen nichts gepusht wurde, bleibt Production bei Stand 9:24.

## Einmalig: Production-Branch = main (empfohlen)

1. **Vercel Dashboard** → Projekt **k2-galerie** → **Settings** → **Git**.
2. **Production Branch** = **main** setzen und speichern.
3. Ab dann: **nur auf main** arbeiten und pushen. Siehe **`docs/DEPLOYMENT-EIN-BRANCH.md`**.

## Schnell-Check: Was liefert Vercel wirklich?

**Am Handy im Browser öffnen (nicht in der App):**

- https://k2-galerie.vercel.app/build-info.json

**Anzeige z. B.:** `{"label":"13.02.26 9:24","timestamp":...}`

- Wenn hier **weiterhin 9:24** steht → Vercel liefert auf dieser URL tatsächlich den alten Build → **Branch-Problem** (Production baut nicht von main-fresh).
- Wenn hier eine **neuere Zeit** steht, die App aber trotzdem 9:24 zeigt → dann ist das **Cache-Problem** auf dem Handy (z. B. „Stand“-Badge tippen für Cache-Bypass, oder Safari: Website-Daten für diese Domain löschen).

## Kurz

- **Stand bleibt 9:24 trotz Push** → fast immer: **Production-Branch in Vercel auf den Branch stellen, auf den du pushst (main-fresh), oder auf main pushen.**

## Wenn das Deployment „Error“ zeigt (Build fehlgeschlagen)

- Im Vercel-Dashboard auf das **fehlgeschlagene Deployment** (roter Punkt „Error“) klicken.
- **„View Build Log“** oder Build-Log öffnen – dort steht die genaue Fehlermeldung.
- Häufige Ursachen: Node-Version (im Projekt ist `engines.node >= 18` gesetzt), Speicher, fehlende Abhängigkeit. Log prüfen und Fehlermeldung beheben.
- Nach dem Fix: erneut pushen oder in Vercel beim letzten Commit **Redeploy** auslösen.
