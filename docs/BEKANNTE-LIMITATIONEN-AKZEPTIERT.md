# Bekannte Limitationen – akzeptiert, keine weiteren Versuche

**Zweck:** Themen, bei denen nach **vielen Versuchen keine Lösung** gefunden wurde. **Professionell = dokumentieren und einstellen**, nicht weiter „vielleicht geht’s diesmal“ probieren. Das wäre Dilettanten-Verhalten, kein Sportwagenmodus.

**Regel für die KI:** Zu diesen Punkten **keine** neuen Fix-Vorschläge oder „lass uns nochmal probieren“-Ansätze, es sei denn, es gibt eine **neue, konkrete Ursachenhypothese** oder ein neues Mittel (z. B. neues Tool, neue Erkenntnis). Dann zuerst mit Georg klären, ob ein gezielter Versuch gewollt ist.

---

## 1. ök2: Zwei Werkbilder fehlen (Musterwerke) – Fix 18.03.26

- **Symptom:** Bei den ök2-Musterwerken fehlen Bilder (blaue „Sonstiges“-Platzhalter, kaputte Unsplash-Bilder).
- **Ursache (konkrete Hypothese):** (1) `OEK2_DEFAULT_ARTWORK_IMAGES` hatte keine Keys `serie` und `konzept` → P1/I1 fielen auf „Sonstiges“. (2) Externe Unsplash-URLs für malerei/grafik lieferten teils 403 oder brachen ab → kaputtes Bild-Symbol.
- **Maßnahme (18.03.26):** Keys `serie` und `konzept` ergänzt; malerei und grafik von Unsplash auf stabile Inline-SVGs umgestellt (wie Keramik/Skulptur). Alle Musterwerke nutzen nur noch Inline-SVGs – keine externen URLs.
- **Vorher:** Abschnitt war als „akzeptiert“ dokumentiert. Der Fix erfolgte bewusst mit neuer, konkreter Hypothese (fehlende Keys + externe Abhängigkeit).

---

## 2. Alte Bilder am Handy (Stand / Cache)

- **Symptom:** Am Handy werden teilweise noch alte Bilder angezeigt (z. B. nach Update, Stand, QR).
- **Stand:** Mehrfach getestet; Ursachen vielfältig (Cache, Stand, Merge, Gerät). Keine allgemeingültige Lösung gefunden.
- **Entscheidung (13.03.26):** **Akzeptiert.** Keine weiteren „vielleicht diesmal“-Versuche. Wenn Georg konkrete neue Hinweise hat (z. B. reproduzierbarer Ablauf), kann gezielt analysiert werden – aber kein blindes Weiterexperimentieren.

---

## Warum diese Datei

- **Eine Quelle:** Wer (Mensch oder KI) auf diese Themen stößt, liest **hier**, dass sie als Limitation akzeptiert sind.
- **Kein Wiederholen:** Kein „lass uns nochmal X probieren“ ohne klaren neuen Ansatz. Das wäre unprofessionell und nicht Sportwagenmodus.
- **Georg (13.03.26):** „Da gibt es anscheinend keine Lösung … weist du keine Lösung sondern probierst halt vielleicht wird es schon mal gehen – das ist absolut unprofessionell und kein Sportwagenmodus, das machen Dilettanten so und nicht die Profis.“

*Angelegt: 13.03.26.*
