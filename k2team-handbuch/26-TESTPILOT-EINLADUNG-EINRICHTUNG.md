# Testpilot-Einladung – einmal einrichten, dann funktioniert es

**Wo du es nutzt:** APf → **Projekte** → **K2 Galerie** → **Lizenzen** → Abschnitt **„Testpilot:in per E-Mail einladen“** (Anker `#testpilot-einladen`).

**Was passiert:** Der Button erzeugt **immer** einen persönlichen Link. Ob **zusätzlich** eine E-Mail vom Server ankommt, hängt von **Resend** ab (siehe unten).

---

## Kurzüberblick

| Du willst … | Dafür brauchst du … |
|-------------|---------------------|
| Nur den Link (kopieren, per Signal/WhatsApp schicken) | **`PILOT_INVITE_SECRET`** – lokal in `.env` und auf Vercel |
| Dass eine **E-Mail** im Postfach landet | Wie oben **plus** **`RESEND_API_KEY`** (und sinnvoll **`RESEND_FROM`**) auf **Vercel**; lokal optional in `.env` zum Testen |

---

## Schritt 1 – Geheimnis `PILOT_INVITE_SECRET` (Pflicht)

Ohne diesen Wert antwortet die API mit einem Fehler (lokal z. B. „PILOT_INVITE_SECRET in .env eintragen“).

1. Einen **langen zufälligen** String wählen – **mindestens 32 Zeichen** (Passwort-Generator oder `openssl rand -hex 32`).
2. **Lokal:** Im Projektordner die Datei **`.env`** anlegen oder ergänzen (nicht committen; liegt in `.gitignore`):

   ```env
   PILOT_INVITE_SECRET=hier-dein-langer-zufallswert-mindestens-32-zeichen
   ```

3. **Dev-Server neu starten** nach jeder Änderung an `.env` (`npm run dev` beenden und neu starten).
4. **Vercel:** **Project** → **Settings** → **Environment Variables** → dieselbe Variable für **Production** (und ggf. Preview) setzen → **Redeploy** auslösen, damit die Serverless-Funktion den neuen Wert hat.

**Wichtig:** Das Geheimnis muss **überall dasselbe** sein, wo du die Einladung wirklich nutzt (lokal nur für lokaler Test; live nur Vercel).

---

## Schritt 2 – E-Mail vom Server (Resend, optional)

Wenn **kein** `RESEND_API_KEY` gesetzt ist: Der Link erscheint in der App, aber **kein** Versand über den Server – dann gelbe Hinweise oder „mailto“ nutzen.

1. Account bei **Resend** anlegen: https://resend.com  
2. **API Key** erstellen → in Vercel als **`RESEND_API_KEY`** eintragen (Production).  
3. **Domain** bei Resend verifizieren (DNS-Einträge wie angegeben).  
4. **`RESEND_FROM`** setzen, z. B. `K2 Galerie <onboarding@deine-verifizierte-domain>` – die Domain muss zu Resend passen.  
5. **Redeploy** auf Vercel nach dem Setzen der Variablen.

**Lokal testen:** Dieselben beiden Variablen in `.env` eintragen, Dev-Server neu starten. Dann sollte ein Versand wie auf Vercel möglich sein (sofern Resend den Key akzeptiert).

---

## Schritt 3 – Erfolg prüfen

1. **Lizenzen** öffnen, Formular ausfüllen, absenden.  
2. **Grüner** Erfolg + keine Warnung → Server-Mail wurde mit Resend ausgelöst.  
3. **Gelbe Warnung** → Link ist da, Server-Mail nicht (kein Key, Resend-Fehler, Domain) – Text in der Meldung lesen; technische Details stehen ggf. darunter.  
4. **Rot** → meist fehlendes Geheimnis oder Netzwerkfehler; Meldung lesen.

---

## Typische Fehler

| Meldung / Symptom | Ursache | Was tun |
|-------------------|---------|---------|
| „PILOT_INVITE_SECRET in .env eintragen“ (nur lokal) | `.env` fehlt oder Variable leer, oder Dev nicht neu gestartet | Schritt 1, dann Dev neu starten |
| Link da, Posteingang leer | Kein `RESEND_API_KEY` auf Vercel oder Resend lehnt ab | Schritt 2; Vercel-Logs prüfen |
| Auf Vercel rot / API-Fehler | `PILOT_INVITE_SECRET` nicht in Vercel gesetzt oder nach Änderung kein Redeploy | Schritt 1 Vercel-Teil |

---

## Eine Quelle im Projekt

- Technische Details und Code: `api/send-pilot-invite.js`, lokale Weiterleitung in `vite.config.ts` (Dev).

**Stand:** März 2026 – bei Änderungen an der API diese Seite mit anpassen.
