import { describe, expect, it } from 'vitest'
import { videoUrlToFeaturedEmbed } from '../utils/featuredVideoEmbed'

describe('videoUrlToFeaturedEmbed', () => {
  it('wandelt YouTube watch in embed um', () => {
    const r = videoUrlToFeaturedEmbed('https://www.youtube.com/watch?v=jNQXAC9IVRw')
    expect(r?.kind).toBe('youtube')
    expect((r as { src: string }).src).toContain('/embed/jNQXAC9IVRw')
  })
  it('erkennt youtu.be', () => {
    const r = videoUrlToFeaturedEmbed('https://youtu.be/jNQXAC9IVRw')
    expect(r?.kind).toBe('youtube')
    expect((r as { src: string }).src).toContain('embed')
  })
  it('erkennt direkte mp4-URL', () => {
    const r = videoUrlToFeaturedEmbed('https://example.com/v/promo.mp4')
    expect(r?.kind).toBe('direct')
  })
  it('leer oder unsicher → null', () => {
    expect(videoUrlToFeaturedEmbed('')).toBeNull()
    expect(videoUrlToFeaturedEmbed('javascript:alert(1)')).toBeNull()
  })
})
