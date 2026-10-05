import { describe, expect, it } from 'vitest'
import {
  buildShareTextWithPublicLink,
  getShareableAppUrl,
  isPrivateHostname,
} from '../utils/publicShare'
import { PROJECT_ROUTES } from '../config/navigation'

describe('publicShare – lokal arbeiten, öffentlich versenden', () => {
  it('erkennt private Hosts', () => {
    expect(isPrivateHostname('localhost')).toBe(true)
    expect(isPrivateHostname('127.0.0.1')).toBe(true)
    expect(isPrivateHostname('192.168.1.102')).toBe(true)
    expect(isPrivateHostname('k2-galerie.vercel.app')).toBe(false)
  })

  it('Pfad wird zur öffentlichen Vercel-URL (Tests laufen ohne window.origin)', () => {
    const url = getShareableAppUrl(PROJECT_ROUTES['k2-yoga'].gespraechsmappe)
    expect(url).toBe('https://k2-galerie.vercel.app/projects/k2-yoga/gespraechsmappe')
    expect(url).not.toMatch(/localhost/)
  })

  it('schreibt localhost-Voll-URL auf Vercel um', () => {
    const url = getShareableAppUrl('http://localhost:5177/projects/k2-yoga/gespraechsmappe')
    expect(url).toBe('https://k2-galerie.vercel.app/projects/k2-yoga/gespraechsmappe')
  })

  it('lässt bereits öffentliche URLs unverändert', () => {
    const u = 'https://k2-galerie.vercel.app/galerie-oeffentlich#mok2'
    expect(getShareableAppUrl(u)).toBe(u)
  })

  it('behält Query und Hash', () => {
    const url = getShareableAppUrl('/projects/k2-galerie?page=handbuch#kapitel')
    expect(url).toBe('https://k2-galerie.vercel.app/projects/k2-galerie?page=handbuch#kapitel')
  })

  it('PDF-Versand-Text: öffentlicher Link, nie localhost', () => {
    const path = '/plakate-druckformate-k2/beispiel.html'
    const publicLink = getShareableAppUrl(path)
    const shareText = `Plakat\n${publicLink}`
    expect(shareText).toContain('https://k2-galerie.vercel.app/plakate-druckformate-k2/beispiel.html')
    expect(shareText).not.toMatch(/localhost/)
  })

  it('buildShareTextWithPublicLink: Titel + Vercel-URL', () => {
    const text = buildShareTextWithPublicLink(
      'Inserat Lokalzeitung',
      '/mok2#mok2-inserat-lokalzeitung',
    )
    expect(text).toContain('Inserat Lokalzeitung')
    expect(text).toContain('https://k2-galerie.vercel.app/mok2#mok2-inserat-lokalzeitung')
    expect(text).not.toMatch(/localhost/)
  })
})
