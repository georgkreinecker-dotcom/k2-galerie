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

## iPad/Handy hängt bei altem Stand (z. B. 13:26) – keine Synchronisation

**Ursache:** Safari/iOS cached oft stark. Die geladene Seite (und build-info.json) sind dann alt → angezeigter Stand bleibt 13:26.

**Sofort probieren (eine der beiden reicht meist):**

1. **Stand-Badge tippen:** Unten links auf **„Stand: 13.26“** (oder die angezeigte Zeit) tippen. Das lädt die Seite mit Cache-Bypass neu. Danach sollte der neue Stand erscheinen.
2. **QR-Code neu scannen:** Neuen QR von der APf (Mission Control / Mac) scannen – der QR enthält immer Server-Stand + Cache-Bust.

**Ab diesem Deployment:** Beim Öffnen der Seite prüft ein Script, ob die geladene Version älter als 2 Minuten ist → dann erfolgt automatisch ein Reload. So bleibt das iPad nicht mehr dauerhaft hängen. Beim **ersten** Mal nach dem Update musst du aber einmal Stand tippen oder QR neu scannen, damit die neue Seite (mit diesem Script) geladen wird.

**Falls es dann noch hängt:** Safari → Einstellungen → Verlauf und Websitedaten löschen (oder nur für k2-galerie.vercel.app).

---

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
