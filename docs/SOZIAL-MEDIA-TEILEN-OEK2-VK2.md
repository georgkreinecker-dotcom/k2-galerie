# Social-Media-/Teilen-Vorbereitung ök2 & VK2

**Stand:** März 2026

## Was wir schon haben

### 1. „Galerie teilen“-Button (K2 & VK2)
- **Wo:** GaleriePage – fixer Button „📤 Galerie teilen“ (oben rechts auf der Galerie).
- **Technik:** Ruft die **Web Share API** (`navigator.share`) auf mit Titel (Galeriename), Text und aktueller URL.
- **Verhalten:** Das **Betriebssystem** öffnet sein **natürliches Teilen-Menü** (Share Sheet). Welche Apps dort erscheinen, legt **nicht** die App fest, sondern der Mac/das Handy (installierte Apps, Erweiterungen).
- **ök2:** Der gleiche Button erscheint im Willkommens-Bereich/Banner („Galerie teilen“), gleiche Logik.

### 2. SEO – Titel & Beschreibung
- **Quelle:** `src/config/seoPageMeta.ts`
- **Inhalt:** Pro Route (galerie, galerie-oeffentlich, VK2, Shop, Vita, …) eigener **Seitentitel** und **Meta-Description**.
- **Nutzen:** Suchmaschinen und Dienste, die die Seite auslesen, sehen einen passenden Titel (z. B. „K2 Galerie Kunst&Keramik“, „Demo-Galerie – kgm solution“).
- **Einschränkung:** Es werden **keine Open-Graph-Tags** (og:image, og:title, og:description) gesetzt. Vorschau-Bilder beim Teilen in Social Media/Messenger hängen davon ab, ob die Plattform die Seite selbst lädt – und unter **localhost** geht das nicht.

### 3. Empfehlungstool (mök2 / Einstellungen)
- **„WhatsApp teilen“:** Eigenen Button, der einen vorbereiteten Link mit Empfehler-ID z. B. für WhatsApp öffnet (wa.me oder ähnlich).
- **Nutzer:** Lizenznehmer:innen teilen ihren Empfehlungs-Link – nicht die Galerie-URL.

### 4. Marketing / Werbeunterlagen (mök2, VK2)
- **Social-Media-Dokumente:** z. B. „Social Media – Vernissage“, „Social Media – Gemeinschaftsausstellung“ (HTML/Text zum Kopieren für Instagram, Facebook, WhatsApp).
- **Social-Masken:** Werbeunterlagen mit Formaten für Instagram, Facebook, LinkedIn.
- **Zweck:** Inhalte **erstellen**, nicht der „Galerie teilen“-Button in der App.

### 5. VK2 – WhatsApp-Gruppe
- Stammdaten: optional **WhatsApp-Gruppen-Link**. Wenn gesetzt, wird auf der VK2-Galerie ein Button „💬 WhatsApp-Gruppe“ angezeigt.

---

## Warum siehst du nur Mail, Nachrichten, AirDrop, Notizen?

- **„Galerie teilen“** nutzt **nur** `navigator.share()`. Es gibt **keine** eigenen Buttons für WhatsApp, Facebook, Instagram in der Galerie.
- Das **Share Sheet** kommt vom **Betriebssystem** (macOS / iOS / Android). Dort erscheinen nur Dienste, die als **Teilen-Erweiterung** installiert sind (z. B. Mail, Nachrichten, AirDrop, Notizen, Erinnerungen). **WhatsApp** oder **Facebook** erscheinen auf dem Mac oft nur, wenn die jeweilige Desktop-App installiert ist und sich als Teilen-Ziel anbietet („Erweiterungen bearbeiten …“).
- **Localhost:** Wenn du unter `localhost` testest, steht im Share-Menü „localhost“ – viele Dienste können damit keine Vorschau (Bild/Titel) laden. Unter der **echten URL** (z. B. k2-galerie.vercel.app) können Social/Messenger die Seite aufrufen und ggf. eine Vorschau anzeigen, sobald wir **Open Graph** ergänzen.

---

## Umgesetzt: Einfach teilen (K2, VK2, ök2)

**Stand März 2026:** Nutzer:innen können überall einfach teilen:

| Ort | Was |
|-----|-----|
| **GaleriePage (K2, VK2, ök2)** | Fixer Button „📤 Galerie teilen“ (oben rechts). Klick → **Popover** mit: 💬 WhatsApp teilen, 🔗 Link kopieren, 📤 System teilen (Mail, AirDrop, …). |
| **ök2-Banner** | „📤 Galerie teilen“ öffnet dasselbe Popover. |
| **Admin → Veröffentlichen** | „Link zu deiner Galerie“: Buttons **💬 WhatsApp**, **🔗 Kopieren**, **📤 System teilen**. |
| **GalerieVorschauPage (Werk-Lightbox)** | Beim einzelnen Werk: **💬 WhatsApp**, **🔗 Link kopieren**, **📤 System teilen**. |

WhatsApp öffnet `wa.me/?text=…` mit Galeriename + URL (bzw. Werk-Titel + URL). Link kopieren schreibt die URL in die Zwischenablage. System teilen = Web Share API (OS-Menü).

---

## Noch offen (optional)

| Thema | Status | Anmerkung |
|-------|--------|-----------|
| **Open Graph (og:image, og:title, og:description)** | ❌ Nicht umgesetzt | Würde beim Teilen der Galerie-URL eine schöne Vorschau (Bild, Titel, Text) in WhatsApp/Social ermöglichen. Nur unter **echter Domain** (Vercel) wirksam, nicht localhost. |
