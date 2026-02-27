# Sync-Ablauf: Mac ↔ iPad (eine Quelle = Vercel)

**Kurz:** Speichern = Daten an Vercel. Anderes Gerät = von Vercel laden. Damit das funktioniert, muss Vercel neu bauen (siehe VERCEL-CHECKLISTE-BEI-KEINEM-STAND.md).

---

## Ablauf

| Schritt | Wer | Was |
|--------|-----|-----|
| 1 | Mac oder iPad | **Werk anlegen/bearbeiten** → **Speichern**. |
| 2 | App (automatisch) | Nach Speichern (nur K2): `publishMobile({ silent: true })` → POST an `/api/write-gallery-data` → GitHub wird aktualisiert (Vercel Serverless) bzw. lokal Vite + git-push. |
| 3 | Vercel | Neuer Commit → Build (1–2 Min). Wenn Build **Ready**, ist gallery-data.json auf der URL aktuell. |
| 4 | Anderes Gerät | **Galerie oder Vorschau** öffnen (oder Stand-Badge tippen) → lädt gallery-data.json von Vercel, merged mit lokal (ohne lokale Neu-Anlagen zu verwerfen). |

**Eine Quelle für Werke:** gallery-data.json auf **https://k2-galerie.vercel.app/gallery-data.json** (nach Veröffentlichen).

---

## Wenn Sync nicht ankommt

1. **Vercel baut nicht neu?** → **docs/VERCEL-CHECKLISTE-BEI-KEINEM-STAND.md** (Deployments, Production Branch, Build-Log).
2. **App-Stand alt (z. B. 13:26)?** → Dasselbe: Vercel muss neuen Build ausliefern; dann **refresh.html** oder QR neu.
3. **Werke verschwinden?** → Merge-Regeln (artworksStorage): Nie mit weniger Werken überschreiben; lokale Werke ohne Server-Eintrag behalten. Bei weiterem Problem: Konsole/Build-Log prüfen.

Ausführlich: **docs/BERICHT-ISTZUSTAND-SYNC-VERCEL-27-02-26.md**, **k2team-handbuch/16-MAC-IPAD-SYNC-SCHRITT-FUER-SCHRITT.md**.
