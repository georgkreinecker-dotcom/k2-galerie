# Plan: Schritt für Schritt gemeinsam abarbeiten

**Stand:** Februar 2026  
**Zweck:** Ein klarer Plan – wir gehen die Schritte nacheinander durch, ohne alles auf einmal zu wollen.

---

## So nutzen wir den Plan

- **Ein Schritt nach dem anderen.** Wenn ein Schritt erledigt ist, Haken setzen oder kurz „erledigt“ notieren.
- **Nicht hetzen.** Lieber einen Schritt sauber machen als drei halb.
- **Bei Unklarheit:** In der angegebenen Doku nachlesen oder hier nachfragen.

---

## Die Schritte (in Reihenfolge)

### Block A: Basis steht (nur prüfen / abhaken)

- [x] **Schritt 1 – Zielgruppe fest**  
  Ist die Zielgruppe in einem Satz festgehalten?  
  → **Ja.** In `tenantConfig.ts`: PRODUCT_ZIELGRUPPE. In mök2 (Box 4) und Werbetexte.  
  *Erledigt 20.02.26.*

- [x] **Schritt 2 – Preisfindung & Einzigartigkeit**  
  Steht schriftlich, was uns abhebt und welcher Preisraum vertretbar ist?  
  → **Ja.** `docs/MARKTCHECK-PREISE-BASIC-PRO-VERGLEICH.md` (inkl. Abschnitt „Einzigartigkeit“). Basic 10–15 €, Pro 25–35 € (bis 50 € mit klarer USPs-Kommunikation).  
  *Erledigt 20.02.26.*

- [x] **Schritt 3 – Kunstvereine: Kernbotschaft in mök2**  
  Ist die Kernbotschaft für Kunstvereine sichtbar?  
  → **Ja.** In mök2 bei „Lizenzstruktur VK2“ steht der orangefarbene Block „Kunstvereine = Multiplikatoren“ mit dem Satz.  
  *Erledigt 20.02.26.*

---

### Block B: Nächste konkrete Schritte (wir arbeiten sie nacheinander ab)

- [x] **Schritt 4 – „Teilen“-Link pro Werk**  
  Feature eingebaut: In der Galerie-Vorschau (Lightbox) gibt es einen Button **„Link kopieren“** – kopiert direkten Link zum Werk (Hash #werk=…). Beim Öffnen eines Links mit diesem Hash öffnet sich die Lightbox automatisch auf dem Werk.  
  *Erledigt 20.02.26.*

- [ ] **Schritt 5 – Kunstvereine: Pilot-Verein benennen**  
  **Einen** konkreten Kunstverein (oder Verband) als Ziel für den ersten Kontakt eintragen.  
  → Wo: mök2 „Kanäle 2026“, Zeile Kooperation (Name oder „noch auswählen“).  
  *Aktion:* Namen eintragen oder „noch offen“ lassen und Schritt später machen.

- [ ] **Schritt 6 – Onboarding „Verein in 3 Schritten“**  
  Kurze Anleitung schreiben: (1) Verein anlegen, (2) Mitglieder eintragen, (3) Galerie veröffentlichen.  
  → Ablage: z. B. `docs/ONBOARDING-VEREIN-3-SCHRITTE.md` oder ein Abschnitt in `VK2-VEREINSPLATTFORM.md`.  
  *Aktion:* Erst wenn Schritt 5 erledigt ist oder parallel, wenn du willst.

- [ ] **Schritt 7 – Lizenz-Preise konkret machen (optional)**  
  Festlegen: Nennen wir feste Preise (z. B. Basic 12 €, Pro 29 €) oder vorerst „auf Anfrage“?  
  → Wo: mök2 „Lizenz-Pakete für Außen“, ggf. tenantConfig wenn wir feste Werte ins UI übernehmen.  
  *Aktion:* Erst wenn du dich bereit fühlst; kann auch später kommen.

---

### Block C: Später (nicht jetzt)

- [ ] **Schritt 8 – Weitere Features aus der Abhebung-Liste**  
  Nach dem ersten Feature (Schritt 4): das nächste aus der Liste wählen (z. B. Belege/Kasse, Präsentationsmodus).

- [ ] **Schritt 9 – „Für Kunstvereine“ als eigener Block auf der Website/Willkommensseite**  
  Wenn Pilot und Onboarding stehen: eigenen Bereich „Für Kunstvereine“ in der Außenkommunikation (z. B. Link von der Willkommensseite).

- [ ] **Schritt 10 – Trust-Checkliste (AGB, Datenschutz, Support)**  
  Kurz prüfen und dokumentieren, dass AGB-Link, Datenschutz und Support-Ansprechpartner stimmen.

---

## Kurzüberblick

| Schritt | Inhalt | Status |
|--------|--------|--------|
| 1 | Zielgruppe fest | erledigt |
| 2 | Preisfindung & Einzigartigkeit | erledigt |
| 3 | Kunstvereine Kernbotschaft in mök2 | erledigt |
| 4 | „Teilen“-Link pro Werk | erledigt (Link kopieren + Hash #werk=…) |
| 5 | Pilot-Verein benennen | **als Nächstes** |
| 6 | Onboarding „Verein in 3 Schritten“ | danach |
| 7 | Lizenz-Preise konkret (optional) | optional |
| 8–10 | Weitere Features, „Für Kunstvereine“-Block, Trust | später |

---

## Wo was steht

| Thema | Doc / Ort |
|--------|-----------|
| Zielgruppe | tenantConfig.ts, mök2 Box 4 |
| Preise & Einzigartigkeit | docs/MARKTCHECK-PREISE-BASIC-PRO-VERGLEICH.md |
| Feature-Ideen Abhebung | docs/FEATURES-ABHEBUNG-ZIELGRUPPE.md |
| Kunstvereine Multiplikatoren | docs/KUNSTVEREINE-MULTIPLIKATOREN.md |
| VK2 Lizenz & Technik | docs/VK2-VEREINSPLATTFORM.md |
| Vermarktung verbessern | docs/VERBESSERUNGEN-VERMARKTUNG-GEMEINSAM.md (falls vorhanden), mök2 „Was wir gemeinsam verbessern“ |

---

*Dieser Plan in docs/ abgelegt. Bei jeder Session: „Wo sind wir im Plan?“ → nächsten Schritt angehen.*
