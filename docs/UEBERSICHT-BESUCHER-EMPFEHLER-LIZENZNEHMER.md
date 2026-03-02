# Übersicht: Besucher, Empfehler, Lizenznehmer

**Stand:** 02.03.26  
**Zweck:** Eine Stelle, an der du den Überblick hast: Besucher (K2, ök2, VK2), Empfehler (ök2/VK2), ganze Lizenznehmer-Geschichte. Ist-Stand und Vorschlag.

---

## Was du brauchst (deine Frage)

- **Überblick über Besucher** bei K2 (deine Galerie), bei ök2 (Demo), bei VK2 (Verein).
- **Überblick über Empfehler** bei ök2 und VK2 (wer hat geworben, wie viel Gutschrift).
- **Ganze Lizenznehmer-Geschichte** (wer hat wann welche Lizenz – manuell oder online, mit/ohne Empfehler).

---

## Ist-Stand (heute)

| Thema | Wo heute | Was fehlt |
|-------|----------|-----------|
| **Lizenznehmer** | **Lizenzen-Seite** (LicencesPage): „Aktive Lizenzen“ (manuell vergeben) + „Online gekaufte Lizenzen & Abrechnung“ (Supabase). Zwei getrennte Blöcke. | **Eine zusammengeführte Sicht:** alle Lizenzen (manuell + online) in einer Liste/Zeitleiste – „ganze Geschichte“. |
| **Empfehler** | Auf der Lizenzen-Seite: Tabellen „Lizenzen“, „Zahlungen“, „Gutschriften“ – pro Zeile steht eine Empfehler-ID. | **Empfehler-Übersicht:** pro Empfehler-ID **zusammengefasst**: wie viele geworbene Lizenzen, Summe Gutschrift (€). So siehst du auf einen Blick, wer wie viel bringt. |
| **Besucher (K2, ök2, VK2)** | **Nicht erfasst.** Es gibt kein Besucher-Tracking (keine Analytics, keine Zugriffszahlen). | **Entweder:** Hinweis „aktuell nicht erfasst“ + Option später (Vercel Analytics, Plausible o. ä.). **Oder:** später ein einfaches Tracking pro Kontext (K2 / ök2 / VK2) und Anzeige in der Übersicht. |

---

## Vorschlag: Eine Stelle für den Überblick

**Prinzip:** Alles, was mit Lizenzen, Empfehlung und (später) Besuch zu tun hat, an **einer** Stelle – dann musst du nicht an mehreren Orten suchen.

### Option A (empfohlen): Lizenzen-Seite ausbauen

Die **Lizenzen-Seite** bleibt die Heimat für Lizenzen und Abrechnung. Darauf **zwei zusätzliche Blöcke**:

1. **Lizenznehmer-Geschichte (alle)**  
   - Eine Liste/Zeitleiste: **alle** Lizenzen (manuell + online), sortiert nach Datum.  
   - Pro Zeile: Datum, Name, E-Mail, Lizenztyp, Herkunft („manuell“ / „online“), Empfehler-ID falls vorhanden.  
   - Optional: Filter nach Lizenztyp, nur mit Empfehler, Zeitraum.  
   - So hast du die **ganze Lizenznehmer-Geschichte** an einem Ort.

2. **Empfehler-Übersicht**  
   - Aus den vorhandenen Daten (online Lizenzen + Zahlungen + Gutschriften, plus manuell vergebene mit Empfehler-ID) **pro Empfehler-ID** auswerten:  
     - Anzahl geworbener Lizenzen  
     - Summe Gutschrift (€)  
   - Anzeige z. B. als Tabelle: Empfehler-ID | Anzahl Lizenzen | Summe Gutschrift (€).  
   - Gilt für ök2 und VK2 gleichermaßen (Empfehler-Daten sind global).

3. **Besucher (K2, ök2, VK2)**  
   - **Kurzfristig:** Ein kurzer Hinweis auf der gleichen Seite (oder in der Übersicht):  
     „Besucher (Zugriffe) werden aktuell nicht erfasst. Bei Bedarf können wir z. B. Vercel Analytics oder Plausible einbinden (Datenschutz beachten).“  
   - **Später (optional):** Wenn du Besucherzahlen willst: Analytics einbinden (z. B. Vercel oder Plausible), dann Link zum Dashboard oder kleine Anzeige (pro Kontext: K2 / ök2 / VK2) in dieser Übersicht.

**Vorteil:** Du hast **eine** Seite (Lizenzen), auf der du: Lizenzen vergibst, Online-Abrechnung siehst, **Lizenznehmer-Geschichte** siehst, **Empfehler-Übersicht** siehst und (später) Hinweis/Link zu **Besuchern**.

### Option B: Eigene Seite „Übersicht“

Statt die Lizenzen-Seite zu erweitern: neue Route z. B. **/platform/uebersicht** oder **/projects/k2-galerie/uebersicht** mit drei Blöcken:

- Lizenznehmer-Geschichte (alle)
- Empfehler-Übersicht
- Besucher (Hinweis / später Link oder Zahlen)

Lizenzen-Seite bleibt unverändert; von APf/DevView aus verlinkst du auf „Übersicht“. Dann hast du **zwei** Orte (Lizenzen + Übersicht); dafür ist die Lizenzen-Seite nicht voller.

**Empfehlung:** Option A – alles auf der Lizenzen-Seite, dann wirklich **ein** Ort für Lizenzen, Abrechnung, Lizenznehmer-Geschichte und Empfehler. Besucher nur als Hinweis bzw. später optional.

---

## Besucher: K2 vs. ök2 vs. VK2

Falls du später Besucherzahlen willst:

- **K2:** Besucher deiner echten Galerie (z. B. Aufrufe von /galerie oder deiner Domain).
- **ök2:** Besucher der Demo (z. B. /galerie-oeffentlich, /willkommen).
- **VK2:** Besucher der Vereinsgalerie (z. B. /projects/vk2/galerie).

Technisch: Entweder ein Analytics-Dienst (Vercel, Plausible, Matomo), der nach Pfad/Quelle filtert, oder eigenes minimales Logging (Datum, Kontext, keine personenbezogenen Daten). Datenschutz (DSGVO, Einwilligung wenn nötig) muss geklärt werden. Für den **Überblick** reicht zunächst der Hinweis „noch nicht erfasst“ und die Option, später etwas einzubinden.

---

## Kurzfassung

| Was | Wo (Vorschlag) | Umsetzung |
|-----|----------------|-----------|
| **Lizenznehmer-Geschichte (alle)** | Lizenzen-Seite, neuer Block „Lizenznehmer-Geschichte“ | Liste aus manuell + online, sortiert nach Datum, mit Herkunft und Empfehler. |
| **Empfehler-Übersicht** | Lizenzen-Seite, neuer Block „Empfehler-Übersicht“ | Pro Empfehler-ID: Anzahl geworbene Lizenzen, Summe Gutschrift (€); Daten kommen aus bestehenden Tabellen. |
| **Besucher (K2, ök2, VK2)** | Gleiche Seite: Hinweis „aktuell nicht erfasst“; optional später Analytics oder kleines Tracking | Zunächst nur Text; später bei Bedarf Vercel Analytics / Plausible oder eigene Anzeige. |

**Eine Stelle:** Lizenzen-Seite = Lizenzen vergeben + Online-Abrechnung + **Lizenznehmer-Geschichte** + **Empfehler-Übersicht** + Hinweis **Besucher**.

Wenn du willst, kann als nächster Schritt die **Empfehler-Übersicht** (aggregierte Tabelle) und die **Lizenznehmer-Geschichte (kombinierte Liste)** auf der Lizenzen-Seite umgesetzt werden; Besucher nur der Hinweis, bis du dich für eine Lösung entscheidest.

---

## Wie ein Profi es macht: Board statt Zettelwirtschaft

**Idee:** Ein **Board** (eine Seite), das sich wie der Stammbaum bei K2 Familie anfühlt: Struktur und Daten auf einen Blick, ein Klick zum Vertiefen – und es macht **Spaß**, das Board zu öffnen.

### Was ein Profi anders macht

- **Eine Einstiegsseite „Übersicht“** – nicht in langen Listen suchen, sondern **zuerst** die Struktur sehen (Lizenznehmer, Empfehler, Abrechnung, Besucher).
- **Große, klare Kacheln** mit Kennzahlen und einem einzigen Handlungsanker („→ Alle anzeigen“, „→ Abrechnung öffnen“). Wie die bunten Aktionen auf der K2-Familie-Homepage (Stammbaum, Events, Kalender).
- **Optik wie K2 Familie:** Gleiche Welt (mission-wrapper, viewport, Karten mit Hover), damit es sich nach **einem** Produkt anfühlt – nicht nach einem anderen Tool. Ruhiger Hintergrund, runde Karten, klare Typografie, eine Zahl pro Kachel sofort sichtbar.
- **Ein Klick = zum Ziel:** Klick auf „Lizenznehmer“ → Lizenzen-Seite (oder eingeblendete Liste); Klick auf „Empfehler“ → Empfehler-Übersicht; Klick auf „Abrechnung“ → CSV/PDF oder Tabellen. Kein Umweg.

### Konkrete Umsetzung (Board)

- **Route:** z. B. `/projects/k2-galerie/uebersicht` – eigenes Board, von APf/Projekte/Lizenzen aus erreichbar.
- **Layout:** Wie K2 Familie – `mission-wrapper`, `viewport`, dann 4 Kacheln im Grid:
  1. **Lizenznehmer** – Zahl (manuell + online), Kurztext „Aktive Lizenzen“, Button „→ Alle anzeigen“ (→ Lizenzen-Seite).
  2. **Empfehler** – Zahl (Anzahl Empfehler mit mind. 1 Gutschrift), Summe Gutschriften (€), Button „→ Empfehler & Gutschriften“ (→ Lizenzen-Seite oder Anker).
  3. **Abrechnung** – Zahl (z. B. Online-Zahlungen diesen Monat oder gesamt), Button „→ CSV/PDF“ (→ Lizenzen-Seite Abrechnungsbereich).
  4. **Besucher** – Platzhalter „Noch nicht erfasst“ oder „Coming soon“, Button „→ Info“ (Hinweis oder später Analytics-Link).
- **Daten:** Beim Öffnen des Boards einmal `/api/licence-data` laden und `localStorage` (manuell vergebene Lizenzen) auslesen – dann die Zahlen in die Kacheln. Kein zweiter Klick zum „Laden“.
- **Optik:** Pro Kachel eine dezente Farbe/Gradient (wie bei K2 Familie: Grün Stammbaum, Orange Events, Teal Kalender), große Zahl, kurzer Titel, ein Button. Hover: Karte hebt sich leicht (wie `.card:hover` bei K2 Familie).

So hast du **ein** Board, das du gerne öffnest – Struktur und Daten sofort sichtbar, ein Klick zu den Details.

**Umsetzung (Stand 02.03.26):** Die Seite **Übersicht-Board** ist umgesetzt: Route `/projects/k2-galerie/uebersicht`. Optik wie K2 Familie (mission-wrapper, viewport, Karten mit Hover), 4 Kacheln (Lizenznehmer, Empfehler, Abrechnung, Besucher). Beim Öffnen werden Daten geladen (API + localStorage); ein Klick pro Kachel führt zur Lizenzen-Seite. Erreichbar über Plattform-Start („Übersicht-Board“), Lizenzen-Seite („📊 Übersicht-Board“) und direkt `/projects/k2-galerie/uebersicht`.
