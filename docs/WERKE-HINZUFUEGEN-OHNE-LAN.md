# Werke hinzufügen – auch ohne LAN möglich

**Stand:** 16.02.26

## Kurzantwort

**Ja – das Hinzufügen von Werken ist ohne LAN möglich.** Die App ist so gebaut, dass du Werke überall hinzufügen kannst: per Vercel (k2-galerie.vercel.app), im Mobilfunk, in anderem WLAN. Es wird nur **localStorage** im Browser genutzt; kein Server im eigenen Netz nötig.

## So funktioniert es (ohne LAN)

1. **App öffnen** – z. B. im Browser: `https://k2-galerie.vercel.app` (oder QR-Code scannen).
2. **Zur Galerie** – Du siehst die Galerie-Startseite (Eingang mit „Galerie betreten“, „Virtueller Rundgang“).
3. **Admin öffnen** – Oben rechts auf **„Admin“** (oder „⚙️ Admin“) tippen.
4. **Passwort** – Wenn nötig: Passwort eingeben (in der Testphase optional leer lassen). Dann **„Admin-Zugang“** bestätigen.
5. **Neues Werk** – Im Admin auf **„+ Neues Werk hinzufügen“** klicken, Formular ausfüllen, speichern.

Das Werk wird sofort in deinem Gerät gespeichert (localStorage). **Kein LAN, kein lokaler Server nötig.**

## Wann „funktioniert es nicht“?

- **Du bist nicht im Admin** – „Produkt/Werk hinzufügen“ gibt es nur **im Admin**, nicht auf der normalen Galerie-Ansicht. Immer zuerst Admin-Button → Passwort → dann „+ Neues Werk hinzufügen“.
- **Du bist auf der Demo (ök2)** – Wenn du die **öffentliche Demo** (galerie-oeffentlich) nutzt, landen neue Werke in der Demo-Galerie (ök2), nicht in deiner echten K2-Galerie. Für echte Werke: normale K2-Galerie-URL nutzen (z. B. k2-galerie.vercel.app → Galerie → Admin).
- **Fehlermeldung beim Speichern** – Sehr selten: z. B. wenn der Speicher voll ist (sehr viele/große Bilder). Dann Hinweis der App beachten (einige Werke löschen oder Bilder verkleinern).

## LAN vs. ohne LAN

| Situation | Werke hinzufügen? | Hinweis |
|-----------|-------------------|--------|
| **Vercel (Internet)** | ✅ Ja | Admin → Neues Werk → speichert in diesem Gerät. |
| **Mac im LAN (npm run dev)** | ✅ Ja | Wie oben; zusätzlich können andere Geräte im gleichen WLAN die gleiche App nutzen. |
| **iPad/Handy (Vercel oder anderes WLAN)** | ✅ Ja | Gleich: Admin öffnen, Neues Werk, speichern. |
| **Offline (kein Internet)** | ✅ Ja* | Speichern geht (localStorage). Sync mit anderen Geräten oder „Veröffentlichen“ braucht später Internet. |

## Technisch (für Entwickler)

- Neues Werk wird in **ScreenshotExportAdmin** unter „+ Neues Werk hinzufügen“ in **localStorage** (`k2-artworks` bzw. ök2: `k2-oeffentlich-artworks`) geschrieben.
- Kein `fetch`/API-Pflicht beim Speichern; optional Supabase-Sync, aber kein Block bei Netzwerkfehler.
- GalerieVorschauPage: Bei fehlgeschlagenem Server-Laden (z. B. Offline/anderes Netz) erscheint der Hinweis „Werke hinzufügen geht trotzdem: Admin → Neues Werk“.
