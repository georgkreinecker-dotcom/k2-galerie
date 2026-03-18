# Automatisierungsgewinn & wie die Promotion-Botschaft in alle Kanäle fließt

**Stand:** 17.03.26 · **Zweck:** Klarheit: Was ist jetzt automatisiert? Woher kommen Werbelinie und Botschaft in Newsletter, Flyer, Plakat, Social?

---

## 1. Automatisierungsgewinn (jetzt)

| Was | Vorher | Jetzt |
|-----|--------|--------|
| **Presse versenden** | Text kopieren, Betreff separat bauen, Verteiler suchen | **Ein Klick „Presse-Paket kopieren“:** Betreff (Format „Presseinformation – [Anlass], [Datum], [Ort]“) + Fließtext in einem Rutsch in die Zwischenablage. Tipp im UI: „E-Mail-Adressen für BCC unter Eventplanung → Presse & Medien → Medienspiegel“. |
| **Kernbotschaften (Pitch, Web, Social)** | Aus mök2 oder Doku zusammensuchen | **Ein Klick „Kernbotschaften kopieren“:** Slogan 1 + Slogan 2 + Zielgruppe + Sweet-Spot (aus **tenantConfig**) in die Zwischenablage – eine definierte Reihenfolge. |
| **PR-Dokumente pro Event** | Einzeln tippen oder aus anderen Quellen kopieren | **Ein Klick pro Typ:** „Presse“, „Newsletter“, „Plakat“, „Social“, „Event-Flyer“ oder „PR-Vorschläge (alle)“ erzeugt sofort den Inhalt aus **Event + Stammdaten** (Datum, Ort, Kontakt, Galeriename, Beschreibung). Keine doppelte Eingabe. |
| **Verteiler** | Neue Liste pro Aktion? | **Eine Liste:** MEDIENVERTEILER-EROEFFNUNG; im Admin Medienspiegel mit „E-Mail-Adressen kopieren“ für BCC. |
| **Betreff Presse** | Manuell formulieren | **Format fest:** „Presseinformation – [Anlass], [Datum], [Ort]“ – wird beim Presse-Paket automatisch aus dem gewählten Event gesetzt. |

**Kurz:** Weniger Klicks, eine Quelle pro Information, kein Neuerfinden pro Aktion.

---

## 2. Woher kommt die Promotion-Botschaft? (eine Quelle)

| Botschaft / Text | Quelle (technisch) | Verwendung |
|------------------|--------------------|------------|
| **Werbelinie (2 Slogans), Zielgruppe, Sweet-Spot** | **tenantConfig.ts:** PRODUCT_WERBESLOGAN, PRODUCT_WERBESLOGAN_2, PRODUCT_ZIELGRUPPE, PRODUCT_POSITIONING_SWEET_SPOT | mök2 Sektion 7, Werbeunterlagen, Präsentationsmappe, EntdeckenPage, Flyer K2 Galerie, Presse-Einladung, **Button „Kernbotschaften kopieren“** im Admin. |
| **Stammdaten (Kontakt, Adresse, Galeriename)** | Admin → Stammdaten (Keys k2-stammdaten-* / VK2 / ök2) | Presse, Newsletter, Flyer, Plakat, Social – alle Generatoren lesen von hier (Ort, Telefon, E-Mail, Öffnungszeiten). |
| **Event-Daten (Titel, Datum, Ort, Beschreibung)** | Admin → Eventplanung → Veranstaltungen | Alle PR-Vorschläge: Presse, Newsletter, Plakat, Social, Event-Flyer. |

---

## 3. Wie fließt die Botschaft in Newsletter, Event-Flyer, Plakat, Social?

Alle vier (plus Presse) werden von **demselben Prinzip** gespeist: **Event + Stammdaten + feste Texte**. Die „Promotion-Botschaft“ (Werbelinie, Sweet-Spot, Zielgruppe) steckt in den **festen Texten** der Generatoren.

### Konkret pro Kanal

| Kanal | Was automatisch eingebaut wird | Quelle der Botschaft aktuell |
|-------|-------------------------------|-------------------------------|
| **Presse** | Titel, Termin, Ort, Eintritt, Zur Ausstellung, Story (1a Human / 1b Produkt), Kontakt, „WEITERVERBREITEN“ + Link | **Lokale Konstanten** im Admin: STORY_1B_PRODUKT_PRESSE (Sweet-Spot-Text), STORY_1A_HUMAN_PRESSE, EROEFFNUNG_LOUNGE_TEXT, EROEFFNUNG_PRESSE_LEAD_PREFIX. Inhaltlich mit tenantConfig/Werbelinie abgestimmt; optional später direkt aus tenantConfig lesen. |
| **Newsletter** | Einladung, Termindaten, Ort, Beschreibung, Werbelinie 1+2 (bei Eröffnung), Kontakt, „Wir freuen uns …“ | **Lokale Konstanten:** EROEFFNUNG_LOUNGE_TEXT, EROEFFNUNG_WERBELINIE_1, EROEFFNUNG_WERBELINIE_2 (entsprechen Slogan 1/2). Stammdaten für Kontakt/Ort. |
| **Event-Flyer** | Titel, Datum, Ort, Über die Ausstellung (Beschreibung), Künstler:innen (Martina/Georg oder Verein), Kontakt, **„TEILEN: Bitte verbreiten … Link zur Galerie“** | Event + Stammdaten; „TEILEN“-Block mit Galerie-URL immer automatisch. |
| **Plakat** | Titel, Typ (z. B. Galerieeröffnung), Datum, Ort, Kurztext, **QR-Code** (automatisch Galerie-URL), Kontakt | Event + Stammdaten; bei Eröffnung **EROEFFNUNG_PLAKAT_KURZTEXT** („Kunst & Keramik · … Gemeinsame Lounge: Galerie erleben, Plattform (K2 · ök2 · VK2) entdecken.“). QR aus Kontext (K2/ök2/VK2). |
| **Social (Instagram, Facebook, WhatsApp)** | Kurztext, Datum, Ort, Hashtags, **Link zur Galerie** im „TEILEN“-Sinn | Bei Eröffnung: fester Eröffnungs-Text („Zur Eröffnung laden wir …“, „K2-Plattform (K2 · ök2 · VK2)“). Sonst Event-Beschreibung + Künstler:innen + Kontakt. |

**Gemeinsam überall:**  
- **Kontakt/Ort/Adresse** immer aus Stammdaten.  
- **Link zur Galerie** bzw. QR automatisch (keine zweite Eingabe).  
- **„WEITERVERBREITEN“ / „TEILEN“**-Block mit Link in Presse, Newsletter, Flyer, Social – einheitlich eingebaut.

Die **Werbelinie und der Sweet-Spot** sind in den festen Formulierungen der Generatoren (STORY_1B, EROEFFNUNG_WERBELINIE_1/2, EROEFFNUNG_PLAKAT_KURZTEXT, Eröffnungs-Social-Texte) inhaltlich drin; technisch kommen sie derzeit noch aus **lokalen Konstanten** im Admin, nicht direkt aus tenantConfig. Eine spätere Auslagerung nach tenantConfig (oder eine zentrale Texte-Quelle) wäre der nächste Schritt für „eine Quelle überall“.

---

## 4. Kurzfassung

- **Automatisierungsgewinn:** Presse-Paket (Betreff + Text) in einem Klick; Kernbotschaften in einem Klick; PR-Vorschläge (Newsletter, Presse, Plakat, Social, Flyer) je ein Klick aus Event + Stammdaten; ein Verteiler; fester Betreff.
- **Botschaftsfluss:** Eine Quelle für Botschaft = tenantConfig (Slogans, Zielgruppe, Sweet-Spot); in den **Generatoren** (Newsletter, Flyer, Plakat, Social, Presse) fließt die Botschaft über **Event + Stammdaten + feste Texte** (diese festen Texte sind mit Werbelinie/Sweet-Spot abgestimmt, stehen heute noch als lokale Konstanten im Admin; optional später aus tenantConfig/zentraler Quelle lesen).

Verknüpfung: [00-INDEX.md](00-INDEX.md), [../STRATEGIE-PROMOTION-SPORTWAGEN.md](../STRATEGIE-PROMOTION-SPORTWAGEN.md).
