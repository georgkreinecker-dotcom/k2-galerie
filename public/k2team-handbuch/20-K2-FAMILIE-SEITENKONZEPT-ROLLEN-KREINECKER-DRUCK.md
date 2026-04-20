# Druckfassung – Seitenkonzept Rollen & Rechte (Beispiel: Familie Kreinecker)

**Stand:** 13.04.26  
**Zweck:** Bedien- und Seitenbild für **Inhaber**, **Zweigverwalter:innen**, **Leserechte** und **eigene Karte** – Bezug **Familie Kreinecker** (nicht Muster „Huber“). Zum **Ausdrucken** in der App: K2 Familie → Handbuch → dieses Kapitel → **Drucken (A4)**.

**Quellen (Technik/Doku):** `docs/K2-FAMILIE-RECHTE-ZWEIGE.md`, `docs/K2-FAMILIE-SEITENKONZEPT-ROLLEN-BEISPIEL-KREINECKER.md`

[SEITENUMBRUCH]

## 1. Warum „Kreinecker“ als Leitbeispiel

| Punkt | Bedeutung |
|--------|-----------|
| **Komplexität** | Mehrere Generationen, Partner:innen, unterschiedliche Hausstände – Spannweite für Zweige, Lesen nach oben, Schreiben nach unten. |
| **Kein Demo-Muster** | Abgrenzung zur Seed-Familie „Huber“ in der App: dort **Technik-Demo**; hier **fachliches Regelwerk**. |
| **Eine Familie, ein Tenant** | Eine K2-Familie-Instanz, innen fein geregelt – nicht zwangsläufig ein Tenant pro Zweig. |

[SEITENUMBRUCH]

## 2. Rollen im Bild (Kurz)

| Rolle | Wer (illustrativ bei Kreinecker) | Was auf den Seiten sichtbar / machbar |
|--------|-----------------------------------|----------------------------------------|
| **Inhaber:in / Administrator** | Zentral festgelegt (eine Person mit Verantwortung für die **Instanz**) | **Instanz:** Sicherung, Einladungen, globale Leseregeln, **Sperre „Beziehungen ändern“** nach der Grundfestlegung. **Nicht:** höchstpersönliche Inhalte auf fremden Karten schreiben (siehe RECHTE-ZWEIGE). |
| **Zweigverwalter:in** | **Automatisch:** das **Paar an der Spitze** eines Astes **oder** der Kleinfamilie – **immer** Verwalter dieses Zweigs (kein gesonderter „Ernennen“-Schritt für diese Ebene). | In **diesem** Zweig nach unten: anlegen/bearbeiten; Momente/Events im Kreis, soweit vorgesehen. |
| **Lesende** | z. B. Enkel, entfernte Verwandte, Gäste mit Karte | Nur das, was der **Zweigverwalter nach oben** freigibt – **themenbezogen**. |
| **Eigene Identität** | Jede eingeloggte Person mit **eigener Personenkarte** | Kurztext, Fotos, persönliche Momente auf der **eigenen Karte** im erlaubten Rahmen. **Beziehungen:** nach Grundfestlegung und Admin-Sperre **keine** freie Änderung mehr. |

*Konkrete Namen in der App kommen aus den **Karten** (Beziehungen nur aus gespeicherten Daten). Dieses Blatt nennt keine privaten Details – nur **Rollen**.*

[SEITENUMBRUCH]

## 3. Beispiel „Baum“ nur als Denkhilfe

Grobskizze – **keine** Stammdaten aus dem Repo:

```
                    [Generation oben – Vorfahren / Wurzeln …]
                                      │
              ┌───────────────────────┴───────────────────────┐
              │         Paar / Kopf (Kern der Linie)         │
              └───────────────────────┬───────────────────────┘
        ┌─────────────┬───────────────┼───────────────┬─────────────┐
        │   Zweig 1   │   Zweig 2   │   …           │   Zweig n   │
        │ Verwalter A │ Verwalter B │               │ Verwalter … │
        │  nach unten │  nach unten │               │  nach unten │
        └─────────────┴──────────────┴───────────────┴─────────────┘
```

**Familie Kreinecker:** Zweige mit echten Linien füllen (**Verwalter** = automatisch Paar/Kleinfamilie an der Spitze; **Lesen nach oben** = freigegeben vom Zweigverwalter). Die App soll die Struktur später **aus den Karten** ableiten können – Voraussetzung: klare Regel „Zweig = …“ (siehe Fußnoten).

[SEITENUMBRUCH]

## 4. Seiten der App (Konzept)

### 4.1 Start / Meine Familie

- **Oben:** Name der Familie („Familie Kreinecker“), optional „Du bist eingeloggt als …“ (Person verknüpft).
- **Kacheln:** Stammbaum, Events & Kalender, Geschichte, Gedenkort, Einstellungen – **Ampel** oder Badges: „Du darfst hier schreiben“ / „nur Lesen“ je Bereich.

### 4.2 Stammbaum

- **Lesen:** Sichtbarkeit gemäß Rolle + Leseregeln (z. B. ganzer Baum für Inhaber; eingeschränkt für andere).
- **Schreiben:** Neue Person / Kanten nur mit Zweigverwalter:in oder Inhaber (nach Regel).
- **Signal:** Am **Zweig** (Farbe oder Icon): „Du bist Verwalter:in dieses Zweigs“.

### 4.3 Person „meine Karte“ / fremde Person

- **Eigene Karte:** Texte, Fotos, persönliche Momente im erlaubten Rahmen. **Höchstpersönliches** (über Namen, Geburtsdaten, Beziehungen hinaus): **auch Administrator:in** schreibt dort **nicht** auf fremden Karten.
- **Fremde Karte:** Nur Anzeige oder Bearbeiten gemäß Rolle (Zweigverwalter:in nach unten vs. Leser:in).
- **Beziehungen:** Sind sie **einmal grundsätzlich festgelegt**, sperrt **Administrator:in** die Struktur-Funktion – **niemand** ändert die Grundverknüpfung mehr im Alltag (Details: `docs/K2-FAMILIE-RECHTE-ZWEIGE.md`).

### 4.4 Einstellungen → Rechte & Sichtbarkeit (später)

- **Inhaber:in:** Inhaber, **Standard-Leseregel** „nach oben“ (grob). **Zweigverwalter:innen** ergeben sich **automatisch** aus Paar/Kleinfamilie an der Spitze (keine separate Ernennungsliste für diese Ebene).
- **Zweigverwalter:in:** Für „meine Linie nach oben“: wer darf mitlesen – optional **themenweise**.

### 4.5 Events & Kalender

- Teilnehmerkreis wie heute; später optional: „nur dieser Zweig“ statt viele Einzelklicks.

[SEITENUMBRUCH]

## 5. Vor Programmierung klären

1. **Definition „Zweig“** bei Kreinecker: Varianten in `docs/K2-FAMILIE-RECHTE-ZWEIGE.md` – eine **Hausregel** wählen.  
2. ~~**Wer ist Verwalter:in?**~~ **Festgelegt:** Paar an der Spitze eines Astes **oder** Kleinfamilie = **automatisch** Verwalter; Administrator = Ausnahme-Rolle für Instanz + Sperren (siehe RECHTE-ZWEIGE).  
3. **Lesen nach oben:** für den Start eine **grobe Stufe**, Feintuning später.  
4. **Konten:** Person ↔ Login – erst dann „jede:r die eigene Karte“ technisch rund.

[SEITENUMBRUCH]

## 6. Kurzfassung

- **Beispiel-Familie: Kreinecker** – komplex, real, **kein** Huber-Demo-Muster.  
- **Seiten:** Start mit Ampel, Stammbaum mit Zweig-Signal, Person (eigen vs. fremd), Einstellungen für Inhaber/Zweig-Leseregeln (später).  
- **Nächster Schritt:** Regeln in Punkt 5 festziehen – dann Architektur und Code.

---

*Abstimmungshinweis: keine Abfrage echter Familiendaten im Repo.*

**Ende Druckfassung** – im Browser **Drucken** wählen, Format **A4**, ggf. **Hintergrundgrafiken** für Farbdiagramme aktivieren.
