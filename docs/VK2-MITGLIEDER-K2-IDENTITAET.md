# VK2-Mitglieder mit K2-Identität: eigenes Erscheinungsbild + 5 Werke

**Stand:** 19.02.26  
**Idee:** Jedem VK2-Mitglied eine echte **K2-Identität** geben – eigene Galerie mit **differenziertem Erscheinungsbild** (modern bis klassisch) und **5 Seed-Werken**.

---

## Bewertung der Idee

**Sehr sinnvoll**, weil:

1. **Klare Positionierung:** Jedes Mitglied ist nicht nur „Eintrag im Verein“, sondern hat eine eigene, nutzbare Galerie – echte K2-Identität.
2. **Sofort nutzbar:** Mit 5 Werken und eigenem Design wirkt jede Galerie seriös und individuell; Mitglieder können sofort zeigen, was die Plattform kann.
3. **Vermarktung:** Unterschiedliche Designs (modern bis klassisch) demonstrieren die Bandbreite der K2 Galerie und sprechen unterschiedliche Geschmäcker an.
4. **Brücke zu ök2:** Diese Mitglieder-Galerien können als „ök2-Nutzer“ genutzt werden – Link in VK2 (`galleryUrl`) führt zur eigenen K2-Identität.
5. **Technisch machbar:** Pro Mitglied ein eigener Datensatz (Werke, Design); Routen und Keys sind erweiterbar.

---

## Konzept im Überblick

| Aspekt | Inhalt |
|--------|--------|
| **K2-Identität** | Pro VK2-Mitglied: eigene Galerie-„Instanz“ mit eigenem Design, eigenen 5 Werken, Stammdaten aus Mitglied (Name, Vita, Kontakt). |
| **Erscheinungsbild** | 4–5 **Design-Varianten** (Presets): z. B. **Modern**, **Klassisch**, **Minimal**, **Warm** (K2-Orange), **Sage** (ök2-Teal). Pro Mitglied wird eine Variante zugewiesen (rotierend oder nach Kunstbereich). |
| **5 Werke** | Pro Mitglied **5 Seed-Werke**, passend zum **Kunstbereich** des Mitglieds (Malerei, Keramik, Grafik, …). Unterschiedliche Titel und Bilder (aus bestehenden VK2/ök2-Bildquellen), einheitlich 5 pro Mitglied. |
| **Speicher** | Pro Mitglied eigene Keys, z. B. `k2-vk2-member-<memberId>-artworks`, `k2-vk2-member-<memberId>-design-settings`, optional `k2-vk2-member-<memberId>-page-texts`. Stammdaten können aus VK2-Mitglied (Name, Vita, Kontakt) gelesen werden. |
| **Routen** | Z. B. `/projects/vk2/galerie/member/:memberId` oder `/projects/vk2/member/:memberId` = Galerie dieses Mitglieds. `galleryUrl` im VK2-Mitglied zeigt auf diese URL. |

---

## Design-Varianten (modern bis klassisch)

Vorschlag für **5 feste Presets** (in Config/Theme ablegen):

| Id | Name | Kurz | Hintergrund | Akzent | Einsatz |
|----|------|-----|-------------|--------|--------|
| `modern` | Modern | Hell, klar, viel Weiß | #f8f9fa, #e9ecef | #0d6efd (Blau) | Sachlich, zeitgenössisch |
| `klassisch` | Klassisch | Warm, Creme, gediegen | #f6f4f0, #ebe7e0 | #5a7a6e (Sage/ök2) | Traditionell, ruhig |
| `minimal` | Minimal | Sehr hell, reduziert | #ffffff, #f5f5f5 | #2d2d2a (Schwarz) | Reduziert, Typo-fokussiert |
| `warm` | Warm | Dunkel, Orange (K2) | #1a0f0a, #2d1a14 | #ff8c42 (K2-Orange) | Atmosphärisch, Galerie-Feeling |
| `kontrast` | Kontrast | Dunkel mit kräftigem Akzent | #1a1a2e, #16213e | #e94560 (Rot) oder #00d9ff | Mutig, künstlerisch |

- Jedes Mitglied bekommt **eine** dieser Varianten (z. B. nach Index: Mitglied 1 → modern, 2 → klassisch, … oder nach Kunstbereich zugeordnet).
- Beim **Anlegen** der K2-Identität wird das Preset gespeichert (`k2-vk2-member-<id>-design-settings`); Mitglied kann später im „eigenen“ Admin (falls wir das anbieten) anpassen.

---

## 5 Werke pro Mitglied

- **Anzahl:** Genau **5 Werke** pro Mitglied.
- **Inhalt:** Abgeleitet aus dem **Kunstbereich** des Mitglieds (`category` in VK2: malerei, keramik, grafik, skulptur, fotografie, textil, sonstiges).
  - Alle 5 Werke in **demselben** Kunstbereich (oder 3 Hauptbereich + 2 aus Nachbarkategorien – je nach gewünschter Variante).
- **Daten:** Titel variieren (z. B. „Landschaft 1“, „Abstrakt 2“, „Porträt 3“ für Malerei; „Gefäß 1“, „Schale 2“ für Keramik). Bilder aus **bestehenden** Quellen: `VK2_DEFAULT_IMAGE[category]` oder OEK2/Unsplash-URLs pro Kategorie (schon vorhanden).
- **Nummerierung:** z. B. `VK2-<Mitglied-Kurz>-1` bis `-5` (z. B. VK2-Lina-1 … VK2-Lina-5) oder schlicht M1–M5 pro Mitglied.
- **Speicher:** Beim **ersten Aufruf** der Mitglieder-Galerie (oder beim „K2-Identität anlegen“ im Admin): Wenn `k2-vk2-member-<memberId>-artworks` leer ist, **Seed** mit 5 Werken schreiben (wie bei SEED_VK2_ARTISTS / MUSTER_ARTWORKS).

---

## Technische Umsetzung (Stichpunkte)

1. **Config**
   - Neue Datei oder Abschnitt in `tenantConfig.ts`: **VK2_MEMBER_THEME_PRESETS** (Array der 5 Design-Varianten mit id, name, colors).
   - **Hilfsfunktion:** `getSeedArtworksForMember(memberId, category, memberName)` → 5 Werke mit Titeln/Bildern für diesen Kunstbereich.

2. **Storage**
   - Keys: `k2-vk2-member-<memberId>-artworks`, `k2-vk2-member-<memberId>-design-settings`.
   - Optional: `k2-vk2-member-<memberId>-page-texts` (oder aus VK2-Stammdaten + Mitgliedsname ableiten).
   - Beim ersten Laden der Mitglieder-Galerie: wenn artworks leer → Seed (5 Werke + Design-Preset gemäß Zuweisung).

3. **Routen**
   - Neue Route z. B. `/projects/vk2/member/:memberId` oder `/projects/vk2/galerie/member/:memberId`.
   - Seite lädt Mitglied aus `getVk2Customers()` (by id), dann Werke aus `k2-vk2-member-<memberId>-artworks`, Design aus `k2-vk2-member-<memberId>-design-settings`. Wenn leer → Seed auslösen, dann anzeigen.

4. **VK2-Mitglied verknüpfen**
   - `galleryUrl` im VK2-Mitglied = Link zu dieser Galerie (z. B. `/projects/vk2/member/<memberId>`).
   - Im Admin (VK2): Button „K2-Identität anlegen“ pro Mitglied → schreibt Seed (5 Werke + Design), setzt `galleryUrl`.

5. **Design-Zuweisung**
   - Entweder **rotierend:** Mitglied 1 → modern, 2 → klassisch, 3 → minimal, 4 → warm, 5 → kontrast, 6 → modern, …
   - Oder **nach Kunstbereich:** z. B. Malerei → warm, Keramik → klassisch, Grafik → modern, Fotografie → minimal, … (einmal festlegen).

---

## Nächste Schritte (Reihenfolge)

1. **Design-Presets** in Config definieren (5 Varianten modern → klassisch).
2. **Seed-Logik** für 5 Werke pro Mitglied (Funktion + Kunstbereich → 5 Werke mit Titeln/Bildern).
3. **Storage-Keys** und Lade-/Seed-Logik für `k2-vk2-member-<id>-*`.
4. **Route** `/projects/vk2/member/:memberId` (oder gewählte URL) + Seite, die Mitglied + Werke + Design lädt (und bei leerem Werke-Seed schreibt).
5. **Admin:** „K2-Identität anlegen“ pro Mitglied (Seed schreiben, `galleryUrl` setzen).
6. **Optional:** Übersichtsseite „Alle Mitglieder-Galerien“ (Liste mit Link zu jeder Mitglieder-Galerie).

Wenn du möchtest, können wir mit **Design-Presets + Seed für 5 Werke** starten und danach die Route und das erste Mitglieder-Galerie-Seite bauen.
