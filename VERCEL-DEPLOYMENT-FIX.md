# 🔧 Vercel Deployment - Problem lösen

## Problem: Output Directory lässt sich nicht ändern

### Lösung 1: Nach dem Deployment ändern

1. **Klicke erstmal auf "Deploy"** (auch wenn Output Directory noch falsch ist)
2. **Warte bis das Deployment fertig ist** (oder fehlschlägt)
3. **Gehe zu:** Projekt → Settings → General
4. **Scrolle zu:** "Build & Development Settings"
5. **Ändere:**
   - Output Directory: `dist`
   - Build Command: `npm run build`
6. **Klicke:** "Save"
7. **Gehe zu:** Deployments → Neuestes Deployment → "Redeploy"

---

### Lösung 2: Framework Preset ändern

**Auf der Deployment-Seite:**

1. **Application Preset:** Ändere von "Other" zu **"Vite"**
2. Vercel erkennt dann automatisch:
   - Build Command: `npm run build`
   - Output Directory: `dist`

---

### Lösung 3: Manuell über Git

**Falls gar nichts geht:**

1. **Commit die vercel.json** (falls noch nicht geschehen):
   ```bash
   cd ~/k2Galerie
   git add vercel.json
   git commit -m "Add vercel.json config"
   git push
   ```

2. **Bei Vercel:** Das Projekt sollte automatisch neu deployen

---

### Lösung 4: Neues Projekt erstellen

**Als letzte Option:**

1. **Lösche das aktuelle Projekt** bei Vercel
2. **Erstelle ein neues Projekt**
3. **Bei "Application Preset":** Wähle **"Vite"**
4. **Importiere:** k2-galerie
5. **Deploy**

---

## 🆘 Was genau geht nicht?

- Kannst du nicht auf "Deploy" klicken?
- Gibt es einen Fehler beim Deployment?
- Wird das Output Directory nicht erkannt?

**Beschreibe mir genau, was passiert!** 💚
