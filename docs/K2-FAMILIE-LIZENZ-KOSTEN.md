# K2 Familie – Lizenzprodukt: Cloud & faire Kostenstruktur

**Stand:** 13.04.26  
**Zweck:** K2 Familie ist ein **eigenes** Lizenzprodukt. Der gemeinsame Ort soll in der Cloud liegen. Faire Struktur für Kosten: wer, wann, wo, wie Lizenzgebühren zahlt.

**Quelle:** Georg – „Auf jeden Fall soll der gemeinsame Ort in der Cloud liegen. Da es ein Lizenzprodukt ist, sollten wir uns Gedanken machen, wie eine faire Struktur der Kosten aussehen könnte – wer wann wo und wie Lizenzgebühren zahlt.“

**Abgrenzung:** Lizenz- und Kostenthemen **nur für K2 Familie** – **keine** Verbindung zu K2-Galerie-Lizenzen. Zur Begriffs-Orientierung (optional): **docs/K2-FAMILIE-LIZENZMODELL-BRUECKE.md**.

---

## 1. Gemeinsamer Ort = Cloud (verbindlich)

- **Der gemeinsame Ort** (Familiendaten – Personen, Momente, Events, Beiträge, Gaben) **liegt in der Cloud.** Nicht nur auf einem Gerät (localStorage), damit alle Beteiligten (z. B. Geschwister) „reinkommen“ und dieselbe Familie sehen und beitragen können.
- **Technisch:** Backend/Sync (z. B. Supabase oder API) pro Familie (Tenant); Einladungslink oder Familien-Code; alle Zugangsberechtigten lesen/schreiben an derselben Quelle.
- **Als Lizenzprodukt** bedeutet das: Nutzung dieses gemeinsamen Ortes und der zugehörigen Funktionen ist lizenziert – damit verbinden wir eine **faire Kostenstruktur**.

---

## 2. Faire Kostenstruktur – wer, wann, wo, wie

### Wer zahlt?

| Modell | Beschreibung | Fair weil … |
|--------|--------------|-------------|
| **Eine Lizenz pro Familie** | **Wer die Familie anlegt** (Gründer/in), zahlt die Lizenz – einmalig oder jährlich. Alle eingeladenen Mitglieder nutzen ohne eigene Gebühr. | Eine Rechnung, eine Verantwortung; die anderen „bekommen“ den Zugang als Geschenk oder Teil der Familie. |
| **Pro Nutzer** | Jeder, der der Familie beitritt, zahlt einen Anteil (oder eine eigene kleine Lizenz). | Lasten verteilt; wer mitmacht, beteiligt sich. Kann aber Hürde sein („muss ich zahlen?“). |
| **Stufen (z. B. Basic/Pro)** | Basic = eine Familie, begrenzte Nutzerzahl oder Speicher; Pro = mehr Nutzer oder mehr Familien. Der Gründer wählt die Stufe und zahlt. | Skalierbar; große Familien oder mehrere Familien (z. B. Vereine) zahlen mehr. |

**Empfehlung für den Einstieg:** **Eine Lizenz pro Familie** – der/die Gründer/in zahlt; eingeladene Mitglieder nutzen kostenfrei mit. Einfach, fair („ich schenke meiner Familie den gemeinsamen Ort“), eine Rechnung.

### Wann zahlt man?

| Option | Beschreibung |
|--------|--------------|
| **Einmalig** | Einmalige Lizenzgebühr – z. B. für dauerhafte Nutzung (evtl. mit zeitlich begrenztem Support/Updates). |
| **Jährlich** | Lizenzgebühr pro Jahr – wiederkehrend; Cloud und Updates abgedeckt. |
| **Monatlich** | Abo – flexibel kündbar; oft gewohnt bei SaaS. |

**Typisch für SaaS/Lizenzprodukt:** Jährlich oder monatlich, damit laufende Kosten (Cloud, Betrieb) gedeckt sind. Einmalig möglich, wenn das Geschäftsmodell es vorsieht.

### Wo zahlt man?

- **In der App** – z. B. nach Anlegen einer Familie oder beim ersten „Einladen“: Hinweis „Gemeinsamer Ort in der Cloud – Lizenz erforderlich“, Button **„Lizenz abschließen“** → Weiterleitung zum **K2-Familie-Checkout** (z. B. Stripe – **nur** dieses Produkt, siehe §4).
- **Transparent:** Preise und Intervalle (jährlich/monatlich) klar anzeigen; keine versteckten Kosten.

### Wie zahlt man?

- **Technisch:** **Stripe Checkout** (oder vergleichbar); Lizenz nach Zahlung speichern (z. B. in Supabase `licences` mit eigenem Produktkennzeichen nur für K2 Familie – **nicht** mit Galerie-Lizenz vermischen).
- **Ablauf:** Nutzer legt Familie an (oder will Cloud aktivieren) → „Lizenz für gemeinsamen Ort“ → Checkout → nach Erfolg: Familie wird in Cloud angelegt, Einladungslink aktiv.
- **Verlängerung:** Bei jährlicher/monatlicher Lizenz: Erinnerung vor Ablauf; Verlängerung im Account oder per Link.

---

## 3. Konkrete Stufen (Vorschlag)

| Stufe | Inhalt | Preis (Beispiel) |
|-------|--------|-------------------|
| **K2 Familie Basic** | Eine Familie, gemeinsamer Ort in der Cloud, bis z. B. X eingeladene Nutzer oder Y Personen im Stammbaum. Einladungslink, Beiträge, Gedenkort. | Preis später festlegen (nur K2-Familie-Produkt; kein Mix mit Galerie-Stufen). |
| **K2 Familie Pro** | Mehr Familien oder mehr Nutzer/Speicher; erweiterte Features. | Höhere Gebühr – **eigenes** Preismodell K2 Familie. |

Preise und Limits später festlegen; die **Struktur** (eine Lizenz pro Familie, Gründer zahlt; wo/wie = in der App, eigener Checkout) bleibt.

---

## 4. Abgrenzung zu K2 Galerie (verbindlich)

- **Lizenzen:** K2 Familie und K2 Galerie sind **getrennte Lizenzprodukte** – keine gemeinsame Rechnung, kein Bundle als Bestandteil dieser Produktdefinition. Details: **docs/K2-FAMILIE-LIZENZMODELL-BRUECKE.md**.
- **Technik (nur intern):** Später können Stripe/Supabase **dieselbe Plattform-Infrastruktur** nutzen – das ist **Buchhaltung/Code-Trennung** (`product`-Kennzeichen getrennt), **keine** inhaltliche oder vertragliche „Verknüpfung“ der Lizenzen.

---

## 5. Datensouveränität – Daten bleiben bei der Familie

**Auch wenn wir die App eines Tages nicht mehr aktiv betreiben:** Die Familiendaten bleiben **100 % verfügbar und erhalten**. Sie können **ausgedruckt** und **privat abgespeichert** (exportiert) werden. Der Cloud-Platz wird dann voraussichtlich nicht mehr zur Verfügung stehen – deshalb sind Export und Druck von Anfang an anzubieten und **gut zu kommunizieren**. Die Familie behält ihre Daten in der Hand. Verbindlich: **docs/K2-FAMILIE-DATENSOUVERAENITAET.md**.

---

## 6. Nächste Schritte (für Roadmap)

- [ ] **Cloud-Backend für K2 Familie** umsetzen (Supabase oder API): Familiendaten pro Tenant in der Cloud; Einladungslink/Code; Sync für alle Geräte.
- [ ] **Export & Druck** jederzeit anbieten und **Datensouveränität** kommunizieren („Deine Daten gehören dir – exportieren, ausdrucken, privat aufbewahren“); siehe **docs/K2-FAMILIE-DATENSOUVERAENITAET.md**.
- [ ] **Lizenzmodell K2 Familie** festlegen: eine Lizenz pro Familie, Gründer zahlt; Stufe (Basic/Pro) und Intervall (jährlich/monatlich); Preise.
- [ ] **Checkout K2 Familie** anbinden (Stripe oder vergleichbar, **eigenes** Produkt/Preis – nicht mit Galerie-Lizenz verknüpft); Lizenz-Check vor „Cloud aktivieren“ oder „Familie einladen“.
- [ ] **Doku mök2/Handbuch:** K2 Familie als Lizenzprodukt, faire Kostenstruktur, wer/wann/wo/wie – für Vertrieb und Nutzer.

---

*„Auf jeden Fall soll der gemeinsame Ort in der Cloud liegen. Da es ein Lizenzprodukt ist, sollten wir uns darüber Gedanken machen, wie eine faire Struktur der Kosten aussehen könnte – oder wer wann wo und wie Lizenzgebühren zahlt.“ – Georg, 02.03.26*
