import { describe, it, expect, beforeEach } from 'vitest'
import { getFamilyPageContent, setFamilyPageContent } from '../config/pageContentFamilie'

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
})
