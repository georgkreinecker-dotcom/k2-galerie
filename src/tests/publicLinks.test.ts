import { describe, it, expect } from 'vitest'
import { getPublicGaleriePath, getPublicGalerieUrl } from '../utils/publicLinks'

describe('publicLinks', () => {
  it('getPublicGaleriePath liefert Besucher-Routen für K2/ök2 und VK2-Routen', () => {
    expect(getPublicGaleriePath('k2', 'galerie')).toBe('/galerie')
    expect(getPublicGaleriePath('k2', 'vorschau')).toBe('/galerie-vorschau')
    expect(getPublicGaleriePath('oeffentlich', 'galerie')).toBe('/galerie-oeffentlich')
    expect(getPublicGaleriePath('oeffentlich', 'vorschau')).toBe('/galerie-oeffentlich-vorschau')
    expect(getPublicGaleriePath('vk2', 'galerie')).toBe('/projects/vk2/galerie')
    expect(getPublicGaleriePath('vk2', 'vorschau')).toBe('/projects/vk2/galerie-vorschau')
  })

  it('getPublicGalerieUrl ist absolut und enthält den Pfad', () => {
    const u = getPublicGalerieUrl('k2', 'galerie')
    expect(u.includes('/galerie')).toBe(true)
    expect(u.startsWith('http')).toBe(true)
  })
})

