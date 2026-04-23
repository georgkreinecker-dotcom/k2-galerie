# K2 Familie – Mandant & Code: **eine** Orientierung (gegen Dauer-Durcheinander)

**Zweck:** Wenn **zwei verschiedene „User“** (du + KI, oder Entwickler:in + Assistent) **nicht den richtigen Code** finden – liegt es selten an „Fehlsuche“, sondern daran, dass **in einer App mehrere Geschichten parallel** laufen. Diese Seite ist der **einzige Einstieg**: erst hier lesen, dann Datei öffnen.

---

## 1. Warum es sich anfühlt wie Dauer-Chaos

| Ursache | Konsequenz |
|--------|------------|
| **Gleiche App, zwei Demos** | **Huber** = fiktive Musterfamilie (`t=huber`). **Kreinecker** = eure Stammfamilie / Präsentation (`t=familie-…` + Vite-Env). **Gleiche Wörter** (Mandant, Familie, Stammbaum), **andere** Quelldateien. |
| **Drei „Wahrheiten“ für `t=`** | (1) URL `?t=` beim Besuch, (2) `localStorage` pro Mandant, (3) optional **Build-**Env für Board/Vercel. Ohne Karte wechselt man die Ebene, ohne es zu merken. |
| **Suche (grep) trifft altes und Neues** | `huber` findet 20+ Stellen, `Kreinecker` viele Texte **ohne** Code-Pfad, `tenant` ist überall. **Ohne** diese Tabelle = Ratespiel. |

---

## 2. **Eine Tabelle: Was brauche ich? → Welche Quelle?**

| Aufgabe / Frage | **Zuerst diese Datei** (eine Quelle) | Dann / Aufrufer |
|-----------------|-------------------------------------|-----------------|
| Muster-Demo **Huber** – Kette Link → Bilder → Seed | `src/data/k2FamilieMusterHuberQuelle.ts` | `familieHuberMuster.ts`, `pageContentFamilie.ts` (Fallback) |
| **Kreinecker** / Präsentationsboard / `t=` aus **Vite** (Stammbaum-URL) | `src/data/k2FamilieKreineckerStammbaumQuelle.ts` | `k2FamiliePresentation.ts`, `LaunchPraesentationBoardPage.tsx` |
| **APf localhost** – welche Familie ist „Zuhause“ ohne URL? | `src/config/k2FamilieApfDefaults.ts` (nutzt dieselbe Env-Reihenfolge wie oben) | `FamilieApfMeineFamilieSync.tsx`, `K2FamilieLayout.tsx` |
| **Aktueller Mandant** in der App (Session) | `src/context/FamilieTenantContext.tsx` | praktisch alle K2-Familie-Seiten |
| **Speicher-Keys** pro Familie | `docs/K2-FAMILIE-DATENMODELL.md` + `src/utils/familieStorage.ts` | – |
| Einladung / QR / `?t=` / `?z=` abarbeiten | `src/components/FamilieEinladungQuerySync.tsx` (+ `FamilieApfMeineFamilieSync.tsx`) | – |

**Nicht** vermischen: **Huber-Quelle** niemals mit **Kreinecker-Env** in einem Kopf – das sind **zwei** Kapitel derselben App.

---

## 3. Kurz-Suche (für KI & Mensch)

- Nur **Musterfamilie**-Logik: Dateiname `*Huber*` oder `k2FamilieMusterHuberQuelle`
- Nur **Kreinecker / Präsentation / Vite-Mandant**: `k2FamilieKreineckerStammbaumQuelle`, `k2FamiliePresentation`
- **Mandant allgemein**: `FamilieTenantContext`, `familieStorage`

---

## 4. Verknüpfung

- **Skalierung & Zusammengehörigkeit (viele Lizenznutzer:innen):** Antwort: Mandant = `tenantId` + getrennte Keys; Instanz/Domain trennt Kund:innen. Details siehe eure Doku/Dialog zur Skalierungs-Frage (kein einziges Mega-`localStorage` für alle).
- **Eiserne Regel Beziehungen:** `k2-familie-beziehungen-nur-aus-karten.mdc`, `K2-FAMILIE-BEZIEHUNGEN-QUELLE-WAHRHEIT.md`
- **Raumschiff-Kriterien (M3/M4/M6/M8) zur Mandanten-Absicherung:** `K2-FAMILIE-RAUMSCHIFF-KRITERIEN-UND-SELBSTKLAERUNG.md` – Abschnitt **1a**

---

*Diese Datei bewusst **kurz** – erweitern nur, wenn eine **neue** parallele Quelle dazukommt; dann **hier** eine Zeile, nicht dritte Stelle im Handbuch.*
