# Drucker – aktueller Stand (umgesetzt)

Damit du nicht raten musst: Hier steht, was **bereits implementiert** ist.

---

## Umgesetzt

- **Etikettenformat** (z. B. 29×90,3 mm) wird **pro Mandant** gespeichert (K2, ök2, Demo) unter Einstellungen → Drucker → „Etikettenformat (Brother)“.
- **Drucker-IP und Drucker-Typ** ebenfalls pro Mandant (jeweils eigene Werte für K2 / ök2 / Demo).
- Beim **Drucken** wird immer der **aktuell aktive Mandant** verwendet (welche Galerie/App du gerade nutzt).
- **Vorschau** im Etikett-Modal zeigt das gespeicherte Format des aktiven Mandanten.
- **QR-Code auf dem Etikett** verwendet eine **feste Basis-URL** (gespeicherte Mobile-URL oder Vercel) – **unabhängig vom WLAN/Router**, damit Anzeige und Scan überall gleich funktionieren.
- **Kassabeleg** nutzt weiterhin eigene Logik (anderer Drucker/Format); Hinweis dazu steht in den Drucker-Einstellungen.

- **Etikett-Druck (Standalone):** QR wird **lokal** erzeugt (Library `qrcode`) – **kein Internet/WLAN nötig**. Funktioniert in jedem Netz und ohne Verbindung. Druckfenster: Buttons „Drucken“ und „Fenster schließen“; Skalierung im Druckdialog nicht nötig. **Nicht** „Seite neu laden“ – „Fenster schließen“ nutzen.

---

## Wo einsehen

- **Einstellungen im Admin:** Einstellungen → Tab „Drucker“ → dort „Einstellungen für“ (K2 / ök2 / Demo), IP, Typ, Etikettenformat.
- **Dieser Stand:** `DRUCKER-STAND.md` (diese Datei) – bei Unsicherheit „Wurde das schon gemacht?“ hier nachsehen.
- **„AirPrint nicht gefunden“ obwohl Brother im Netz?** → `DRUCKER-AIRPRINT.md` (Drucker per IP in Systemeinstellungen hinzufügen).

*Zuletzt aktualisiert: Februar 2026*
