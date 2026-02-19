# Code 5 – Cursor-Fenster crasht

**Wenn Cursor mit „reason: crashed, code: 5“ abstürzt – und die Einschläge immer häufiger kommen:**

Das Problem liegt **viel tiefer** – in der **Cursor-Preview** (iframe/Electron), nicht im App-Code. Es trifft **nicht nur** das Preview-Fenster: **Der ganze Host (Cursor/Rechner) kann mit abstürzen.** Die stabile Lösung ist, die Preview **gar nicht** für die laufende App zu nutzen. (Technisch: Wenn die App im iframe erkannt wird, lädt sie dort nicht mehr – nur ein Hinweis „Im Browser öffnen“. So bleibt der Host stabil.)

---

## Sofort-Lösung: App im normalen Browser, nicht in der Preview

- **Chrome oder Safari** öffnen
- Adresse: **http://localhost:5177** (bzw. der Port, den `npm run dev` anzeigt)
- **Dort** die App nutzen (APf, Galerie, Admin, alles)
- **Cursor-Preview** schließen oder minimieren – in Cursor nur noch Code bearbeiten, Terminal, Git

So crasht das Cursor-Fenster nicht. Die App läuft stabil im Browser; Cursor bleibt für Editor und Befehle offen.

---

## Wichtig: Preview in Cursor **schließen**, sonst unterbricht sie die Arbeit

Auch wenn die App in Chrome läuft: **Solange die Cursor-Preview offen ist**, kann sie crashen und **Cursor selbst unterbrechen** (Fenster weg, Chat weg, Zeitverlust).

- **Preview-Panel / Preview-Tab in Cursor schließen** (nicht nur minimieren – wirklich schließen, damit die App dort nicht mehr läuft).
- Dann läuft die App **nur** im Browser (localhost), und in Cursor **nur** Editor + Terminal. Nichts, das in Cursor crashen und deine Arbeit unterbrechen kann.

**Wenn localhost erst abstürzt, wenn du Cursor wieder öffnest:** Browser-Tab mit localhost vor dem Schließen von Cursor schließen. Nach dem Öffnen von Cursor: `npm run dev` neu starten, dann Browser mit localhost öffnen. (Details: docs/CRASH-BEREITS-GEPRUEFT.md → „Localhost stürzt erst ab, wenn Cursor wieder öffnet“.)
