[SEITENUMBRUCH]

# Shop und Internetbestellung – was Besucher sehen und wie Zahlung heute funktioniert

Dieses Kapitel erklärt die **Kundenansicht** des Shops (über die Galerie im Internet), **wichtige Hinweise zur Zahlung** und – für die Planung – wie eine **optionale Online-Bezahllösung** später aussehen könnte. Die **Kasse für den Verkauf vor Ort** (Bon, Rechnung, Kassabuch) steht im Kapitel [Kassa und Buchhaltung](08-KASSA-BUCHHALTUNG.md).

---

## Zwei verschiedene Wege: Internetshop und Kasse

| | **Internetshop** (Besucher über die Galerie) | **Kasse** (Sie im Admin) |
|---|------------------|---------------------------|
| **Wer** | Kundinnen und Kunden im Browser | Sie oder Ihr Team |
| **Zweck** | Werke in den Warenkorb legen, Bestellung oder Reservierung auslösen | Verkauf vor Ort erfassen, Bon/Rechnung drucken |
| **Zugang** | Link „Shop“ von der öffentlichen Galerie | Admin → Kassa |

Beides nutzt ähnliche Begriffe (Warenkorb, Zahlungsart), arbeitet aber **unterschiedlich**: Im Internet gibt es **keinen** automatischen Einzug von Kartengeld durch die App – siehe unten.

---

## Hinweise zur Zahlung im Internetshop (Stand der Plattform)

**Wichtig – bitte weitergeben an Kundinnen und Kunden:**

1. **Keine eingebaute Online-Zahlung im Browser**  
   Wenn Besucher im Shop **Karte**, **Rechnung** oder **Bar** wählen, speichert die App die **gewünschte Zahlungsart** und die **Bestellung** – es wird **kein** Betrag automatisch von einer Karte abgebucht und **kein** Dienst wie PayPal oder eine Bank im Hintergrund angeschlossen.

2. **Was „Karte“ im Internetshop bedeutet**  
   Das ist der **Wunsch**, mit Karte zu zahlen. Die **eigentliche Kartenzahlung** klären Sie **außerhalb** der App: z. B. Zahlungslink per E-Mail, Terminal bei Abholung, Telefon – je nach Ihrem Ablauf.

3. **Rechnung / Überweisung**  
   Wenn Sie **Bankverbindung** in den Stammdaten hinterlegt haben, kann der Kunde die Daten für eine **Überweisung** sehen. Die **Zahlung** läuft wie gewohnt über das **Bankkonto**; die App **bucht** nicht automatisch ein.

4. **Bar**  
   Typisch für **Abholung** vor Ort: Sie vereinbaren mit dem Kunden, dass **bar** gezahlt wird, wenn er das Werk holt.

5. **Nach der Bestellung**  
   Der Besucher sieht eine **Bestätigung** (z. B. dass die Anfrage angekommen ist). **Sie** bearbeiten die Bestellung: Kontakt aufnehmen, Zahlung klären, Werk reservieren oder versenden – wie in Ihrer Galerie üblich.

6. **Lizenz kaufen ist etwas anderes**  
   Der **Erwerb einer Lizenz** für die eigene Galerie (über die vorgesehene Lizenz-Seite) kann mit einem **Zahlungsanbieter** (z. B. Stripe) verbunden sein. Das betrifft **nicht** den **Warenkorb** mit Kunstwerken für Endkundinnen und Endkunden.

7. **Daten auf dem Gerät des Besuchers**  
   Bestellungen werden im **Browser-Speicher** des jeweiligen Geräts mitgeführt. Für den **fachlichen** Ablauf sollten Sie Bestellungen im **Admin** (Kunden, Kassa, Listen) mitverfolgen und **veröffentlichen**, damit Bestände und Galerie **übereinstimmen** – siehe Kapitel [Einstellungen](10-EINSTELLUNGEN.md) und [Galerie gestalten, Werke anlegen](02-GALERIE-GESTALTEN.md).

---

## Wie könnte eine optionale Online-Bezahllösung für User aussehen?

Das folgende Bild ist **kein Versprechen für eine bestimmte Version**, sondern eine **typische technische und organisatorische Richtung**, falls später eine **echte** Online-Zahlung für den Warenkorb gewünscht ist:

1. **Zahlungsanbieter**  
   Häufig **Stripe** oder ein vergleichbarer Dienst: der Kunde klickt nach dem Warenkorb auf **„Jetzt bezahlen“**, wird auf eine **sichere Bezahlseite** des Anbieters geleitet, gibt Karte oder andere dort angebotene Methoden ein – die App sieht **keine** vollständigen Kartendaten.

2. **Ablauf in groben Schritten**  
   - Warenkorb und Betrag aus der App an den Anbieter übergeben.  
   - Kunde zahlt beim Anbieter.  
   - Der Anbieter **bestätigt** der App „Zahlung erfolgreich“.  
   - Erst dann wird die Bestellung **endgültig** bestätigt und z. B. in Ihrer **Bestellübersicht** geführt; Werke können automatisch als verkauft markiert werden.

3. **Pro Mandant / pro Galerie**  
   Jede **lizenzierte Galerie** bräuchte **eigene** Einstellungen beim Anbieter (Konto, Schlüssel, ggf. Auszahlung auf Ihr Geschäftskonto) – nicht „eine Zentrale“ für alle Künstlerinnen ohne deren Zustimmung.

4. **Rechtliches und Buchhaltung**  
   AGB, Widerruf bei Fernabsatz, Belege, **Umsatzsteuer**, **GoBD** – das muss mit **Steuerberaterin** oder **Steuerberater** und den Regeln des gewählten Anbieters abgestimmt sein, **bevor** so etwas live geht.

5. **Gebühren**  
   Zahlungsanbieter verlangen in der Regel **Gebühren pro Transaktion**; das sollte in Ihre **Preisgestaltung** einfließen.

**Kurz:** Eine optionale Lösung wäre: **ein Klick „Bezahlen“** → **externe sichere Seite** → **Bestätigung zurück in die App** → Bestellung wie heute, aber mit **nachgewiesener** Zahlung statt nur „Wunsch Zahlungsart“.

---

## Kurz zusammengefasst

- **Internetshop** = Bestellung und **Wunsch-Zahlungsart**; **keine** automatische Abbuchung in der App.  
- **Kasse** = Verkauf vor Ort mit Bon/Rechnung; siehe [Kassa und Buchhaltung](08-KASSA-BUCHHALTUNG.md).  
- **Lizenz kaufen** ≠ Kunstwerk-Warenkorb (kann anderer Zahlungsweg sein).  
- **Optionale Online-Zahlung** später = typisch **externer Anbieter** + Bestätigung an die App + **rechtliche** Klärung.
