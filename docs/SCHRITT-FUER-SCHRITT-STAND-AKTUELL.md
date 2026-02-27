# Schritt für Schritt: Stand überall aktuell

**Ausgangslage (Screenshot 27.02.26):** Vercel zeigt Deployments mit Status **Ready**, aber „Current“ ist ein älterer Commit (z. B. 8206750). iPad/Handy bleiben bei alter Zeit (z. B. 13:26).

**Ziel:** Der neueste Code ist auf Vercel live, und iPad/Mac zeigen denselben Stand.

---

## Schritt 1: Sicherstellen, dass der neueste Code gepusht ist

- Im Cursor-Terminal: `git status` → alles committed?
- Wenn nicht: `git add .` → `git commit -m "Stand DD.MM.YY HH:MM"` → `git push`
- **Wichtig:** Nur was auf **main** gepusht ist, wird von Vercel gebaut.

---

## Schritt 2: In Vercel prüfen, welcher Build „Current“ ist

1. **https://vercel.com** → Projekt **k2-galerie** → **Deployments**.
2. Oben das Deployment mit dem Label **„Current“** ansehen:
   - **Commit-Nachricht:** Ist das dein **neuester** Commit (z. B. mit „Stand …“, „QR …“, „api/build-info“)?
   - Wenn **ja** → weiter zu Schritt 4.
   - Wenn **nein** (z. B. steht noch „DIALOG-STAND: Werk bleibt in Vorschau…“) → Schritt 3.

---

## Schritt 3: Neues Deployment auslösen

- **Option A:** Nochmal pushen (z. B. kleiner Commit wie Stand-Update), dann 1–2 Min warten.
- **Option B:** In Vercel beim **neuesten** Deployment (nicht dem Current) auf die drei Punkte **⋯** klicken → **„Promote to Production“** (falls vorhanden).
- **Option C:** Bei einem neueren Deployment, das **Ready** ist, **„Promote to Production“** wählen, damit es **Current** wird.
- Danach in der Deployments-Liste prüfen: Das gewünschte Deployment ist **Current**.

---

## Schritt 4: Stand prüfen, den Vercel ausliefert

1. Im Browser (Mac): **https://k2-galerie.vercel.app/api/build-info** öffnen (oder **https://k2-galerie.vercel.app/build-info.json**).
2. Prüfen: Wird eine **aktuelle** Zeit angezeigt (z. B. heute, gerade)?
   - **Ja** → Vercel liefert den neuen Stand. Weiter Schritt 5 (Client).
   - **Nein** (z. B. noch 13:26) → Beim Build wird der Stand nicht neu geschrieben. Lokal im Cursor-Terminal `node scripts/write-build-info.js` ausführen, dann **commit + push**. Nach neuem Deployment nochmal prüfen.

---

## Schritt 5: iPad / Handy auf neuen Stand bringen

- **QR-Code:** Auf der APf (Galerie/Willkommensseite) **neuen QR scannen** – der Link enthält einen Cache-Bust, damit die aktuelle Version geladen wird.
- **Oder:** Im Browser auf dem Gerät **https://k2-galerie.vercel.app/refresh.html** einmal aufrufen – leitet mit Cache-Bust zur Galerie weiter.
- **Oder:** In den Einstellungen des Browsers / PWA **Website-Daten löschen** für k2-galerie.vercel.app, dann Seite neu öffnen.

---

## Schritt 6: Kontrolle

- **iPad/Handy:** Galerie öffnen → unten links **Stand: DD.MM.YY HH:MM** – entspricht das der Zeit aus Schritt 4?
- Wenn **ja:** Stand ist überall gleich.
- Wenn **nein:** Nochmal Schritt 5 (refresh.html oder QR neu scannen); ggf. prüfen, ob ein anderes Netz/Cache (z. B. Mobilfunk vs. WLAN) eine alte Version liefert.

---

## Kurz-Checkliste

| Schritt | Was tun |
|--------|--------|
| 1 | Neuesten Stand committen und auf **main** pushen. |
| 2 | Vercel → Deployments: Ist **Current** der neueste Commit? |
| 3 | Wenn nein: Nochmal pushen oder „Promote to Production“ für neueres Deployment. |
| 4 | build-info auf Vercel prüfen (api/build-info oder build-info.json) – aktuelle Zeit? |
| 5 | iPad: QR neu scannen oder refresh.html aufrufen. |
| 6 | Stand auf dem Gerät prüfen (unten links). |

Siehe auch: **VERCEL-CHECKLISTE-BEI-KEINEM-STAND.md**, **VERCEL-STAND-HANDY.md**.
