# 🚀 Vercel API für Veröffentlichen (iPad/iPhone → Mac/alle Geräte)

## ✅ Was wurde umgesetzt

**Problem:** Auf dem iPad Werke gelöscht, Veröffentlichen geklickt – Mac und iPhone zeigten weiter die alten Werke.

**Ursache:** Die Route `/api/write-gallery-data` existierte nur lokal (Vite Dev-Middleware). Auf `k2-galerie.vercel.app` kam 404 – die Datei wurde nie aktualisiert.

**Lösung:** Vercel Serverless Function in `api/write-gallery-data.js`, die:
1. POST-Body (JSON) entgegennimmt
2. `public/gallery-data.json` im GitHub-Repo per API aktualisiert
3. Vercel baut neu → alle Geräte sehen die gleichen Daten

---

## 🔑 WICHTIG: GITHUB_TOKEN in Vercel einrichten

Ohne Token funktioniert die API nicht. **Einmalig einrichten:**

1. **Token erstellen** (falls noch nicht vorhanden):
   - [github.com/settings/tokens](https://github.com/settings/tokens)
   - "Generate new token (classic)"
   - Scope: **repo** aktivieren
   - Token kopieren (z.B. `ghp_xxxx...`)

2. **In Vercel eintragen:**
   - [vercel.com/k2-galerie/k2-galerie](https://vercel.com/k2-galerie/k2-galerie)
   - **Settings** → **Environment Variables**
   - Name: `GITHUB_TOKEN`
   - Value: dein Token (ghp_...)
   - Environment: Production (und ggf. Preview)
   - Speichern

3. **Neu deployen:**
   - Nach dem Hinzufügen der Variable einmal neu deployen (Deployments → drei Punkte → Redeploy)

---

## 📋 Ablauf nach dem Setup

1. iPad: Werke bearbeiten/löschen
2. "Veröffentlichen" klicken
3. App ruft `https://k2-galerie.vercel.app/api/write-gallery-data` auf
4. API schreibt `gallery-data.json` ins GitHub-Repo
5. Vercel baut automatisch neu (1–2 Minuten)
6. Mac/iPhone: QR-Code neu scannen → neue Daten sichtbar

---

## 🆘 Fehlermeldung "GITHUB_TOKEN fehlt"

→ Token in Vercel unter Settings → Environment Variables hinzufügen (siehe oben).
