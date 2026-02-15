# Vercel: Fehlermeldung oder Bestätigung (Ready) per E-Mail

Damit du in Zukunft eine **Fehlermeldung bei fehlgeschlagenem Build** oder eine **Bestätigung bei „Ready“** bekommst.

---

## E-Mail-Benachrichtigungen einrichten

1. **Vercel anmelden**  
   Im Browser öffnen: **https://vercel.com/dashboard** (nicht vercel.com/k2-galerie/k2-galerie – die direkte Projekt-URL kann 404 geben). Vom Dashboard aus auf das Projekt **k2-galerie** klicken.

2. **Benachrichtigungen öffnen**  
   - Oben rechts: dein **Profilbild** (oder Account-Menü)  
   - **Settings** (Einstellungen)  
   - Links: **Notifications** (Benachrichtigungen)  
   - Oder direkt: **https://vercel.com/account/notifications**

3. **E-Mail aktivieren**  
   - **Deployment Failed** (Build fehlgeschlagen): ankreuzen → du bekommst eine E-Mail, wenn der Build z. B. wegen TypeScript-Fehlern scheitert.  
   - **Deployment Ready** (optional): ankreuzen → du bekommst eine E-Mail, wenn das Deployment erfolgreich ist („Ready“).

4. **Speichern**  
   Änderungen werden in der Regel automatisch übernommen.

---

## Was du dann bekommst

| Ereignis              | E-Mail-Inhalt (ungefähr)     |
|-----------------------|------------------------------|
| **Build fehlgeschlagen** | „Deployment failed“ + Link zu den Build-Logs |
| **Deployment Ready**  | Hinweis, dass das Deployment live ist        |

So siehst du sofort, ob der Push zu Vercel geklappt hat oder ob du nachschauen musst (z. B. in den Build-Logs).

---

## Zusätzlich: GitHub-E-Mails

Wenn du über **GitHub** zu Vercel pushst, kannst du zusätzlich in GitHub E-Mails für Commit-Status aktivieren (z. B. „Build failed“). Das ist unter GitHub → Settings → Notifications konfigurierbar. Die Vercel-Benachrichtigungen reichen aber in der Regel aus.

---

## Keine E-Mail bekommen?

- **Erste E-Mail:** Kann 1–2 Minuten dauern; **Spam-Ordner** prüfen.
- **Nie eine E-Mail:** Unter https://vercel.com/account/notifications **Deployment Failed** (und optional **Deployment Ready**) aktivieren. E-Mail-Adresse ist die deines Vercel-Accounts.
- **Status trotzdem prüfen:** https://vercel.com/dashboard → Projekt **k2-galerie** → **Deployments** → oben „Ready“ (grün) = OK, „Error“ (rot) = Build-Logs öffnen.

---

## Kurzfassung

- **Vercel:** https://vercel.com/account/notifications  
- **Deployment Failed** aktivieren → Fehlermeldung per E-Mail  
- **Deployment Ready** (optional) aktivieren → Bestätigung per E-Mail  
