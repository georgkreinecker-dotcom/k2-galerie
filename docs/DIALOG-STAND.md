# Dialog-Stand

**Was wir JETZT tun:** Lokal arbeiten / öffentlich versenden – ein Standard auch für PDF-Versand (`getShareableAppUrl`).

**Einordnung:** Druck/PDF speichern = same-origin OK; Link und PDF versenden = immer öffentlich (Vercel). Boot: kein Auto-Reload in WhatsApp.

**Nächster Schritt:** Nach Deploy Gesprächsmappe in WhatsApp öffnen – Link + Mappe lesbar.

**Ausgangspunkt Yoga** bleibt: [docs/K2-YOGA-AUSGANGSPUNKT.md](K2-YOGA-AUSGANGSPUNKT.md)

**Was zuletzt gemacht:**
- `getShareableAppUrl` / `buildShareTextWithPublicLink` für Galerie, Yoga, mök2, Zettel, Pilot, PDF-Versand.
- PDF: Speichern/Druck lokal; Versand inkl. öffentlichem Link-Text.
- Yoga-Gesprächsmappe: WhatsApp-Button + Link kopieren.
- Boot: kein Auto-Reload in WhatsApp; kein Reload bei Fetch-Fehler.
- Commit: **30c5a944** ✅ auf GitHub
