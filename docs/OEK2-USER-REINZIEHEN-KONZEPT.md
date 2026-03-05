# ök2 – User reinziehen (lösungsorientiert, sonst uninteressiert)

**Ziel:** User, die eigentlich nur an **Lösungen** interessiert sind („Zeig mir, was ich davon habe“), in die App holen und dranbleiben – ohne sie mit Hürden oder Ablenkung zu verlieren.

---

## Grundannahme

- Diese User sind **nicht** motiviert, „eine Galerie-Software zu erkunden“.
- Sie wollen: **schnell sehen, ob das meine Lösung ist** – und wenn ja, **sofort nutzen**.
- Jede unnötige Seite, jedes leere Formular, jede Unklarheit („Wo trage ich was ein?“) kostet Aufmerksamkeit → sie gehen.

---

## Prinzipien (Umsetzung im Produkt)

1. **Lösung zuerst zeigen, nicht die App.**  
   Erster Eindruck = „Das ist deine Galerie“ (oder „So sieht deine Galerie aus“), nicht „Willkommen, hier sind 7 Bereiche“.

2. **Ein Weg, ein Ziel.**  
   Pro Absicht **einen** klaren Weg: z. B. „Galerie ausprobieren“ → direkt in die Galerie/Admin mit **leeren, sofort ausfüllbaren** Feldern (keine Musterdaten, die ablenken). Kein Umweg über mehrere Klicks.

3. **Angst und Ablenkung minimieren.**  
   Keine langen Texte, keine Verpflichtungserklärungen vor dem Ausprobieren. Keine zweite „Person“ oder zweite Adresse, wenn wir nur **einen** Künstler abbilden. Weniger Felder = weniger „Das füll ich nie aus“.

4. **Eine Sache pro Bildschirm.**  
   Klar: „Hier machst du genau das.“ Nächste Aktion offensichtlich (ein Button, ein Fokus). Kein „sieben Karten, alle gleich wichtig“.

5. **Sofort überschreibbar.**  
   Bereits umgesetzt: Stammdaten ök2 = leere Felder bei neuem User. Nichts vorgefüllt, was sie erst löschen müssen. Sie füllen **ihre** Daten ein.

---

## Bereits umgesetzt

- Stammdaten ök2: `loadStammdaten('oeffentlich', …)` liefert leere Felder (`getEmptyOeffentlich`) bei leerem localStorage – neue User sehen keine Musterdaten.
- Mein-Bereich: Einstieg für Künstler:in, kein Admin-Button-Chaos auf der Galerie; optional Passwort.

---

## Nächste Schritte (konkret)

- [ ] **Einstieg prüfen:** Willkommen/Entdecken – führt „Galerie ausprobieren“ / erster CTA wirklich **direkt** in einen Zustand „deine Galerie“ (leere Felder, eine klare nächste Aktion)?
- [ ] **Eine Person, eine Adresse:** Stammdaten-UI auf **einen** Künstler, **eine** Adresse (optional Galerie-Adresse) reduzieren; Person-2-Block entfernen (bereits geplant).
- [ ] **Erste Aktion nach Einstieg:** Beim ersten Öffnen der Demo: eine einzige, klare Aktion anbieten (z. B. „Deinen Namen eintragen“ oder „Deine Galerie benennen“) – nicht sieben Tabs.
- [ ] **Texte kürzen:** Lange Erklärungen auf Willkommen/Entdecken/erster Admin-Ansicht auf das Nötige reduzieren; „Lösung zeigen“ statt „Produkt erklären“.

---

*Stand: 05.03.26 – aus Faden „ök2 Mobil-Test, User reinziehen“.*
