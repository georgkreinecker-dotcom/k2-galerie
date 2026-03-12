# Links & QR-Codes – Übersicht und Einbauorte

**Stand:** 12.03.26  
**Zweck:** Eine Quelle für alle App-URLs; QR-Codes für Vercel immer mit Server-Stand + Cache-Bust. Regel: .cursor/rules/stand-qr-niemals-zurueck.mdc.

---

## 1. Zentrale Quelle für URLs

| Was | Quelle | Verwendung |
|-----|--------|------------|
| **Basis-URL (Produktion)** | `BASE_APP_URL` in `src/config/navigation.ts` | Immer `https://k2-galerie.vercel.app` – keine Hardcodierung in Seiten. |
| **Routen** | `WILLKOMMEN_ROUTE`, `ENTDECKEN_ROUTE`, `PILOT_SCHREIBEN_ROUTE`, `PROJECT_ROUTES['k2-galerie'].galerie`, `PROJECT_ROUTES['k2-galerie'].galerieOeffentlich`, `PROJECT_ROUTES.vk2.galerie` usw. | Links und QR-Basis-URLs bauen aus `BASE_APP_URL + Route`. |
| **QR mit Cache-Bust** | `buildQrUrlWithBust(url, useQrVersionTimestamp())` aus `src/hooks/useServerBuildTimestamp.ts` | Für **jeden** QR, der auf Vercel/Galerie/Willkommen zeigt – damit Scan immer aktuelle Version lädt. |

---

## 2. Wo Links und QR vorkommen (Einbauorte)

| Seite / Komponente | Inhalt | Regel |
|--------------------|--------|--------|
| **GaleriePage** | QR Galerie (K2/ök2/VK2), Presse-QR | ✅ buildQrUrlWithBust + useQrVersionTimestamp |
| **PlatformStartPage** | QR Galerie-URL | ✅ buildQrUrlWithBust |
| **MobileConnectPage** | QR Galerie (Vercel + lokal), DevView | ✅ Galerie mit Bust; DevView optional |
| **WerbeunterlagenPage** | QR Willkommen, QR K2-Galerie (Modus K2) | ✅ buildQrUrlWithBust |
| **ProspektGalerieeroeffnungPage** | Link + QR K2-Galerie | ✅ buildQrUrlWithBust |
| **PraesentationsmappePage** | Links + QR ök2, Willkommen, VK2 | ✅ buildQrUrlWithBust |
| **Vk2GaleriePage** | QR Mitglieder-URL | ✅ buildQrUrlWithBust |
| **ZettelPilotPage** | QR ök2, VK2, pilotUrl | ✅ URLs aus navigation; QR mit buildQrUrlWithBust |
| **ZettelMartinaMunaPage** | QR ök2, VK2 | ✅ URLs aus navigation; QR mit buildQrUrlWithBust |
| **PilotStartPage** | QR Galerie-Einstieg, QR diese Seite | ✅ buildQrUrlWithBust für beide |
| **GalerieVorschauPage** | Etikett-QR (galerie-vorschau?q=…) | ✅ BASE_APP_URL + buildQrUrlWithBust (Version von Parent) |
| **MarketingOek2Page** | Link Willkommen; QR Pilot-Schreiben | ✅ Link aus BASE_APP_URL; Pilot-QR mit Bust |
| **FlyerK2GaleriePage** | Kein QR in Datei – nur Stammdaten/Text | – |
| **EmpfehlungstoolPage** | Willkommens-URL mit Empfehler-Parameter | BASE_APP_URL + WILLKOMMEN_ROUTE + Query |

---

## 3. Pflicht bei neuen Links/QR

- **Neuer Link auf Galerie/Willkommen/Vercel:** Immer `BASE_APP_URL` + Route aus `navigation.ts` verwenden, nie `https://k2-galerie.vercel.app` fest eintippen.
- **Neuer QR auf Vercel:** Immer `buildQrUrlWithBust(url, useQrVersionTimestamp())` (oder von Parent übergebener Timestamp), nie nur `url` in QRCode.toDataURL.

---

## 4. Einbauorte für QR/Links (wo wir sie nutzen können)

| Kontext | Wo einbauen | Zweck |
|---------|-------------|--------|
| **APf / Mission Control** | PlatformStartPage, MobileConnectPage | QR für Galerie (K2/ök2) – bereits umgesetzt. |
| **Galerie (öffentlich)** | GaleriePage | QR unten/Seite – bereits umgesetzt. |
| **Werbeunterlagen** | WerbeunterlagenPage | QR Willkommen (ök2) + QR K2-Galerie (Modus K2) – umgesetzt. |
| **Flyer / Prospekt** | ProspektGalerieeroeffnungPage, PraesentationsmappePage | Link + QR – bereits mit Bust. |
| **Zettel (Pilot, Martina&Muna)** | ZettelPilotPage, ZettelMartinaMunaPage | QR ök2/VK2 – mit Bust nachziehen. |
| **Pilot-Brief** | PilotStartPage | QR Galerie + QR diese Seite – mit Bust nachziehen. |
| **Admin / Etikett** | GalerieVorschauPage (EtikettQrCode) | QR zu Werk-Vorschau – URL aus config + Bust. |
| **mök2** | MarketingOek2Page | Willkommens-Link; Pilot-QR – einheitlich mit config + ggf. Bust. |

---

## 5. Register – alle QR-Codes und zentralen Links

**Jeder QR und jeder zentrale Vercel-Link mit Ziel, Datei und Zweck.**

| Nr | Ziel (Basis-URL) | Datei | Zweck |
|----|------------------|-------|--------|
| 1 | Galerie K2 | `src/pages/GaleriePage.tsx` | QR unten auf Galerie (musterOnly=false) |
| 2 | Galerie ök2 | `src/pages/GaleriePage.tsx` | Presse-QR ök2 |
| 3 | Galerie VK2 | `src/pages/GaleriePage.tsx` | Presse-QR VK2 |
| 4 | Galerie (kontextabhängig) | `src/pages/PlatformStartPage.tsx` | QR Mission Control / APf |
| 5 | Galerie Vercel + lokal | `src/pages/MobileConnectPage.tsx` | QR Mobil verbinden |
| 6 | DevView | `src/pages/MobileConnectPage.tsx` | QR DevView (optional ohne Bust) |
| 7 | Willkommensseite | `src/pages/WerbeunterlagenPage.tsx` | QR Werbeunterlagen (Modus ök2) |
| 8 | K2-Galerie | `src/pages/WerbeunterlagenPage.tsx` | QR Werbeunterlagen (Modus K2) |
| 9 | K2-Galerie | `src/pages/ProspektGalerieeroeffnungPage.tsx` | Link + QR Prospekt Galerieeröffnung |
| 10 | ök2, Willkommen, VK2 | `src/pages/PraesentationsmappePage.tsx` | Links + QR Präsentationsmappe (kombiniert + Varianten oek2-kurz, oek2-lang, vk2-kurz, vk2-lang) |
| 11 | VK2 Galerie-Vorschau | `src/pages/Vk2GaleriePage.tsx` | QR Mitglieder-URL |
| 12 | Entdecken (ök2) | `src/pages/ZettelPilotPage.tsx` | QR Pilot-Zettel ök2 |
| 13 | VK2 Galerie | `src/pages/ZettelPilotPage.tsx` | QR Pilot-Zettel VK2 |
| 14 | pilotUrl (Query) | `src/pages/ZettelPilotPage.tsx` | QR individueller Pilot-Link |
| 15 | ök2 (galerie-oeffentlich) | `src/pages/ZettelMartinaMunaPage.tsx` | QR Zettel Martina & Muna ök2 |
| 16 | VK2 Galerie | `src/pages/ZettelMartinaMunaPage.tsx` | QR Zettel Martina & Muna VK2 |
| 17 | Entdecken (Pilot-Galerie) | `src/pages/PilotStartPage.tsx` | QR + Link „Galerie öffnen“ (Michael) |
| 18 | Schreiben an Michael | `src/pages/PilotStartPage.tsx` | QR diese Seite aufs Handy |
| 19 | Galerie-Vorschau ?q=Nummer | `src/pages/GalerieVorschauPage.tsx` (EtikettQrCode) | QR auf Etikett zu einem Werk |
| 20 | Pilot-Schreiben | `src/pages/MarketingOek2Page.tsx` | QR „für Michael“ (mök2) |
| 21 | Willkommen | `src/pages/MarketingOek2Page.tsx` | Link Willkommensseite (Text) |

**Routen aus navigation.ts:** `BASE_APP_URL` + `WILLKOMMEN_ROUTE` (`/willkommen`), `ENTDECKEN_ROUTE` (`/entdecken`), `PILOT_SCHREIBEN_ROUTE` (`/schreiben-michael`), `PROJECT_ROUTES['k2-galerie'].galerie`, `.galerieOeffentlich`, `.galerieVorschau`, `PROJECT_ROUTES.vk2.galerie`, `.galerieVorschau`.

---

**Kurz:** Alle URLs aus `navigation.ts` (BASE_APP_URL, PROJECT_ROUTES, …). Jeder QR auf Vercel mit `buildQrUrlWithBust` + Server-Timestamp. Keine Hardcodierung von k2-galerie.vercel.app in Seiten.
