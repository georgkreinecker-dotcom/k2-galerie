# Brother-Drucker: AirPrint & Druck vom iPad/Handy

## QL-820**N**WBc (wie auf der Verpackung) = **AirPrint**

**Brother QL-820NWBc** – „Works with Apple AirPrint“, „Made for iPhone | iPad | iPod“. Das ist die einfache Lösung für Mobile.

**Vom iPad/Handy drucken:**

**A) Zuverlässig (Größe passt garantiert):** In K2 **„Etikett speichern“** tippen → Datei in Fotos/Dateien öffnen → **Teilen** → **Brother iPrint & Label** → dort drucken. Kein Mac nötig.

**B) Direkt über Safari:** „Jetzt drucken“ → Brother wählen → Papier 29×90,3 mm, 100 %. Safari ignoriert oft unsere Größenangaben (Skalierungsproblem), dann A nutzen.

---

## Nur bei Modell QL-820**M**WBc (mit M): kein AirPrint

Falls du das **ältere Modell mit M** (QL-820**M**WBc) hast: das hat kein AirPrint. Dann: „Etikett teilen“ → Brother iPrint & Label App → drucken.

---

## AirPrint aktiviert (QL-820NWBc)

AirPrint ist eingerichtet (z. B. über handyPrint, Printopia oder Mac-Freigabe). Beim Etikett-Druck:

1. **„Jetzt drucken“** tippen
2. **Drucker wählen** (Brother oder AirPrint-Drucker)
3. **Papier:** 29×90,3 mm (Brother-Etikett)
4. **Skalierung:** 100 %

---

## Brother QL-820**M**WBc (älteres Modell) – kein AirPrint

Nur das **ältere** Modell QL-820**M**WBc (mit M) hat kein AirPrint. Mit handyPrint, Printopia oder Mac-Freigabe kann man es nachrüsten (Mac muss laufen).

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
2. PNG auf dem Gerät speichern
3. In der **Brother iPrint & Label** App öffnen (App Store / Play Store)
4. Dort drucken – per Bluetooth oder WLAN direkt zum Brother

**Vorteil:** Umgeht den Browser-Druck komplett. Kein AirPrint nötig. Funktioniert auf iPad, iPhone und Android.

---

### 3. handyPrint oder Printopia (Mac-Software)

Mac-Apps, die **AirPrint auf beliebigen Druckern** aktivieren. Brother an den Mac anschließen → App aktivieren → iPad sieht einen virtuellen AirPrint-Drucker.

- **handyPrint** (ca. 5 $) – 14 Tage Testversion
- **Printopia** (ca. 20 $) – 7 Tage Testversion

**Nachteil:** Kostenpflichtig, Mac muss eingeschaltet sein.

---

## Wenn Brother + Safari trotzdem nicht – das kommt vor

Stimmt: **Nicht nur du** – **Safari**, **System-Druckdialog**, **WLAN**, **Treiber** und **Gerät** hängen zusammen. Wenn der **Brother defekt** oder **nur halb erreichbar** ist, scheitern **auch** Dinge wie **One-Click** (der braucht denselben Drucker im Netz mit **IPP**).

**Reihenfolge, die in der Praxis am häufigsten hilft:**

| Priorität | Etikett (29×90) | Kassenbon (Rolle) |
|-----------|-----------------|---------------------|
| **1** | **Nicht** auf „nur Safari drucken“ verlassen. **Etikett speichern / teilen** → **Brother iPrint & Label** öffnen → dort drucken (Bluetooth oder WLAN zum QL). Das umgeht Safari. | **Chrome** statt Safari probieren – oder Drucker am **Mac** einrichten, Bon aus dem **Systemdialog** auf diesen Drucker. **K2 braucht dafür keinen Brother** – nur einen Drucker, den macOS/iOS als Rolle kennt. |
| **2** | Brother per **IP am Mac** (Drucker & Scanner), ggf. **„für iPhone/iPad freigeben“** – dann vom iPad den **Mac** als Drucker wählen. | Gleicher Weg: Auftrag über den **Mac** zum Drucker, wenn direkt verbinden hakt. |
| **3** | **One-Click** (`npm run print-server`) nur, wenn der Brother unter seiner **IP** erreichbar ist **und** Etikett per Netz sonst klappt – sonst zuerst 1. | One-Click betrifft **Etikett**, nicht den Bon-Dialog in der Kasse. |

**Kurz:** Wenn der **Brother wirklich nicht** – zuerst **App-Weg** fürs Etikett; **Bon** über **anderen Drucker** oder **Chrome**; **Hardware** reparieren oder ersetzen, wenn nichts Vernünftiges mehr aus dem Gerät kommt.

---

## Brother-Modelle

| Modell | AirPrint | Verpackung |
|--------|----------|------------|
| **QL-820NWBc** | **Ja** – „Works with Apple AirPrint“, Made for iPhone/iPad/iPod |
| **QL-820MWBc** | Nein (älteres Modell mit M) |
| **QL-810Wc** | Ja (laut Hersteller) |

Dein Drucker (QL-820**N**WBc) = AirPrint, einfach „Jetzt drucken“ → Brother wählen.

---

## Alternative zu Brother – wenn Safari zuverlässig drucken soll

**Ehrlich:** **Niemand** (auch nicht Apple) garantiert **100 %** für **jeden** Bon aus **Safari** auf **schmalem Papier** – der Systemdialog und die Seitengröße sind die häufigsten Stolpersteine. Am **nächsten** an „ohne Treiber-Frickelei“ kommt nur, was **wirklich** **Apple AirPrint** auf dem **Datenblatt** hat – nicht nur „für iPad geeignet“ oder „WLAN“.

| Richtung | Was wählen |
|----------|------------|
| **Kassenbon / schmale Rolle (58 oder 80 mm)** | **Star Micronics TSP650II**-Serie, **Variante explizit mit AirPrint** (z. B. Modellbezeichnung **TSP654II AirPrint** / WLAN+AirPrint). Im **Handel nur kaufen**, wenn auf der **Produktseite** oder der **Verpackung** **„Apple AirPrint“** steht – es gibt viele TSP650II-**ohne** AirPrint. |
| **Epson TM-m30 / ähnlich** | Vorsicht: Händler sprechen oft von „iOS“ – **das ist nicht dasselbe wie AirPrint**. Wenn **AirPrint** nicht im offiziellen Epson-Datenblatt steht, **Safari-Druck** oft genauso zäh wie beim Brother. **K2 Kasse (TM-m30II):** Schritt-für-Schritt bei leerer iOS-Druckerliste → `docs/DRUCKER-EPSON-TM-M30II-K2.md` **Abschnitt 7**. |
| **Etiketten (wie Brother QL 29×90)** | AirPrint-Etikettendrucker sind **selten**. Star nennt u. a. **TSP800II**-Linie mit AirPrint für **Ticket/Label** – **Medienformat** vor Kauf prüfen (nicht 1:1 QL-Ersatz ohne Abgleich). |

**Praxis:** Neues Gerät im Laden oder beim Händler: **Testseite** aus Safari (oder K2-Bon) auf **Rolle** drucken – erst dann kaufen, wenn **Papierformat** im Dialog stimmt.

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

## 300 DPI im Etikett-PNG (technisch)

K2 schreibt beim Export des Etiketts **300 DPI (pHYs)** ins PNG. Damit erkennen AirPrint und Drucker die richtige physische Größe (29×90,3 mm bei 100 % Skalierung). Wenn trotzdem die Größe nicht stimmt: **„Als Datei speichern“** → in **Brother iPrint & Label** öffnen → dort drucken (App setzt Etikettengröße zuverlässig).

---

## Kurz-Übersicht

| Gerät | Lösung |
|--------|--------|
| **Mac** | Brother per IP hinzufügen (Systemeinstellungen → Drucker & Scanner) |
| **iPad/iPhone** | 1) Druck über Mac („Für iOS freigeben“) – zuverlässig<br>2) Etikett herunterladen → Brother iPrint & Label App |
| **Android** | Etikett teilen/herunterladen → Brother iPrint & Label App (Play Store) – Größe passt dort |