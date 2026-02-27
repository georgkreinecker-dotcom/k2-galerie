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

## 3. Kurz

| Problem | Prüfen |
|--------|--------|
| Stand bleibt alt | Deployments → neuestes **Ready**? Sonst Build-Log, Fehler beheben. |
| Kein neues Deployment | Settings → Git → Production Branch = **main**? |
| Build fehlgeschlagen | Build-Log lesen, lokal `npm run build`, Fix pushen. |

Siehe auch: **docs/BERICHT-ISTZUSTAND-SYNC-VERCEL-27-02-26.md**, **docs/VERCEL-STAND-HANDY.md**.
