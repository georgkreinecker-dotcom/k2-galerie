# Stand – Mac, Handy, iPad

**Stand** = Version dieser App (unten links, z. B. „Stand: 2026-02-11 14.43“).

**Regel:** Sobald eine Umsetzung (Feature/Fix) erledigt ist, **sofort** einen neuen Stand setzen: `node scripts/write-build-info.js` ausführen (oder `npm run dev` / `npm run build` – die rufen das Script auf). Keine abgeschlossene Änderung ohne aktualisierten Stand.

- **Mit „(lokal)“** → Du siehst die App vom Mac (Dev-Server). Handy kann anderen Stand haben (Vercel).
- **Ohne „(lokal)“** → App vom gleichen Server wie andere Geräte (z. B. Vercel).

**Merken:** Neuester Stand ist immer am Mac (hier wird gebaut; Mobil kann keinen Code ändern). Bei jedem `npm run dev` wird der Stand am Mac aktualisiert (`write-build-info.js`). Mobil zeigt die zuletzt deployte Version.

**Wann gibt es einen neuen Stand?** Nach Code-Änderungen: am Mac beim nächsten `npm run dev`; für Mobil nach `npm run build` und Deploy (dann zeigt die deployte Version den neuen Stand).

**Anderer Stand auf einem Gerät?** Dort **Cmd+Shift+R** (Mac) bzw. Seite neu laden / Cache leeren → dann überall gleich.

---

## Mac zeigt alten Stand

**Cmd+Shift+R** (Hard Refresh) oder Browser-Cache leeren oder Galerie in einem **privaten Fenster** öffnen.

---

## iPad lädt nicht / alter Stand

1. Gleiche URL wie auf dem Handy (QR-Code liefert sie).
2. Safari: Verlauf und Websitedaten löschen (oder nur für diese Seite).
3. QR-Code **neu** scannen oder URL von Hand eingeben.

---

## Kurz

| Gerät | Lösung |
|-------|--------|
| Mac | Cmd+Shift+R oder Cache leeren |
| iPad | Safari Cache leeren, QR neu scannen |
| Handy | Meist schon aktuell |

Nach neuem Deployment: 1–2 Min warten, dann auf allen Geräten neu laden (Cmd+Shift+R / QR neu scannen).
