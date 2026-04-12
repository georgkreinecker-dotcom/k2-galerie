# K2 Familie – Eigenbereich, Module aus ök2/VK2, kein Durcheinander

**Stand:** 12.04.26  
**Status:** verbindliche Produkt- und Architektur-Leitlinie für K2 Familie.

---

## Das eine Bild: ein anderes Fahrzeug

**K2 Familie ist kein Anhänger an ök2 oder VK2** – es ist ein **eigenes Fahrzeug**: eigener Zweck, eigene Daten, eigener Projekt-Raum. Gleiche **Straße** (Plattform, Repo, Qualitätsstandards), aber **nicht** dieselbe Ladung vermischen.

---

## 1. Ganz eigener Bereich

| Festlegung | Konsequenz |
|------------|------------|
| **Eigene Routen** | `/projects/k2-familie/…` – klar von Galerie, ök2, VK2 getrennt. |
| **Eigene Keys / Mandant** | Nur `k2-familie-*` und Familien-`tenantId` – siehe Datentrennungs-Regeln. |
| **Eigenes Produkt** | Nicht „Galerie plus Familie in einem Topf“ – **Projekt K2 Familie** steht für sich. |
| **Nichts geht durcheinander** | Keine K2-Daten in ök2, keine Familien-Daten in Galerie-Keys – **eiserne Trennung** bleibt. |

---

## 2. Module aus ök2 und VK2 – nur als fertige, funktionierende Bausteine

**Erlaubt:** Bewährte **Muster** übernehmen – z. B. einheitliche Bildverarbeitung, Druck-Standards, UX-Patterns, **ein Standard pro Problemstellung** (Sportwagenmodus), wo es sinnvoll ist.

**Verboten:**  
- Daten, Stammdaten oder Keys von **ök2** oder **VK2** in K2 Familie **einmischen** oder umgekehrt.  
- „Mal so wie in der Galerie“ ohne **eigene** K2-Familie-Quelle und **eigenen** Speicherpfad.  
- Halbfertige oder experimentelle Parallelen aus anderen Projekten **kopieren**, statt **eine** saubere Lösung in K2 Familie zu haben.

**Kurz:** Von ök2/VK2 kommt **Erfahrung und Muster**, nicht **deren Daten** und nicht **wilder Mix**.

---

## 3. Sportwagenmodus und klare Projekt-Trennung

- **Ein Standard pro Problemstellung** gilt **innerhalb K2 Familie** – dieselbe Disziplin wie in der Plattform, aber **ohne** Galerie- und ök2-/VK2-Codepfade zu vermischen.  
- **Klare Trennung der Projekte:** Arbeit an K2 Familie = Auswirkungen auf `k2-familie-*`, Familien-Routen, Familien-Doku – **nicht** „nebenbei“ Galerie- oder Demo-Logik ändern.  
- **Abgrenzung zu „K2 Galerie“** (echte Galerie): Regel **k2-echte-galerie-eisernes-gesetz** – K2-Kern nicht anfassen, außer Georg ordnet es an.

---

## 4. Verweis auf Detailregeln

- **Datentrennung K2 / ök2 / VK2:** `docs/K2-OEK2-DATENTRENNUNG.md`, `.cursor/rules/k2-oek2-eisernes-gesetz-keine-daten.mdc`  
- **Lehren aus K2 Galerie (nicht zweimal):** `docs/K2-FAMILIE-LEHREN-AUS-K2-GALERIE.md`  
- **Skalierung / Mandanten:** `docs/SKALIERUNG-KONZEPT.md`  
- **Ein Standard:** `.cursor/rules/ein-standard-problem.mdc`

---

## Kurzfassung

**K2 Familie = eigenes Fahrzeug.** Eigener Bereich, eigene Daten, keine Vermischung mit ök2/VK2/Galerie. **Module** von ök2/VK2 nur als **fertige, bewährte Bausteine** (Muster, Standards), **Sportwagenmodus** und **projekt-saubere Grenzen** – dann bleibt nichts durcheinander.
