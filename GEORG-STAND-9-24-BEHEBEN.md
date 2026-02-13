# Stand 9:24 beim Scannen – in 3 Schritten beheben

## Warum 9:24?

Vercel „Production“ (die normale App-URL) baut fast immer von **einem festen Branch**. Du pushst auf **main-fresh**, Production baut aber von **main** → Production wird **nie** aktualisiert, deshalb bleibt 9:24.

---

## Schritt 1: Prüfen, was Vercel wirklich ausliefert

**Am Handy** im Browser (Safari/Chrome) diese Adresse öffnen:

**https://k2-galerie.vercel.app/build-info.json**

- Zeigt es **9:24** (oder eine alte Zeit)? → Weiter mit **Schritt 2** (Branch anpassen).
- Zeigt es eine **neuere Zeit** (z. B. 13:18)? → Dann ist es Cache: **Stand-Badge unten links tippen** (lädt neu). Fertig.

---

## Schritt 2: In Vercel den Production-Branch anpassen

1. Im Browser am Mac: **vercel.com** → einloggen.
2. Dein **Projekt** öffnen (z. B. k2-galerie).
3. Oben **Settings** (Einstellungen).
4. Links **Git** anklicken.
5. Bei **Production Branch** steht vermutlich **main**.
6. Dort **main-fresh** eintragen (oder auswählen) und **Save** speichern.
7. Gehe zu **Deployments**. Klicke beim **neuesten** Deployment (von main-fresh) auf die drei Punkte **⋯** → **Redeploy** → **Redeploy** bestätigen.
8. Ca. 1–2 Minuten warten, bis der Build durch ist.

---

## Schritt 3: Am Handy neu scannen oder Stand tippen

- QR-Code nochmal scannen **oder**
- App öffnen und **unten links auf „Stand: 9:24“ tippen** (lädt die Seite neu).

Dann solltest du den neuen Stand sehen.

---

## Wenn du nicht in Vercel gehen willst: Auf main pushen

Wenn du den Branch in Vercel nicht ändern willst, kannst du deinen aktuellen Stand auf **main** bringen. **Im Cursor-Terminal:**

```bash
git checkout main
git merge main-fresh
git push origin main
```

Dann baut Vercel Production von **main** und hat den neuesten Stand. Danach am Handy: Stand-Badge tippen oder QR neu scannen.

---

**Kurz:** 9:24 bleibt, weil Production den falschen Branch baut. Entweder in Vercel **Production Branch = main-fresh** setzen und Redeploy, oder **main** mit dem aktuellen Stand pushen.
