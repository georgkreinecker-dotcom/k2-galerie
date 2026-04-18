# Testuser & Pilot – einfach organisieren (End-to-End)

**Ziel:** Wenig Seiten im Kopf, ein roter Faden, Nummerierung ab 10, Qualität per Automatik wo möglich.

---

## 1. Ein Einstieg für dich (APf)

| Was | Wo (eine Route) |
|-----|------------------|
| **Alles zu Testuser/Pilot an einem Ort** | **Testuser-Mappe** → `/testuser-anmeldung` (aus Smart-Panel, Mission Control, Plattform-Start oder Texte-Schreibtisch verlinkt) |

Dort: interner **Katalog**, Anmeldetext, Links zu Zetteln/Testprotokoll – **nicht** jede Hilfeseite einzeln merken.

---

## 2. Der kurze Ablauf (drei Schritte)

1. **Neuer Pilot:** `/zettel-pilot-form` → Name, App-Name, Linie → **Laufzettel generieren** → `/zettel-pilot?…`
2. **Zettel** ausdrucken / mitgeben; nach Öffnen des Zettels erscheint der Eintrag **mit Zugangsblatt-Link** in der Testuser-Mappe (automatisch).
3. **Testen:** Protokoll-Vorlagen in der Mappe verlinkt; Handbuch „Testuser“ bei Bedarf.

**Zähler:** Nächste Zettel-Nr. startet bei **10** (siehe unten). Ältere kleine Nummern im Browser-Speicher werden beim nächsten Zettel auf mindestens 10 angehoben.

---

## 3. Automatik (ohne dass du testest)

| Was | Befehl / Ort |
|-----|----------------|
| **Katalog-Logik** (Seed, Registrierung, Upsert) | `npm run test -- --run src/tests/testuserKatalogStorage.test.ts` |
| **Volle Qualität vor Push** | `npm run test` und `npm run build` (wie Vercel) |

**E2E im Browser (Playwright):** im Projekt vorhanden – **ausbaubar** für einen durchgängigen Klick-Pfad (Formular → Zettel). Bis das fest verdrahtet ist: die Unit-Tests oben + manuell einmal der Drei-Schritte-Ablauf reichen als „Ende-zu-Ende“-Sicherheit für die Datenlogik.

---

## 4. Nur wenn du wirklich „von null“ mit Zähler willst

Im Browser (einmal): Entwicklertools → **Application** → **Local Storage** → Key **`k2-pilot-zettel-last-nr`** löschen.  
Nächster Aufruf des Formulars schlägt wieder **10** vor (oder höher, je nach Logik `Math.max`).

---

## 5. Die drei „Rest“-Piloten

In der Mappe als Zeilen **Bestehender Pilot 1–3** – Platzhalter. Namen, App und **Zugangsblatt** dort eintragen **oder** echte Zettel über Schritt 1 erzeugen (dann neue Zeilen mit Nummer ≥ 10).

---

*Kurz: **Eine Mappe**, **ein Formular**, **ein Zettel** – Rest ist KI/Tests + optional später Playwright.*
