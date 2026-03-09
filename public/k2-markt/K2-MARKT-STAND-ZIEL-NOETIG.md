# K2 Markt – Was wir haben, wohin wir wollen, was noch nötig ist

**Stand:** 09.03.26. Eine Übersicht – damit immer klar ist: wo stehen wir, was ist das Ziel, was fehlt.

---

## 1. Was wir bis jetzt haben

### Konzept & Vision (Doku)

| Was | Wo | Kurz |
|-----|-----|-----|
| **Leitvision** | Kreativprozess und Leitvision (diese Mappe) | „Heute will ich K2/ök2/K2 Familie auf den Markt bringen – du hast alles; fehlt was, Studio.“ |
| **Kreativprozess** | ebd. | Leitvision → Ideen bündeln → Linie wählen → Momente → Tor → Umsetzung. Tor = Werkzeug, nicht Einstieg. |
| **Eigene Arbeitsoberfläche** | ebd. Abschn. 5 | Forderung + Recherche: Werbeleute nutzen dedizierte Oberflächen (Flora, HolaBrief, Miro, …). K2 Markt braucht eigene Oberfläche wie die APf. |
| **Vision & Architektur** | Vision und Architektur, Architektur einzigartig (diese Mappe) | Produkt-Moment, eine Wahrheit, Medienhaus-Metapher, Qualitäts-Tor, Regeln im System. |
| **mök2 komplett** | docs/MOK2-KOMPLETT-UMSETZEN.md | Ziel: alle Sektionen mit Inhalt, eine Quelle, Werbeunterlagen, K2 Markt angebunden. |

### Technik & Oberflächen (bereits umgesetzt)

| Was | Wo | Kurz |
|-----|-----|-----|
| **K2 Markt Mappe** | /projects/k2-galerie/k2-markt | Doku-Mappe: Vision, Handbuch, Planer, Produkt-Moment, DoD Flyer, Flyer-Agent. |
| **K2 Markt Tor** | /projects/k2-galerie/k2-markt-tor | Live aus Quellen **oder** gespeicherte Momente. mök2-Idee (Basis) wählbar + optional Kampagne. Entwurf → DoD prüfen → Freigabe. |
| **Quellen** | k2MarktQuellen.ts | getMok2Quellen, getMomentFromQuellenLive({ mok2IdeenId, kampagneDoc }), fetchMok2Ideen(), buildMomentFromQuellen(…, mok2Idee). |
| **mök2-Ideen** | mok2-ideen.json | Ausgearbeitete Ideen (USPs, Marktchancen, Pro+, VK2, Empfehlungs-Programm, …) als wählbare Basis für Momente. |
| **Momente** | produkt-momente.json, localStorage k2-markt-momente | Statische + lokale Momente; mit source (kampagneDoc, mok2IdeenId) bleiben live auflösbar. |
| **Flyer-Agent / DoD** | k2MarktFlyerAgent.ts | ProduktMoment → FlyerEntwurf, erfuelltDoDFlyer, Freigabe-Log. |
| **mök2** | Marketing ök2 | Ideen ausgearbeitet (USPs, Lizenzen, …); Slogan/Botschaft in tenantConfig + localStorage. |
| **Kampagne** | Kampagne Marketing-Strategie | Markdown-Docs als optionale Quelle für Momente. |

### Was noch **nicht** da ist (siehe Abschnitt 3)

- ~~Eine **eigene K2-Markt-Arbeitsoberfläche**~~ → **umgesetzt 09.03.26** (Route k2-markt-oberflaeche; Einstieg im Smart Panel).
- Ein **Einstieg** „Heute will ich X auf den Markt bringen“ – **umgesetzt** auf der Oberfläche (Produkt wählen, Ideen/Kampagne, dann Zum Tor).
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

- Route `/projects/k2-galerie/k2-markt-oberflaeche`. Leitvision sichtbar, „Heute will ich … auf den Markt bringen“ mit Produktwahl (K2 / ök2 / K2 Familie), Ideen & Quellen (Links mök2, Kampagne, Mappe), „Zum Tor“-Button.
- Smart Panel: „K2 Markt“ führt auf die Arbeitsoberfläche. Mappe über Link auf der Oberfläche.

### B) Kreativprozess-Einstieg (in dieser Oberfläche) ✅ umgesetzt (09.03.26)

- **„Dein Ablauf“** auf der Oberfläche: 3 Schritte (1. Wofür? 2. Ideen & Linie. 3. Entwurf prüfen & freigeben). Abschnitte als Schritt 1 / 2 / 3 überschrieben.

### C) Studio im Werkzeugkasten ✅ umgesetzt (09.03.26)

- Auf der K2-Markt-Oberfläche: Block **„Fehlt was? → Studio“** mit Text und Button **„Studio öffnen (Admin)“** → Link zu Admin (Design, Bildverarbeitung).

### D) Leitvision in der App ✅ umgesetzt (09.03.26)

- **mök2-Sektion „Leitvision K2 Markt“:** In mok2 (Kern – Überblick & Stärken); gleicher Wortlaut wie in der Doku (zwei Absätze + Quellenhinweis).

---

## 4. Kurzfassung

| | Inhalt |
|---|--------|
| **Haben** | Leitvision + Kreativprozess + Forderung eigene Oberfläche (Doku); Tor mit Live/gespeichert, mök2-Ideen, Quellen, Momente, DoD, Freigabe; mök2, Kampagne; Mappe mit Vision/Handbuch. |
| **Wollen** | Eine eigene K2-Markt-Oberfläche (eigene Welt), Einstieg „heute X auf den Markt bringen“, alles da + Studio wenn was fehlt, Kreativprozess vor dem Tor. |
| **Noch nötig** | (A) ✅. (B) ✅. (C) ✅ Studio. (D) ✅ Leitvision in App. |
