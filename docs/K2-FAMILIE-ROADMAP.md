# K2 Familie – Vision & Roadmap (Sportwagenmodus)

**Start:** 01.03.26  
**Basis:** K2-Struktur (tenantfähig, Stammdaten, „Werke“/Momente, Events, eine Oberfläche).  
**Kern:** Jeder Mensch will gesehen werden und sich ein wenig präsentieren – und ist vernetzt in seiner Grundfamilie.

---

## Vision in einem Satz

**Ein tenantfähiges Familien-Stammbaum-Tool:** Jede Familie = ein Mandant. Jede Person = eine Seite (Foto, Text, Momente). Beziehungen (Eltern, Kinder, Partner, Geschwister) = der Baum. Modern, app-tauglich, für jede Familie skalierbar.

---

## Was wir von K2 mitnehmen

| K2 heute | K2 Familie |
|----------|------------|
| Tenant = Galerie (K2, ök2, VK2) | Tenant = **eine Familie** |
| Stammdaten (Personen) | **Personen** mit Beziehungen (Eltern, Kinder, Partner, Geschwister) |
| Werke (Bild + Titel + Beschreibung) | **Momente / Meilensteine** (Hochzeit, Geburt, Reise, Fotos, Geschichten) |
| Events | **Familien-Events** (Treffen, Feste, Geburtstage) |
| Dokumente | **Familien-Dokumente** (optional) |
| Eine Oberfläche, Admin + Anzeige | **Eine Oberfläche:** Stammbaum + Personen-Seiten + Momente |

**Neu:** Beziehungsmodell (wer ist mit wem wie verbunden), Stammbaum-Ansicht (grafisch oder Liste), Geburtstage/Jubiläen, Einladungen nur für die Familie.

---

## Sportwagen-Phasen (erste Skizze)

### Phase 1: Fundament – Datenmodell & eine Familie
- [ ] **1.1** Beziehungsmodell definieren: Person hat `parentIds`, `childIds`, `partnerId`, `siblingIds` (oder ein einfaches Schema). Eine Quelle (z. B. `familieStorage.ts` oder Erweiterung Stammdaten).
- [ ] **1.2** Ein Tenant „K2 Familie“ (oder erste Test-Familie) anlegen – gleiche Infrastruktur wie K2/ök2/VK2 (tenantId, Keys pro Familie).
- [ ] **1.3** Personen-Liste pro Familie speichern und laden (Name, Foto, Kurztext, Beziehungen).

### Phase 2: Erste UI – Stammbaum & Personen-Seite
- [ ] **2.1** Stammbaum-Ansicht (erst einfach: Liste oder Baum-Visualisierung). Klick auf Person → ihre Seite.
- [ ] **2.2** Personen-Seite: Foto, Text, „Meine Momente“ (wie Werke: Bild + Titel + Datum + Text). Jeder Mensch sichtbar.
- [ ] **2.3** Beziehungen im UI pflegbar (wer ist Mutter/Vater/Kind/Partner von wem).

### Phase 3: Momente & Events
- [ ] **3.1** „Momente“ pro Person (Hochzeit, Geburt, Umzug, …) – gleiche Struktur wie Werke, andere Semantik.
- [ ] **3.2** Familien-Events (Geburtstage, Treffen) aus Beziehungen ableiten oder manuell anlegen.
- [ ] **3.3** Kalender/Übersicht (optional).

### Phase 4: Skalierung & Produkt
- [ ] **4.1** Jede Familie = eigener Tenant (wie Galerie pro Künstler:in). Einladung/Lizenz pro Familie.
- [ ] **4.2** Doku, Onboarding, evtl. Lizenzmodell „K2 Familie“.

---

## Warum das groß werden kann

- **Jeder Mensch** will gesehen werden und sich ein wenig präsentieren.
- **Jede Familie** hat ähnliche Bedürfnisse: verbunden bleiben, Erinnerungen teilen, Überblick (wer gehört dazu, wer ist wer).
- **K2 hat die Basis:** Multi-Tenant, Personen, „Einträge“ (Werke/Momente), Events, eine Oberfläche. Wir bauen darauf auf, nicht von null.

---

## Nächster konkreter Schritt (Sportwagenmodus)

1. **Datenmodell** in einer Doku oder in Code festhalten: Person + Beziehungen (minimal: Eltern, Kinder, Partner).
2. **Erste Route** `/projects/k2-familie` mit Startseite (Vision, Link zu dieser Roadmap) – **erledigt mit Projektkarte + Startseite**.
3. **Erste Datenstruktur** für eine Familie (z. B. `k2-familie-mitglieder` oder pro Tenant `k2-familie-{tenantId}-personen`) und Beziehungen skizzieren.

---

*„Mir läuft es kalt über den Rücken, wenn ich mir vorstelle, was so ein Tool bewirken kann.“ – Georg, 01.03.26*
