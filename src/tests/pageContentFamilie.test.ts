import { describe, it, expect, beforeEach } from 'vitest'
import { getFamilyPageContent, setFamilyPageContent } from '../config/pageContentFamilie'
import {
  FAMILIE_HUBER_TENANT_ID,
  K2_FAMILIE_DEFAULT_WELCOME_IMAGE,
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
    expect(c.welcomeImage).toMatch(/^\/img\/k2-familie\//)
    expect(c.cardImage).toMatch(/^\/img\/k2-familie\//)
  })
})
