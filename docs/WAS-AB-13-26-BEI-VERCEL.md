# Was ab 13:26 bei Vercel passiert ist

**Frage:** Was wurde um 13:26 bei Vercel gemacht, dass der Stand seitdem hängt?

---

## Kurzantwort

**Im Repo wurde bei Vercel nichts „eingestellt“ oder „konfiguriert“.**  
Vercel baut nur das, was wir pushen. Der Stand 13:26 heißt: **Der letzte Build, der als Production live ging, war zu dieser Zeit.** Alle späteren Pushes haben entweder **keinen neuen Build** ausgelöst oder der **Build ist fehlgeschlagen**.

---

## Zeitstrahl (27.02.26)

| Zeit (ca.) | Commit / Inhalt |
|------------|------------------|
| **13:25–13:42** | Vorschau (Werk bleibt), GaleriePage-Merge (BUG-012), Bilder, Handbuch Sync – **letzter Stand, der bei dir als 13:26 ankommt** |
| 14:00 | Zentrale Stelle Vercel (Speichern = Sync, Nummern von dort) |
| 14:12 | iPad: Werke schneller vom Server laden |
| **14:17** | **Inject-Script** in index.html (Stale-Check 2 Min, Reload bei Fetch-Fehler von build-info.json) |
| 14:22 | refresh.html (Refresh-URL) |
| 14:35 | Weiterleitung auf /r/\<timestamp\> |
| 14:58, 15:04, … | Stand-Updates, Vercel-Checkliste, später /api/build-info, QR mit Date.now() |

---

## Was wir nicht gemacht haben

- **Kein Zugriff auf das Vercel-Dashboard** – Production Branch, Deployments, Build-Logs können nur dort geändert bzw. eingesehen werden.
- **Keine Änderung an „Vercel“ als Dienst** – nur Code und Dateien im Repo (vercel.json, index.html, Scripts, API).

---

## Was die Ursache sein kann

1. **Build schlägt fehl**  
   Ein Commit nach 13:26 hat einen **Build-Fehler** eingeführt (z. B. TypeScript, fehlende Datei, Skript-Fehler). Dann erstellt Vercel zwar einen Build, der aber mit **Error** endet und nicht als Production ausgeliefert wird.  
   **→ Im Vercel-Dashboard:** Deployments → neuestes Deployment mit Status **Error** → **Build-Log** öffnen. Die Fehlermeldung dort ist die Ursache.

2. **Production-Branch**  
   Wenn in Vercel unter Settings → Git ein anderer **Production Branch** eingestellt ist als der, auf den ihr pusht (z. B. `main-fresh` statt `main`), baut Production nicht von euren letzten Commits.  
   **→ Prüfen:** Settings → Git → Production Branch = **main**.

3. **Build wird nicht gestartet**  
   Webhook/Anbindung zu GitHub unterbrochen oder Projekt-Einstellungen geändert.  
   **→ Prüfen:** Deployments – erscheinen überhaupt neue Builds bei jedem Push?

---

## Was du konkret tun kannst

1. **Vercel Dashboard** → Projekt **k2-galerie** → **Deployments**.
2. Neuestes Deployment ansehen: **Ready** (grün) oder **Error** (rot)?
3. Bei **Error:** Auf das Deployment klicken → **Build-Log** / „View build log“ öffnen → Fehlermeldung lesen (z. B. „Module not found“, TypeScript-Fehler, „Invalid …“).
4. **Settings → Git:** Production Branch = **main**?

Die genaue Ursache steht **nur im Build-Log** bzw. in den Vercel-Einstellungen – nicht im Repo. Sobald der Build wieder **Ready** ist (nach Fix oder nach Redeploy), liefert Vercel einen neuen Stand und 13:26 ist vorbei.

---

## Zusammenfassung

- **13:26** = letzter erfolgreicher Production-Build.
- **Danach:** Nur normale Code-Änderungen (Inject-Script, refresh.html, /api/build-info, QR). Nichts davon „konfiguriert Vercel“ direkt.
- **Warum es hängt:** Entweder schlagen neue Builds fehl (→ Build-Log) oder Production baut nicht von main (→ Settings → Git). Beides wird im **Vercel-Dashboard** geklärt.
