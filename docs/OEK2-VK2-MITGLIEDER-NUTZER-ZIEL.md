# Ziel: Alle Vereinsmitglieder = ök2-Nutzer mit gegenseitiger Interaktion

**Stand:** 19.02.26  
**Kontext:** K2 (eigene Galerie), ök2 (Muster-Galerie für Vermarktung), VK2 (Vereinsorganisation & Mitgliederpräsentation).

---

## Was wir haben

| Bereich | Heute |
|--------|--------|
| **K2** | Eine echte Galerie (Martina & Georg), echte Stammdaten, Werke, Shop, Admin. |
| **ök2** | Eine **einzige** öffentliche Muster-Galerie (tenantId `oeffentlich`). Zeigt Interessent:innen, wie eine Galerie aussehen kann. Keine Nutzer, keine Anmeldung, keine Interaktion – nur Demo. |
| **VK2** | Vereinsplattform: Mitglieder = Kunden (`k2-vk2-customers`), Künstler = Werke (`k2-vk2-artworks`). Admin mit `context=vk2`, Routen `/projects/vk2/…`, Mitglieder-Vita, Kunstbereiche. **Bereits vorgesehen:** pro Mitglied ein Feld `galleryUrl` = „Link zur eigenen Galerie (in der ök2 erstellt)“ – also Idee „Mitglied → eigene ök2-Galerie“ ist im Modell angelegt. |

---

## Ziel (deine Formulierung)

- **Alle Mitglieder des Vereins** sollen **Nutzer der ök2** sein.
- Sie sollen in **gegenseitige Interaktion** treten können.
- **Nutzen für alle maximal** erhöhen.

---

## Was dafür fehlt (Lücken)

### 1. Identität: Wer ist „Nutzer“?

- Heute: Kein Nutzer-Login für „Mitglieder“. Nur Galerie-Admin-Passwort (K2/ök2).
- Für Interaktion braucht es: **erkennbare Identität** („Das ist Mitglied X“). Entweder Anmeldung (Login) oder zumindest eindeutige Verknüpfung (z. B. Einladungslink pro Mitglied).

### 2. ök2 = eine Demo oder eine Community?

- **Aktuell:** ök2 = **eine** Muster-Galerie für alle. Kein „Mitglied A“, „Mitglied B“.
- **Für das Ziel:** Entweder  
  - **Variante A:** ök2 wird ein **gemeinsamer Ort** (eine Community-Galerie), in dem sich Mitglieder anmelden und interagieren (Kommentare, Likes, Nachrichten, gemeinsame Events).  
  - **Variante B:** Jedes Mitglied bekommt eine **eigene ök2-artige Galerie** (eigene URL / Sub-Mandant), und Interaktion = Verlinkung, Empfehlungen, gemeinsame Vereins-Events.  
  - **Variante C:** Mischung – gemeinsame ök2-Community **plus** optional eigene Galerie-URL pro Mitglied (bereits `galleryUrl` im VK2-Mitglied).

### 3. Konkrete Interaktion

Was soll passieren? Beispiele (noch nicht umgesetzt):

- **Gemeinsame Sichtbarkeit:** Mitglieder sehen einander (z. B. Liste „Mitglieder“ mit Link zu Vita / Galerie).
- **Kommentare / Reaktionen:** Zu Werken oder Künstlerprofilen.
- **Nachrichten / Kontakt:** Direktnachrichten oder Kontaktanfragen unter Mitgliedern.
- **Gemeinsame Events:** Vereinsausstellungen, Termine – wer nimmt teil, wer zeigt was.
- **Empfehlungen:** „Mitglied X empfiehlt Werk / Künstler Y“ (Anknüpfung an bestehendes Empfehlungs-Programm).
- **Pinnwand / News:** Gemeinsame Vereins-Infos, die alle sehen.

### 4. Technische Brücke VK2 ↔ ök2

- **VK2-Mitglieder** sind heute nur in `k2-vk2-customers` (lokal/Admin).
- Damit sie „ök2-Nutzer“ werden:  
  - Entweder **eine** ök2-Instanz, in der „Mitglieder“ als Rollen/Profile erscheinen (Daten aus VK2 oder Sync).  
  - Oder **pro Mitglied** eine Sub-Instanz / Sub-URL der ök2 (dann Speicher pro Mitglied, z. B. `k2-oeffentlich-<memberId>-*` oder Backend pro Mitglied).

### 5. Wo leben die Daten?

- Heute: Vieles in **localStorage** (K2, ök2, VK2 getrennt).
- Für echte Interaktion (Kommentare, Nachrichten, „wer hat was gesehen“): braucht es **gemeinsamen, persistenten Speicher** (z. B. Supabase oder anderes Backend), auf den alle Mitglieder zugreifen können – sonst sieht jeder nur seinen eigenen Browser.

---

## Umsetzungsoptionen (wie am besten)

### Option 1: **ök2 als gemeinsame Community (ein Ort)**

- **Idee:** Eine gemeinsame „ök2-Community“-Seite (oder Erweiterung der bestehenden ök2-Galerie).
- **Mitglieder:** Aus VK2 (Mitgliederliste) werden „Profile“ in der Community. Entweder ohne Login (nur Verlinkung von VK2 aus) oder mit **einfachem Login** (E-Mail + Link/Magic Link oder Passwort).
- **Interaktion:** Kommentare, Likes, gemeinsame Events in **Supabase** (oder ähnlich) speichern; Anzeige in der App.
- **Vorteil:** Ein Ort, alle treffen sich, klare „ök2-Nutzer = Vereinsmitglieder“.  
- **Aufwand:** Login/Identität, Backend für Interaktion, UI für Kommentare/Events/Nachrichten.

### Option 2: **Jedes Mitglied = eigene Mini-Galerie (ök2-artig)**

- **Idee:** Pro Mitglied eine eigene Galerie-URL (z. B. `/projects/oeffentlich/galerie/<memberId>` oder Subdomain). Daten pro Mitglied (wie heute ök2, aber Keys pro Mitglied).
- **Interaktion:** Über **Verlinkung** (VK2 zeigt alle Mitglieder + Link zur jeweiligen Galerie), gemeinsame **Vereins-Events** (eine Tabelle „Events“, alle sehen sie), optional Empfehlungs-Links.
- **Vorteil:** Jeder hat „seine“ Galerie, wenig Konflikt. `galleryUrl` in VK2 wird genutzt.  
- **Aufwand:** Multi-Mandant pro Mitglied (Speicher/Keys), Routing, Event-/News-Bereich gemeinsam.

### Option 3: **Schrittweise (empfohlen)**

**Phase 1 – ohne Login (schnell nutzbar):**

1. **VK2 → ök2 sichtbar machen:** Auf der ök2-Galerie (oder einer neuen „Vereins-ök2“-Seite) eine Sektion „Vereinsmitglieder“: Liste aus VK2-Mitgliedern mit Link zu Vita und optional `galleryUrl`. So sind „alle Mitglieder“ schon „in der ök2“ sichtbar.
2. **Mitglieder-Vita verlinken:** In VK2 ist Vita schon da; von ök2 aus Link zu `/projects/vk2/vita/member/:id`. Optional: von Mitglied A zu Mitglied B verlinken („weitere Künstler:innen“).
3. **Gemeinsame Events:** Eine gemeinsame Event-Liste (Vereins-Events), die sowohl in VK2 als auch in ök2 angezeigt wird (eine Quelle, z. B. `k2-vk2-events` oder Supabase).

**Phase 2 – Interaktion mit Identität:**

4. **Einfache Identität:** Magic-Link oder Passwort pro Mitglied (E-Mail aus VK2), nur um „angemeldet als X“ zu sein – keine komplexen Rollen.
5. **Interaktion:** Kommentare zu Werken/Künstlern, einfache Nachrichten oder Kontaktanfragen – Speicher in Supabase.
6. **Empfehlungen:** „Als Mitglied X Werk Y empfehlen“ – Anbindung an bestehendes Empfehlungs-Programm.

**Phase 3 – nach Bedarf:**

7. Eigene Mini-Galerie pro Mitglied (Option 2) **oder** Ausbau der gemeinsamen Community (Option 1) je nach Rückmeldung.

---

## Konkrete nächste Schritte (Vorschlag)

1. **Entscheidung:** Soll der erste Schritt „**eine gemeinsame ök2-Community**“ (Option 1) oder „**Mitglieder in ök2 sichtbar + Verlinkung**“ (Option 3 Phase 1) sein?
2. **VK2-Mitglieder in ök2 anzeigen:** Eine Sektion „Vereinsmitglieder“ / „Künstler:innen im Verein“ auf der ök2-Galerie (oder eigener Tab), Daten aus `k2-vk2-customers` (nur lesend, z. B. über Route/Context „ök2 + Mitgliederliste aus VK2“). Kein Login nötig.
3. **Gemeinsame Events:** Ein gemeinsamer Speicher für Vereins-Events (`k2-vk2-events`), Anzeige in VK2 und in ök2.
4. **Doku & Regeln:** K2/ök2/VK2-Trennung beibehalten; neue Regel „ök2 kann VK2-Mitgliederliste lesen (nur Anzeige), keine Vermischung der Schreib-Keys“.

---

## Kurzfassung

| Thema | Status / Vorschlag |
|--------|---------------------|
| **Ziel** | Alle Vereinsmitglieder = ök2-Nutzer, gegenseitige Interaktion, maximaler Nutzen. |
| **Fehlt** | Identität (Login/Profil), ök2 als Community oder pro-Mitglied-Galerie, konkrete Interaktion (Kommentare, Events, Nachrichten), gemeinsamer Speicher (z. B. Supabase). |
| **Bereits da** | VK2-Mitglieder mit Vita, `galleryUrl`; ök2 als Demo; getrennte Keys. |
| **Empfehlung** | Schrittweise: Zuerst VK2-Mitglieder in ök2 sichtbar + gemeinsame Events; dann einfache Identität + Interaktion (Supabase). |

Wenn du sagst, ob du eher „**ein gemeinsamer Ort**“ (Option 1) oder „**jeder seine Galerie + Verlinkung**“ (Option 2) willst, kann die nächste Umsetzung darauf ausgerichtet werden.
