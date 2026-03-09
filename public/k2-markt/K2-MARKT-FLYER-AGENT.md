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
| **Produkt-Moment** | Noch offen: Speicherort (JSON, Supabase, Datei). Beim Start: ein Moment manuell oder aus Kampagne/mök2-Struktur anlegen. |
| **Flyer-Template** | Ein Standard-Layout (z. B. 1 Seite A5/A6), feste Zonen: Kopf (Titel/Bild), Mitte (Botschaft), Fuß (Kontakt, Link/QR). Entwurf = „Fertige Beispiele“ aus Kampagne/mök2 als Vorlage oder neues Minimal-Template. |

Sportwagenmodus: Bestehende Vorlagen (mök2, Kampagne „Fertige Beispiele“) nutzen, wo passend.

---

## 4. Technik (Skizze für Umsetzung)

- **Agent** = Funktion oder Modul: `flyerEntwurf(moment, template) → entwurf`.
- **Entwurf** = strukturierte Daten (title, bodyText, contact, qrUrl, imageRef) oder direkt gerenderte Vorschau (HTML/Canvas/PDF).
- **Tor:** UI zeigt Entwurf, prüft gegen [DoD Flyer](K2-MARKT-DOD-FLYER.md), Button „Freigeben“ (Phase 3).

---

## 5. Nächster Schritt

- **Option A:** Speicherort für Produkt-Momente festlegen (JSON in Repo, Supabase, oder erstmal eine Beispiel-Moment-Datei in k2-markt).
- **Option B:** Ein Minimal-Flyer-Template definieren (Felder/Platzhalter) + eine Ableit-Funktion (moment → entwurf) skizzieren oder implementieren.
- **Option C:** Tor-UI (Phase 3) vorbereiten: Stelle, an der Entwurf angezeigt und DoD geprüft wird.

Phase 2 Meilenstein: **Ein Agent liefert Entwurf** – kann zunächst ohne echte KI (reine Ableitung aus Moment in Template), KI später für Texte/Bildvorschläge ergänzen.

---

*Verknüpfung: [Vision](K2-MARKT-VISION-ARCHITEKTUR.md) §6 Fluss, [Produkt-Moment](K2-MARKT-PRODUKT-MOMENT.md), [DoD Flyer](K2-MARKT-DOD-FLYER.md), [Für die Planer](K2-MARKT-FUER-PLANER.md) Phase 2.*
