# K2 Familie – Datenschutz & Sicherheit: Familienraum verlässt nichts, Schutz vor Zugriffen

**Stand:** 02.03.26  
**Zweck:** EU-Datenschutz (DSGVO) als Selbstverständlichkeit; wie wir sicherstellen, dass **keine Daten den Familienraum verlassen** und wie wir **Schutz vor unbefugtem Zugriff („Hacking“)** umsetzen und ehrlich kommunizieren.

**Quelle:** Georg – „Ein ganz wichtiger Punkt ist der Datenschutz. Dass wir die EU-Richtlinien einhalten, ist selbstverständlich. Aber wie können wir garantieren, dass keine Daten diesen Familienraum verlassen und niemand sie hacken kann?“

---

## 1. EU-Datenschutz (DSGVO) – selbstverständlich

- **Rechtliche Grundlage:** Verarbeitung personenbezogener Daten (Namen, Fotos, Lebensdaten, Beziehungen, Momente, Events) erfolgt **konform mit der DSGVO** (EU-Datenschutz-Grundverordnung) und dem anwendbaren nationalen Recht (z. B. Österreich, Deutschland).
- **Datenschutzerklärung, Rechtsgrundlagen, Betroffenenrechte (Auskunft, Berichtigung, Löschung, Widerspruch, Datenübertragbarkeit), Speicherdauer, Empfänger, ggf. Auftragsverarbeiter** – alles in der Datenschutzerklärung der App/des Angebots dokumentiert und für Nutzer*innen zugänglich.
- **Keine Weitergabe an Dritte** zu Werbezwecken; **kein Verkauf** von Familiendaten; **keine Nutzung** der Inhalte für Training von KI oder Marketing. **Kommerzielle Verwertung der Familiendaten ist absolut – für immer – ausgeschlossen** (Teil des Genoms von K2 Familie, siehe **docs/K2-FAMILIE-GRUNDBOTSCHAFT.md** Abschnitt „Genom“). Das ist kein Geschäftsmodell-Entschluss, sondern ethisches und rechtliches Fundament.

---

## 2. Garantie „Keine Daten verlassen den Familienraum“

**Was wir damit meinen und wie wir es umsetzen:**

| Prinzip | Umsetzung |
|---------|-----------|
| **Ein Raum = eine Familie** | Jede Familie ist ein **eigener Mandant (Tenant)**. Technisch: Daten getrennt nach `tenantId` (z. B. `k2-familie-{familieId}-personen`, `-momente`, `-events`). Familie A sieht und speichert **nur** in ihrem Raum; Familie B in ihrem. Keine Überschneidung, keine gemeinsame „Schublade“. |
| **Kein Verkauf, kein Sharing** | Wir verkaufen **keine** Familiendaten. Wir geben sie **nicht** an Dritte weiter (Werbung, Datenhändler, Soziale Netzwerke). Nutzung nur für den Betrieb des Dienstes (Speicherung, Sync, Anzeige für die berechtigten Familienmitglieder). |
| **Zugriff nur für die Familie** | Nur Nutzer*innen, die **zu dieser Familie eingeladen** sind (Einladungslink / Familien-Code / Konto-Zuordnung), können die Daten dieser Familie lesen und – je nach Rolle – bearbeiten. Kein „Durchsuchen“ anderer Familien durch uns oder Dritte. **Zusätzlich** gilt: **vollständiger Zugang** zur eigenen Personenkarte und **Schreibberechtigung** erst mit **persönlicher ID** auf der Karte – dieselbe Aussage in App, Handbuch und Doku (*Vertrauen: privater Familienraum*). |
| **Wir als Betreiber** | Zugriff auf Infrastruktur (Server, Backend) nur für **technische Notwendigkeit** (Betrieb, Backup, Fehlerbehebung, gesetzliche Pflichten). Kein „Durchlesen“ von Familieninhalten für andere Zwecke. In Auftragsverarbeitung / Internen Richtlinien festgehalten. |

**Formulierung für Nutzer*innen:** „Eure Daten leben nur in eurem Familienraum. Wir mischen sie nicht mit anderen Familien, verkaufen sie nicht und geben sie nicht weiter. Nur ihr und die, die ihr einladet, haben Zugriff.“

---

## 3. Schutz vor unbefugtem Zugriff („Hacking“)

**Ehrliche Aussage:** **Niemand kann zu 100 % garantieren, dass ein System nie angegriffen oder kompromittiert wird.** Was wir tun, ist **alles Vernünftige und Übliche**, um das Risiko stark zu reduzieren und Angriffe zu erschweren. Das dokumentieren wir und halten es ein.

| Maßnahme | Beschreibung |
|----------|---------------|
| **Verschlüsselung beim Transport (HTTPS)** | Alle Verbindungen zwischen App/Browser und Server laufen über **HTTPS** (TLS). Daten werden unterwegs nicht im Klartext gelesen. |
| **Verschlüsselung bei Speicherung (at rest)** | Sobald Familiendaten in einer Cloud/DB liegen: **Verschlüsselung at rest** (Standard bei seriösen Anbietern wie Supabase, Vercel). Kein unverschlüsselter Klartext auf Festplatten. |
| **Zugriff nur mit Berechtigung** | Zugriff auf Familien-Daten nur für Nutzer*innen, die **für diese Familie freigeschaltet** sind (Auth/Token/Einladung). Kein anonymes „Alle-Daten-lesen“. Im Backend: **Row Level Security (RLS)** bzw. Abfragen strikt nach `tenantId` / Familie-ID. |
| **Keine Secrets im Code** | Keine Passwörter, API-Keys oder Zugangsdaten im Quellcode/Repo. Über Umgebungsvariablen (z. B. Vercel, Supabase); .env nicht versioniert. |
| **Sicherheits-Updates** | Regelmäßig **Abhängigkeiten prüfen** (z. B. `npm audit`), bekannte Schwachstellen beheben. Dokumentiert in Sicherheits-Checklisten. |
| **Kein unnötiges Öffnen** | Keine offenen Admin-Zugänge ohne Auth; keine Debug- oder Test-Endpunkte in Produktion; Fehlermeldungen ohne sensible Daten nach außen. |

**Was wir nicht behaupten:** „Unser System ist unknackbar.“ – Stattdessen: „Wir setzen den Stand der Technik ein (Verschlüsselung, getrennte Räume, Zugriffskontrolle, regelmäßige Prüfungen), um eure Daten zu schützen.“

---

## 4. Was Nutzer*innen selbst tun können

- **Starkes Passwort / sichere Anmeldung** – wenn wir Login nutzen: Hinweis auf sicheres Passwort, ggf. Zwei-Faktor-Option später.
- **Export & private Kopie** – Daten jederzeit exportieren und privat speichern (siehe **docs/K2-FAMILIE-DATENSOUVERAENITAET.md**). So hat die Familie eine Kopie außerhalb unserer Infrastruktur.
- **Nur eingeladene Personen** – Einladungslink oder Code nicht öffentlich teilen; nur an Vertrauenspersonen geben.

---

## 5. Kommunikation in der App und gegenüber Familien

- **Kurz und klar:** „EU-Datenschutz (DSGVO) ist für uns selbstverständlich. Eure Daten bleiben in eurem Familienraum – wir mischen sie nicht mit anderen, verkaufen sie nicht und geben sie nicht weiter. Wir schützen sie mit Verschlüsselung und Zugriffskontrolle; niemand kann absolute Garantie gegen jeden Angriff geben, aber wir tun alles Vernünftige dafür.“
- **Datenschutzerklärung:** Vollständige Angaben (Verantwortliche, Zweck, Rechtsgrundlage, Speicherdauer, Betroffenenrechte, ggf. Auftragsverarbeiter, technische und organisatorische Maßnahmen) – verlinkt in der App und bei Registrierung/Lizenz.
- **Bei „Garantie“:** Wir **garantieren** die Einhaltung des Datenschutzes und dass wir keine Daten aus dem Familienraum herausgeben oder verkaufen. Wir **garantieren nicht** das technische Unmögliche („niemand wird jemals hacken können“), sondern dass wir **angemessene Maßnahmen** treffen und dokumentieren.

---

## 6. Kurzfassung

| Thema | Aussage |
|-------|---------|
| **EU-Datenschutz** | DSGVO und nationales Recht selbstverständlich; Datenschutzerklärung, Betroffenenrechte, keine Weitergabe zu Werbe-/Verkaufszwecken. |
| **Daten verlassen den Familienraum nicht** | Ein Raum = eine Familie (Tenant-Isolation); kein Verkauf, kein Sharing; Zugriff nur für eingeladene Familienmitglieder; wir nur für technische Notwendigkeit. |
| **Schutz vor Hacking** | HTTPS, Verschlüsselung at rest, Zugriffskontrolle, RLS/tenantId, keine Secrets im Code, regelmäßige Sicherheitsprüfungen. Keine falsche „100 %-Garantie“, aber alles Vernünftige getan und dokumentiert. |
| **Kommunikation** | In der App und in der Doku: klar, ehrlich, vertrauensbildend – ohne leere Versprechen. |

---

*„Ein ganz wichtiger Punkt ist der Datenschutz. Dass wir die EU-Richtlinien einhalten, ist selbstverständlich. Aber wie können wir garantieren, dass keine Daten diesen Familienraum verlassen und niemand sie hacken kann?“ – Georg, 02.03.26*
