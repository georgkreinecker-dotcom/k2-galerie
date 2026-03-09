# K2 Markt – Flyer-Agent (Phase 2)

**Stand:** 09.03.26  
**Zweck:** Erster Agent als **Ableiter** – liest Produkt-Moment + ein Flyer-Template, liefert **Entwurf**. Erfindet nichts neu; leitet ab.

---

## 1. Rolle

- **Input:** Ein **Produkt-Moment** (id, titel, botschaft, zielgruppe, kontakt, links, medien, kernargumente) + **ein** Flyer-Template (Struktur/Layout, Platzhalter-Positionen).
- **Output:** Ein **Flyer-Entwurf** – alle Stellen aus dem Moment befüllt, bereit für Prüfung am Qualitäts-Tor (DoD Flyer).
- **Regel:** Ein Template pro Zweck. Kein zweites Flyer-Template ohne Grund.

---

## 2. Ablauf (scharf)

1. **Auswahl:** User wählt einen Produkt-Moment (z. B. aus Liste oder Kampagne).
2. **Template:** Das **eine** Flyer-Template wird geladen (aus mök2, Kampagne oder K2-Markt-Vorlagen).
3. **Ableiten:** Agent füllt Template mit Werten aus dem Moment (botschaft → Text, kontakt → Kontaktblock, links → URL/QR, medien → Bildreferenz).
4. **Entwurf:** Ergebnis = Entwurf (z. B. HTML/PDF-Vorschau oder Datenstruktur für Render). Kein Platzhalter mehr, wo der Moment liefert.
5. **Weiter:** Entwurf geht ins **Qualitäts-Tor** (Bildschirm) → Prüfung DoD Flyer → Freigabe oder Nacharbeit.

---

## 3. Wo Template und Moment herkommen

| Quelle | Inhalt |
|--------|--------|
| **Produkt-Moment** | **Speicherort:** `public/k2-markt/produkt-momente.json` (Array von Momenten, im Repo, App liest per fetch). Beispiel-Moment enthalten. |
| **Flyer-Template** | Ein Standard-Layout (z. B. 1 Seite A5/A6), feste Zonen: Kopf (Titel/Bild), Mitte (Botschaft), Fuß (Kontakt, Link/QR). Entwurf = „Fertige Beispiele“ aus Kampagne/mök2 als Vorlage oder neues Minimal-Template. |

Sportwagenmodus: Bestehende Vorlagen (mök2, Kampagne „Fertige Beispiele“) nutzen, wo passend.

---

## 4. Technik (umgesetzt)

- **Agent** = `src/utils/k2MarktFlyerAgent.ts`: `momentToFlyerEntwurf(moment) → FlyerEntwurf`. Typen `ProduktMoment`, `FlyerEntwurf`. Kein zweites Template – eine Ableitung.
- **DoD-Prüfung** = `erfuelltDoDFlyer(entwurf)` liefert `{ ok, fehlend[] }` (Kernbotschaft, Kontakt, Link/QR, Bild).
- **Tor:** UI unter Route „K2 Markt Tor“ – zeigt Entwurf, DoD-Checkliste, Button „Freigeben“.

---

## 5. Stand (09.03.26) – A, B, C umgesetzt

- **A:** Speicherort = `public/k2-markt/produkt-momente.json`, Beispiel-Moment angelegt.
- **B:** `src/utils/k2MarktFlyerAgent.ts`: `momentToFlyerEntwurf(moment)`, `erfuelltDoDFlyer(entwurf)`.
- **C:** Tor-UI unter **/projects/k2-galerie/k2-markt-tor** (K2MarktTorPage): Entwurf aus Moment, DoD-Checkliste, Button „Freigeben“. Von der K2 Markt Mappe verlinkt („Zum Tor“).

Phase 2 Meilenstein erfüllt: Ein Agent liefert Entwurf; Tor zeigt ihn und prüft DoD.

---

*Verknüpfung: [Vision](K2-MARKT-VISION-ARCHITEKTUR.md) §6 Fluss, [Produkt-Moment](K2-MARKT-PRODUKT-MOMENT.md), [DoD Flyer](K2-MARKT-DOD-FLYER.md), [Für die Planer](K2-MARKT-FUER-PLANER.md) Phase 2.*
