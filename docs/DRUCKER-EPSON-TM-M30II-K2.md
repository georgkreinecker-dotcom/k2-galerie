# Epson TM-m30II – WLAN & K2 (Kasse)

Kurzanleitung für den **Epson TM-m30II** im WLAN. **K2:** Der Epson ist der **Kassendrucker** (Bon/Beleg im Shop per System-Druckdialog). **Etiketten** gehen am **Brother QL** (eigene IP + One-Click). Im Admin unter **K2 Galerie** zwei Abschnitte: Etikett Brother, Kasse Epson.

---

## 1. Drucker ins WLAN bringen

- Drucker per **Epson-Utility** oder **Bedienfeld/Wizard** mit dem **Heim-WLAN** verbinden (SSID + Passwort wie beim Router).
- Wenn ein **mobiler Hotspot / zweiter Router** genutzt wird: Drucker und **der Rechner, auf dem der Print-Server läuft**, müssen im **selben** Teilnetz sein (z. B. alle `192.168.1.x`).

---

## 2. IP-Adresse ermitteln

- **Statusblatt** am Drucker drucken (laut Epson-Handbuch: oft Taste am Gerät oder Menü „Netzwerkstatus“), oder  
- Im Browser die **Web-Config** öffnen: `http://<IP-des-Druckers>/` (IP vom Statusblatt oder vom Router „verbundene Geräte“).

Diese **IPv4** trägst du in der K2-App ein: **Admin → Einstellungen → Drucker** (Mandant **K2 Galerie**) im Abschnitt **Kassendrucker (Epson TM-m30II)** → **IP-Adresse (Epson Kasse)** – nicht die Brother-Etiketten-IP verwechseln.

---

## 3. IPP aktivieren & Pfad für K2

Der interne Print-Server spricht den Drucker per **IPP auf Port 631** an: `http://<Drucker-IP>:631/<IPP-Pfad>`.

- Im **Web-Config** des Epson (Netzwerk / IPP): **IPP** einschalten, falls aus.
- Den **IPP-Pfad** (Queue-Name) steht dort meist als etwas wie **`EPSON_IPP_Printer`** – **ohne** führenden Slash, exakt so wie angezeigt übernehmen.

In K2: **Admin → Einstellungen → Drucker**  
- **Etikett Brother:** IPP-Pfad One-Click = typischerweise `ipp/print`  
- **Kasse Epson:** **IPP-Pfad Epson** im Abschnitt Kassendrucker – oft `EPSON_IPP_Printer` (vom Gerät ablesen). One-Click im Etikett-Modal nutzt weiter nur den Brother.

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

Dependencies: im Projekt `npm install` – Paket **`ipp`** muss installiert sein (siehe Kommentar in `scripts/k2-print-server.js`).

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
3. **Print-Server** (Abschnitt 5): Bon vom Mac oder vom Server an den Epson schicken, wenn ihr diesen Weg nutzt.

In der **K2-App** sind die Bon-Hinweise darauf ausgerichtet (kein Versprechen „AirPrint = Epson sichtbar“).

---

## Siehe auch

- `DRUCKER-AIRPRINT.md` – Druckdialog, Teilen, iPad/Android  
- `DRUCKER-STAND.md` – was in der App bereits umgesetzt ist  
- `docs/KRITISCHE-ABLAEUFE.md` – Etikett: primärer Weg = Druckdialog; One-Click = Zusatzweg

*Stand: April 2026*
