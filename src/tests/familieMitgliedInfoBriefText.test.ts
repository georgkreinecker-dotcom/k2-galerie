import { describe, expect, it } from 'vitest'
import {
  buildFamilieEinladungsUrlKurz,
  buildMitgliederInformationsText,
  MUSTERTEXT_MITGLIEDER_INFORM_KERN,
} from '../utils/familieMitgliedInfoBriefText'

describe('familieMitgliedInfoBriefText', () => {
  it('Mustertext enthält alle Platzhalter', () => {
    expect(MUSTERTEXT_MITGLIEDER_INFORM_KERN).toContain('{{FAMILIENNAME}}')
    expect(MUSTERTEXT_MITGLIEDER_INFORM_KERN).toContain('{{FAMILIEN_LINK}}')
  })

  it('buildFamilieEinladungsUrlKurz baut t und z', () => {
    const u = buildFamilieEinladungsUrlKurz('tenant-test', 'AB12', 'Mustermann')
    expect(u).toContain('t=tenant-test')
    expect(u).toContain('z=AB12')
    expect(u).toContain('fn=Mustermann')
  })

  it('buildMitgliederInformationsText füllt Kurztext ohne Sterne', () => {
    const text = buildMitgliederInformationsText({
      tenantId: 't1',
      familienZ: 'XY99',
      familyDisplayName: 'Familie Beispiel',
      signaturName: 'Alex',
    })
    expect(text).toContain('Familie Beispiel')
    expect(text).toContain('XY99')
    expect(text).toContain('Alex')
    expect(text).not.toContain('**')
    expect(text).toContain('/projects/k2-familie/meine-familie')
    expect(text).toContain('/projects/k2-familie/mitglieder-codes')
  })
})
