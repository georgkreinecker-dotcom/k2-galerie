import { describe, it, expect, beforeEach } from 'vitest'
import { getFamilyPageContent, mergeFamilyPageContentFromServer, setFamilyPageContent } from '../config/pageContentFamilie'
import {
  FAMILIE_HUBER_TENANT_ID,
  FAMILIE_HUBER_DEFAULT_PAGE_CONTENT,
  FAMILIE_HUBER_DEFAULT_EINSTIEG_HERO,
  K2_FAMILIE_DECKBLATT_HOME_PNG,
} from '../data/k2FamilieMusterHuberQuelle'

describe('pageContentFamilie', () => {
  beforeEach(() => {
    try {
      localStorage.clear()
    } catch {
      /* ignore */
    }
  })

  it('setFamilyPageContent: undefined überschreibt welcomeImage nicht (kein leeres JSON)', () => {
    setFamilyPageContent('tenant-a', { welcomeImage: 'data:image/jpeg;base64,xx' })
    setFamilyPageContent('tenant-a', { welcomeImage: undefined })
    const c = getFamilyPageContent('tenant-a')
    expect(c.welcomeImage).toBe('data:image/jpeg;base64,xx')
  })

  it('setFamilyPageContent: leerer String entfernt Bild absichtlich', () => {
    setFamilyPageContent('tenant-b', { welcomeImage: 'data:image/jpeg;base64,yy' })
    setFamilyPageContent('tenant-b', { welcomeImage: '' })
    const c = getFamilyPageContent('tenant-b')
    expect(c.welcomeImage).toBe('')
  })

  it('Muster huber: ohne Speicher = Standard-Hero unter /img/k2-familie (Vercel/ohne Netz)', () => {
    const c = getFamilyPageContent(FAMILIE_HUBER_TENANT_ID)
    expect(c.welcomeImage).toBe(FAMILIE_HUBER_DEFAULT_EINSTIEG_HERO)
    expect(c.welcomeImage).toMatch(/^\/img\/k2-familie\//)
    expect(c.cardImage).toMatch(/^\/img\/k2-familie\//)
  })

  it('fremde Mandanten-ID: Huber-Screenshot + Huber-Kartenbild im Speicher → Hero-Bild entfernt (Vermischung)', () => {
    const tid = 'familie-kreinecker-xyz'
    localStorage.setItem(
      `k2-familie-${tid}-page-content`,
      JSON.stringify({
        welcomeImage: FAMILIE_HUBER_DEFAULT_EINSTIEG_HERO,
        cardImage: FAMILIE_HUBER_DEFAULT_PAGE_CONTENT.cardImage,
      }),
    )
    const c = getFamilyPageContent(tid)
    expect(c.welcomeImage).toBeUndefined()
    expect(c.cardImage).toBeUndefined()
  })

  it('fremde Mandanten-ID: gleiches Huber-PNG als volle Origin-URL → Hero entfernt (nicht nur Pfad-Vergleich)', () => {
    const tid = 'familie-kreinecker-stamm-alkoven'
    const absolut = `https://k2-galerie.vercel.app${FAMILIE_HUBER_DEFAULT_EINSTIEG_HERO}`
    localStorage.setItem(
      `k2-familie-${tid}-page-content`,
      JSON.stringify({ welcomeImage: absolut }),
    )
    expect(getFamilyPageContent(tid).welcomeImage).toBeUndefined()
  })

  it('fremde Mandanten-ID: ohne Speicher = kein Default-Willkommensbild (kein Huber-Marketing-PNG)', () => {
    const c = getFamilyPageContent('familie-nur-lokal-001')
    expect(c.welcomeImage).toBeUndefined()
  })

  it('mergeFamilyPageContentFromServer: Server liefert Bild, lokal leer → übernehmen', () => {
    const tid = 'familie-merge-cloud-001'
    const merged = mergeFamilyPageContentFromServer(
      {},
      { welcomeImage: 'https://example.org/hero.jpg' },
      tid,
    )
    expect(merged.welcomeImage).toBe('https://example.org/hero.jpg')
  })

  it('mergeFamilyPageContentFromServer: Server leer, lokal mit data-URL → lokal behalten', () => {
    const tid = 'familie-merge-cloud-002'
    const local = { welcomeImage: 'data:image/jpeg;base64,abcd' }
    const merged = mergeFamilyPageContentFromServer(local, { welcomeImage: '' }, tid)
    expect(merged.welcomeImage).toBe('data:image/jpeg;base64,abcd')
  })

  it('Deckblatt-Voll-Screenshot: huber → Einstiegs-PNG; sonst kein Bild', () => {
    const tidFremd = 'familie-hat-deckblatt'
    localStorage.setItem(
      `k2-familie-${tidFremd}-page-content`,
      JSON.stringify({ welcomeImage: K2_FAMILIE_DECKBLATT_HOME_PNG }),
    )
    expect(getFamilyPageContent(tidFremd).welcomeImage).toBeUndefined()

    localStorage.setItem(
      `k2-familie-${FAMILIE_HUBER_TENANT_ID}-page-content`,
      JSON.stringify({ welcomeImage: K2_FAMILIE_DECKBLATT_HOME_PNG }),
    )
    const h = getFamilyPageContent(FAMILIE_HUBER_TENANT_ID)
    expect(h.welcomeImage).toBe(FAMILIE_HUBER_DEFAULT_EINSTIEG_HERO)
    expect(h.welcomeImage).not.toBe(K2_FAMILIE_DECKBLATT_HOME_PNG)
  })
})
