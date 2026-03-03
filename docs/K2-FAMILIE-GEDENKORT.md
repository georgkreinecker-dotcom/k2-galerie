# K2 Familie – Gedenkort (Konzept)

**Stand:** 02.03.26  
**Quelle:** Georg – ein Ort, um derer zu gedenken, die uns vorausgegangen sind: „die ewige Heimat, dorthin woher wir gekommen sind und wohin wir zurückgehen – der Ort der Sehnsucht und der Ungewissheit“. Möglichkeit, Blumen oder anderes, was uns wichtig ist, zu hinterlassen.

---

## 1. Der Ort

- **Eigene Seite/Bereich** in K2 Familie, z. B. **„Die uns vorausgegangen sind“** oder **„In Gedenken“**.
- In der Navigation sichtbar (neben Stammbaum, Events, Kalender) – ruhig, würdig, ohne religiöse Symbolik (Grundbotschaft).
- Zeigt **nur Personen, die als verstorben markiert sind** (siehe Datenmodell unten).

---

## 2. Wer wird gezeigt

- **Personen-Feld:** `verstorben?: boolean`, optional `verstorbenAm?: string` (Datum).
- Auf dem Gedenkort: Foto, Name, optional Sterbedatum, Kurztext – pro Person eine kleine Erinnerungsseite oder gemeinsame „Wand“.

---

## 3. Gaben hinterlassen

Nutzer:innen können **etwas hinterlassen** – Blumen, Kerze, Text, Foto von etwas Wichtigem.

- **Art:** z. B. Blume, Kerze, Text, Foto (Symbol oder hochgeladenes Bild).
- **Inhalt:** optional kurzer Text und/oder Bild-URL.
- **Von wem:** optional (Name oder anonym).
- **Sichtbarkeit (wichtig):**
  - **Privat:** Eintrag nur für die Person sichtbar, die ihn angelegt hat – **niemand sonst sieht ihn.** Ganz persönlich, nur für mich.
  - **Öffentlich:** Eintrag ist für alle sichtbar, die Zugang zur Familie haben – geteiltes Gedenken.

Technisch pro Gabe: `personId` (für wen / bei wem), `type`, `content`, `createdBy` (optional), `createdAt`, **`sichtbarkeit: 'privat' | 'oeffentlich'`**. Bei Anzeige: private Gaben nur dem Verfasser anzeigen (z. B. anhand Session/Login oder gespeicherter „meine Einträge“-Zuordnung).

---

## 4. Ton

Leise, würdig – keine Punkte, keine Belohnungen. Formulierungen wie „Blume hinterlassen“, „Kerze anzünden“, „Etwas in Erinnerung teilen“. Ort der Sehnsucht und der Ungewissheit bleibt respektvoll im Vordergrund.

---

## 5. Datenmodell (für spätere Umsetzung)

- **Person (Erweiterung):** `verstorben?: boolean`, `verstorbenAm?: string` (ISO-Datum).
- **Gabe / Gedenkeintrag:**  
  `id`, `personId` (verstorbene Person), `type` (z. B. `blume` | `kerze` | `text` | `foto`), `content` (Text und/oder Bild-URL), `createdBy` (optional, Anzeigename oder User-Kennung), `createdAt`, **`sichtbarkeit: 'privat' | 'oeffentlich'`**.

Speicher z. B. `k2-familie-{tenantId}-gaben` oder `k2-familie-{tenantId}-gedenken`. Lade/Schreib über `familieStorage.ts` mit gleichen Schutzregeln wie üblich.

---

## 6. Roadmap

Siehe **docs/K2-FAMILIE-ROADMAP.md** – Phase 5 (Gedenkort).

---

*„Ein Ort, um an die zu gedenken, die uns schon vorausgegangen sind – in die ewige Heimat, dorthin woher wir gekommen sind und wohin wir zurückgehen. Die Möglichkeit, Blumen zu hinterlassen oder anderes, was uns wichtig ist. Vielleicht ein ganz persönlicher Eintrag, den niemand sieht – und einer, der öffentlich ist.“ – Georg, 02.03.26*
