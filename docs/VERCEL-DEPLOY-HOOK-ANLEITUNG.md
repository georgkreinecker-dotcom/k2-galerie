# Vercel: Deployment per Deploy Hook auslösen

**Wenn Push kein neues Deployment startet** – mit dem Deploy Hook löst du den Build manuell aus (aktueller Stand von main).

---

## Schritte (einmalig einrichten)

1. **https://vercel.com** öffnen → Projekt **k2-galerie** auswählen.

2. Links **Settings** → dann **Git** (unter Project Settings).

3. Nach unten scrollen bis **Deploy Hooks**.

4. **Create Hook** klicken (oder „Add Hook“).
   - **Name:** z. B. `main` oder `Manuell`
   - **Branch:** **main** auswählen
   - Speichern / Create

5. Vercel zeigt eine **URL** (beginnt z. B. mit `https://api.vercel.com/v1/integrations/...`).
   - Diese URL **kopieren** (oder im Lesezeichen speichern).

---

## Deployment auslösen

- Die **URL im Browser** in die Adresszeile einfügen und **Enter**.
- Oder im Terminal (Mac): `curl "HIER_DIE_URL_EINFÜGEN"`

→ Vercel startet sofort ein neues Deployment vom **aktuellen** main.  
→ Unter **Deployments** erscheint nach 1–2 Min ein neuer Eintrag (Commit „Stand 27.02.26 …“).  
→ Dieser Build wird Production und löst den alten 13:26-Stand ab.

---

## Kurz

| Schritt | Aktion |
|--------|--------|
| 1 | Vercel → k2-galerie → Settings → Git |
| 2 | Deploy Hooks → Create Hook, Branch **main** |
| 3 | URL kopieren |
| 4 | URL im Browser aufrufen → Build startet |

Die URL kannst du bei jedem „Push, aber kein Deploy“ wieder aufrufen.

---

## Deploy Hook gibt PENDING, aber kein Deployment sichtbar

- **Vercel → Deployments:** Filter auf **All** oder **Preview** stellen (nicht nur Production). Erscheint ein neuer Eintrag mit Status **Building** oder **Error**? Bei **Error:** Build anklicken → **View Build Log** → Fehlermeldung lesen.
- **Production Branch:** Vercel → Settings → Git → **Production Branch** muss **main** sein. Wenn z. B. ein anderer Branch eingestellt ist, landet der Hook-Build nur als Preview und ersetzt nicht die live Seite.
- **Deployment von deinem Mac (Vercel CLI):** Siehe unten „Vercel CLI – direkter Zugang“.

---

## Vercel CLI – direkter Zugang (für nächstes Vercel-Problem)

**Wenn Push, Deploy Hook und Redeploy nichts bringen:** Vom Mac aus den aktuellen Ordnerstand direkt zu Vercel Production deployen. Kein GitHub, kein Webhook nötig.

### Einmalig: Login

1. **Mac-Terminal** öffnen (nicht Cursor-Terminal).
2. In den Projektordner wechseln:
   ```bash
   cd /Users/georgkreinecker/k2Galerie
   ```
3. Anmelden:
   ```bash
   npx vercel login
   ```
4. Im Browser die angezeigte URL öffnen, bei Vercel anmelden → „Authorization successful“ → Tab schließen.
5. Im Terminal erscheint: „Congratulations! You are now signed in.“

### Jedes Mal: Production-Deployment

1. **Mac-Terminal** → im Ordner **k2Galerie** (siehe oben).
2. Ausführen:
   ```bash
   npx vercel --prod
   ```
3. Prompts:
   - **Set up and deploy "~/k2Galerie"?** → **Enter** (yes)
   - **Which scope?** → **georg's projects** auswählen → **Enter**
   - **Link to existing project?** → **Y** → **k2-galerie** wählen
4. Warten (Build + Upload, ca. 1–2 Min). Am Ende zeigt die CLI die URL (z. B. https://k2-galerie.vercel.app).
5. **Prüfen:** https://k2-galerie.vercel.app/api/build-info → neue Zeit? Dann am Handy QR neu scannen oder refresh.html.

### Kurz

| Schritt | Befehl / Aktion |
|--------|------------------|
| Einmalig | `npx vercel login` (Browser: anmelden) |
| Deploy | `npx vercel --prod` (im Ordner k2Galerie) |
| Bei „Link to existing project?“ | **Y** → **k2-galerie** |

Damit hast du bei jedem Vercel-Problem einen direkten Weg: Stand auf dem Mac ist bereit → Terminal → `npx vercel --prod` → fertig.

---

## Wenn trotzdem nur „vor 3 Stunden“ als neuestes Deployment erscheint

- **CLI nochmal ausführen** und **bis zum Ende** durchlaufen lassen (nicht abbrechen).
- Wichtig: Bei **„Link to existing project?“** unbedingt **Y** wählen und dann **k2-galerie** (nicht ein anderes Projekt). Sonst entsteht ein neues Vercel-Projekt und die Live-Seite k2-galerie.vercel.app wird nicht aktualisiert.
- Am Ende muss in der CLI etwas wie **Production: https://k2-galerie.vercel.app** stehen. Steht dort eine andere URL (z. B. k2-galerie-xxx.vercel.app als Preview), wurde nicht das richtige Projekt getroffen.
- Nach erfolgreichem Lauf: In Vercel unter **Deployments** sollte **sofort** ein neuer Eintrag erscheinen („just now“). Siehst du keinen neuen Eintrag, den Befehl erneut ausführen und bei der Projekt-Frage explizit **k2-galerie** wählen.
