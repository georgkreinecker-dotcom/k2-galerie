# Datentransport iPad ↔ Vercel ↔ Mac

**Eine zentrale Stelle:** Vercel. Alle Geräte (iPad, Mac, lokal) nutzen dieselbe API und dieselbe Datei.

---

## Ablauf (technisch)

1. **iPad/Mac:** Nutzer tippt „📤 Daten an Server senden“ (oder nach Speichern am Mac läuft das automatisch).
2. **App** sendet POST an `https://k2-galerie.vercel.app/api/write-gallery-data` mit dem kompletten gallery-Export (JSON).
3. **Vercel Serverless** (api/write-gallery-data.js) schreibt die Datei per **GitHub API** in das Repo: `public/gallery-data.json`.
4. **Vercel** erkennt den neuen Commit und startet einen **neuen Build** (1–2 Minuten).
5. Nach dem Build wird **gallery-data.json** aus dem Build ausgeliefert.
6. **Am anderen Gerät:** „🔄 Bilder vom Server laden“ holt `https://k2-galerie.vercel.app/gallery-data.json` (mit Cache-Bust) und merged mit lokalen Daten.

**Wichtig:** Zwischen „Daten an Server senden“ und „Bilder vom Server laden“ **1–2 Minuten** warten, damit Vercel fertig gebaut hat.

---

## Einmalige Einrichtung: GITHUB_TOKEN in Vercel

Damit die API die Datei ins Repo schreiben kann, muss in **Vercel** die Umgebungsvariable **GITHUB_TOKEN** gesetzt sein.

1. **GitHub:** Persönliches Access Token anlegen  
   GitHub → Profil → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token.  
   Scope: **repo** (voller Zugriff auf Repositories).
2. **Vercel:** Token eintragen  
   Vercel → Projekt k2-galerie → Settings → Environment Variables → Name: `GITHUB_TOKEN`, Value: (Token), Environment: Production (und ggf. Preview).
3. **Neues Deployment auslösen** (z. B. leerer Commit pushen oder Redeploy), damit die Variable aktiv wird.

Wenn GITHUB_TOKEN fehlt, antwortet die API mit 500 und die App zeigt die Fehlermeldung inkl. Hinweis „In Vercel: Settings → Environment Variables → GITHUB_TOKEN hinzufügen“.

---

## Was tun, wenn etwas nicht funktioniert?

| Problem | Prüfen / Tun |
|--------|----------------|
| **„Daten konnten nicht gesendet werden“** | Fehlermeldung lesen (steht dort „GITHUB_TOKEN fehlt“? → siehe oben). App von k2-galerie.vercel.app geöffnet? Internet (WLAN/Mobil) OK? |
| **„Bilder vom Server laden“ liefert alte Daten** | 1–2 Min nach „Daten an Server senden“ warten. Dann erneut „Bilder vom Server laden“. |
| **Server antwortet mit 404** | gallery-data.json existiert noch nicht auf Vercel → zuerst am iPad „Daten an Server senden“ ausführen, 1–2 Min warten, dann am Mac laden. |

---

## Kurzfassung für Georg

- **iPad → Mac:** Am iPad Speichern → „Daten an Server senden“ → 1–2 Min warten → am Mac „Bilder vom Server laden“.
- **Mac → iPad:** Am Mac Speichern (geht automatisch an Vercel) → am iPad Galerie öffnen oder Stand-Badge tippen.
- **Einmalig:** In Vercel GITHUB_TOKEN setzen (siehe oben), sonst funktioniert „Daten an Server senden“ nicht.

Siehe auch: **k2team-handbuch/16-MAC-IPAD-SYNC-SCHRITT-FUER-SCHRITT.md**
