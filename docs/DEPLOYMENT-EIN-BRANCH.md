# Deployment: Ein Branch – damit es immer funktioniert

**Problem:** Zwei Branches (main und main-fresh) → mal baut Vercel von dem einen, mal vom anderen → Stand stimmt mal, mal nicht. So kann man nicht arbeiten.

**Lösung: Nur ein Branch.**

---

## Verbindliche Regel

| Was | Regel |
|-----|--------|
| **Branch** | Nur **main**. Kein main-fresh mehr im Alltag. |
| **Code pushen** | Immer `git push origin main` (oder über Cursor/Git-Button – der pusht auf main). |
| **Vercel** | **Production Branch = main.** In Vercel: Settings → Git → Production Branch = **main**. |
| **Git-Button (Veröffentlichen)** | Schreibt gallery-data.json, committed, merged ggf. nach main, pusht **main**. Du bleibst danach auf main. |

Wenn **nur main** verwendet wird und Vercel **main** als Production baut, ist der Stand immer derselbe: Push → Vercel baut → QR/Handy zeigen den neuesten Stand.

---

## Einmalig: Vercel prüfen

1. **Vercel Dashboard** → Projekt **k2-galerie** → **Settings** → **Git**.
2. **Production Branch** muss **main** sein. Wenn dort main-fresh steht → auf **main** ändern und speichern.
3. Fertig. Ab dann: nur noch auf main arbeiten und pushen.

---

## Einmalig: Alles auf main bringen (falls du noch main-fresh nutzt)

Wenn du aktuell auf main-fresh arbeitest und alles nach main soll:

```bash
git checkout main
git merge main-fresh
git push origin main
```

Danach: **main** als Arbeitsbranch nutzen (in Cursor z.B. unten links „main“ auswählen). main-fresh ignorieren oder löschen.

---

## Täglicher Ablauf (kurz)

1. **Arbeiten** wie gewohnt (Code, Galerie, Werke).
2. **Veröffentlichen:** In der App „Code-Update (Git)“ / Git-Button → pusht auf **main**.
3. **Vercel** baut automatisch von main (1–2 Min).
4. **Handy:** QR neu scannen oder Stand-Badge tippen → neuer Stand.

Kein „mal main, mal main-fresh“ – nur main. Dann funktioniert es zuverlässig.

---

## Warum das reicht

- **Ein Branch** = eine Quelle für Production.
- **Vercel baut nur einen Branch** (den Production Branch). Wenn der immer **main** ist und du immer **main** pushst, ist immer derselbe Stand live.
- Keine Verwechslung, kein „hab ich jetzt main oder main-fresh gepusht?“.

*Zuletzt: 18.02.26*
