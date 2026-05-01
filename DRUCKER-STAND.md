# Drucker – aktueller Stand (umgesetzt)

Damit du nicht raten musst: Hier steht, was **bereits implementiert** ist.

---

## Umgesetzt

- **Etikettenformat** (mm, z. B. Brother 29×60 oder Epson 80×…) wird **pro Mandant** gespeichert (K2, ök2, Demo) unter Einstellungen → Drucker → „Etikettenformat (mm)“.
- **Drucker-IP, Drucker-Typ und IPP-Pfad** pro Mandant (K2 / ök2 / Demo): IPP-Pfad nur für **One-Click** über den Print-Server – z. B. Brother `ipp/print`, Epson TM-m30II oft `EPSON_IPP_Printer` (exakt aus Drucker-Web-Config). Siehe `docs/DRUCKER-EPSON-TM-M30II-K2.md`.
- Beim **Drucken** wird immer der **aktuell aktive Mandant** verwendet (welche Galerie/App du gerade nutzt).
- **Vorschau** im Etikett-Modal zeigt das gespeicherte Format des aktiven Mandanten.
- **QR-Code auf dem Etikett** verwendet eine **feste Basis-URL** (gespeicherte Mobile-URL oder Vercel) – **unabhängig vom WLAN/Router**, damit Anzeige und Scan überall gleich funktionieren.
- **Kassabeleg** nutzt weiterhin eigene Logik (anderer Drucker/Format); Hinweis dazu steht in den Drucker-Einstellungen.

- **Etikett-Druck (Standalone):** QR wird **lokal** erzeugt (Library `qrcode`) – **kein Internet/WLAN nötig**. Funktioniert in jedem Netz und ohne Verbindung. Druckfenster: Buttons „Drucken“ und „Fenster schließen“; Skalierung im Druckdialog nicht nötig. **Nicht** „Seite neu laden“ – „Fenster schließen“ nutzen.

---

## Wo einsehen

- **Einstellungen im Admin:** Einstellungen → Tab „Drucker“ → dort „Einstellungen für“ (K2 / ök2 / Demo), IP, Typ, Etikettenformat, IPP-Pfad, Print-Server-URL.
- **Dieser Stand:** `DRUCKER-STAND.md` (diese Datei) – bei Unsicherheit „Wurde das schon gemacht?“ hier nachsehen.
- **AirPrint aktiv:** Drucker im Druckdialog wählen. Details → `DRUCKER-AIRPRINT.md`.

*Zuletzt aktualisiert: April 2026*
