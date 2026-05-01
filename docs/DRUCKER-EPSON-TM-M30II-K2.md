# Epson TM-m30II – WLAN & K2 One-Click (IPP)

Kurzanleitung, damit der **Epson TM-m30II** im gleichen WLAN wie Mac/iPad/Handy erreichbar ist und der **One-Click-Druck** aus der K2-App funktioniert (Print-Server + IPP).

---

## 1. Drucker ins WLAN bringen

- Drucker per **Epson-Utility** oder **Bedienfeld/Wizard** mit dem **Heim-WLAN** verbinden (SSID + Passwort wie beim Router).
- Wenn ein **mobiler Hotspot / zweiter Router** genutzt wird: Drucker und **der Rechner, auf dem der Print-Server läuft**, müssen im **selben** Teilnetz sein (z. B. alle `192.168.1.x`).

---

## 2. IP-Adresse ermitteln

- **Statusblatt** am Drucker drucken (laut Epson-Handbuch: oft Taste am Gerät oder Menü „Netzwerkstatus“), oder  
- Im Browser die **Web-Config** öffnen: `http://<IP-des-Druckers>/` (IP vom Statusblatt oder vom Router „verbundene Geräte“).

Diese **IPv4** trägst du in der K2-App ein: **Admin → Einstellungen → Drucker → IP-Adresse** (Mandant **K2 Galerie**).

---

## 3. IPP aktivieren & Pfad für K2

Der interne Print-Server spricht den Drucker per **IPP auf Port 631** an: `http://<Drucker-IP>:631/<IPP-Pfad>`.

- Im **Web-Config** des Epson (Netzwerk / IPP): **IPP** einschalten, falls aus.
- Den **IPP-Pfad** (Queue-Name) steht dort meist als etwas wie **`EPSON_IPP_Printer`** – **ohne** führenden Slash, exakt so wie angezeigt übernehmen.

In K2: **Admin → Einstellungen → Drucker → IPP-Pfad (One-Click)**  
- Brother QL: typischerweise `ipp/print`  
- Epson TM-m30II: oft `EPSON_IPP_Printer` (von deinem Gerät ablesen, nicht raten)

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

## Siehe auch

- `DRUCKER-AIRPRINT.md` – Druckdialog, Teilen, iPad/Android  
- `DRUCKER-STAND.md` – was in der App bereits umgesetzt ist  
- `docs/KRITISCHE-ABLAEUFE.md` – Etikett: primärer Weg = Druckdialog; One-Click = Zusatzweg

*Stand: April 2026*
