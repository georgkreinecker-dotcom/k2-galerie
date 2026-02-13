# Warum das Handy nach QR-Scan noch Stand 9:24 zeigt

## Häufigste Ursache: Falscher Branch = Production wird nicht aktualisiert

**Du pushst auf `main-fresh`, aber Vercel „Production“ baut von Branch `main`.**

- Dann: Jeder Push zu **main-fresh** erzeugt nur eine **Preview**-URL.
- Die **normale Vercel-URL** (die der QR-Code nutzt) = **Production** = letzter Stand von **main**.
- Wenn auf **main** seit Tagen nichts gepusht wurde, bleibt Production bei Stand 9:24.

## Lösung 1: Production-Branch in Vercel auf main-fresh stellen (empfohlen)

1. **Vercel Dashboard** öffnen → dein Projekt (z. B. k2-galerie / georgs-projects-…).
2. **Settings** → **Git**.
3. Unter **Production Branch** steht vermutlich `main`.
4. Auf **main-fresh** ändern und speichern.
5. Einmal **Redeploy** der letzten Deployment von **main-fresh** auslösen (Deployments → bei dem neuesten von main-fresh „⋯” → Redeploy).

Danach: QR-Code neu scannen → Handy sollte den neuesten Stand zeigen.

## Lösung 2: Stattdessen auf main pushen

Wenn du Production bei `main` lassen willst:

- Änderungen von **main-fresh** nach **main** mergen und **main** pushen.
- Dann baut Vercel Production von dem neuen main-Stand.

Beispiel (im Cursor-Terminal, wenn main der Production-Branch ist):

```bash
git checkout main
git merge main-fresh
git push origin main
```

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
