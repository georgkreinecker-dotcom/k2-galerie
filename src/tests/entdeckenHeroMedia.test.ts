import { describe, it, expect } from 'vitest'
import { isEntdeckenHeroVideoUrl } from '../config/entdeckenHeroMedia'

describe('isEntdeckenHeroVideoUrl', () => {
  it('erkennt mp4/webm/mov', () => {
    expect(isEntdeckenHeroVideoUrl('/video/tor.mp4')).toBe(true)
    expect(isEntdeckenHeroVideoUrl('/x.MP4?v=1')).toBe(true)
    expect(isEntdeckenHeroVideoUrl('https://h.app/a.webm')).toBe(true)
  })
  it('lehnt Bilder und data-URLs ab', () => {
    expect(isEntdeckenHeroVideoUrl('/img/x.jpg')).toBe(false)
    expect(isEntdeckenHeroVideoUrl('data:image/jpeg;base64,xx')).toBe(false)
  })
})
