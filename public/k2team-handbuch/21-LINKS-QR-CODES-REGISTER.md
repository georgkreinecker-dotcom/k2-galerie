# Links & QR-Codes – Register

**Stand:** 12.03.26  
Alle QR-Codes und zentralen Links der App – wo sie vorkommen, wohin sie führen, wofür sie da sind.

---

## Wichtig

- **Eine Quelle für URLs:** Basis-URL und Routen stehen in `src/config/navigation.ts` (BASE_APP_URL, PROJECT_ROUTES). Keine feste Adresse in den Seiten eintippen.
- **QR = immer aktueller Stand:** Jeder QR, der auf die Galerie/Willkommen zeigt, nutzt Server-Stand + Cache-Bust – damit ein Scan immer die aktuelle Version lädt (nicht gecachte alte).

---

## Register – alle QR-Codes und zentralen Links

| Nr | Ziel | Wo (Seite/Datei) | Zweck |
|----|------|-------------------|--------|
| 1 | Galerie K2 | GaleriePage | QR unten auf Galerie (echte K2) |
| 2 | Galerie ök2 | GaleriePage | Presse-QR Demo-Galerie |
| 3 | Galerie VK2 | GaleriePage | Presse-QR Vereinsgalerie |
| 4 | Galerie (kontextabh.) | PlatformStartPage | QR Mission Control / APf |
| 5 | Galerie Vercel + lokal | MobileConnectPage | QR Mobil verbinden |
| 6 | DevView | MobileConnectPage | QR DevView |
| 7 | Willkommensseite | WerbeunterlagenPage | QR Werbeunterlagen (Modus ök2) |
| 8 | K2-Galerie | WerbeunterlagenPage | QR Werbeunterlagen (Modus K2) |
| 9 | K2-Galerie | ProspektGalerieeroeffnungPage | Link + QR Prospekt Galerieeröffnung |
| 10 | ök2, Willkommen, VK2 | PraesentationsmappePage | Links + QR Präsentationsmappe |
| 11 | VK2 Galerie-Vorschau | Vk2GaleriePage | QR Mitglieder-URL |
| 12 | Entdecken (ök2) | ZettelPilotPage | QR Pilot-Zettel ök2 |
| 13 | VK2 Galerie | ZettelPilotPage | QR Pilot-Zettel VK2 |
| 14 | pilotUrl (Query) | ZettelPilotPage | QR individueller Pilot-Link |
| 15 | ök2 (galerie-oeffentlich) | ZettelMartinaMunaPage | QR Zettel Martina & Muna ök2 |
| 16 | VK2 Galerie | ZettelMartinaMunaPage | QR Zettel Martina & Muna VK2 |
| 17 | Entdecken (Pilot-Galerie) | PilotStartPage | QR + Link „Galerie öffnen“ (z. B. Michael) |
| 18 | Schreiben an Michael | PilotStartPage | QR diese Seite aufs Handy |
| 19 | Galerie-Vorschau ?q=Nummer | GalerieVorschauPage (EtikettQrCode) | QR auf Etikett zu einem Werk |
| 20 | Pilot-Schreiben | MarketingOek2Page (mök2) | QR „für Michael“ |
| 21 | Willkommen | MarketingOek2Page | Link Willkommensseite (Text) |
| 22 | Admin Lizenznehmer-Instanz | Stammdaten Admin, LizenzErfolgPage | QR + Link nur Admin, nach Registrierung bzw. wenn API `/admin` liefert |

---

## Wo wir QR/Links einbauen können

| Kontext | Wo | Zweck |
|---------|-----|--------|
| APf / Mission Control | PlatformStartPage, MobileConnectPage | QR für Galerie (K2/ök2) |
| Galerie (öffentlich) | GaleriePage | QR unten/Seite |
| Werbeunterlagen | WerbeunterlagenPage | QR Willkommen + QR K2-Galerie |
| Flyer / Prospekt | ProspektGalerieeroeffnungPage, PraesentationsmappePage | Link + QR |
| Zettel (Pilot, Martina&Muna) | ZettelPilotPage, ZettelMartinaMunaPage | QR ök2/VK2 |
| Pilot-Brief | PilotStartPage | QR Galerie + QR diese Seite |
| Admin / Etikett | GalerieVorschauPage | QR zu Werk-Vorschau |
| mök2 | MarketingOek2Page | Willkommens-Link; Pilot-QR |

---

**Vollständige technische Übersicht (Quellen, Pflichten, Code-Stellen):** docs/LINKS-QR-CODES-UEBERSICHT.md
