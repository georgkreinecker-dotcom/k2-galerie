# mök2 & VK2 – geschützte Bereiche (was gilt, worauf du dich verlassen kannst)

**Stand:** Februar 2026

## Warum ist etwas „verschwunden“?

Inhalt, den du in **mök2** oder in den **Lizenzen** festgelegt hattest (z. B. **Lizenzstruktur VK2**, **Kunstvereine** statt Enterprise), lag in derselben Codebasis wie der Rest der App – aber in **eigenen, klar abgegrenzten** Bereichen:

- **mök2** = eigener Bereich (Marketing ök2, Vertrieb, Werbeunterlagen, **Lizenzstruktur VK2**).
- **Lizenzen** = Basic, Pro, **Kunstvereine (VK2)** als dritte Stufe.

Mögliche Ursachen, warum es trotzdem weg war:

1. **Refactor oder „Aufräumen“** ohne zu prüfen, ob in den geänderten Dateien auch mök2-/VK2-Inhalte stecken (z. B. MarketingOek2Page, LicenseManager, Mok2Layout).
2. **Feature entfernen / Zurücknehmen** und dabei nicht nur die eine gewünschte Sache entfernt, sondern auch Abschnitte, die in derselben Datei lagen (z. B. VK2-Sektion in mök2).
3. **Copy-Paste oder Merge** einer älteren Version einer Datei, in der die VK2-/Kunstvereine-Anpassungen noch nicht drin waren.
4. **Keine explizite Regel**, die sagte: „mök2 und VK2-Lizenzstruktur nicht anfassen, wenn die Aufgabe nichts damit zu tun hat.“

Das hat **nichts mit VK2-Code** (Routen, Galerie, Admin) zu tun – die Inhalte lagen in der **eigenen Struktur mök2** und in den **Lizenzen**. Trotzdem wurden sie verändert oder entfernt. Das bricht die Abmachung: **mök2 ist ein eigener Bereich; was du dort festgelegt hast, bleibt.**

---

## Was weiterhin gilt – worauf du dich verlassen kannst

### 1. Regeln im Projekt (unverändert)

- **.cursorrules** und **.cursor/rules/** – alle festgelegten Regeln gelten weiter: Kommunikation, Crash-Vermeidung, Stand/QR, K2/ök2-Trennung, **mök2 als eigener Bereich**, Skalierung, keine doppelten Eingaben, etc.
- **Feature entfernen** (.cursor/rules/feature-entfernen-vollstaendig.mdc): Nur die explizit genannte Sache entfernen; alle Referenzen in einem Zug; **nicht** andere Bereiche (z. B. mök2, VK2-Lizenz) mit löschen oder überschreiben.
- **Revert/Aufräumen** (.cursor/rules/revert-aufraumen-strikt.mdc): Nur den geänderten Ablauf aufräumen – **nicht** in anderen, unabhängigen Dateien (z. B. MarketingOek2Page, LicenseManager) Inhalte streichen.

### 2. mök2 – eigener Bereich

- **mök2** bleibt die **Arbeitsplattform für den Vertrieb von ök2**. Alles, was du dort als Sektion oder Seite angelegt hast (USPs, Lizenzen, **Lizenzstruktur VK2**, Werbeunterlagen, etc.), gehört zu diesem Bereich.
- **Regel für die Zukunft:** Änderungen, die **nicht** ausdrücklich „mök2-Inhalt anpassen“ oder „Sektion X in mök2 ändern“ sind, dürfen **keine** mök2-Sektionen löschen oder ersetzen. Bei Refactors in `MarketingOek2Page.tsx` oder `Mok2Layout.tsx`: prüfen, ob bestehende Sektionen (insbesondere **Lizenzstruktur VK2**) erhalten bleiben.

### 3. Lizenzen – Kunstvereine (VK2) als dritte Stufe

- In den **Lizenzen** (Konditionen & Vergebung) gilt: **Basic**, **Pro**, **Kunstvereine (VK2)**. Nicht „Enterprise“ als dritte Stufe.
- **LicenseManager:** Dritte Karte = **Kunstvereine** (Verein nutzt Pro; ab 10 registrierten Mitgliedern kostenfrei; Lizenzmitglied 50 % Lizenz; nicht registrierte Mitglieder im System erfasst). Keine Rücknahme zu „Enterprise“, außer du forderst es ausdrücklich.
- **LicencesPage (Lizenz vergeben):** Typen = Basic, Pro, VK2 (Verein). Entspricht der Lizenzstruktur in mök2 → Lizenzstruktur VK2.

### 4. Doku als Referenz

- **docs/VK2-VEREINSPLATTFORM.md** – inhaltliche Quelle für VK2-Logik und Lizenzbedingungen.
- **docs/LICENCE-STRUKTUR.md**, **docs/LIZENZMODELL-BASIC-PRO-ENTERPRISE.md** – können um den Hinweis ergänzt werden: dritte Stufe im Produkt = **Kunstvereine (VK2)**; Enterprise nur ggf. in der Doku als Option für später.

---

## Kurzfassung

- **Warum weg:** Refactor/Cleanup/Feature-Entfernen hat mök2- oder Lizenz-Inhalte mit erwischt, obwohl die Aufgabe nichts mit VK2/mök2 zu tun hatte.
- **Was gilt weiter:** Alle bestehenden Regeln; mök2 = eigener Bereich, Inhalte nicht ohne deine Anweisung entfernen; Lizenzen = Basic, Pro, **Kunstvereine (VK2)**.
- **Worauf du dich verlassen kannst:** Die Regeln in .cursorrules und .cursor/rules; plus die neue Schutzregel: mök2- und VK2-Lizenz-Inhalte nicht „nebenbei“ löschen oder überschreiben.

Diese Doku und die Cursor-Regel „mök2/VK2-Inhalte schützen“ stellen sicher, dass jede Session (AI/Entwickler) dasselbe einhält.
