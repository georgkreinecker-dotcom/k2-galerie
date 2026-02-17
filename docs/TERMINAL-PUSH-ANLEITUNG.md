# Terminal: Code zu Vercel pushen

**Wann:** Wenn du Änderungen (Orange-Design, App.tsx, GaleriePage.tsx usw.) zu Vercel schicken willst.

**Wo:** Im **Mac Terminal** (oder Cursor-Terminal) – du musst im Ordner `k2Galerie` sein.

---

## Schritte (einfach nacheinander eingeben)

```bash
cd ~/k2Galerie
```

(Falls du nicht schon dort bist.)

```bash
git status
```

Zeigt, welche Dateien geändert sind (z. B. App.tsx, GaleriePage.tsx).

```bash
git add .
```

**Alle** Änderungen zum Commit vorbereiten (App.tsx, GaleriePage.tsx, gallery-data.json, alles). Du musst nichts einzeln auswählen.

```bash
git commit -m "Orange-Design und Stand-Badge für alle Geräte"
```

Änderungen lokal speichern (mit Nachricht).

```bash
git push
```

Schickt alles zu GitHub – Vercel baut dann automatisch (1–2 Min).

**Falls Fehler:** `The current branch main has no upstream branch`  
→ einmalig ausführen: **`git push --set-upstream origin main`**  
Danach reicht wieder normales **`git push`**.

---

## Wichtig

- **URLs** wie https://vercel.com/... **nicht** im Terminal eingeben – die öffnest du im **Browser**.
- **Dateinamen** wie GaleriePage.tsx **nicht** im Terminal eingeben – das sind nur Dateien im Projekt; `git add .` und `git push` nehmen sie mit.

---

## Nach dem Push

- Vercel baut automatisch (ca. 1–2 Min).
- Im **Browser** öffnen: **https://vercel.com/dashboard** (diese URL, sonst evtl. 404) → auf Projekt **k2-galerie** klicken → Deployments → warten bis „Ready“ (grün).
- Dann auf dem Handy: Galerie neu öffnen oder QR neu scannen.
