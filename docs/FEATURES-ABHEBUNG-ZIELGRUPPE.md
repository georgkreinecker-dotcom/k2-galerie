# Feature-Ideen: Abhebung von der Masse – Zielgruppe Künstler:innen

**Stand:** Februar 2026  
**Zielgruppe (eine Quelle):** Künstler:innen mit Verkauf – Atelier, Ausstellungen, Märkte – die Webauftritt, Kasse und Werbung aus einer Hand wollen.

---

## 1. Warum wir uns abheben (bereits da)

- **Multifunktional am PC/Mac, nicht nur App** – Arbeitsplattform am Rechner + Galerie & Kassa mobil, gleicher Stand überall. In dieser Kombination einzigartig.
- **Alles in einer Oberfläche** – Galerie, Werke, Events, Marketing, Kasse, eine Datenbasis. Konkurrenz liefert das getrennt.
- **Kasse vor Ort + Etiketten** – für Verkauf im Atelier/auf dem Markt.

Damit rechtfertigen wir einen höheren Preis (siehe **MARKTCHECK-PREISE-BASIC-PRO-VERGLEICH.md**, Abschnitt Einzigartigkeit). Die folgenden Ideen sollen die Zielgruppe **noch mehr** ansprechen und die Abhebung verstärken.

---

## 2. Feature-Ideen (Priorität: was spricht Zielgruppe am meisten an?)

### Hohe Priorität – starker Nutzen, gut einbaubar

| Feature | Nutzen für Zielgruppe | Aufwand (grob) | Einordnung |
|--------|------------------------|----------------|------------|
| **Belege / Quittungen aus der Kasse** (Druck oder PDF) | Verkauf vor Ort → Kunde bekommt was Handfestes. Kaum ein Konkurrent in der Nische bietet Kasse + Beleg aus einer Hand. | Mittel (Druck-Layout, PDF-Export) | **Stark differenzierend** |
| **„Teilen“-Link pro Werk** (Copy-Link, optional „Für Social kopieren“) | Ein Werk schnell per Link teilen (Mail, Social, Flyer). Vermarktung ohne Umweg. | Gering | Schnell umsetzbar, hohe Sichtbarkeit |
| **Einfache Käufer:innen- / Interessent:innen-Liste** | Aus Kasse oder „Kontakt anfragen“: Wer hat gekauft / sich gemeldet? Für Einladungen, Newsletter, nächste Ausstellung. Kein volles CRM – nur Liste mit Name, Kontakt, optional Notiz. | Mittel (neue Liste + Speicher, evtl. Export) | **Sehr zielgruppennah** |
| **Präsentationsmodus / Ausstellungsmodus** | Galerie im Vollbild, ruhig (keine Navigation sichtbar), z. B. für Vernissage am Bildschirm oder im Schaufenster. „So zeigen wir unsere Werke.“ | Gering bis Mittel (Fullscreen, optional Slideshow) | Gutes Aushängeschild |

### Mittlere Priorität – klarer Mehrwert

| Feature | Nutzen für Zielgruppe | Aufwand (grob) | Einordnung |
|--------|------------------------|----------------|------------|
| **Einfache Auswertung: Verkäufe pro Kategorie / Zeitraum** | „Was läuft?“ – welche Kategorie verkauft sich, wie viele Verkäufe im Monat. Entscheidungshilfe ohne Excel. | Mittel (Daten aus Kassa/History auswerten, einfache Darstellung) | Pro-Option denkbar |
| **Reservierung „Werk reservieren für X Tage“** | Typisch Galerie: Kunde will reservieren, nicht sofort zahlen. Option im Shop oder in der Galerie. | Mittel (Status „reserviert“, Frist, Benachrichtigung optional) | Hebt von reinem Shop ab |
| **Mehrsprachigkeit Galerie (z. B. DE/EN)** | Internationale Käufer oder Gäste; eine Umschaltung für Galerietexte/Werke. | Mittel (Texte pro Sprache, UI-Umschalter) | Erweiterung Zielgruppe |

### Geringere Priorität / später

| Feature | Nutzen | Aufwand |
|--------|--------|--------|
| Newsletter / Einladungen aus derselben Datenbasis | Einladung zu Vernissage an alle, die schon gekauft haben oder Interesse gezeigt haben. | Hoch (Versand, Opt-in, DSGVO) |
| Terminbuchung „Atelier-Besuch / Besichtigung“ | Interessent bucht Zeitslot. | Mittel bis hoch |
| QR auf Etikett → Link zum Werk | Beim Etikettendruck QR, der direkt zum Werk in der Galerie führt. | Gering bis Mittel (wenn Etiketten-Layout erweiterbar) |

---

## 3. Empfohlene Reihenfolge zum Einbauen

1. **„Teilen“-Link pro Werk** – wenig Aufwand, sofort nutzbar für Vermarktung.
2. **Belege / Quittungen aus Kasse** – starkes Alleinstellungsmerkmal, Zielgruppe erwartet das beim Verkauf vor Ort.
3. **Präsentationsmodus** – gutes Demo-Feature für Vernissage und Werbung.
4. **Käufer:innen- / Interessent:innen-Liste** – sehr zielgruppennah, Grundlage für spätere Einladungen/Newsletter.

Danach je nach Kapazität: Auswertung, Reservierung, Mehrsprachigkeit.

---

## 4. Kunstvereine als Multiplikatoren

**Kunstvereine** sind Multiplikatoren: Ein Verein = viele Künstler:innen, eine Entscheidung, großer Sichtbarkeits-Effekt. Wir haben mit **VK2 (Vereinsplattform)** bereits die technische und lizenzielle Grundlage. Eindruckvoll anbieten heißt: klare Kernbotschaft („Eine Plattform für Ihren Verein: alle Mitglieder sichtbar, eine Galerie, ein Auftritt – ab 10 Mitgliedern kostenfrei“), Pilot-Verein als Referenz, Onboarding „Verein in 3 Schritten“, eigener Block „Für Kunstvereine“ in der Außenkommunikation. → **docs/KUNSTVEREINE-MULTIPLIKATOREN.md**

---

## 5. Verweise

- **Kunstvereine als Multiplikatoren:** docs/KUNSTVEREINE-MULTIPLIKATOREN.md
- **Preise & Einzigartigkeit:** docs/MARKTCHECK-PREISE-BASIC-PRO-VERGLEICH.md  
- **Zielgruppe (eine Quelle):** src/config/tenantConfig.ts → PRODUCT_ZIELGRUPPE  
- **USPs & Kommunikation:** mök2 (Marketing ök2), Sektion USPs / „Was macht den Unterschied“

---

*Dieses Doc in docs/ abgelegt. Bei Entscheidung „Feature einbauen“: hier priorisieren, dann in Backlog oder Sprint aufnehmen.*
