# K2 Familie – Datenmodell (Phase 1.1)

**Stand:** 02.03.26  
**Zweck:** Verbindliche Definition von Person, Beziehungen und Momenten. Grundlage für `familieStorage.ts` und alle K2-Familie-UI.

---

## 1. Person

Jede Person hat eine eindeutige ID und kann mit anderen über Beziehungen verbunden sein.

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | string | Eindeutige ID (z. B. UUID oder `person-1`) |
| `name` | string | Anzeigename |
| `photo` | string | Bild (URL, Data-URL oder Vercel-Pfad) – optional |
| `shortText` | string | Kurztext / Beschreibung – optional |
| `parentIds` | string[] | IDs der Eltern (beliebig viele: biologische, soziale, Pflege) |
| `childIds` | string[] | IDs der Kinder |
| `partners` | PartnerRef[] | Partner*innen – **mit Zeitraum** für wechselnde Partnerschaften (siehe unten) |
| `siblingIds` | string[] | IDs der Geschwister |
| `wahlfamilieIds` | string[] | IDs von Menschen aus der Wahlfamilie („wer gehört für mich dazu“) |
| `createdAt` | string (ISO) | Erstellungszeit – optional |
| `updatedAt` | string (ISO) | Letzte Änderung – optional |

**Grundbotschaft:** Keine Kategorien, die ausgrenzen. Eltern/Kinder/Partner*innen/Geschwister/Wahlfamilie sind flexibel befüllbar – jede Konstellation hat Platz.

---

## 2. PartnerRef – Partner*innen mit Zeitraum

Wechselnde Partnerschaften brauchen einen Zeitraum (von–bis). Wer aktuell verbunden ist, hat `to` leer oder null.

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `personId` | string | ID der anderen Person |
| `from` | string (ISO-Datum) oder null | Beginn der Beziehung – null = unbekannt/offen |
| `to` | string (ISO-Datum) oder null | Ende der Beziehung – null = andauern |

**Beispiel:** Zwei Partnerschaften nacheinander → zwei Einträge in `partners`, der erste mit `to` gesetzt, der zweite mit `to: null`.

---

## 3. Moment (später Phase 3.1)

Ein Moment ist wie ein „Werk“ – Bild + Titel + Datum + Text. Für Hochzeit, Geburt, Umzug, Abschied, Neuanfang, Alltägliches.

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | string | Eindeutige ID |
| `personId` | string | Zu welcher Person dieser Moment gehört |
| `title` | string | Titel (z. B. „Hochzeit“, „Umzug Wien“) |
| `date` | string (ISO) oder null | Datum des Moments |
| `image` | string | Bild (URL, Data-URL, Vercel-Pfad) – optional |
| `text` | string | Beschreibung / Geschichte – optional |
| `createdAt` / `updatedAt` | string (ISO) | Optional |

Speicher: `k2-familie-{tenantId}-momente` (eigener Key pro Tenant). Lade/Schreib über `familieStorage.ts`: `loadMomente(tenantId)`, `saveMomente(tenantId, list, { allowReduce })`. **Erledigt Phase 3.1.**

---

## 4. Familien-Event (Phase 3.2)

Geburtstage, Treffen, Feste – mit Datum und Teilnehmern (Personen-IDs).

| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | string | Eindeutige ID |
| `title` | string | Titel (z. B. „Geburtstag Anna“, „Familientreffen“) |
| `date` | string | Datum (ISO, z. B. YYYY-MM-DD) |
| `participantIds` | string[] | IDs der teilnehmenden Personen (aus Stammbaum) |
| `note` | string | Optional: Ort, Hinweise |
| `createdAt` / `updatedAt` | string (ISO) | Optional |

Speicher: `k2-familie-{tenantId}-events`. `loadEvents(tenantId)`, `saveEvents(tenantId, list, { allowReduce })`. **Erledigt Phase 3.2.**

---

## 5. Speicher (localStorage) – Tenant-basiert

- **Personen:** `k2-familie-{tenantId}-personen` → Array von Person. Lade/Schreib über `familieStorage.ts`: `loadPersonen(tenantId)`, `savePersonen(tenantId, list, { allowReduce })`.
- **Momente:** `k2-familie-{tenantId}-momente` → Array von Moment. `loadMomente(tenantId)`, `saveMomente(tenantId, list, { allowReduce })`.
- **Events (Phase 3.2):** `k2-familie-{tenantId}-events` → Array von Event (title, date, participantIds, note). `loadEvents(tenantId)`, `saveEvents(tenantId, list, { allowReduce })`.
- **Erster Tenant:** `default` (Konstante `K2_FAMILIE_DEFAULT_TENANT` in `src/utils/familieStorage.ts`). Später mehrere Familien = mehrere TenantIds.

**Regeln (unveränderlich):**
- Keine automatischen Löschungen. Kein Filter, der still Einträge entfernt und zurückschreibt.
- Schreiben nur nach expliziter User-Aktion (Speichern, Löschen, Bearbeiten).
- Vor kritischen Änderungen: Backup (wie bei K2).

---

## 5. Beziehungen konsistent halten

Wenn Person A `childIds: [B]` hat, soll Person B `parentIds: [A]` haben (oder umgekehrt gepflegt). UI/Validierung kann darauf hinweisen – aber **niemals** still automatisch „aufräumen“ und überschreiben (Datenschutz). Lieber einmalige manuelle Bereinigung anbieten.

---

## 6. Nächste Schritte (nach 1.1)

- **1.2** Tenant anlegen – **erledigt:** `K2_FAMILIE_DEFAULT_TENANT = 'default'` in `src/utils/familieStorage.ts`.
- **1.3** `familieStorage.ts` – **erledigt:** `loadPersonen(tenantId)`, `savePersonen(tenantId, list, { allowReduce })` mit gleichen Schutzregeln wie artworksStorage.

**Weiter:** Phase 2 – erste UI (Stammbaum-Ansicht, Personen-Seite).

---

**Quelle:** `docs/K2-FAMILIE-ROADMAP.md` Phase 1. Typen: `src/types/k2Familie.ts`. Storage: `src/utils/familieStorage.ts`.
