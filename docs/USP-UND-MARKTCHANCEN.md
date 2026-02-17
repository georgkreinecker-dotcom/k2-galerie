# USPs und Marktchancen – K2 Galerie

Kurzfassung der Alleinstellungsmerkmale und einer realistischen Einschätzung der Marktchancen für das Produkt.

---

## 1. USPs (Unique Selling Points)

### Alles in einer Oberfläche
- **Eine App** für Galerie-Webauftritt, Werke, Events, Marketing und Kasse – kein Wechsel zwischen vielen Tools.
- Admin (APf) am Rechner; Galerie und Kassa auf Tablet/Handy über dieselbe App (QR, gleicher Stand).

### Zielgruppe: Künstler:innen
- Klar auf **Selbstvermarktung** ausgerichtet: eigene Werke, eigene Ausstellungen, eigener Webauftritt.
- Kein abstraktes „CMS“, sondern Begriffe und Abläufe, die zu Galerien und Ateliers passen (Werke, Events, Stammdaten, Öffentlichkeitsarbeit).

### Marketing aus einem Guss
- **PR-Vorschläge** aus Stammdaten und Event – Newsletter, Plakat, Presse, Social Media, Event-Flyer im Galerie-Design.
- Mehrere **Vorschläge pro Typ** möglich (z. B. mehrere Plakat-Varianten), alle unter der jeweiligen Rubrik zugeordnet.
- Druckformate **A4, A3, A5** (inkl. Plakat), einheitliche Werbelinie (Farben, Schriften).
- **QR-Code-Plakat** für Homepage und virtuellen Rundgang – direkt aus der Werbematerial-Liste.

### Technik ohne Vendor-Lock-in
- **Plattformneutral:** Windows, Android, macOS, iOS – Browser bzw. PWA, keine Mac-Pflicht für Kunden.
- **Moderner Web-Stack** (React, TypeScript, Vite), Deployment z. B. über Vercel/GitHub möglich.
- **Konfiguration statt Festverdrahtung:** Namen, Texte, Farben, Mandanten (K2, Demo, später weitere) steuerbar – Basis für Licence-Versionen.

### Kassafunktion & Etiketten
- **Kasse/Shop** für Verkauf vor Ort – direkt aus der Galerie-App (z. B. am iPad/Handy).
- **Etikettendruck** (z. B. Brother QL) – Etiketten mit Werk-Nummer, Titel, QR-Code; WLAN-fähig, von mehreren Geräten nutzbar.
- **Kundenverwaltung** (Kunden-Tab) – für Erfassung und Zuordnung; Tagesgeschäft und Kassa in einer Oberfläche.

### Fotostudio
- **Professionelle Werkfotos in der App** – Objektfreistellung und professioneller Hintergrund direkt im Browser (z. B. @imgly/background-removal, keine API-Keys).
- **Ideal für Fotos von iPad/iPhone** – neue Werke werden oft mobil aufgenommen; beim Hereinladen automatisch aufgewertet (Freistellung + Pro-Hintergrund), hochprofessioneller Eindruck.

### Mobile und Stand
- **Ein Stand überall:** Nach Push/Deploy gleiche Version auf allen Geräten; QR mit Cache-Bust, Stand-Badge, optional „Neue Version“-Hinweis.
- **Galerie-Assistent:** Schritt-für-Schritt-Anleitung für neue Nutzer (Stammdaten → Werke → Design → Events), ohne externe Abhängigkeit; Erweiterung um optionale KI später möglich.

### Datensouveränität und Backup
- **Lokale Speicherung** (localStorage) plus Backup & Wiederherstellung; Vollbackup als Datei (z. B. Speicherplatte/backupmicro).
- **K2 vs. Demo (ök2)** strikt getrennt – keine Vermischung von echten und Musterdaten.
- Kein Datenverlust durch Merge-Logik: Stammdaten werden beim Laden/Speichern sinnvoll zusammengeführt, bestehende Werte nicht mit Leer überschrieben.

### Professioneller Auftritt
- **Deutsche UI**, seriös und klar; „Empfehlungs-Programm“ statt aggressiver Marketing-Begriffe.
- **Design anpassbar:** Farben, Willkommensbild, Galerie-Karte, virtueller Rundgang, Seitentexte – alles im Admin ohne Code.
- **Vita-Seiten** für Künstler:innen, Platzanordnung, Shop – alles auf eine vermarktbare Galerie-Instanz ausgerichtet.

---

## 2. Marktchancen – Einschätzung

### Stärken
- **Klare Nische:** Künstler:innen und kleine Galerien, die Webauftritt + Events + einfache Kasse + Marketing aus einer Hand wollen, sind unterversorgt.
- **PWA + plattformneutral:** Keine App-Stores nötig; Nutzung auf Windows und Android ohne Mac – gut für breitere Vermarktung.
- **Produktvision und Konfiguration:** Codebasis und Doku (Produkt-Vision, Plattform, K2/ök2) sind auf Mehrfachnutzung und Licence-Versionen vorbereitet.
- **Echter Einsatz:** K2 wird bereits genutzt (Martina & Georg) – echte Anforderungen und Workflows sind abgebildet.

### Herausforderungen
- **Bekanntheit:** Ohne Vertrieb/Marketing erreicht man die Zielgruppe nur begrenzt; Vertrauen und Sichtbarkeit müssen aufgebaut werden.
- **Wettbewerb:** Es gibt generische Website-Builder und Nischen-Tools für Künstler:innen; Differenzierung gelingt über „Alles in einer App“ + Galerie-Fokus + PR/Marketing aus einem Guss.
- **Betrieb/Recht:** Für seriöse Vermarktung braucht es klares Hosting-/Licence-Modell, AGB, Datenschutz und ggf. Support – Aufwand, aber machbar.

### Fazit
- **Marktchance:** Ja – die Kombination aus Galerie-Webauftritt, Werke-Verwaltung, Event/Marketing und optional Kasse in einer plattformneutralen App spricht eine definierbare Zielgruppe an und ist technisch sowie konzeptionell gut vorbereitet.
- **Erfolg hängt stark ab von:** Positionierung („Die Galerie-App für Künstler:innen“), einfachem Einstieg (Galerie-Assistent, Onboarding), klarem Nutzen (USPs kommunizieren) und später Vertrieb/Kommunikation (Website, Empfehlungen, ggf. Partner).
- **Empfehlungs-Programm (Vertrieb durch Nutzer:innen):** Konzept mit 50 % Licence-Gebühr an Empfehler:in und persönlicher Empfehler-ID ist in **docs/VERMARKTUNGSKONZEPT-EMPFEHLUNGSPROGRAMM.md** beschrieben.
- **Nächste sinnvolle Schritte** (aus Produkt-Vision): Konfiguration weiter zentralisieren, Onboarding/Ersteinrichtung dokumentieren und im UI führen, Licence-/Preismodell für Künstler:innen konkretisieren, dann Rechtliches und Betrieb klären.

---

*Stand: Februar 2026, basierend auf dem aktuellen Feature-Stand der K2 Galerie App.*
