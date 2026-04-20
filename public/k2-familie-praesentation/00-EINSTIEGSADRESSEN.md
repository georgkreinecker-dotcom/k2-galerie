# Einstiegsadressen – Prospekte, Postings, QR

**Eine Quelle:** Alle sichtbaren Links und gedruckten QR für **K2 Familie** beziehen sich auf dieselbe **Produktions-Basis**. Technische Quelle im Code: `DEFAULT_PUBLIC_APP_URL` / `APP_BASE_URL_SHAREABLE` in `src/config/externalUrls.ts` (aktuell Vercel).

## Produktions-Basis

| | |
|---|--|
| **Host** | `https://k2-galerie.vercel.app` |
| **Nur Pfad** (gleiche Origin, z. B. am Mac in der App) | jeweils Spalte **Pfad** unten – ohne Domain |

---

## Tabelle – Zweck, Pfad, Voll-URL

| Zweck | Pfad | Voll-URL |
|--------|------|----------|
| **Öffentlicher Marketing-Einstieg** – Flyer, Social, „Was ist K2 Familie?“ | `/projects/k2-familie/willkommen` | `https://k2-galerie.vercel.app/projects/k2-familie/willkommen` |
| **Musterfamilie Huber** – direkt in die App (Demo, Pilot:innen) | `/projects/k2-familie/meine-familie?t=huber` | `https://k2-galerie.vercel.app/projects/k2-familie/meine-familie?t=huber` |
| **Einstieg B** – Umschau-Text zur Musterfamilie (explizit Huber) | `/projects/k2-familie/einstieg?t=huber` | `https://k2-galerie.vercel.app/projects/k2-familie/einstieg?t=huber` |
| **Präsentationsmappe (Kunde)** – zum Übergeben, ohne interne Vertriebstexte | `/projects/k2-familie/praesentationsmappe-kunde` | `https://k2-galerie.vercel.app/projects/k2-familie/praesentationsmappe-kunde` |
| **Vertriebsunterlagen** – Kurzprospekt, Prospekt, FAQ, Drehbuch (intern) | `/projects/k2-familie/praesentationsmappe` | `https://k2-galerie.vercel.app/projects/k2-familie/praesentationsmappe` |
| **Marketing & Leitbild** – Konzept in der App | `/projects/k2-familie/marketing` | `https://k2-galerie.vercel.app/projects/k2-familie/marketing` |
| **Benutzerhandbuch** – eigenständige Lesefassung | `/k2-familie-handbuch` | `https://k2-galerie.vercel.app/k2-familie-handbuch` |
| **Projekt-Start** – Übersicht unter K2 Familie (APf) | `/projects/k2-familie` | `https://k2-galerie.vercel.app/projects/k2-familie` |
| **Lizenz erwerben** – Stripe-Einstieg | `/projects/k2-familie/lizenz-erwerben` | `https://k2-galerie.vercel.app/projects/k2-familie/lizenz-erwerben` |

---

## Nicht für Massen-Flyer

**Einladung in eine konkrete Familie** (`?t=…`, `?z=…`, ggf. `?m=…`) kommt **individuell** aus der App: **Einstellungen → Verwaltung** (Zugangsnummer, QR Familie, persönlicher QR). Diese URLs gehören **nicht** auf allgemeine Prospekte.

---

## QR und Stand

- **In der App** erzeugte QR für Familien-Einladungen nutzen **Server-Stand + Cache-Bust** (`buildQrUrlWithBust`) – Projektregel wie bei der Galerie.
- **Gedruckte** QR auf Prospekten: feste **Voll-URL** aus der Tabelle reicht; bei Host-Wechsel diese Datei und alle Druckvorlagen anpassen.

---

**Stand:** technisch gebunden an `externalUrls.ts`. Bei neuer öffentlicher Route: Tabelle und `PROJECT_ROUTES['k2-familie']` in `src/config/navigation.ts` mitpflegen.
