# Prospekt – Produktinformation K2 Familie

**Ausführlicheres Prospekt** mit mehr Produktinformation – **ableitend** aus dem [Flyer / Kurzprospekt Verkaufsargumentation](01-FLYER-KURZPROSPEKT-VERKAUFSARGUMENTATION.md) und inhaltlich **abgestimmt** mit dem **K2 Familie Handbuch** (`public/k2-familie-handbuch/`).

Kurzfassung für den ersten Kontakt: [01-FLYER-KURZPROSPEKT-VERKAUFSARGUMENTATION.md](01-FLYER-KURZPROSPEKT-VERKAUFSARGUMENTATION.md).

[SEITENUMBRUCH]

## 1. Produktidentität

**K2 Familie** ist eine **eigenständige** digitale Plattform für Familien: Stammbaum, Beziehungen, Erinnerungen, Kalender und Gedenken – **mandantenisoliert**, mit **eigener Ethik** und **klarer Trennung** von K2 Galerie, ök2 (Demo) und VK2 (Verein).

| Aspekt | Inhalt |
|--------|--------|
| **Marke / Anbieter** | **kgm solution** – Qualität unter einem Dach; K2 Familie als **eigenes Produkt** |
| **Datenraum** | Nur `k2-familie-*` – **keine** Vermischung mit Galerie-, Demo- oder Vereinsdaten |
| **Grundbotschaft** | Inklusion, Respekt, **Genom:** Daten der Familie, **keine** kommerzielle Verwertung – siehe `docs/K2-FAMILIE-GRUNDBOTSCHAFT.md` |

[SEITENUMBRUCH]

## 2. Funktionsmodule (Überblick)

| Modul | Nutzen in einem Satz |
|-------|----------------------|
| **Personenkarten** | Jede Person mit Profil; **Beziehungen** werden **nur aus den gespeicherten Karten** abgeleitet – eine Quelle der Wahrheit |
| **Stammbaum** | Visualisierung der Linie; festes Muster, erweiterbar |
| **Rollen** | **Inhaber:in**, **Bearbeiter:in**, **Leser:in** – klare Rechte ohne technisches Rätselraten |
| **Einladungen** | Familieninterne Einladung neuer Mitglieder; Status und Ablauf im Handbuch beschrieben |
| **Momente** | Erinnerungen und Ereignisse im Familienkontext |
| **Kalender / Events** | Termine und Jahrestage in der Familienlogik |
| **Geschichte** | Längere Texte und Familiengeschichte – gebündelt im Produkt |
| **Gedenkort** | Würdevolle Erinnerung an Verstorbene – ohne „Show“-Logik |
| **Lizenz & Mandant** | Eigene Lizenzlinie K2 Familie; **nicht** identisch mit K2-Galerie-Lizenzen – siehe `docs/K2-FAMILIE-LIZENZMODELL-BRUECKE.md` |

Details und Bedienung: **K2 Familie Benutzerhandbuch** in der App (`public/k2-familie-handbuch/`, Index `00-INDEX.md`).

**Heft 3 – Produktfeatures:** [Produktfeatures – Überblick für Vertrieb](03-K2-FAMILIE-PRODUKTFEATURES.md) (Nutzen im Gespräch, Tabellen, zum Drucken).

[SEITENUMBRUCH]

## 3. Technik und Architektur (für Anbieter & IT-Einsteiger)

- **Multi-Tenant:** Eine **Instanz / Mandant** pro Familie – Datenisolation wie bei anderen Mandanten der Plattform.
- **Speicher:** Ausschließlich **k2-familie-*** Keys im Browser; keine stillen Überschreibungen fremder Kontexte.
- **Sicherheit:** Lizenznehmer erhalten **keinen** Zugriff auf ök2/VK2-Strukturen der Plattform (eiserne Regel – Hostname / Tenant).
- **Stand & Deployment:** Wie die Gesamt-PWA – gleicher **Build-Stand** über Geräte hinweg (siehe Projektregeln Stand/QR).

Vertiefte technische Einstiege: `docs/EINSTIEG-INFORMATIKER-SYSTEM-WARTUNG.md`, `docs/K2-FAMILIE-LEHREN-AUS-K2-GALERIE.md`.

[SEITENUMBRUCH]

## 4. Recht, Datenschutz, Vertrauen

- **DSGVO / EU** als Rahmen; Verarbeitung im Kontext des **Familien-Mandanten**.
- **Datensouveränität:** Export und Ausdruck wo vorgesehen – `docs/K2-FAMILIE-DATENSOUVERAENITAET.md`.
- **Genom & Ethik:** Keine kommerzielle Verwertung der Familiendaten – **Vertrags- und Produktkonform** mit der Grundbotschaft.

[SEITENUMBRUCH]

## 5. Vertrieb und Einordnung

- **Strategie:** Zweig K2 Familie in `docs/MARKETING-STRATEGIE-AUTOMATISIERTER-VERTRIEB.md`.
- **Kontakt:** **info@kgm.at** – skalierbar, **ohne** Standard-Aufbau individueller 1:1-Kundenbetreuung (Plattformprinzip).
- **Unterlagen:** Dieser Prospekt + Kurzprospekt + Handbuch; **ein Standard** für Druck und PDF aus der App.

[SEITENUMBRUCH]

## 6. Literatur im Repo (Kurzliste)

| Dokument | Zweck |
|----------|--------|
| `docs/K2-FAMILIE-GRUNDBOTSCHAFT.md` | Ethik, Genom, Raumschiff-Anspruch |
| `docs/K2-FAMILIE-LIZENZMODELL-BRUECKE.md` | Lizenz K2 Familie vs. Galerie |
| `docs/K2-FAMILIE-DATENSOUVERAENITAET.md` | Export, Souveränität |
| `public/k2-familie-handbuch/00-INDEX.md` | Nutzerhandbuch – Kapitelübersicht |

[SEITENUMBRUCH]

## Vertriebsmappe – alle Kapitel

Übersicht **aller** Texthefte (FAQ, Lizenz, erste Schritte, B2B, Wettbewerb, Medien): [00-INDEX.md](00-INDEX.md).

---

*Stand: April 2026 · `public/k2-familie-praesentation/02-PROSPEKT-PRODUKTINFORMATION.md`*
