# Testpilot-Einladung – einmal einrichten, dann funktioniert es

**Wo du es nutzt:** APf → **Projekte** → **K2 Galerie** → **Lizenzen** → Abschnitt **„Testpilot:in per E-Mail einladen“** (Anker `#testpilot-einladen`).

**Was passiert:** Der Button erzeugt **immer** einen persönlichen Link. Ob **zusätzlich** eine E-Mail vom Server ankommt, hängt von **Resend** ab (siehe unten).

---

## Der eine Pfad (normaler Betrieb)

**Lizenzen auf der APf** – auch wenn du die App unter **localhost** öffnest – schickt der Browser die Anfrage **immer an die Live-API** auf k2-galerie.vercel.app. Der Link in der E-Mail bzw. zum Kopieren wird dort signiert; **ein** Ablauf, **kein** Mix aus „lokal signieren, Link zeigt auf Vercel“.

Dafür muss **`PILOT_INVITE_SECRET`** auf **Vercel** (Production) stimmen und nach Änderungen ein **Redeploy** gelaufen sein. Das ist der Pfad für dich im Alltag.

*Hilfestellung zum Fehlerfinden:* Wenn etwas nicht passt, kann man in der Konsole oder in Vercel-Logs nachsehen; **gleiches Secret lokal und auf Vercel** war früher eine Erklärhilfe bei `bad_signature` – **kein** zweiter offizieller Nutzerweg neben dem Live-API-Pfad.

---

## Kurzüberblick

| Du willst … | Dafür brauchst du … |
|-------------|---------------------|
| Den Einladungs-Link (kopieren, z. B. Signal/WhatsApp) | **`PILOT_INVITE_SECRET`** auf **Vercel** (Schritt 1) – die APf nutzt dafür automatisch die Live-API |
| Dass eine **E-Mail** im Postfach landet | Wie oben **plus** **`RESEND_API_KEY`** (und sinnvoll **`RESEND_FROM`**) auf **Vercel** |
| **Kurze, einzeilige** Einladungs-URL in der Mail (lesbar, Symbol statt Riesen-Link) | **Supabase:** Migration **`009_pilot_short_invites.sql`** im Projekt auf deiner Datenbank ausführen; **`SUPABASE_URL`** und **`SUPABASE_SERVICE_ROLE_KEY`** müssen auf **Vercel** gesetzt sein. Ohne Tabelle oder ohne Keys: Es funktioniert weiter mit dem **langen** Fallback-Link (`?t=…`). |

---

## Schritt 1 – Geheimnis `PILOT_INVITE_SECRET` (Pflicht für Live)

Ohne diesen Wert auf Vercel antwortet die Live-API mit einem Fehler.

1. Einen **langen zufälligen** String wählen – **mindestens 32 Zeichen** (Passwort-Generator oder `openssl rand -hex 32`).
2. **Vercel:** **Project** → **Settings** → **Environment Variables** → **`PILOT_INVITE_SECRET`** für **Production** (und ggf. Preview) setzen → **Redeploy** auslösen, damit die Serverless-Funktion den Wert hat.

**Nur Entwicklung / direkter API-Test am Rechner:** Wer die Route **`/api/send-pilot-invite`** im **lokalen** Dev-Server über die Vite-Middleware anstößt, braucht **`PILOT_INVITE_SECRET`** zusätzlich in **`.env`** im Projektordner (nicht committen) und startet den Dev-Server danach neu. Das ist **nicht** der gleiche Weg wie „Lizenzen in der APf“ – die geht wie oben über **Live**.

---

## Schritt 2 – E-Mail vom Server (Resend, optional)

Wenn **kein** `RESEND_API_KEY` gesetzt ist: Der Link erscheint in der App, aber **kein** Versand über den Server – dann gelbe Hinweise oder „mailto“ nutzen.

1. Account bei **Resend** anlegen: https://resend.com  
2. **API Key** erstellen → in Vercel als **`RESEND_API_KEY`** eintragen (Production).  
3. **Domain** bei Resend verifizieren (DNS-Einträge wie angegeben).  
4. **`RESEND_FROM`** setzen, z. B. `K2 Galerie <onboarding@deine-verifizierte-domain>` – die Domain muss zu Resend passen.  
5. **Redeploy** auf Vercel nach dem Setzen der Variablen.

**Optional lokal:** Dieselben Resend-Variablen in `.env` nur wenn du **E-Mail-Versand** direkt gegen den Dev-Server testen willst; für den normalen Lizenzen-Weg reicht Vercel.

---

## Schritt 3 – Erfolg prüfen

1. **Lizenzen** öffnen, Formular ausfüllen, absenden.  
2. **Grüner** Erfolg + keine Warnung → Server-Mail wurde mit Resend ausgelöst.  
3. **Gelbe Warnung** → Link ist da, Server-Mail nicht (kein Key, Resend-Fehler, Domain) – Text in der Meldung lesen; technische Details stehen ggf. darunter.  
4. **Rot** → meist fehlendes Geheimnis auf Vercel oder Netzwerkfehler; Meldung lesen.

---

## Typische Fehler

| Meldung / Symptom | Ursache | Was tun |
|-------------------|---------|---------|
| API-Fehler / rot nach **Lizenzen** | `PILOT_INVITE_SECRET` fehlt auf Vercel oder kein Redeploy nach Änderung | Schritt 1 Vercel |
| „PILOT_INVITE_SECRET in .env eintragen“ (nur lokal, **Dev** direkt) | `.env` fehlt für **lokalen** API-Test, oder Dev nicht neu gestartet | Nur bei Middleware-Test: `.env` + Neustart; **Lizenzen** nutzen Live-API |
| Link da, Posteingang leer | Kein `RESEND_API_KEY` auf Vercel oder Resend lehnt ab | Schritt 2; Vercel-Logs prüfen |
| Früher: `bad_signature` nach Klick auf Link | Signatur und Prüfung an verschiedenen Orten – **behoben** durch einen Live-API-Pfad aus der APf | Bei erneutem Auftreten: Vercel-Secret und Deploy prüfen |

---

## Eine Quelle im Projekt

- **Welche URL der Browser aufruft:** `src/utils/pilotInviteClient.ts` (`getSendPilotInviteApiUrl()`).
- **Server:** `api/send-pilot-invite.js`; lokale Weiterleitung in `vite.config.ts` nur für **Dev**.

**Stand:** März 2026 – bei Änderungen an der API diese Seite mit anpassen.
