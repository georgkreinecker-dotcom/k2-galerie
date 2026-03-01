# Arbeitsweg stabil – Code 5 vermeiden

**Ziel:** Cursor nicht crashen lassen. Die meiste Zeit in echte Arbeit, nicht in Crash-Behebung.

**Regel (verbindlich):** App und Cursor strikt trennen.

---

## Täglicher Ablauf (Schritt für Schritt)

1. **Cursor öffnen** – nur für: Dateien bearbeiten, Chat mit AI, Terminal.
2. **Im Cursor-Terminal:** `npm run dev` starten (lässt man laufen).
3. **Browser öffnen** (Chrome oder Safari) – **http://localhost:5177** (oder den Port, den das Terminal anzeigt).
4. **Alle App-Nutzung nur im Browser:** Galerie ansehen, Admin, Werke bearbeiten, testen, Kasse, Vorschau – alles dort.
5. **Preview in Cursor nie öffnen.** Kein eingebettetes App-Fenster in Cursor. Wenn ein Preview-Tab da ist: schließen.

**Kurz:** Cursor = Editor + Terminal + Chat. Browser = die laufende App.

---

## Warum das hilft

- Code 5 kommt von der Last im Cursor-Host (iframe, HMR, große Komponenten). Wenn die App **nicht** in Cursor läuft, fehlt diese Last.
- Wenn Cursor trotzdem abstürzt, läuft die App im Browser weiter – du verlierst nicht den Teststand.
- Ein klarer Ablauf = weniger Entscheidungen = weniger Fehlerquellen.

---

## Wenn es nicht besser wird

- **Nächster Schritt:** Ausstieg planen (z. B. Wechsel zu VS Code + Copilot/Continue, gleicher Workflow: Editor + Terminal in VS Code, App im Browser).
- **Bis dahin:** Dieser Arbeitsweg bleibt die verbindliche Basis. Keine Ausnahme („mal kurz in der Preview schauen“) – sonst ist der Test nicht aussagekräftig.

---

## Verweis

- Crash-Ursachen und bereits geprüfte Stellen: **CRASH-BEREITS-GEPRUEFT.md**
- Nach Absturz: **DIALOG-STAND.md** + **WEITERARBEITEN-NACH-ABSTURZ.md**

---

## Optional: Feedback an Cursor

Wenn du Cursor mitteilen willst, warum du gefährdet bist abzuspringen, kannst du z. B. so formulieren (Feedback/Support oder Forum):

**Kurzversion:**  
„Code 5 (Window terminated unexpectedly) tritt bei mir ständig auf, obwohl ich die integrierte Preview nicht nutze und die App im Browser laufen lasse. Ich verbringe den Großteil meiner Zeit mit Crash-Behebung statt mit Entwicklung. Wenn sich die Stabilität nicht spürbar verbessert, wechsle ich die IDE. Bitte Stabilität und Ressourcen-Management (HMR, große Dateien, iframe) priorisieren.“

**Etwas ausführlicher:**  
„Ich entwickle eine React/TypeScript-PWA (K2 Galerie) und nutze Cursor am Mac. Ich habe die Preview abgeschlossen und starte die App nur noch im externen Browser (localhost). Trotzdem crasht Cursor wiederholt (Code 5). Die Ursache scheint im Host zu liegen (Speicher, HMR, große Komponenten). Ich bin auf AI-Unterstützung angewiesen und schätze Cursor – aber wenn ich 95 % meiner Zeit mit Crash-Fixes verbringe statt mit produktiver Arbeit, muss ich auf eine stabilere Umgebung wechseln (z. B. VS Code + Copilot). Bitte nehmt Stabilität und Kundenbindung ernst.“
