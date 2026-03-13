# Lehre: Design-Fehler „Server = einzige Wahrheit“ (13.03.26)

**Zweck:** Dokumentieren, was von Anbeginn hätte gelten müssen – und warum es nicht so gebaut wurde. Damit dieselbe Art Fehler bei Sync, „authoritative source“ und anderen Themen nicht wieder passiert.

---

## Was schiefgelaufen ist

**Nutzererwartung (Georg):** „Wenn ich an Server sende, ist das der absolut richtige Stand. Nach dem Abholen müssen alle Daten und Fotos zu 100 % gleich an Mac und Handy sein – ohne Wenn und Aber.“

**Was gebaut war:** Beim „Vom Server laden“ wurde **gemergt** – und bei Konflikt (gleiches Werk auf Server und lokal) galt:
- **Mobile gewinnt:** Lokales Werk mit `createdOnMobile` ersetzte die Server-Version.
- **Neueres updatedAt gewinnt:** Lokales Werk mit neuerem Zeitstempel ersetzte die Server-Version.

**Folge:** Nach „An Server senden“ (vom iPad) und „Aktuellen Stand holen“ (am Mac oder Handy) konnte der **lokale** Stand den gerade gesendeten **Server-**Stand wieder überschreiben. Mac und Handy waren nicht zu 100 % identisch mit dem, was der Nutzer bewusst an den Server geschickt hatte. Das kostete viele Stunden Frust und Nacharbeit.

**Georg:** „Das hätten wir von Anbeginn gebraucht.“ – „Wie viele Stunden hätte ich mir ersparen können. Jetzt ist es so wie es gehört. Dokumentiere diese Idiotie, damit so etwas nie wieder passiert – auch bei anderen Problemen.“

---

## Die richtige Grundregel (von Anfang an)

| Nutzeraktion | Bedeutung | Technische Konsequenz |
|--------------|-----------|------------------------|
| **„An Server senden“** | Dieser Stand ist verbindlich. | Server speichert exakt das, was gesendet wird. |
| **„Vom Server laden“ / „Aktuellen Stand holen“** | Ich will genau den Stand, der auf dem Server liegt. | Ein **auf dem Server vorhandenes** Werk wird **niemals** durch die lokale Version ersetzt. Server = einzige Wahrheit für alle Einträge, die der Server hat. |

**Einzige Ausnahme (bewusst):** Lokale Werke **ohne** Server-Eintrag (z. B. gerade am Handy angelegt, noch nicht gesendet) können beim Laden ergänzt werden (`onlyAddLocalIfMobileAndVeryNew`), damit nichts verloren geht. Das ändert nichts an der Regel: **Was der Server hat, gewinnt immer.**

---

## Warum der Fehler entstand

- **Typische Sync-Mentalität:** „Lokale Änderungen schützen“, „nichts überschreiben“. Daraus wurde „bei Konflikt gewinnt Mobile“ bzw. „neueres updatedAt“. Klingt sicher, ist aber falsch, sobald der Nutzer **explizit** „dieser Stand gilt“ gesagt hat (durch Senden).
- **Grundregel nicht zuerst geklärt:** Es wurde nicht zuerst festgelegt: „Nach explizitem Senden ist der Server die einzige Wahrheit beim Abholen.“ Stattdessen wurde ein generischer Merge mit Konfliktregeln gebaut.

---

## Was wir daraus für alle ähnlichen Themen ableiten

1. **Bei Sync / „authoritative source“ / „eine Quelle der Wahrheit“:**  
   **Zuerst** die Grundregel klären: **Nach welcher expliziten Nutzeraktion ist wer die einzige Wahrheit?** Dann bauen – nicht umgekehrt.

2. **Bei „Merge“ immer fragen:**  
   Darf Lokal den Server **jemals** überschreiben, wenn der Nutzer gerade „Stand vom Server holen“ ausgeführt hat? Wenn die Antwort „Nein“ ist (wie hier), darf der Merge das nie tun.

3. **Für andere Probleme:**  
   Bevor man komplexe Regeln (Mobile gewinnt, neueres gewinnt, Fallbacks) einbaut: **Nutzererwartung und Grundgesetz** in einem Satz formulieren. Dann prüfen, ob der geplante Code dieses Gesetz erfüllt.

---

## Umsetzung (13.03.26)

- **Option `serverAsSoleTruth: true`** in `mergeServerWithLocal` (syncMerge.ts): Wenn gesetzt, wird ein vorhandenes Server-Werk **nie** durch die lokale Version ersetzt.
- **Alle Lade-Pfade** (GaleriePage handleRefresh/loadData, Admin „Aktuellen Stand holen“, Supabase loadArtworksFromSupabase) übergeben diese Option.
- **Doku:** PROZESS-VEROEFFENTLICHEN-LADEN.md (eisernes Gesetz), prozesssicherheit-veroeffentlichen-laden.mdc (Pflicht serverAsSoleTruth beim Laden).

---

## Verweise

- **Prozess:** docs/PROZESS-VEROEFFENTLICHEN-LADEN.md (Abschnitt 2, eisernes Gesetz).
- **Regel:** .cursor/rules/prozesssicherheit-veroeffentlichen-laden.mdc.
- **Code:** src/utils/syncMerge.ts (`serverAsSoleTruth`, Merge-Logik).

**Kurzfassung:** Wer „authoritative source“ oder Sync baut: Zuerst die eine Grundregel festlegen (wer ist nach welcher Aktion die Wahrheit?). Dann implementieren. So etwas wie „Lokal überschreibt Server beim Abholen“ darf nie wieder aus Versehen eingebaut werden.
