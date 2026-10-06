# Dialog-Stand

**Was wir JETZT tun:** Link/PDF-Standard fertig – lokal arbeiten, öffentlich versenden.

**Einordnung:** Druck/PDF speichern = same-origin OK; Link kopieren / PDF-Versand-Text = immer `getShareableAppUrl` (Vercel). Kein WhatsApp-Sonderbutton in Gesprächsmappe/Zettel. Boot: kein Auto-Reload in WhatsApp/In-App.

**Nächster Schritt:** Georg testet Gesprächsmappe am Handy: Link kopieren → in WhatsApp einfügen – Mappe lesbar, kein Hängen bei „Laden …“.

**Ausgangspunkt Yoga** bleibt: [docs/K2-YOGA-AUSGANGSPUNKT.md](K2-YOGA-AUSGANGSPUNKT.md)

**Was zuletzt gemacht:**
- `getShareableAppUrl` / `buildShareTextWithPublicLink` – ein Standard für Galerie, Yoga, mök2, Zettel, Pilot, PDF-Versand.
- **Gesprächsmappe:** nur **Link kopieren** + **Als PDF** (kein WhatsApp-Button).
- **ZettelAktionsLeiste:** nur **Link kopieren** (öffentlich) + **Als PDF** (dieses Gerät).
- **Boot:** In-App (WhatsApp etc.) kein Auto-Reload; Fetch-Fehler kein Reload; Loading-Text nur „Laden …“.
- Tests: `publicShare`, `yogaGespraechsmappe`, `staticPagePdfExport` grün; `qs:local` / Build grün.
- Feature-Commit: **30c5a944** ✅ (Code: Zettel, Gesprächsmappe, publicShare, Boot)
- Abschluss: **ba0356d5** – Doku/Briefing; QS: publicShare + yogaGespraechsmappe + staticPagePdfExport grün, build:vercel grün
