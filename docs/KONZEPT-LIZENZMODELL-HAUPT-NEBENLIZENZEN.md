# Lizenzmodell – Hauptlizenzen und Nebenlizenzen

**Stand:** 12.04.26  
**Zweck:** Ein klares, vertretbares Modell für **Abgrenzung**, **Skalierung** und **Kommunikation** (Website, mök2, Vertrag). Technische Umsetzung (Stripe-Produkte, tenantId) folgt Markt und Priorität – **dieses Dokument ist die fachliche Leitlinie**.

**Verknüpfung:** `docs/SKALIERUNG-KONZEPT.md` (Mandant = tenantId), bestehende Galerie-Stufen in `src/config/licencePricing.ts` und `LicencesPage`.

---

## 1. Begriffe

| Begriff | Bedeutung |
|--------|------------|
| **Hauptlizenz** | Der **vertragliche Kern**: Zugang zu **einer** definierten Produkt-Instanz mit einem **festen Leistungsumfang** (z. B. Galerie nach Stufe Basic/Pro/… **oder** K2 Familie als eigenes Produkt). **Ein Mandant (tenantId) = eine klar umrissene Daten- und Nutzungswelt.** |
| **Nebenlizenz** | **Zusatz** zur Hauptlizenz oder **eigenständiger Zusatzkauf**: weiterer **Mandant**, **Zusatznutzer**, **Zusatzprodukt** oder **Rechte-Paket** – immer **benannt und abrechenbar**, nie „still mit drin“. |
| **Mandant (tenant)** | Technische und vertragliche **Grenze der Daten**: keine Vermischung zwischen Haupt- und Neben-Instanzen. |

---

## 2. Hauptlizenzen (Galerie – heute im Produkt)

Die **Galerie-Lizenz** bleibt die bekannte **Stufenleiter** (Auszug, Details und Preise: eine Quelle im Code/Doku):

- **Basic** – Einstieg, begrenzte Werke, Kernfunktionen.  
- **Pro** – erweiterter Umfang (z. B. unbegrenzte Werke, Custom Domain – je nach Produktdefinition).  
- **Pro+** – inkl. Marketingbereich (Events, Präsentation, Flyer, Presse, Social).  
- **Pro++** – inkl. Rechnungsstellung nach Vorgaben (z. B. USt).  
- **VK2 (Kunstvereine)** – eigene Stufe mit Vereinslogik (Mitglieder, Rabatte); technisch und vertraglich **eigenes Profil**, aber **gleiche Architektur** wie die anderen Stufen.

**Hauptlizenz = immer genau eine Sache:** *Diese* Galerie-Instanz unter *dieser* Stufe. Kein automatisches „alles für alle Verwandten“.

---

## 3. Nebenlizenzen – Typen (Konzept)

Nebenlizenzen **ergänzen** oder **splitten** Verantwortung – ohne die Hauptlizenz zu verwässern.

### 3.1 Zusätzlicher Mandant (Seitenlinie, zweite Familie, zweite Galerie)

- **Wer:** z. B. Neffe, Nichte, Schwager, Schwägerin, zweiter Hausstand – **eigene** Stammbaum-/Galerie-Welt.  
- **Was:** **Eigener Mandant**, eigene Daten, eigener „Das bin ich“-Kontext – **keine** stille Einbindung in die Hauptfamilie.  
- **Lizenz:** **Nebenlizenz „zusätzlicher Mandant“** (eigenes Produkt in Stripe oder Paketpreis) – **Extra-Lizenz**, klar kommuniziert.  
- **Warum:** Abgrenzung, Datenschutz, klare Erwartung („das ist unser Raum“).

### 3.2 Zusatznutzer / Bearbeitende (ohne eigenen Mandanten)

- **Wer:** z. B. feste Bearbeiter:innen in **derselben** Familie oder Galerie.  
- **Was:** Rechte in **einem** Mandanten (Rollen: Lesen, Bearbeiten, …).  
- **Lizenz:** **Nebenlizenz „zusätzlicher Bearbeiter“** oder im Paket enthalten bis zu *n* Plätzen – **festzulegen bei Einführung**.  
- **Abgrenzung zu 3.1:** Gleicher Mandant = keine zweite Datenwelt; nur Zugriff und Rechte.

### 3.3 Zusatzprodukt (Cross-Sell)

- **Beispiel:** Kunde hat Galerie **Pro+**, möchte **K2 Familie** dazu.  
- **Lizenz:** **Nebenlizenz „K2 Familie“** oder **Bundle** „Galerie + Familie“ – **getrennte Buchung**, damit Leistung und Support klar bleiben.

### 3.4 Organisation / Verein (VK2)

- Bereits als **Hauptlizenz-Typ** geführt (siehe §2). Wenn ein Verein **zusätzlich** eine zweite Einheit braucht: wie **3.1** – zweiter Mandant = zweite vertragliche Einheit (Nebenlizenz oder zweite Hauptlizenz je nach Preislogik).

---

## 4. Regeln (verbindlich für Kommunikation und Produkt)

1. **Eine Hauptlizenz = ein klar beschriebener Umfang** (Stufe oder Produkt).  
2. **Seitenlinie / eigene Welt einbinden** → **nicht** über „alles in einem Mandanten“ lösen, wenn **Datenherrschaft und Abgrenzung** gefragt sind → **Nebenlizenz Mandant** (oder zweite Hauptlizenz nach Preisstrategie).  
3. **Nebenlizenzen** sind **benannt** (was genau ist dabei), **optional** oder **im Paket** – nie versteckt.  
4. **Kein direkter Kunden-Support pro Nutzer** skaliert nicht (bestehende Leitlinie): Bestellung, Zahlung, Dokumentation, ggf. Druck – **kein** 1:1-Beziehungsaufbau; Nebenlizenzen ändern daran nichts.  
5. **Technik folgt dem Vertrag:** `tenantId` trennt Daten; Lizenztyp in Supabase/Stripe entspricht dem gekauften Paket.

---

## 5. Kurzfassung für Außen (z. B. mök2, AGB)

- **Hauptlizenz:** Ihre Galerie (bzw. Ihr Produkt) in der gewählten **Stufe** – **ein** geschlossener Bereich.  
- **Nebenlizenz:** Zusatz, der **zusätzliche Mandanten**, **Bearbeitende** oder **weitere Produkte** abdeckt – immer **explizit** bestellt und abgerechnet.  
- **Eigene Seitenlinie** (Familie, Partnerhaus, Vereinszweig mit eigener Datenhaltung): **eigene Lizenz** – damit **klar**, **fair** und **technisch sauber** getrennt.

---

## 6. Nächste Schritte (wenn ihr marktreif seid)

- Preise und Stripe-Produkte für definierte Nebenlizenzen (z. B. „K2 Familie Zusatzmandant“).  
- **Erledigt (Apr. 2026):** Kurztexte auf **LicencesPage** (Infobox) und **mök2** (`#mok2-10c-haupt-neben-lizenz`) – Hauptstufen unverändert.  
- **Offen:** AGB: Verweis auf Haupt- vs. Nebenleistung und Mandantentrennung.

**Dieses Konzept ist die fachliche Basis; Zahlen und SKU-Namen werden bei Go-Live der jeweiligen Nebenlizenz festgelegt.**
