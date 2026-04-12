import { describe, it, expect } from 'vitest'
import {
  getAktuellesPersonenFoto,
  getLebensphaseFeldFuerAktuellesFoto,
  isHttpUrlForExternalOpen,
} from '../utils/familiePersonFotos'

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

describe('getLebensphaseFeldFuerAktuellesFoto', () => {
  it('liefert das Feld der ersten Priorität mit Inhalt', () => {
    expect(
      getLebensphaseFeldFuerAktuellesFoto({
        photoAlter: 'https://a',
        photoErwachsen: 'https://e',
        photoJugend: undefined,
        photoKind: undefined,
        photo: undefined,
      })
    ).toBe('photoAlter')
    expect(
      getLebensphaseFeldFuerAktuellesFoto({
        photoAlter: '',
        photoErwachsen: 'https://e',
        photoJugend: undefined,
        photoKind: undefined,
        photo: undefined,
      })
    ).toBe('photoErwachsen')
  })

  it('legacy nur wenn nur photo gesetzt', () => {
    expect(
      getLebensphaseFeldFuerAktuellesFoto({
        photoAlter: undefined,
        photoErwachsen: undefined,
        photoJugend: undefined,
        photoKind: undefined,
        photo: 'https://old',
      })
    ).toBe('legacy')
  })
})

describe('isHttpUrlForExternalOpen', () => {
  it('erkennt http(s)', () => {
    expect(isHttpUrlForExternalOpen('https://example.com/x')).toBe(true)
    expect(isHttpUrlForExternalOpen('data:image/jpeg;base64,xx')).toBe(false)
    expect(isHttpUrlForExternalOpen('')).toBe(false)
  })
})
