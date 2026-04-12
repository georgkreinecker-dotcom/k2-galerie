import { describe, it, expect } from 'vitest'
import { getAktuellesPersonenFoto } from '../utils/familiePersonFotos'

describe('getAktuellesPersonenFoto', () => {
  it('nimmt die späteste befüllte Phase (Alter vor Erwachsen …)', () => {
    expect(
      getAktuellesPersonenFoto({
        photoAlter: 'https://a',
        photoErwachsen: 'https://e',
        photoJugend: 'https://j',
        photoKind: 'https://k',
        photo: 'https://legacy',
      })
    ).toBe('https://a')
    expect(
      getAktuellesPersonenFoto({
        photoAlter: '',
        photoErwachsen: 'https://e',
        photoJugend: 'https://j',
        photoKind: 'https://k',
        photo: 'https://legacy',
      })
    ).toBe('https://e')
  })

  it('fällt auf Legacy photo zurück', () => {
    expect(
      getAktuellesPersonenFoto({
        photoAlter: undefined,
        photoErwachsen: undefined,
        photoJugend: undefined,
        photoKind: undefined,
        photo: 'https://legacy',
      })
    ).toBe('https://legacy')
  })

  it('leer wenn nichts gesetzt', () => {
    expect(
      getAktuellesPersonenFoto({
        photoAlter: undefined,
        photoErwachsen: undefined,
        photoJugend: undefined,
        photoKind: undefined,
        photo: undefined,
      })
    ).toBeUndefined()
  })
})
