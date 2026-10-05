# Dialog-Stand

**Was wir JETZT tun:** Boot-Fix für WhatsApp/In-App – öffentlicher Yoga-Gesprächsmappe-Link muss beim Empfänger laden (nicht „Laden… Nach QR-Scan“).

**Einordnung:** Adresse war schon richtig (Vercel). Production hatte noch altes `boot-build-info.js` (Reload bei Fetch-Fehler → Hänger). Lokal Fix vorhanden, muss live.

**Nächster Schritt:** Nach Vercel Ready: Boot-Datei prüfen (WhatsApp-Guard), Link in normalem Browser + ggf. WA testen; PDF als Fallback.

**Ausgangspunkt Yoga** bleibt: [docs/K2-YOGA-AUSGANGSPUNKT.md](K2-YOGA-AUSGANGSPUNKT.md)

**Was zuletzt gemacht:**
- UX: nur Link kopieren + Als PDF (kein WhatsApp-Button-Chaos).
- Boot: WhatsApp kein Auto-Reload; Fetch-Fehler kein Reload; root-interaction In-App ohne Reload-Loop; Lade-Text entschärft; `/boot/` no-cache.
