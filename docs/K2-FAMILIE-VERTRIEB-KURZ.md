# K2 Familie – Vertrieb Kurz (Meta)

**Zweck:** Einordnung und Verweise – **kein** zweiter Langtext neben dem Kurzprospekt.

## Einstiegsadressen für Prospekte und Postings

- **Eine Quelle:** [public/k2-familie-praesentation/00-EINSTIEGSADRESSEN.md](../public/k2-familie-praesentation/00-EINSTIEGSADRESSEN.md) – Pfade, Voll-URLs, Produktions-Basis; technisch `src/config/externalUrls.ts`.

## Lesefassung für Druck und Gespräche

- **Eine Quelle für den Text:** [public/k2-familie-praesentation/01-KURZPROSPEKT-VERTIEB.md](../public/k2-familie-praesentation/01-KURZPROSPEKT-VERTIEB.md)
- **In der App (Lesen, Sidebar, Druck):** Route `PROJECT_ROUTES['k2-familie'].familiePraesentationsmappe` → `K2FamiliePraesentationsmappePage` mit `BenutzerHandbuchViewer`, Basis `public/k2-familie-praesentation/`.

## Strategische Einordnung

- Übergeordnet: **docs/MARKETING-STRATEGIE-AUTOMATISIERTER-VERTRIEB.md** (Zweig K2 Familie).
- Parallele zur Galerie-Prospekt-Logik: **docs/K2-GALERIE-PRAESENTATIONSMAPPE.md** – aber **inhaltlich nur Familie**, keine Galerie-/ök2-Slogans auf K2 Familie.
- Moralisches Fundament: **docs/K2-FAMILIE-GRUNDBOTSCHAFT.md**

## mök2

- Sektion **K2 Familie – Kurzprospekt (Vertrieb)** mit Link zur App-Route; `returnTo` auf Marketing ök2 für „Zurück“.
