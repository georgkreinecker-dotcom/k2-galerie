# Stand & QR – So bleibt es dauerhaft (für Georg und alle Sessions)

Georg hat das Problem **viele Male** gehabt: Handy zeigt alte Version (z.B. 15:22), obwohl auf Vercel neu (15:46). Es wird gefixt, ein paar Sessions später ist es wieder kaputt → Stunden Frust.

**Die Lösung, die damals funktioniert hat:** Ein QR mit der **festen Vercel-URL** zur Galerie. Genau die haben wir – nur so abgesichert, dass Caches keine alte Version mehr liefern können: Dieselbe URL (`https://k2-galerie.vercel.app/projects/k2-galerie/galerie`) wird im QR um **Server-Stand** und **einen eindeutigen Parameter** ergänzt (`?v=...&_=...`). Ein Scan = eine frische URL = aktuelle Version. Das ist derselbe funktionierende QR, nur dauerhaft gegen Cache abgesichert.

Damit das **nicht wieder passiert**, gelten feste Regeln. Sie stehen in **.cursor/rules/stand-qr-niemals-zurueck.mdc** (immer angewendet) und hier in Kurzform.

---

## Was immer gelten muss

### 1. QR-Code = Server-Stand + Cache-Bust

- Der QR-Code auf dem Mac wird mit dem **aktuellen Stand von Vercel** gebaut (nicht mit dem lokalen Build).
- Zusätzlich wird **bei jeder Anzeige** ein neuer Parameter angehängt (`&_=Zeitstempel`), damit jede gescannte URL einmalig ist und kein CDN eine alte Version liefern kann.
- **Technisch:** `buildQrUrlWithBust(url, useQrVersionTimestamp())` aus `src/hooks/useServerBuildTimestamp.ts`. **Nicht** nur `urlWithBuildVersion(url)` verwenden.

### 2. Altes HTML lädt sich einmal neu

- Beim Build wird ein kleines Script in die index.html eingefügt. Es prüft:
  - Ist die geladene Seite älter als 2 Minuten? → einmal neu laden mit Cache-Bust.
  - Ist auf dem Server eine neuere Version? → einmal neu laden.
  - Schlägt der Abruf fehl (z.B. fremdes WLAN)? → einmal neu laden (max. einmal pro Session).
- Dieses Script **darf nicht** entfernt oder so vereinfacht werden, dass diese drei Punkte wegfallen.

### 3. Vercel liefert keine gecachte Version

- In `vercel.json` stehen für index.html und build-info.json **no-cache**-Header. So werden immer die neuesten Dateien ausgeliefert.

### 4. Eine Quelle für die Regeln

- **.cursor/rules/stand-qr-niemals-zurueck.mdc** ist die verbindliche Regel. Jede Änderung an Build, QR, Stand oder Vercel-Config muss diese Regel einhalten. Dort steht auch eine Checkliste vor Änderungen.

---

## Wenn doch wieder alter Stand erscheint

1. **Vercel:** Ist der letzte Push auf **main** gebaut und **Current**? (Vercel Dashboard)
2. **QR:** Wird der QR **nach** dem Deployment neu angezeigt? (APf-Seite neu laden, dann QR scannen)
3. **Regel:** Wurde irgendwo wieder nur `urlWithBuildVersion` für den Galerie-QR verwendet? → Zurück zu `buildQrUrlWithBust` + `useQrVersionTimestamp`.

---

## Dateien, die nicht „zurückgebaut“ werden dürfen

| Datei / Bereich | Was nicht entfernen/ändern |
|-----------------|----------------------------|
| `src/hooks/useServerBuildTimestamp.ts` | Hook und `buildQrUrlWithBust`; Abfrage von build-info.json |
| `GaleriePage.tsx`, `PlatformStartPage.tsx`, `MobileConnectPage.tsx` | QR mit `buildQrUrlWithBust(..., useQrVersionTimestamp())` |
| `scripts/write-build-info.js` | Aufruf mit `--inject-html`; vollständiges Inject-Script (Stale + build-info + Fehler-Reload) |
| `index.html` | Placeholder `<!-- BUILD_TS_INJECT -->` |
| `vercel.json` | no-cache für `/`, index.html, build-info.json, projects |

Diese Liste ist auch in der Cursor-Regel **stand-qr-niemals-zurueck.mdc** festgehalten.
