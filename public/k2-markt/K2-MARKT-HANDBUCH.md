# Handbuch K2 Markt – Dokumentation unserer Arbeit

**Stand:** 09.03.26  
**Zweck:** Unsere Arbeit am Projekt K2 Markt dokumentieren – Stand, Entscheidungen, nächste Schritte. Eine Quelle, sauber sortiert. Dieses Handbuch liegt in der **K2 Markt Mappe** (Smart Panel) und wird mit dem Projekt mitgeführt.

---

## 1. Was dieses Handbuch enthält

- **Stand:** Wo stehen wir gerade? Was ist erledigt?
- **Entscheidungen:** Was haben wir verbindlich festgelegt (Basis, Methode, Architektur)?
- **Nächste Schritte:** Was kommt als Nächstes (priorisiert)?
- **Verknüpfungen:** Regeln (Sportwagenmodus), Vermächtnis (WIR-PROZESS), Kampagne, mök2.

---

## 2. Stand (09.03.26)

| Erledigt | Kurz |
|----------|------|
| **Vision und Architektur (eine Quelle)** | Zusammengeführte Vision: Kette zum Markt, Medienhaus, eine Wahrheit → viele Formate, Produkt-Moment, Qualitäts-Tor + eine Freigabe, Regeln im System, Traceability. Mit Georgs Persönlichkeit und gemeinsamer Schärfe. |
| **Eigene Mappe im Smart Panel** | K2 Markt als eigenes Produkt in der Hall of Fame; alle Dokumente (Index, Vision, Handbuch, Planer, Produkt-Moment) an einem Ort. |
| **Handbuch (diese Datei)** | Dokumentation der Arbeit – hier wird fortgeschrieben. |
| **Phase 2 gestartet** | Flyer-Agent-Konzept in K2-MARKT-FLYER-AGENT.md: Input = Moment + Template, Output = Entwurf. Nächste Schritte: Speicherort Moment, Minimal-Template, ggf. Tor-UI. |
| **A, B, C + Tor aus einem Guss** | Produkt-Momente (produkt-momente.json), Flyer-Agent (momentToFlyerEntwurf, DoD), Tor-UI (k2-markt-tor) mit gleicher Struktur wie Mappe. |
| **Traceability von Anfang an** | Beim Freigeben wird ein Eintrag gespeichert: momentId, momentTitel, template (flyer-minimal), timestamp. Log in localStorage (k2-markt-freigaben), Anzeige „Letzte Freigaben“ am Tor. |

---

## 3. Verbindliche Basis

- **Wir-Regeln und Vermächtnis** – alles, was im Wir-Team und im Vermächtnis hinterlegt ist, gilt auch für K2 Markt.
- **Sportwagenmodus** – eine Quelle, ein Standard, ein Ablauf pro Problem. Keine Doppelungen, keine Sonderfälle.
- **Anbindung** – mök2, Kampagne, Marketing-Strategie sind **Quelle** (Rohmaterial); K2 Markt ist der **Mechanismus**, der daraus fertige Produkte macht.

---

## 4. Nächste Schritte (offen)

- **Planer:** Einstieg steht in der Mappe – [Für die Planer](K2-MARKT-FUER-PLANER.md). Dort: Phasen, Meilensteine, Reihenfolge auf Basis der Architektur ausarbeiten.
- **Weitere Formate:** DoD und Agent für E-Mail, Presse etc.; gleiches Muster wie Flyer (Moment → Entwurf → Tor → Freigabe + Traceability).
- Optional: Quelle strukturieren (mök2, Kampagne, Docs); Zentrale (Bildschirm) erweitern; Ausgabe-Formate priorisieren.

---

## 5. Verknüpfungen

| Thema | Wo nachlesen |
|-------|----------------|
| **Vision & Architektur** | In dieser Mappe: Vision und Architektur (eine Quelle) – zusammengeführt, eine Stimme. |
| **Sportwagenmodus** | .cursor/rules, SPORTWAGEN-ROADMAP, PRODUKT-STANDARD-NACH-SPORTWAGEN |
| **Vermächtnis / Wir-Team** | docs/WIR-PROZESS.md |
| **Kampagne** | Smart Panel → Kampagne Marketing-Strategie |
| **mök2** | Smart Panel → mök2 – Vertrieb & Promotion |
| **Docs-Übersicht** | docs/00-INDEX.md (Eintrag K2-MARKT-VISION-ARCHITEKTUR) |

---

*Dieses Handbuch wird bei jeder wesentlichen Änderung am Projekt K2 Markt ergänzt – Stand, Entscheidungen, nächste Schritte.*
