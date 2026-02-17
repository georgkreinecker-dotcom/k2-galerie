# Checklisten: Einsturzsicher & Einbruchsicher

**Stand:** 17.02.26  
**Zweck:** Beim Ändern von Code oder Infrastruktur diese Punkte im Blick behalten – damit das „Haus“ stabil und sicher bleibt.

---

## Einsturzsicher – 5 Punkte

1. **Error Boundaries nicht entfernen**  
   `AppErrorBoundary`, `AdminErrorBoundary`, `ErrorBoundary.tsx` fangen React-Fehler ab. Ohne sie crasht die ganze App bei einem Fehler in einer Komponente.

2. **Try/Catch bei Speicher & Netz**  
   Jeder Zugriff auf `localStorage`, Supabase, `fetch`, `JSON.parse`/`stringify` sollte in try/catch liegen – sonst kann ein Quota- oder Netzfehler die App zum Absturz bringen.

3. **Timeouts bei fetch/API**  
   Lange laufende oder hängende Requests mit `AbortController` und Timeout begrenzen (z. B. 8–30 s). Verhindert Endlosschleifen und Crashes durch „ewiges Warten“.

4. **Admin-Start entlastet lassen**  
   Kein automatischer Safe-Mode-Check und kein Auto-Sync (Supabase/gallery-data) direkt beim Mount – nur verzögertes Laden (z. B. 3 s Werke, 1,5 s Stammdaten). Details: `docs/CRASH-FIXES-STAND-17-02-26.md`.

5. **Keine automatischen Reloads**  
   Kein `setTimeout(() => window.location.reload())` in Reaktions auf Daten – nur manueller „Aktualisieren“-Button. Automatische Reloads haben früher zu Crashes geführt.

---

## Einbruchsicher – 5 Punkte

1. **Secrets nie ins Repo**  
   `.env`, `.env.local`, `.env.production` stehen in `.gitignore`. Supabase-URL und Anon-Key nur über `VITE_*`; keine Passwörter oder API-Keys im Quellcode.

2. **K2/ök2 getrennt halten**  
   Bei allem, was Werke/Stammdaten/Events betrifft: `tenantId` / `musterOnly` prüfen. ök2 nur in `k2-oeffentlich-*` Keys schreiben, nie in `k2-artworks`, `k2-stammdaten-*` usw. Doku: `docs/K2-OEK2-DATENTRENNUNG.md`.

3. **Kein User-Input in innerHTML**  
   Kein `dangerouslySetInnerHTML` mit Nutzerdaten. In `main.tsx` werden Fehlermeldung und Stack **escaped** (escapeHtml), bevor sie in innerHTML landen – XSS-Risiko minimiert.

4. **Supabase: RLS & Rechte prüfen**  
   Row Level Security und Tabellen-Berechtigungen in Supabase regelmäßig prüfen. Aktueller Stand und Optionen zum Schärfen: `docs/SUPABASE-RLS-SICHERHEIT.md`.

5. **Abhängigkeiten aktuell halten**  
   Regelmäßig `npm audit` ausführen und kritische/hohe Schwachstellen beheben. Bekannte Lücken in Dependencies sind ein klassischer „Einbruch“.

---

## Wo nachschlagen

- **Crash-Fixes (nicht zurückdrehen):** `docs/CRASH-FIXES-STAND-17-02-26.md`
- **K2 vs. ök2:** `docs/K2-OEK2-DATENTRENNUNG.md`
- **Supabase RLS:** `docs/SUPABASE-RLS-SICHERHEIT.md`
- **Verbesserungen ohne Mehrkosten:** `docs/VERBESSERUNGEN-OHNE-MEHRKOSTEN.md`
- **Produkt-Label & Regress (Zahlungen/Vergütung):** `docs/PRODUKT-LABEL-SICHERHEIT-ROADMAP.md`
- **Projekt-Übersicht:** `HAUS-INDEX.md` (Root)

---

## Wo wir auf der Skala stehen (nach Optimierung, 17.02.26)

**Von außen (Angriffe):** **6–6,5 / 10**  
- Plus: Secrets nicht im Repo, XSS reduziert (Escape + Stack nur in Dev), CORS nur bekannte Origins, Security-Header, K2/ök2 getrennt.  
- Minus: Anon-Key im Frontend sichtbar, RLS derzeit offen, ök2-Admin nur Passwort im localStorage – echte „10“ erst mit Auth + schärferer RLS.

**Von innen (Stabilität / eigene Fehler):** **7,5–8 / 10**  
- Plus: Error Boundaries, try/catch, Timeouts, keine Auto-Reloads, Admin-Start entlastet, klare Trennung K2/ök2, Checklisten.  
- Minus: Sehr große Seiten bleiben komplex; „10“ wäre nur bei weniger Risiko durch Größe und perfekte Nutzung.
