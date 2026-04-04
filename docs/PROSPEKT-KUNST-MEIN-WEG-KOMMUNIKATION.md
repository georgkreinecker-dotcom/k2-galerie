# Prospekt & Pitch: Kunst präzise + Mein Weg sichtbar

**Zweck:** Festhalten, was bei **Prospekt**, **Präsentationsmappe** und **Pitch** zusammengehört — damit es zwischen Sessions und im Team **reproduzierbar** bleibt (Georg: „unbedingt merken“).

---

## 1. Kunst – spezieller Hinweis (Formulierung)

**Nicht** generisches Web- oder „Content“-Vokabular für **Werke** und **Galerie** verwenden.

**Stattdessen bewusst:** **Werke**, **Künstler:innen und Künstler**, **Kunstgalerien**, **Vernissage**, **Etikett am Objekt**, **Urheberschaft**, **Preis**, **Verfügbarkeit**, **Substanz** — **kein** bloßes „Assets“ oder „Content-Management“.

**Referenz-Text (Lesefassung):** `public/praesentationsmappe-vollversion/02B-PROSPEKT-ZUKUNFT.md` — Abschnitt **„Vom Atelier zum gesamten Markt“** und der **Übergangssatz** (Kunst nicht zur Fußnote; Skalieren = vervielfältigen, nicht verwässern).

---

## 2. Mein Weg & sechs Sparten – immer mitkommunizieren

Wenn **Marktweite**, **gesamter Markt** oder **Plattform** genannt werden, darf **Mein Weg** nicht fehlen — sonst wirkt die Breite wie ein **Geheimnis** statt wie ein **Angebot**.

| Begriff | Bedeutung |
|--------|-----------|
| **Mein Weg** | In den **Stammdaten** wählt die Person **eine von sechs Sparten** → steuert u. a. **Werktypen**, **Kategorien**, **Galerie-Filter**, **viele Texte**. |
| **Sechs Sparten** | **Kunst & Galerie**, **Handwerk & Manufaktur**, **Design & Möbel**, **Mode & Kleinserien**, **Food & Genuss**, **Dienstleister & Portfolio**. |
| **Eine Quelle im Code** | `FOCUS_DIRECTIONS` in `src/config/tenantConfig.ts` — keine parallele Liste erfinden. |
| **Vertiefung für Gespräch / PDF** | **Marketing ök2** in der App: `/mok2` — Kapitel **Leitvision – Mein Weg & sechs Sparten**. |

**Merksatz:** **Für die Kunst definiert und formuliert — für den Markt über Mein Weg skalierbar.**

**Kunst bleibt:** Einstieg, Herkunft, Referenz — **nicht** die **Grenze** des Produkts.

---

## 3. Wo pflegen?

- **Prospekt (Vollversion):** `public/praesentationsmappe-vollversion/02B-PROSPEKT-ZUKUNFT.md` — eigener Abschnitt **Mein Weg**.
- **Kurzform Mappe:** `src/pages/PraesentationsmappePage.tsx` (Subtitle), `src/utils/praesentationsmappeKurzHtml.ts`.
- **mök2:** `src/pages/MarketingOek2Page.tsx`, `src/config/mok2Structure.ts`.

---

*Stand: 04.04.26 — Anlass: Prospekt 02B; Ergänzung Mein Weg / Sparten.*
