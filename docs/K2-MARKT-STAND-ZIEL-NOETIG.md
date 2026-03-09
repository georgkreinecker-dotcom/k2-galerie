# K2 Markt – Was wir haben, wohin wir wollen, was noch nötig ist

**Stand:** 09.03.26. Eine Übersicht – damit immer klar ist: wo stehen wir, was ist das Ziel, was fehlt.

**Definition (verbindlich):** K2 Markt ist **von Beginn an als eigenständiges Projekt** definiert (wie K2 Familie), nicht als Teil von K2 Galerie. Frühere URLs unter `/projects/k2-galerie/k2-markt*` im Code waren nur Implementierungsdetail – keine inhaltliche Zuordnung. Heute: eigenes Projekt unter `/projects/k2-markt`, Datenquelle ök2.

---

## 1. Was wir bis jetzt haben

### Konzept & Vision (Doku)

| Was | Wo | Kurz |
|-----|-----|-----|
| **Leitvision** | docs/K2-MARKT-KREATIVPROZESS-LEITVISION.md | „Heute will ich K2/ök2/K2 Familie auf den Markt bringen – du hast alles; fehlt was, Studio.“ |
| **Kreativprozess** | ebd. | Leitvision → Ideen bündeln → Linie wählen → Momente → Tor → Umsetzung. Tor = Werkzeug, nicht Einstieg. |
| **Eigene Arbeitsoberfläche** | ebd. Abschn. 5 | Forderung + Recherche: Werbeleute nutzen dedizierte Oberflächen (Flora, HolaBrief, Miro, …). K2 Markt braucht eigene Oberfläche wie die APf. |
| **Vision & Architektur** | K2-MARKT-VISION-ARCHITEKTUR.md, K2-MARKT-ARCHITEKTUR-EINZIGARTIG.md | Produkt-Moment, eine Wahrheit, Medienhaus-Metapher, Qualitäts-Tor, Regeln im System. |
| **mök2 komplett** | docs/MOK2-KOMPLETT-UMSETZEN.md | Ziel: alle Sektionen mit Inhalt, eine Quelle, Werbeunterlagen, K2 Markt angebunden. |

### Technik & Oberflächen (bereits umgesetzt)

| Was | Wo | Kurz |
|-----|-----|-----|
| **K2 Markt Mappe** | K2MarktPage, `/projects/k2-markt/mappe` | Doku-Mappe: Vision, Handbuch, Planer, Produkt-Moment, DoD Flyer, Flyer-Agent. |
| **K2 Markt Tor** | K2MarktTorPage, `/projects/k2-markt/tor` | Live aus Quellen **oder** gespeicherte Momente. mök2-Idee (Basis) wählbar + optional Kampagne. Entwurf → DoD prüfen → Freigabe. |
| **Quellen** | k2MarktQuellen.ts | getMok2Quellen, getMomentFromQuellenLive({ mok2IdeenId, kampagneDoc }), fetchMok2Ideen(), buildMomentFromQuellen(…, mok2Idee). |
| **mök2-Ideen** | public/k2-markt/mok2-ideen.json | Ausgearbeitete Ideen (USPs, Marktchancen, Pro+, VK2, Empfehlungs-Programm, …) als wählbare Basis für Momente. |
| **Momente** | produkt-momente.json, localStorage k2-markt-momente | Statische + lokale Momente; mit source (kampagneDoc, mok2IdeenId) bleiben live auflösbar. |
| **Flyer-Agent / DoD** | k2MarktFlyerAgent.ts | ProduktMoment → FlyerEntwurf, erfuelltDoDFlyer, Freigabe-Log. |
| **mök2** | MarketingOek2Page, mok2Structure | Ideen ausgearbeitet (USPs, Lizenzen, …); Slogan/Botschaft in tenantConfig + localStorage. |
| **Kampagne** | KampagneMarketingStrategiePage, public/kampagne-marketing-strategie/ | Markdown-Docs als optionale Quelle für Momente. |

### Was noch **nicht** da ist (siehe Abschnitt 3)

- ~~Eine **eigene K2-Markt-Arbeitsoberfläche**~~ → **umgesetzt 09.03.26** (K2MarktOberflaechePage, Route k2-markt-oberflaeche; Einstieg im Smart Panel).
- Ein **Einstieg**, der mit „Heute will ich X auf den Markt bringen“ startet – **teilweise:** Produkt wählen (K2/ök2/K2 Familie) auf der Oberfläche; Ideen/Kampagne verlinkt, dann Zum Tor.
- ~~**Studio** im Werkzeugkasten~~ → **umgesetzt 09.03.26** (Block „Fehlt was? → Studio“ auf der K2-Markt-Oberfläche, Link zum Admin).
- ~~Leitvision in der **App**~~ → **umgesetzt 09.03.26** (mök2-Sektion „Leitvision K2 Markt“).

---

## 2. Wohin wir wollen

- **Leitvision erlebbar:** Ich setze mich an den Mac → „Heute möchte ich meine K2 / ök2 / K2 Familie auf den Markt bringen“ → **eine eigene Arbeitsoberfläche** (wie APf, aber für Markt), in der ich **nur** dafür arbeite – eigene Welt, wirklich kreativ werden.
- **Alles da:** Quellen (mök2, Ideen, Kampagne) sind in dieser Oberfläche verfügbar; fehlt etwas (Bilder, Videos, Texte) → **Studio** im Werkzeugkasten zum professionellen Erzeugen und Ergänzen.
- **Kreativprozess vor dem Tor:** Ideen ansehen → Linie/Kampagne wählen → Momente erzeugen → **dann** ans Tor zur Prüfung und Freigabe. Tor bleibt, wird aber von dieser Oberfläche aus gespeist.
- **Eine Quelle, viele Formate:** Produkt-Moment als eine Wahrheit; daraus Flyer, Presse, Social, Ansprache – eine Freigabe, dann marktfähig.

---

## 3. Was dazu noch notwendig ist

### A) Eigene K2-Markt-Arbeitsoberfläche ✅ umgesetzt (09.03.26)

- **K2MarktOberflaechePage**, Route `/projects/k2-galerie/k2-markt-oberflaeche`. Nur für Kreativprozess – Leitvision sichtbar, „Heute will ich … auf den Markt bringen“ mit Produktwahl (K2 / ök2 / K2 Familie), Ideen & Quellen (Links mök2, Kampagne, Mappe), „Zum Tor“-Button.
- Smart Panel: „K2 Markt“ führt auf die Arbeitsoberfläche (nicht mehr auf die Mappe). Mappe über Link auf der Oberfläche erreichbar.
- DevView: Tab „K2 Markt“ zeigt die Arbeitsoberfläche; Vollbild-Link auf k2MarktOberflaeche.

### B) Kreativprozess-Einstieg (in dieser Oberfläche) ✅ umgesetzt (09.03.26)

- **„Dein Ablauf“** oben auf der Oberfläche: 3 nummerierte Schritte (1. Wofür? → Produkt wählen. 2. Ideen & Linie → mök2, Kampagne. 3. Entwurf prüfen & freigeben → Zum Tor). Hinweis: „Einstieg ist immer Schritt 1 – nicht das Tor.“
- Die drei Abschnitte darunter sind als **Schritt 1**, **Schritt 2**, **Schritt 3** überschrieben; der Ablauf ist klar lesbar.

### C) Studio im Werkzeugkasten ✅ umgesetzt (09.03.26)

- **Studio** = der Ort, an dem Bilder, Videos, Texte professionell erzeugt oder ergänzt werden, wenn etwas fehlt.
- Auf der K2-Markt-Oberfläche: Block **„Fehlt was? → Studio“** mit Text und Button **„Studio öffnen (Admin)“** → Link zu `/admin` (Design, Bildverarbeitung). Leitvision-Bereich enthält zusätzlich Inline-Link „→ Studio (Admin: Design, Bildverarbeitung)“.

### D) Leitvision in der App ✅ umgesetzt (09.03.26)

- **mök2-Sektion „Leitvision K2 Markt“:** In mok2Structure (Kern – Überblick & Stärken) ergänzt; in MarketingOek2Page gleicher Wortlaut wie in der Doku (zwei Absätze + Quellenhinweis).
- **Mappe:** K2-MARKT-KREATIVPROZESS-LEITVISION.md und ggf. dieses Doc (Stand-Ziel-Nötig) in die K2-Markt-Mappe (K2MarktPage DOCUMENTS) aufnehmen, damit alles in einer Mappe liegt.

---

## 4. Die Lücke: Daten da – kreative/automatisierte Markteintritts-Schicht fehlt (09.03.26)

**Georg (09.03.26):** Bisher sind wir bis auf das Tor noch nicht wirklich weitergekommen. Unter jeder Kachel zeigen wir Sachen, die **schon da sind** (mök2, Mappe, Kampagne, Studio) – das als **Datenmaterial** zu nutzen ist richtig. Aber wir haben **noch nichts Neues, Kreatives** daraus gemacht, um **automatisiert auf den Markt eintreten** zu können – **wozu die KI und die ganzen Agenten da sind**.

| Heute | Ziel |
|--------|------|
| Kacheln = Links zu **bestehenden** Bereichen (Datenmaterial) | Aus dem Datenmaterial **neu erzeugen** (KI/Agenten) → dann **automatisiert** marktfähig werden |
| Tor = manuell prüfen & freigeben | Tor bleibt; **davor** die Schicht: aus Quellen etwas **Kreatives** erzeugen, das dann ans Tor kann |
| Keine echte „Maschine“ für Markteintritt | KI + Agenten = genau dafür: aus mök2/Kampagne/Mappe **etwas Neues** machen und damit (unterstützt/automatisiert) auf den Markt |

**Konsequenz für die nächste Entwicklung:** Nicht nur Oberfläche mit Links – sondern die **kreative/automatisierte Schicht** bauen: Eingabe = bestehende Quellen (mök2, Kampagne, Mappe), Verarbeitung = KI/Agenten (etwas Neues daraus erzeugen), Ausgabe = marktfähige Formate → Tor → Freigabe. Das ist die Richtung.

---

## 5. Kurzfassung

| | Inhalt |
|---|--------|
| **Haben** | Leitvision + Kreativprozess; Tor, Quellen, Momente, DoD, Freigabe; mök2, Kampagne; Mappe. Oberfläche = Kacheln zu den **Datenquellen**. |
| **Wollen** | Eigene K2-Markt-Oberfläche, „heute X auf den Markt bringen“, alles da + Studio. **Plus:** Aus dem Datenmaterial **etwas Neues** mit KI/Agenten erzeugen → **automatisiert** auf den Markt. |
| **Lücke** | Die **kreative/automatisierte Markteintritts-Schicht** (KI, Agenten) fehlt noch – genau dafür sind sie gedacht. |
| **Nächste Phase** | Kreative Schicht: Eingabe = Quellen, Verarbeitung = KI/Agenten, Ausgabe = marktfähig → Tor. |

---

*Quelle: Zusammenführung aus K2-MARKT-KREATIVPROZESS-LEITVISION.md, K2-MARKT-VISION-ARCHITEKTUR.md, MOK2-KOMPLETT-UMSETZEN.md und aktuellem Code-Stand. Abschnitt 4: Georg 09.03.26.*
