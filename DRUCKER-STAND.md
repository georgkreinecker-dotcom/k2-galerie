# Drucker – aktueller Stand (umgesetzt)

Damit du nicht raten musst: Hier steht, was **bereits implementiert** ist.

---

## Umgesetzt

- **K2 Galerie:** **Brother QL** = Etikett (IP, Format, IPP `ipp/print`, One-Click über Print-Server). **Epson TM-m30II** = **Kasse** (eigene IP + IPP-Referenz im Admin-Abschnitt „Kassendrucker“; Bon im Shop per System-Druckdialog → Epson). Code: `src/utils/printerSettingsStorage.ts`.
- **Etikettenformat** (mm, z. B. Brother 29×60) wird **pro Mandant** gespeichert (K2, ök2, Demo) unter Einstellungen → Drucker.
- **Drucker-IP, Drucker-Typ und IPP-Pfad (Etikett)** pro Mandant: IPP nur für **One-Click** – Brother `ipp/print`. Epson IPP für K2-Kasse siehe `docs/DRUCKER-EPSON-TM-M30II-K2.md`.
- Beim **Drucken** wird immer der **aktuell aktive Mandant** verwendet (welche Galerie/App du gerade nutzt).
- **Vorschau** im Etikett-Modal zeigt das gespeicherte Format des aktiven Mandanten.
- **QR-Code auf dem Etikett** verwendet eine **feste Basis-URL** (gespeicherte Mobile-URL oder Vercel) – **unabhängig vom WLAN/Router**, damit Anzeige und Scan überall gleich funktionieren.
- **Kassabeleg (K2):** Hinweise im Bon-HTML auf **Epson TM** (Mac); ök2/Demo-Bon weiter mit Brother-Rollen-Hinweis wo sinnvoll.

- **Etikett-Druck (Standalone):** QR wird **lokal** erzeugt (Library `qrcode`) – **kein Internet/WLAN nötig**. Funktioniert in jedem Netz und ohne Verbindung. Druckfenster: Buttons „Drucken“ und „Fenster schließen“; Skalierung im Druckdialog nicht nötig. **Nicht** „Seite neu laden“ – „Fenster schließen“ nutzen.

---

## Wo einsehen

- **Einstellungen im Admin:** Einstellungen → Tab „Drucker“ → „Einstellungen für“ (K2 / ök2 / Demo). **K2:** zwei Blöcke – Etikett Brother, Kasse Epson.
- **Dieser Stand:** `DRUCKER-STAND.md` (diese Datei) – bei Unsicherheit „Wurde das schon gemacht?“ hier nachsehen.
- **AirPrint aktiv:** Drucker im Druckdialog wählen. Details → `DRUCKER-AIRPRINT.md`.

*Zuletzt aktualisiert: April 2026*
