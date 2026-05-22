import { describe, it, expect } from 'vitest'
import { parseTestuserAnmeldungText, selectedPilotLinien } from '../utils/testuserAnmeldungParse'

const SAMPLE = `Testuser-Anmeldung (kgm solution)

Name: Wolfgang Kraus
Wunsch-Name für die App (Test): Woifal
E-Mail: wolfgang@mental-illusions.at
Telefon: 06646153132
Interesse an Produktlinie:
  ök2 (Demo): ja
  VK2 (Verein): ja
  K2 Familie: ja
`

describe('testuserAnmeldungParse', () => {
  it('parst Standard-Anmelde-E-Mail', () => {
    const p = parseTestuserAnmeldungText(SAMPLE)
    expect(p).not.toBeNull()
    expect(p?.name).toBe('Wolfgang Kraus')
    expect(p?.appName).toBe('Woifal')
    expect(p?.email).toBe('wolfgang@mental-illusions.at')
    expect(p?.phone).toBe('06646153132')
    expect(p?.oek2).toBe(true)
    expect(p?.vk2).toBe(true)
    expect(p?.familie).toBe(true)
    expect(selectedPilotLinien(p!)).toEqual(['oek2', 'vk2', 'familie'])
  })

  it('leerer Text → null', () => {
    expect(parseTestuserAnmeldungText('')).toBeNull()
  })
})
