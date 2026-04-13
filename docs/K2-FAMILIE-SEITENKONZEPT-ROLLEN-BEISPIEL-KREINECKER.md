# K2 Familie – Seitenkonzept Rollen & Rechte (Beispiel: Familie Kreinecker)

**Stand:** 13.04.26  
**Zweck:** Ein **Bedien- und Seitenbild**, wie Inhaber, Zweigverwalter:innen, Leserechte und „eigene Karte“ zusammenspielen – **an der komplexen, echten Familie Kreinecker** gedacht, **nicht** am technischen Muster-Tenant „Huber“.

**Verknüpfung (allgemein):** [K2-FAMILIE-RECHTE-ZWEIGE.md](./K2-FAMILIE-RECHTE-ZWEIGE.md) (Was ist ein Zweig?, Optionen A/B/C)

---

## 1. Warum „Kreinecker“ als Leitbeispiel

| Punkt | Bedeutung |
|--------|-----------|
| **Komplexität** | Mehrere Generationen, Partner:innen, unterschiedliche Hausstände – genug Spannweite für Zweige, Lesen nach oben, Schreiben nach unten. |
| **Kein Demo-Muster** | Abgrenzung zur Seed-Familie „Huber“ in der App: dort geht es um **Technik-Demo**; hier um **euer fachliches Regelwerk**. |
| **Eine Familie, ein Tenant** | Wie bei euch gedacht: **eine** K2-Familie-Instanz, innen fein geregelt – nicht zwangsläufig ein Tenant pro Zweig. |

---

## 2. Rollen im Bild (Kurz)

| Rolle | Wer (illustrativ bei Kreinecker) | Was auf den Seiten sichtbar / machbar |
|--------|-----------------------------------|----------------------------------------|
| **Inhaber:in / Administrator** | Zentral festgelegt (eine Person mit Verantwortung für die **Instanz**) | **Instanz:** Sicherung, Einladungen, globale Leseregeln, **Sperre „Beziehungen ändern“** nach der Grundfestlegung. **Nicht:** höchstpersönliche Inhalte auf fremden Karten schreiben (siehe RECHTE-ZWEIGE). |
| **Zweigverwalter:in** | **Automatisch:** das **Paar an der Spitze** eines Astes **oder** der Kleinfamilie – **immer** Verwalter dieses Zweigs (kein gesonderter „Ernennen“-Schritt für diese Ebene). | In **diesem** Zweig nach unten: anlegen/bearbeiten; Momente/Events im Kreis, soweit vorgesehen. |
| **Lesende** | z. B. Enkel, entfernte Verwandte, Gäste mit Karte | Nur das, was der **Zweigverwalter nach oben** freigibt – themenbezogen (siehe Unten). |
| **Eigene Identität** | Jede eingeloggte Person mit **eigener Personenkarte** | Kurztext, Fotos, persönliche Momente auf der **eigenen Karte** im erlaubten Rahmen. **Beziehungen:** nach Grundfestlegung und Admin-Sperre **keine** freie Änderung mehr. |

*Konkrete Namen in der App kommen immer aus den **Karten** (Beziehungen nur aus gespeicherten Daten). Dieses Dokument nennt keine privaten Details – nur die **Rolle**.*

---

## 3. Beispiel „Baum“ nur als Denkhilfe (ohne Daten aus dem Code)

Grobskizze zum Mitdenken – **keine** Stammdaten aus dem Repo:

```
                    [Generation oben – Vorfahren / Wurzeln …]
                                      │
              ┌───────────────────────┴───────────────────────┐
              │         Paar / Kopf (z. B. Kern der Linie)   │
              └───────────────────────┬───────────────────────┘
        ┌─────────────┬───────────────┼───────────────┬─────────────┐
        │   Zweig 1   │   Zweig 2   │   …           │   Zweig n   │
        │ Verwalter A │ Verwalter B │               │ Verwalter … │
        │  nach unten │  nach unten │               │  nach unten │
        └─────────────┴──────────────┴───────────────┴─────────────┘
```

**Familie Kreinecker:** Ihr könnt diese Zweige mit euren **wirklichen** Linien füllen (Wer ist Verwalter? Wer darf was nach oben lesen?). Die App soll später dieselbe Struktur **aus den Karten** ableiten können – Voraussetzung: klare Regel „Zweig = …“ (siehe RECHTE-ZWEIGE).

---

## 4. Seiten der App (Konzept – keine Implementierung)

### 4.1 Start / Meine Familie

- **Oben:** Name der Familie („Familie Kreinecker“ o. ä.), optional Hinweis „Du bist eingeloggt als …“ (Person verknüpft).
- **Kacheln:** Stammbaum, Events & Kalender, Geschichte, Gedenkort, Einstellungen – wie heute, aber **Ampel** oder Badges: „Du darfst hier schreiben“ / „nur Lesen“ je Bereich (aus Rolle + Zweig).

### 4.2 Stammbaum

- **Lesen:** Jede Person sieht mindestens das, was ihre Rolle + Leseregeln erlauben (z. B. ganzer Baum für Inhaber; eingeschränkt für andere).
- **Schreiben:** Neue Person / Kanten nur, wenn Zweigverwalter:in oder Inhaber (nach Regel).
- **Signal:** Am **Zweig** (z. B. Farbe oder kleines Icon): „Du bist Verwalter:in dieses Zweigs“.

### 4.3 Person „meine Karte“ / Personenkarte (fremde Person)

- **Eigene Karte:** Texte, Fotos, persönliche Momente im erlaubten Rahmen. **Höchstpersönliches** (über Namen, Geburtsdaten, Beziehungen hinaus): **auch Administrator:in** schreibt dort **nicht** auf fremden Karten.
- **Fremde Karte:** Nur Anzeige oder Bearbeiten gemäß Rolle (Zweigverwalter:in nach unten vs. Leser:in).
- **Beziehungen:** Sind sie **einmal grundsätzlich festgelegt**, sperrt **Administrator:in** die Struktur-Funktion – **niemand** ändert die Grundverknüpfung mehr im Alltag (Details: [K2-FAMILIE-RECHTE-ZWEIGE.md](./K2-FAMILIE-RECHTE-ZWEIGE.md)).

### 4.4 Einstellungen → Rechte & Sichtbarkeit (später)

- **Inhaber:in:** Wer ist Inhaber? Welche **Standard-Leseregel** „nach oben“ (grob: nichts / Vornamen / Stammdaten / …)? **Zweigverwalter:innen** ergeben sich **automatisch** aus Paar/Kleinfamilie an der Spitze (keine separate Ernennungsliste für diese Ebene).
- **Zweigverwalter:in (pro Zweig):** Für „meine Linie nach oben“: wer darf mitlesen – **themenweise** (Kontakt, Fotos, Momente, …) wenn ihr das stufen wollt.

### 4.5 Events & Kalender

- Teilnehmerkreis wie heute (`participantIds`) – später optional: Vorschlag „nur dieser Zweig“, damit nicht immer 30 Personen antippen.

---

## 5. Was noch zu klären ist (vor Programmierung)

1. **Definition „Zweig“** bei Kreinecker: Variante A/B/C aus [K2-FAMILIE-RECHTE-ZWEIGE.md](./K2-FAMILIE-RECHTE-ZWEIGE.md) – eine Variante als Hausregel.  
2. ~~**Wer ist Verwalter:in?**~~ **Festgelegt:** Paar an der Spitze eines Astes **oder** Kleinfamilie = **automatisch** Verwalter; Administrator = Ausnahme-Rolle für Instanz + Sperren (siehe RECHTE-ZWEIGE).  
3. **Lesen nach oben:** eine grobe Stufe reicht für den Start, Feintuning später.  
4. **Konten:** Welche Person verbindet sich mit welchem Login (später) – erst dann ist „jede:r die eigene Karte“ technisch wasserdicht.

---

## 6. Kurzfassung

- **Beispiel-Familie im Konzept: Kreinecker** – komplex genug, real, **kein** Huber-Demo-Muster.  
- **Seiten:** Start mit Ampel, Stammbaum mit Zweig-Signal, Person mit „eigenem“ vs. fremdem Bereich, Einstellungen für Inhaber/Zweig-Leseregeln (später).  
- **Nächster Schritt:** Regeln in Punkt 5 schriftlich festziehen – dann erst Architektur und Code.

---

## 7. Druckfassung (PDF über Browser)

Die **druckoptimierte** Variante mit Seitenumbrüchen, Fußnoten zu den Doku-Quellen und Seitenzahl liegt im K2-Familie-Handbuch in der App: **K2 Familie → Handbuch → „Seitenkonzept Rollen (Kreinecker, Druck)“ → Drucken (A4)**. Markdown-Quelle: `public/k2team-handbuch/20-K2-FAMILIE-SEITENKONZEPT-ROLLEN-KREINECKER-DRUCK.md`.

---

*Dokument dient der gemeinsamen Abstimmung; keine Abfrage echter Familiendaten im Repo.*
