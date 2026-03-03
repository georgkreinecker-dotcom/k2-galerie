# Stand – Mac, Handy, iPad

**Stand** = Version dieser App (unten links, z. B. „Stand: 2026-02-11 14.43“).

**Regel:** Sobald eine Umsetzung (Feature/Fix) erledigt ist, **sofort** einen neuen Stand setzen: `node scripts/write-build-info.js` ausführen (oder `npm run dev` / `npm run build` – die rufen das Script auf). Keine abgeschlossene Änderung ohne aktualisierten Stand.

- **Mit „(lokal)“** → Du siehst die App vom Mac (Dev-Server). Handy kann anderen Stand haben (Vercel).
- **Ohne „(lokal)“** → App vom gleichen Server wie andere Geräte (z. B. Vercel).

**Merken:** „Stand … (lokal)“ = Anzeige kommt aus dem **letzten lokalen Build** (Datei `buildInfo.generated.ts`). **Commit/Push allein ändert das nicht** – der Build läuft auf Vercel, nicht auf deinem Mac. Dein lokaler Stand bleibt z. B. 11:49, bis du auf dem Mac einmal **`npm run build`** ausführst (dann schreibt write-build-info.js die Datei neu).

**Wann gibt es einen neuen Stand?**  
- **Lokal (lokal):** Nur wenn du **`npm run build`** auf dem Mac ausführst. `npm run dev` aktualisiert den Stand **nicht** (damit Cursor ruhig bleibt).  
- **Vercel/Handy:** Nach Push baut Vercel; 1–2 Min später ist der neue Stand auf k2-galerie.vercel.app. Um ihn zu sehen: App dort öffnen (nicht localhost) oder QR neu scannen.

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
