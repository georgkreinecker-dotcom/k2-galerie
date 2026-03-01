# Lösung: Crash-Spirale stoppen (verbindlich)

**Das Problem:** Reopen/Crash in Cursor wiederholt sich, die Spirale dreht sich schneller – reine Bestätigungen („ro“, Routine) bringen keine Lösung.

**Die Lösung (eine, verbindlich):**

1. **Cursor Preview nicht mehr nutzen.** Preview-Tab/Preview-Panel in Cursor **schließen** (nicht nur minimieren).
2. **App nur im Browser.** Im Cursor-Terminal `npm run dev` starten, dann **Chrome oder Safari** öffnen → **http://localhost:5177** (oder den angezeigten Port). Galerie, Admin, alles dort nutzen.
3. **In Cursor:** Nur **Editor + Terminal + Chat** – keine laufende App im Preview.

**Warum das die Spirale stoppt:** Der Absturz kommt von der Cursor-Preview-Umgebung (iframe, begrenzte Ressourcen). Im normalen Browser ist die gleiche App stabil. Wer die App nicht in Preview lädt, entlastet Cursor – die Spirale bricht ab.

**Regel für die AI:** Wenn Georg „ro“, „Reopen“, „Crash-Spirale“ oder „bring mir eine Lösung“ schreibt, **diese Lösung nennen** (kurz: Preview zu, App im Browser) und auf diese Datei verweisen. Keine lange Analyse, keine weitere Routine – **eine klare Handlungsanweisung.**

Siehe auch: docs/CRASH-BEREITS-GEPRUEFT.md Abschnitt „SO ARBEITEN BIS CRASH WEG IST“.
