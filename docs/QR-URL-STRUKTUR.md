# QR-Codes & URLs – Struktur und Regeln (Check damit nichts schiefgeht)

**Stand:** 16.03.26  
**Zweck:** Zwei klare Fälle für alle QR/URL-Stellen; keine localhost in gedruckten/ geteilten Werbemitteln. Ergänzt LINKS-QR-CODES-UEBERSICHT.md und .cursor/rules/stand-qr-niemals-zurueck.mdc.

---

## 1. Zwei Fälle – nie verwechseln

| Fall | Wofür | URL / Logik | Wo |
|------|--------|-------------|-----|
| **A) QR zum Scannen (Handy soll aktuelle Version laden)** | Galerie, Mission Control, Mobile Connect, Werbeunterlagen (live auf APf) | **Basis-URL = Produktion** (BASE_APP_URL + Route). **Immer** `buildQrUrlWithBust(url, useQrVersionTimestamp())` – Server-Stand + Cache-Bust. Nie nur `urlWithBuildVersion` (lokal). | GaleriePage, PlatformStartPage, MobileConnectPage, WerbeunterlagenPage, ProspektGalerieeroeffnungPage, PraesentationsmappePage, Vk2GaleriePage, ZettelPilotPage, ZettelMartinaMunaPage, PilotStartPage, GalerieVorschauPage (Etikett-Basis), MarketingOek2Page |
| **B) QR/Link in gedrucktem oder geteiltem Werbemittel** | Plakat, Flyer, Newsletter, Presse-PDF, Event-Plakat, „Mehr erfahren“-Link | **Immer Produktions-URL.** Wenn Stammdaten.website leer: **Fallback = BASE_APP_URL + PROJECT_ROUTES['k2-galerie'].galerie** (bzw. FALLBACK_GALERIE_URL_WERBEMITTEL in ScreenshotExportAdmin). **Niemals** `window.location.origin` als Fallback – sonst landet gedruckter QR auf localhost. | ScreenshotExportAdmin: printQRCodePlakat, Flyer/Plakat/Newsletter-Inhalte (getFlyerContent, getPlakatContent, Newsletter-HTML), Presse „Mehr erfahren“-Link |

---

## 2. Konstanten und eine Quelle

| Konstante / Quelle | Wo definiert | Verwendung |
|-------------------|--------------|------------|
| **APP_BASE_URL** | `src/config/externalUrls.ts` | Produktions-URL (Env: `VITE_APP_BASE_URL` oder Fallback `https://k2-galerie.vercel.app`) – für Werbemittel-QR/Links. |
| **BASE_APP_URL** | `src/config/navigation.ts` | Immer `https://k2-galerie.vercel.app` – weiterhin für andere produktive Links. |
| **PROJECT_ROUTES['k2-galerie'].galerie** | `src/config/navigation.ts` | Pfad Galerie K2. |
| **PROJECT_ROUTES['k2-galerie'].virtuellerRundgang** | ebd. | Pfad Virtueller Rundgang. |
| **GALERIE_QR_BASE** | ScreenshotExportAdmin.tsx | `APP_BASE_URL + PROJECT_ROUTES['k2-galerie'].galerie` – Etiketten-QR. |
| **FALLBACK_GALERIE_URL_WERBEMITTEL** | ScreenshotExportAdmin.tsx | `APP_BASE_URL + PROJECT_ROUTES['k2-galerie'].galerie` – Fallback für Flyer, Plakat, Newsletter, Presse. |
| **isProductionLikeUrl(url)** | ScreenshotExportAdmin.tsx | Nur wenn `url` mit `https://` beginnt und kein `localhost` enthält, wird Stammdaten.website für QR/Link genutzt; sonst Fallback. Verhindert „Server nicht gefunden“ bei gedrucktem Plakat. |

---

## 3. Checkliste vor Änderungen an QR/URL

- [ ] **Neuer QR auf Galerie/Willkommen/Vercel (Fall A):** Basis-URL aus navigation.ts; QR mit `buildQrUrlWithBust(url, useQrVersionTimestamp())`.
- [ ] **Neuer QR/Link in Druck/PDF/Newsletter (Fall B):** Kein `window.location.origin` – immer BASE_APP_URL + Route oder Stammdaten.website; Fallback = FALLBACK_GALERIE_URL_WERBEMITTEL (bzw. gleiche Logik).
- [ ] **Etiketten-QR (Werk-Nummer):** Basis = GALERIE_QR_BASE (bereits Produktion); urlWithBuildVersion für Version – OK, Basis stimmt.

---

## 4. ScreenshotExportAdmin – alle Werbemittel-URL-Stellen

| Stelle | Inhalt | Regel (umgesetzt) |
|--------|--------|-------------------|
| **printQRCodePlakat** | Homepage-, Virtueller-Rundgang-QR | BASE_APP_URL + PROJECT_ROUTES (galerie, virtuellerRundgang). |
| **getFlyerContent** (Varianten) | qrCode | galleryData.website \|\| FALLBACK_GALERIE_URL_WERBEMITTEL. |
| **getPlakatContent** (Flyer/Plakat) | qrCode | g.website \|\| FALLBACK_GALERIE_URL_WERBEMITTEL. |
| **Plakat (Event) websiteUrl** | plakatContent.qrCode | freshGalleryData.website \|\| FALLBACK_GALERIE_URL_WERBEMITTEL. |
| **Newsletter HTML** | „Mehr erfahren“-Link | galleryData.website \|\| FALLBACK_GALERIE_URL_WERBEMITTEL. |
| **getArtworkUrlForQR** (Etikett) | URL für Werk-QR | GALERIE_QR_BASE (Produktion) + ?werk=…; urlWithBuildVersion. |

---

## 5. Verweise

- **stand-qr-niemals-zurueck.mdc** – Server-Stand + buildQrUrlWithBust für Fall A; Inject-Script; no-cache.
- **LINKS-QR-CODES-UEBERSICHT.md** – Einbauorte, Register aller QR/Links.
- **KRITISCHE-ABLAEUFE.md** – Etikett-Druck, Veröffentlichen, Stand.

**Kurz:** Fall A = Scan soll aktuelle Version → Server-Timestamp + Bust. Fall B = Druck/PDF/Newsletter → immer Produktions-URL, Fallback FALLBACK_GALERIE_URL_WERBEMITTEL, nie localhost.

---

## 6. Plakat QR „Server nicht gefunden“ (Safari)

**Ursache:** Im QR steckte eine ungültige URL (z. B. Stammdaten.website = localhost oder http). Beim Scannen: „Safari kann die Seite nicht finden, da der Server nicht gefunden wird.“

**Absicherung (16.03.26):** Für alle Werbemittel-QR und -Links (Plakat, Flyer, Event-Plakat, Presse „Mehr erfahren“) gilt: Es wird nur dann `Stammdaten.website` verwendet, wenn `isProductionLikeUrl(website)` (https, kein localhost). Sonst immer **FALLBACK_GALERIE_URL_WERBEMITTEL** (APP_BASE_URL + Galerie-Route). Zusätzlich nutzen QR-Code-Plakat und Fallback **APP_BASE_URL** aus `externalUrls.ts` – bei Custom Domain in Vercel kann `VITE_APP_BASE_URL` gesetzt werden, dann zeigen alle gedruckten QR dorthin.

**Nach einer URL-Fix:** Plakat/Flyer neu erzeugen und drucken – der bereits gedruckte QR enthält sonst weiterhin die alte URL.
