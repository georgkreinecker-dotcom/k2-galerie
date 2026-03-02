# Skalierungskonzept – stimmig und nach oben unendlich skalierbar

**Stand:** 02.03.26  
**Kernfrage:** Ist das Konzept (ök2, VK2, K2 Familie als Einheiten mit einheitlicher Struktur, pro Tenant eigene Gestaltung) **stimmig** und **nach oben hin unendlich skalierbar**?

**Antwort: Ja.** Ein einziges Prinzip, zweifach anwendbar.

---

## Das eine Prinzip

| Regel | Bedeutung |
|-------|------------|
| **Eine Struktur, viele Instanzen** | Pro „Produktlinie“ (Galerie, Familie, …) **eine** feste Struktur (Layout, Bereiche, Abläufe). Kein Sonderbau pro Kunde. |
| **Kontext = Mandant (tenantId)** | Wer welche Daten und welche Gestaltung sieht, steuert nur der **Mandant** (tenantId). Gleiche Oberfläche, andere Inhalte. |
| **Gestaltung pro Tenant** | Texte, Bilder, evtl. Theme pro tenantId (z. B. `k2-oeffentlich-page-texts`, `k2-familie-{tenantId}-page-content`). Keine Festverdrahtung. |

---

## Zwei Skalierungsrichtungen

### 1. Skalierung „breit“ (mehr Mandanten pro Produkt)

- **Galerie:** K2, ök2, VK2, Lizenznehmer 1, 2, 3, … → beliebig viele Galerien, dieselbe Struktur, pro Mandant eigene Daten und Gestaltung.
- **K2 Familie:** Familie „default“, Familie Müller, Familie Garcia, … → beliebig viele Familien, dieselbe Struktur, pro Familie eigene Texte/Bilder.

**Nach oben unendlich:** Neue Mandanten = neue tenantId + gleicher Ablauf. Kein neuer Code pro Mandant.

### 2. Skalierung „hoch“ (mehr Produktlinien)

- **Heute:** Galerie (ök2, VK2, K2) + K2 Familie.
- **Später:** Weitere Produktlinien (z. B. Atelier, Verein, …) nach **demselben Muster**: eine Struktur für die Linie, viele Tenant-Instanzen, Gestaltung pro tenantId.

Jede neue Linie nutzt dasselbe Prinzip; die Architektur bleibt stimmig.

---

## Warum das stimmig ist

- **Ein Muster überall:** Keine „Sonderlogik für den einen Kunden“. Konfiguration und tenantId entscheiden, nicht eigener Code.
- **Gleiche Technik:** Keys pro Tenant (`k2-*`, `k2-oeffentlich-*`, `k2-vk2-*`, `k2-familie-{tenantId}-*`), gleiche Idee bei Seitentexten und Seitengestaltung.
- **Klare Trennung:** Galerie-Einheit (ök2, VK2) und Familien-Einheit (K2 Familie) sind getrennt, aber **nach derselben Logik** gebaut.

---

## Kurzfassung

**Stimmig:** Ja – ein Prinzip für Galerie und für K2 Familie (und künftige Linien).  
**Nach oben unendlich skalierbar:** Ja – mehr Mandanten pro Linie (skalierbar „breit“) und mehr Produktlinien (skalierbar „hoch“), ohne dass das Konzept bricht. Keine Ausnahme pro Kunde, keine Festverdrahtung.

**Regel im Projekt:** Siehe `.cursor/rules/skalierungsprinzip.mdc` – jede Funktion auf Skalierung ausgelegt.

---

## Raumschiff-Qualitätskriterien – auch beim Skalieren

**Skalierung darf nicht auf Kosten der Qualität gehen.** Das Raumschiff-Prinzip (siehe `docs/K2-FAMILIE-GRUNDBOTSCHAFT.md`) gilt für alles, was „in die Welt hinausgeht“ – und damit für jede Produktlinie und jeden Mandanten, der Nutzer:innen sieht.

| Kriterium | Bedeutung beim Skalieren |
|-----------|---------------------------|
| **Keine Hilfe von der Erde** | Was ausgeliefert wird (Galerie, Familie, künftige Linien), muss **startklar** sein. Kein „wir fixen das später“ pro Mandant. |
| **Qualität vor Quantität** | Lieber weniger Mandanten/Features, die dem Anspruch genügen, als schnell skalieren und technisch oder moralisch Abstriche machen. |
| **Klare Schichten, keine Datenverluste** | Skalierung (neue tenantIds, neue Linien) darf keine stillen Filter, keine Kundendaten-Löschung, keine Vermischung von Kontexten einführen. Regeln (niemals-kundendaten-loeschen, Datentrennung) gelten für alle. |
| **Doku und Regeln** | Jede neue Linie oder jeder neue Ablauf muss so dokumentiert und regelbasiert sein, dass spätere Bauende (oder KI) das System verstehen und weiterbauen können. |
| **Gegenseitige Kontrolle** | Bei kritischen Schritten (neue Produktlinie, neuer Mandantentyp) gemeinsam prüfen: Sind wir startklar? Keine Abstriche bei Grundbotschaft (bei K2 Familie: Inklusion, Respekt) oder bei technischer Zuverlässigkeit. |

**Kurz:** Nach oben unendlich skalierbar – aber **jeder Schritt in Raumschiff-Qualität**. Nicht abheben, bevor es startklar ist. Quelle: `docs/K2-FAMILIE-GRUNDBOTSCHAFT.md`, Abschnitt „Raumschiff-Anspruch“.
