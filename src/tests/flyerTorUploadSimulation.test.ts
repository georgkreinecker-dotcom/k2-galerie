import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import FlyerK2Oek2TorViererPage from '../pages/FlyerK2Oek2TorViererPage'

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,TEST'),
  },
}))

describe('Flyer Vierer Tor Upload Simulation', () => {
  it('setzt Torbild nach Dateiauswahl in der Tor-Kachel', async () => {
    const originalCreateObjectURL = URL.createObjectURL
    const originalRevokeObjectURL = URL.revokeObjectURL
    const createObjectURLMock = vi.fn(() => 'blob:tor-test-bild')
    const revokeObjectURLMock = vi.fn()
    URL.createObjectURL = createObjectURLMock
    URL.revokeObjectURL = revokeObjectURLMock

    const host = document.createElement('div')
    document.body.appendChild(host)
    const root = createRoot(host)

    try {
      await act(async () => {
        root.render(
          React.createElement(
            MemoryRouter,
            null,
            React.createElement(FlyerK2Oek2TorViererPage)
          )
        )
      })

      const torInput = host.querySelector('input[aria-label="Torbild wählen"]') as HTMLInputElement | null
      expect(torInput).toBeTruthy()

      const testFile = new File(['tor-bild'], 'tor-test.png', { type: 'image/png' })
      await act(async () => {
        Object.defineProperty(torInput as HTMLInputElement, 'files', {
          configurable: true,
          value: [testFile],
        })
        torInput?.dispatchEvent(new Event('change', { bubbles: true }))
      })

      expect(createObjectURLMock).toHaveBeenCalled()
      const anyTorPreviewHasBlob = Array.from(host.querySelectorAll('img')).some((img) =>
        img.getAttribute('src')?.includes('blob:tor-test-bild')
      )
      expect(anyTorPreviewHasBlob).toBe(true)
      const statusText = host.textContent || ''
      expect(statusText.includes('Datei gewählt: tor-test.png') || statusText.includes('Wird geladen')).toBe(true)
    } finally {
      await act(async () => {
        root.unmount()
      })
      host.remove()
      URL.createObjectURL = originalCreateObjectURL
      URL.revokeObjectURL = originalRevokeObjectURL
    }
  })
})

