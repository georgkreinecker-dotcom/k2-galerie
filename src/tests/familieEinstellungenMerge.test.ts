import { describe, it, expect } from 'vitest'
import { mergeEinstellungenFromServer } from '../utils/familieStorage'

describe('mergeEinstellungenFromServer', () => {
  it('behält lokales „Du“, wenn die Cloud noch einen anderen Eintrag liefert', () => {
    const local = { ichBinPersonId: 'georg-id', ichBinPositionAmongSiblings: 3, familyDisplayName: 'Familie X' }
    const server = { ichBinPersonId: 'cilli-id', familyDisplayName: 'Familie Server' }
    const m = mergeEinstellungenFromServer(local, server)
    expect(m.ichBinPersonId).toBe('georg-id')
    expect(m.ichBinPositionAmongSiblings).toBe(3)
    expect(m.familyDisplayName).toBe('Familie Server')
  })

  it('übernimmt Server-„Du“, wenn lokal noch niemand gewählt ist', () => {
    const local = {}
    const server = { ichBinPersonId: 'cilli-id' }
    const m = mergeEinstellungenFromServer(local, server)
    expect(m.ichBinPersonId).toBe('cilli-id')
  })
})
