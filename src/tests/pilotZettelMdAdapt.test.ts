import { describe, it, expect } from 'vitest'
import { adaptPilotOek2Vk2ZettelMd } from '../utils/pilotZettelMdAdapt'

const COMBINED = `# Testpilot:in ök2 & VK2 – voller Gratis-Zugang

**QR und feste Adressen** stehen in der **Tabelle unten** (gleicher Aufbau wie beim K2-Familie-Zettel).

---

## Kurz

*ök2 = Demo (Künstler); VK2 = Vereinsplattform. Beides im Browser – Laptop und Handy. Einmal **Drucken / Als PDF speichern**, mitgeben.*

---

## Erste Schritte

**Deinen Weg festlegen (wichtig):** Bei **ök2** unter **„Wofür nutzt du deine Galerie?“** eine **Sparte** wählen (z. B. Kunst & Galerie, Handwerk …) – davon hängen Typ und Kategorien in „Werke verwalten“ ab. Bei **VK2** in den Einstellungen **Verein** und **Kunstrichtungen** zu euch passend eintragen.

**In einem Satz:** *„Plattform für Galerie, Kasse, Einladungen, Presse – **ök2** ist die Demo, **VK2** die Vereinsplattform. Beides gratis testen.“*

---

*Stand: April 2026. ök2 & VK2.*
`

describe('adaptPilotOek2Vk2ZettelMd', () => {
  it('lässt null unverändert', () => {
    expect(adaptPilotOek2Vk2ZettelMd(COMBINED, null)).toBe(COMBINED)
  })
  it('oek2: keine kombinierte Überschrift, eigene Anwendung', () => {
    const r = adaptPilotOek2Vk2ZettelMd(COMBINED, 'oek2')
    expect(r).toContain('ök2 – Demo-Galerie')
    expect(r).not.toMatch(/ök2 & VK2 – voller/)
    expect(r).toContain('getrennt von VK2')
    expect(r).toContain('Nur ök2')
    expect(r).toContain('**Deinen Weg festlegen (wichtig):**')
    expect(r).toContain('Wofür nutzt du deine Galerie')
    expect(r).toContain('Meine Daten')
    expect(r).not.toMatch(/Kunstrichtungen zu euch passend eintragen/)
    expect(r).not.toMatch(/\*\*In einem Satz:\*\*/)
  })
  it('vk2: keine kombinierte Überschrift', () => {
    const r = adaptPilotOek2Vk2ZettelMd(COMBINED, 'vk2')
    expect(r).toContain('VK2 – Vereinsplattform')
    expect(r).not.toMatch(/ök2 & VK2 – voller/)
    expect(r).toContain('getrennt von ök2')
    expect(r).toContain('Nur VK2')
    expect(r).toContain('**Deinen Weg festlegen (wichtig):**')
    expect(r).toContain('Kunstrichtungen')
    expect(r).toContain('**Verein**')
    expect(r).not.toMatch(/Wofür nutzt du deine Galerie/)
  })
})
