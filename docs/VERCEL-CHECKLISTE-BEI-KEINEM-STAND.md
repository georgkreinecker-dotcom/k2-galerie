# Vercel-Checkliste: Wenn kein neuer Stand ankommt (iPad/Mac)

**Wenn build-info.json auf Vercel noch eine alte Zeit zeigt (z. B. 13:26) oder iPad/QR keinen neuen Stand bekommen.**

---

## 1. Im Vercel Dashboard prüfen

1. **https://vercel.com** → Projekt **k2-galerie** öffnen.
2. **Deployments:** Neuestes Deployment ansehen.
   - **Status:** **Ready** (grün) oder **Error** (rot)?
   - **Commit:** Entspricht der letzte Commit (z. B. „Stand 27.02.26 …“)?
3. **Wenn Error (rot):**
   - Auf das Deployment klicken → **View Build Log** / Build-Log öffnen.
   - Fehlermeldung notieren (z. B. TypeScript, „module not found“, Speicher).
   - **Lokal prüfen:** Im Cursor-Terminal `npm run build` – gleicher Fehler? Dann im Projekt beheben, commit, push.
4. **Settings → Git:**
   - **Production Branch** muss **main** sein. Wenn etwas anderes steht (z. B. main-fresh) → auf **main** stellen und speichern.

---

## 2. Nach dem Fix

- Erneut **pushen** (oder im Vercel Deployment **Redeploy** klicken).
- 1–2 Min warten bis Deployment **Ready**.
- **Prüfen:** Im Browser **https://k2-galerie.vercel.app/build-info.json** öffnen → sollte **neue** Zeit zeigen.
- **iPad:** **https://k2-galerie.vercel.app/refresh.html** einmal öffnen oder QR neu scannen.

---

## 3. Kein neues Deployment trotz Push

**Wenn du gerade gepusht hast, aber unter Deployments nichts Neues erscheint:**

1. **Vercel → Projekt k2-galerie → Settings → Git**
   - **Connected Git Repository:** Welches Repo steht da? Es muss **dasselbe** sein, in das du pushst (z. B. `georgkreinecker-dotcom/k2-galerie`). Wenn ein anderes Repo oder ein anderes Konto (z. B. k2galerie/…) verbunden ist, werden Pushes von deinem Mac nicht ausgelöst.
   - **Production Branch:** Muss **main** sein. Wenn dort z. B. `main-fresh` steht, wird bei Push auf `main` kein Production-Build gestartet.

2. **Git-Integration neu verbinden (wenn Repo stimmt, aber trotzdem nichts kommt)**
   - In Vercel: Settings → Git → **Disconnect** (oder „Repository ändern“).
   - Danach wieder **Connect** → GitHub → das richtige Repo wählen (`k2-galerie`) → Branch **main**.
   - Damit wird der Webhook neu eingerichtet; der nächste Push sollte ein Deployment auslösen.

3. **Sofort ein Deployment auslösen (ohne neuen Push)**
   - Vercel → **Deployments** → beim **neuesten** Deployment (oben) auf die **drei Punkte ⋯** klicken → **Redeploy**.
   - Oder: Projekt-Übersicht → **Deploy**-Button (falls vorhanden) → „Redeploy with latest commit“ o. ä.

4. **Push kommt an, aber Vercel baut nicht (Webhook defekt)**
   - **GitHub prüfen:** Repo **k2-galerie** → **Settings** → **Webhooks**. Gibt es einen Eintrag von Vercel? Bei „Recent Deliveries“: Letzte Lieferungen grün (200) oder rot (Fehler)? Bei Fehlern: Webhook löschen; in Vercel unter Git einmal **Disconnect** → wieder **Connect** (erstellt neuen Webhook).
   - **Workaround – Deploy Hook:** Vercel → Projekt **k2-galerie** → **Settings** → **Git** → Abschnitt **Deploy Hooks**. Neuen Hook anlegen (z. B. Name „Manuell“), Branch **main** → Vercel zeigt eine **URL**. Diese URL einmal im Browser aufrufen (oder mit `curl <URL>`) → löst sofort ein Deployment aus, unabhängig vom GitHub-Webhook.

5. **Direkt vom Mac deployen (Vercel CLI) – für nächstes Vercel-Problem**
   - **Im Mac-Terminal** (nicht Cursor-Terminal): in den Projektordner wechseln, dann:
   - Einmalig Login: `npx vercel login` (Browser öffnet sich, bei Vercel anmelden → „Authorization successful“).
   - Jedes Mal für Deployment: `npx vercel --prod`
   - Bei „Set up and deploy?“ → **Enter** (yes). Bei „Which scope?“ → **georg's projects** (Enter). Bei „Link to existing project?“ → **Y**, dann **k2-galerie** wählen.
   - Vercel baut den **aktuellen Ordnerstand** und stellt ihn als Production live. Unabhängig von GitHub/Webhook/Deploy Hook. Dauer ca. 1–2 Min.
   - **Vollständige Anleitung:** **docs/VERCEL-DEPLOY-HOOK-ANLEITUNG.md** (Abschnitt „Vercel CLI – direkter Zugang“).

---

## 5. Kurz

| Problem | Prüfen / Tun |
|--------|----------------|
| Stand bleibt alt | Deployments → neuestes **Ready**? Sonst Build-Log, Fehler beheben. |
| Kein neues Deployment | Settings → Git → **richtiges Repo?** Production Branch = **main**? |
| Webhook/Hook bringt nichts | **Vercel CLI:** Mac-Terminal → `cd .../k2Galerie` → `npx vercel --prod` (siehe Abschnitt 5 oben). |
| Build fehlgeschlagen | Build-Log lesen, lokal `npm run build`, Fix pushen. |

Siehe auch: **docs/VERCEL-DEPLOY-HOOK-ANLEITUNG.md** (inkl. Vercel CLI), **docs/BERICHT-ISTZUSTAND-SYNC-VERCEL-27-02-26.md**, **docs/VERCEL-STAND-HANDY.md**.

**Ursache finden (kein neues Deployment trotz Push):** **docs/VERCEL-DEPLOY-AUSBLEIBEN-URSACHEN.md** – zwei mögliche Ursachen (A: Build wird nicht gestartet / B: Build schlägt fehl), klare Prüfung in Vercel → Deployments, dann gezielt beheben.
