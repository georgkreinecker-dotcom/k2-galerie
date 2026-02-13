# One-Click-Druck ohne Mac vor Ort (Standalone)

**Situation:** Tablet/Handy und Drucker (Brother) sind vor Ort (z. B. Galerie), der Mac ist woanders. One-Click soll trotzdem funktionieren.

## Warum es von Vercel aus oft scheitert

Wenn du K2 von **https://k2-galerie.vercel.app** öffnest, darf der Browser **keine** Anfragen an **http://** (z. B. einen lokalen Print-Server) senden („Mixed Content“). Deshalb funktioniert One-Click mit einer **http://**-Print-Server-URL von Vercel aus in der Regel nicht.

---

## Option A: Kleines Gerät vor Ort (empfohlen für Standalone)

**Ein Gerät** (Raspberry Pi, alter Laptop, Mini-PC) hängt am **gleichen WLAN/Router** wie Drucker und Tablet.

1. **Auf diesem Gerät** (nicht dem Mac):
   - Projekt kopieren (oder vom Mac per Netzwerk zugreifen).
   - Print-Server starten: `npm run print-server` (läuft z. B. auf Port 3847).
   - Optional: K2 auch dort starten, z. B. `npm run dev` oder statischen Build ausliefern, dann öffnet das Tablet **http://GERAET-IP:5175** (nicht Vercel).

2. **Tablet/Handy** im gleichen WLAN:
   - K2 öffnen unter **http://GERAET-IP:5175** (also von dem Gerät vor Ort, nicht von Vercel).
   - Einstellungen → Drucker → Print-Server URL: **http://GERAET-IP:3847** (gleiche IP wie das Gerät).
   - Brother-Drucker-IP wie gewohnt eintragen (wenn der Drucker im gleichen Netz ist).

3. **One-Click drucken** funktioniert, weil alles **http://** im gleichen Netz ist – kein Mixed-Content-Block.

---

## Option B: Von Vercel aus drucken (Print-Server per HTTPS)

Du willst K2 weiter von **Vercel** (Handy/Tablet) aus nutzen und trotzdem One-Click.

Dann muss der Print-Server **per HTTPS** erreichbar sein, damit der Browser von der Vercel-Seite aus anfragen darf.

1. **Vor Ort** läuft ein Gerät (Raspberry Pi, Laptop) mit dem Print-Server (`npm run print-server`).
2. Auf diesem Gerät **ngrok** (oder ähnlich) einrichten, z. B.:
   - `ngrok http 3847`
   - Du bekommst eine URL wie **https://xxxx.ngrok.io**.
3. In K2 (von Vercel aus): Einstellungen → Drucker → Print-Server URL: **https://xxxx.ngrok.io** (ohne Port, ngrok leitet weiter).
4. One-Click von Vercel aus geht, weil die Anfrage an **https://** geht.

**Hinweis:** Bei ngrok-Free kann sich die URL beim Neustart ändern; dann in K2 wieder anpassen oder einen festen Tunnel nutzen.

---

## Kurz

- **Standalone ohne Mac:** Ein Gerät vor Ort (Pi, Laptop) mit Print-Server; Tablet öffnet K2 per **http://GERAET-IP:5175** und Print-Server URL **http://GERAET-IP:3847** → One-Click funktioniert.
- **Oder:** Print-Server vor Ort per **HTTPS** (z. B. ngrok) erreichbar machen → dann One-Click auch von Vercel aus.
