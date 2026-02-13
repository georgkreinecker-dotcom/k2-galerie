# Brother-Drucker: AirPrint & Druck-Einstellungen

## AirPrint aktiviert

AirPrint ist eingerichtet und funktioniert (z. B. über handyPrint, Printopia oder Mac-Freigabe). Beim Etikett-Druck:

1. **„Jetzt drucken“** tippen
2. **Drucker wählen** (Brother oder AirPrint-Drucker)
3. **Papier:** 29×90,3 mm (Brother-Etikett)
4. **Skalierung:** 100 %

---

## Brother QL-820MWBc – AirPrint über Mac/Apps

Der Brother QL-820MWBc hat von Haus aus kein AirPrint. Mit **handyPrint**, **Printopia** oder **Mac-Freigabe** wird er als AirPrint-Drucker sichtbar.

---

## Alternativen (falls AirPrint ausfällt)

### 1. Druck über den Mac – am zuverlässigsten

**Brother am Mac per IP hinzufügen:**

1. **Systemeinstellungen** → **Drucker & Scanner** → **„+“** (Hinzufügen)
2. **„IP-Drucker“** wählen
3. **IP-Adresse** eintragen (z. B. `192.168.1.102` – steht in K2 Einstellungen → Drucker)
4. **Protokoll:** IPP, LPD oder Socket testen
5. **Hinzufügen**

**Für iPad nutzbar machen:**

- Brother auswählen → **„Für andere Mac- und iOS-Geräte freigeben“** aktivieren
- iPad im gleichen WLAN: Beim Drucken den **Mac** als Drucker wählen → Auftrag geht über den Mac an den Brother

**Vorteil:** Funktioniert stabil, keine zusätzliche App.

---

### 2. Etikett herunterladen + Brother iPrint & Label (App)

1. In K2: **„Etikett teilen“** oder **„Etikett herunterladen“**
2. PNG auf dem iPad speichern
3. In der **Brother iPrint & Label** App (App Store) öffnen
4. Dort drucken – per Bluetooth oder WLAN direkt zum Brother

**Vorteil:** Umgeht den Browser-Druck komplett. Kein AirPrint nötig.

---

### 3. handyPrint oder Printopia (Mac-Software)

Mac-Apps, die **AirPrint auf beliebigen Druckern** aktivieren. Brother an den Mac anschließen → App aktivieren → iPad sieht einen virtuellen AirPrint-Drucker.

- **handyPrint** (ca. 5 $) – 14 Tage Testversion
- **Printopia** (ca. 20 $) – 7 Tage Testversion

**Nachteil:** Kostenpflichtig, Mac muss eingeschaltet sein.

---

## Brother-Modelle mit AirPrint (bei Neukauf)

| Modell | AirPrint |
|--------|----------|
| **QL-820NWBc** | Ja (laut Hersteller) |
| **QL-810Wc** | Ja (laut Hersteller) |
| **QL-820MWBc** | Nein |

QL-820**N**WBc (mit N) hat AirPrint, QL-820**M**WBc (mit M) nicht.

---

## One-Click-Druck (ohne Druckdialog)

Wenn der **K2 Print-Server** läuft:

1. **Print-Server starten** (im Cursor- oder Mac-Terminal):
   ```bash
   npm run print-server
   ```
2. **In K2:** Einstellungen → Drucker → **Print-Server URL** eintragen (z.B. `http://localhost:3847` oder `http://MAC-IP:3847` für iPad)
3. **Etikett-Modal:** Button **„⚡ One-Click drucken“** – Etikett geht direkt an den Brother, kein Druckdialog.

**Voraussetzung:** Brother im WLAN erreichbar (IP in Drucker-Einstellungen), Mac und Gerät im gleichen Netz.

**Wichtig – Drucker im mobilen LAN:** Wenn der Brother am mobilen Router/Hotspot (192.168.1.x) hängt, der Mac aber im anderen Haus-WLAN (z.B. 192.168.0.x) ist, erreicht der Mac den Drucker nicht. One-Click funktioniert nur, wenn der Mac im **gleichen** Netz wie der Brother ist (z.B. Mac per WLAN mit dem mobilen Hotspot verbinden).

**iPad/iPhone:** K2 und Print-Server müssen beide per HTTP erreichbar sein (z.B. K2 unter `http://MAC-IP:5175`, Print-Server unter `http://MAC-IP:3847`). Bei K2 von Vercel (HTTPS) blockiert der Browser den Zugriff auf den lokalen Print-Server.

---

## Etikett-Druck in K2: Ablauf (klassisch)

1. **Vorschau:** K2 zeigt das Etikett
2. **„Jetzt drucken“** tippen
3. **„Automatisches Drucken erlauben“** – einmal bestätigen (Pop-up)
4. **Druckdialog:** Brother (oder Mac als Drucker) wählen, **Papier: 29×90,3 mm**
5. **100 % Skalierung**

---

## Format passt nicht?

- **Papier wählen:** Im Druckdialog unbedingt „29 × 90 mm“ oder „Etikett“ / „Label“ wählen (nicht A4).
- **Skalierung 100 %:** „An Seite anpassen“ oder „Fit to page“ deaktivieren, Skalierung auf 100 %.
- **iPad/iPhone:** Falls der Browser das Format ignoriert: „Etikett teilen“ → PNG speichern → in **Brother iPrint & Label** öffnen und drucken.

---

## Kurz-Übersicht

| Gerät | Lösung |
|--------|--------|
| **Mac** | Brother per IP hinzufügen (Systemeinstellungen → Drucker & Scanner) |
| **iPad/iPhone** | 1) Druck über Mac („Für iOS freigeben“) – zuverlässig<br>2) Etikett herunterladen → Brother iPrint & Label App |
