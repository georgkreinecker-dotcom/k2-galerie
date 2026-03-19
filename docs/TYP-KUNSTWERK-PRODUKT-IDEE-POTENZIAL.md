# Typ (Kunstwerk / Produkt / Idee) – Potenzial ausschöpfen

**Stand:** 19.03.26 – Georg: „Irgend etwas passt mir da bei dieser Typ-Geschichte, da ist noch mehr drin, da schöpfen wir unser Potential noch nicht aus.“

---

## Wo Typ heute vorkommt

| Ort | Was passiert |
|-----|--------------|
| **Konfiguration** | `ENTRY_TYPES` in tenantConfig (artwork, product, idea); `getEntryTypeLabel`, `getCategoriesForEntryType`, Nummernlogik P/I. |
| **Admin – Filter (nur ök2)** | Dropdown „Typ“ (Alle / Kunstwerk / Produkt / Idee); bei „Idee“ Hinweis „Was möchtest du präsentieren?“ |
| **Admin – Neues Werk / Bearbeiten** | Dropdown „Typ“; Kategorien je nach Typ (Malerei/… vs. Serie/Konzept/…). |
| **Admin – Werkliste** | Typ-Badge pro Werk (Kunstwerk / Produkt / Idee). |
| **Werkkatalog** | Spalte „Typ“, Export, Detailansicht. |
| **Galerie (öffentlich)** | In der Vision: eine Oberfläche für alle – aktuell auf den **Karten** für Besucher wird der Typ **nicht** als Filter oder Badge angeboten. |
| **mök2 / Werbeunterlagen** | „Kunstwerk, Produkte, Ideen – alles in einer Oberfläche“ in Genaue Produktbeschreibung; Vision zitiert. |
| **K2** | Kein Typ-Filter (nur Kategorien M/K/G/S/O); Neues Werk standardmäßig Kunstwerk. |

---

## Mögliche Hebel (Potential ausschöpfen)

### 1. **Eine Beschreibung pro Typ (konfigurierbar)**

- Heute: Nur „Idee“ hat einen fest eingebauten Hinweis („Was möchtest du präsentieren?“).
- **Mehr:** In `ENTRY_TYPES` pro Typ ein optionales Feld `description` oder `hint` (z. B. Idee: „Was möchtest du präsentieren?“, Produkt: „Was bietest du an?“). Eine Quelle – Filter-Leiste, Modal „Neues Werk“, ggf. Galerie-Tooltip.

### 2. **Galerie für Besucher: Typ sichtbar oder filterbar**

- Heute: Besucher sehen Karten ohne Filter „Nur Ideen / Nur Produkte“; Typ-Badge auf Karten optional.
- **Mehr:** Auf der öffentlichen Galerie (ök2, ggf. spätere Lizenznehmer) Typ als **Filter** („Ideen“, „Produkte“, „Kunstwerke“) oder als **Badge auf der Karte** – dann wird die Vision „eine Galerie, alles in einer Oberfläche“ für den Besucher erlebbar.

### 3. **Willkommen / Onboarding beim ersten „Idee“ oder „Produkt“**

- Beim ersten Anlegen eines Werks mit Typ „Idee“ oder „Produkt“ einen kurzen Satz aus der Vision anzeigen (z. B. „Kunst = Träger der Idee – der ganze Markt hat Platz.“) oder Link zu einer kurzen Erklärung. So wird die Idee hinter den Typen genutzt.

### 4. **mök2 / Präsentationsmappe: Dreiklang klar machen**

- Die drei Typen in Werbeunterlagen und Präsentationsmappe als **Dreiklang** nutzen: je ein kurzer Satz, was „Kunstwerk“, „Produkt“, „Idee“ für den Nutzer bedeutet (z. B. Idee = „Was möchtest du präsentieren?“). Eine Stelle, von der alle Texte (Filter, Modal, Doku) gespeist werden.

### 5. **K2 später: gleiche Typ-Logik wie ök2**

- Heute: K2 nur Kunstwerk-Kategorien (M/K/G/S/O), kein Typ-Filter.
- **Später:** Wenn du willst, in K2 dieselbe Typ-Auswahl (Kunstwerk / Produkt / Idee) und dieselbe Filter-/Beschreibungs-Logik wie in ök2 – dann schöpfen wir das Modell auch für die echte Galerie aus, ohne Sonderbau.

### 6. **Nummern & Kategorien prüfen**

- Sicherstellen, dass überall wo „Typ“ eine Rolle spielt (Nummern P/I, Kategorien Serie/Konzept, Filter), eine Quelle (`getCategoriesForEntryType`, `getEntryTypeLabel`, ggf. `getEntryTypeDescription`) genutzt wird – kein zweiter, versteckter Ablauf.

---

## Nächster Schritt (mit dir)

- **Priorität setzen:** Welcher der Punkte (1–6) ist dir zuerst wichtig? Oder hast du eine andere Richtung (z. B. Formulierung „meine Idee“ vs. „Idee“)?
- **Dann:** Schritt für Schritt umsetzen – eine Quelle pro Sache, kein Sonderbau (siehe VISION-WERKE-IDEEN-PRODUKTE.md).

---

**Verknüpfung:** docs/VISION-WERKE-IDEEN-PRODUKTE.md, tenantConfig ENTRY_TYPES, Admin Filter/Modal, Werke verwalten.
