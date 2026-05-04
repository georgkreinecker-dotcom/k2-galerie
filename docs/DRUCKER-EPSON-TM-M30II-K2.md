# Epson TM-m30II / TM-m30III – WLAN & K2 (Kasse)

Kurzanleitung für den **Epson TM-m30II** bzw. **TM-m30III** im WLAN. **K2:** Der Epson ist der **Kassendrucker** (Bon/Beleg im Shop per System-Druckdialog). **Etiketten** gehen am **Brother QL** (eigene IP + One-Click). Im Admin unter **K2 Galerie** zwei Abschnitte: Etikett Brother, Kasse Epson.

---

## 1. Drucker ins WLAN bringen

- Drucker per **Epson-Utility** oder **Bedienfeld/Wizard** mit dem **Heim-WLAN** verbinden (SSID + Passwort wie beim Router).
- Wenn ein **mobiler Hotspot / zweiter Router** genutzt wird: Drucker und **der Rechner, auf dem der Print-Server läuft**, müssen im **selben** Teilnetz sein (z. B. alle `192.168.1.x`).

---

## 2. IP-Adresse ermitteln

- **Statusblatt** am Drucker drucken (laut Epson-Handbuch: oft Taste am Gerät oder Menü „Netzwerkstatus“), oder  
- Im Browser die **Web-Config** öffnen: `http://<IP-des-Druckers>/` (IP vom Statusblatt oder vom Router „verbundene Geräte“).

Diese **IPv4** trägst du in der K2-App ein: **Admin → Einstellungen → Drucker** (Mandant **K2 Galerie**) im Abschnitt **Kassendrucker (Epson TM-m30II / III)** → **IP-Adresse (Epson Kasse)** – nicht die Brother-Etiketten-IP verwechseln. **Beispiel** aus einem Status-Bon vor Ort: **192.168.0.83** (siehe Konstante `K2_EPSON_STATUS_BON_EXAMPLE_IP` – im Admin gibt es einen Button „vom Status-Bon eintragen“). Bei **DHCP** kann sich die IP ändern → neuen Bon drucken oder feste IP / Reservierung im Router.

---

## 3. IPP aktivieren & Pfad für K2

Der interne Print-Server spricht den Drucker per **IPP auf Port 631** an: `http://<Drucker-IP>:631/<IPP-Pfad>`.

- Im **Web-Config** des Epson (Netzwerk / IPP): **IPP** einschalten, falls aus.
- Den **IPP-Pfad** (Queue-Name) steht dort meist als etwas wie **`EPSON_IPP_Printer`** – **ohne** führenden Slash, exakt so wie angezeigt übernehmen.

In K2: **Admin → Einstellungen → Drucker**  
- **Etikett Brother:** IPP-Pfad One-Click = typischerweise `ipp/print`  
- **Kasse Epson:** **IPP-Pfad Epson** im Abschnitt Kassendrucker – oft `EPSON_IPP_Printer` (vom Gerät ablesen). Mit **Print-Server** (`npm run print-server`) und Epson-IP zeigt die **Kasse** zusätzlich **Bon direkt an Epson** (siehe §5a).

---

## 4. Etikettenformat (mm)

Im Feld **Etikettenformat** Breite × Höhe in **Millimeter** (wie beim Brother).

- TM-m30II mit **80 mm** Rollenbreite: Breite oft **80**, Höhe je nach Etikett/Rolle (z. B. `80x200` – an deine Rolle und den gewünschten Ausschnitt anpassen).
- Wenn der Druck schief oder abgeschnitten wirkt: Höhe/Breite schrittweise anpassen oder in der Epson-Software testen.

---

## 5. Print-Server (One-Click)

1. Am **Mac** im Projektordner: `npm run print-server` (oder `node scripts/k2-print-server.js`).  
2. In K2: **Print-Server URL** = `http://localhost:3847` (nur wenn die App **auf demselben Mac** läuft).  
3. Druckt ein **iPad** im WLAN mit: URL muss die **LAN-IP dieses Macs** sein, z. B. `http://192.168.1.x:3847` – Firewall am Mac ggf. Port **3847** für lokales WLAN erlauben.

Derselbe Server nimmt **Etikett (Brother)** und **Kassenbon (Epson)** entgegen: `POST /print` mit PNG; beim Bon setzt die App `jobName: k2-bon` (IPP-Jobname), damit der Epson den Auftrag sauber trennt.

Dependencies: im Projekt `npm install` – Paket **`ipp`** muss installiert sein (siehe Kommentar in `scripts/k2-print-server.js`).

---

## 5a. Kasse: „Bon direkt an Epson (WLAN)“ (K2, Zusatzweg)

Wenn **Epson-IP**, **IPP-Pfad** und **Print-Server-URL** in den Drucker-Einstellungen stehen, zeigt die **K2-Kasse** nach einem Verkauf (und beim **Bon erneut drucken**) den Button **„Bon direkt an Epson (WLAN)“**.

- **Ablauf:** Bon-HTML → im Browser zu PNG gerastert → `fetch` an den Print-Server auf dem Mac → **IPP** an die Epson-IP.
- **Reihenfolge der Buttons:** Am **Mac/Desktop** zuerst **„Kassenbon – Druckdialog“** (wie in `docs/KRITISCHE-ABLAEUFE.md`), darunter optional **Bon direkt an Epson**. Am **iPad** (Touch), wenn Epson + Print-Server eingetragen sind: **zuerst Bon direkt an Epson**, darunter **„Bon als PDF / Teilen“** – damit der erste sichtbare Schritt **nicht** nur die System-/AirPrint-Liste ist (Epson fehlt dort oft).
- **Voraussetzung:** `npm run print-server` läuft auf dem **Mac** im gleichen WLAN wie iPad und Epson.
- **Wichtig – https vs. http:** Öffnest du die Kasse unter **https** (z. B. Vercel `k2-galerie.vercel.app`), blockiert der Browser Aufrufe zu einem **http**-Print-Server (**Mixed Content**). **Das betrifft dich auch, wenn Epson-IP und Print-Server-URL „richtig“ eingetragen sind** – es liegt nicht an der 192.168.x.x des Druckers, sondern an **https-Seite → http-Server**. Dann erscheint eine **klare Meldung** in der App. **Lösungen:** Kasse im LAN unter **http://…** öffnen (z. B. `http://<Mac-LAN-IP>:5177/projects/k2-galerie/shop` mit `npm run dev` am Mac; Print-Server-URL weiter `http://<Mac-LAN-IP>:3847`), oder einen **https**-Zugang zum Print-Server einrichten (Tunnel/Reverse-Proxy – für Experten).
- **Technik:** `src/utils/k2EpsonBonOneClick.ts`, `ShopPage.tsx`, Print-Server `scripts/k2-print-server.js`.

---

## 6. Kurz-Checkliste

| Schritt | Erledigt |
|--------|----------|
| Epson im gleichen WLAN wie Mac/Print-Server | ☐ |
| IP in K2 eingetragen | ☐ |
| IPP an, Pfad aus Web-Config in **IPP-Pfad** eingetragen | ☐ |
| Etikettenformat (mm) zur Rolle passend | ☐ |
| Print-Server läuft, URL in K2 stimmt | ☐ |

---

## 7. iPad/iPhone: „Kein Epson“ unter Drucken / AirPrint?

Der **TM-m30II** hat in der Regel **kein Apple AirPrint**. In der iOS-Druckerliste erscheint er deshalb oft **gar nicht** – das ist **kein Fehler** der App.

**Praktische Wege:**

1. **Bon am Mac drucken:** PDF **Teilen** → in **Dateien** speichern → auf dem Mac öffnen und mit dem dort eingerichteten Epson (IPP/IP) drucken. Oder Mac-Drucker für das iPad **freigeben** (Systemeinstellungen → Freigaben).
2. **Hersteller-Seite:** **Epson TM Utility** / passende **Epson-Drucker-App** nutzen, falls ihr sie für den Bon einsetzt (laut Epson-Doku zum Modell).
3. **Print-Server** (Abschnitt 5 / **5a**): Button **„Bon direkt an Epson (WLAN)“** – Bon geht als PNG über den Mac-Print-Server per IPP an den Epson (ohne AirPrint).

In der **K2-App** sind die Bon-Hinweise darauf ausgerichtet (kein Versprechen „AirPrint = Epson sichtbar“).

---

## Siehe auch

- `DRUCKER-AIRPRINT.md` – Druckdialog, Teilen, iPad/Android  
- `DRUCKER-STAND.md` – was in der App bereits umgesetzt ist  
- `docs/KRITISCHE-ABLAEUFE.md` – Etikett: primärer Weg = Druckdialog; One-Click = Zusatzweg

*Stand: April 2026 – Abschnitt 5a Bon-One-Click ergänzt*
