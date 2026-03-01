/**
 * Button „Bild zuschneiden“ für Admin: wandelt previewUrl (blob/URL) in Data-URL um und öffnet den Zuschnitt (onOpenCrop).
 * Ausgelagert, damit ScreenshotExportAdmin.tsx nicht weiter wächst – weniger Last für Editor/Cursor.
 */

import React from 'react'

async function previewUrlToDataUrl(previewUrl: string): Promise<string> {
  if (previewUrl.startsWith('data:')) return previewUrl
  if (previewUrl.startsWith('blob:')) {
    const r = await fetch(previewUrl)
    const blob = await r.blob()
    return new Promise((res, rej) => {
      const fr = new FileReader()
      fr.onload = () => res(String(fr.result))
      fr.onerror = rej
      fr.readAsDataURL(blob)
    })
  }
  const url = previewUrl.startsWith('http') ? previewUrl : (window.location.origin + (previewUrl.startsWith('/') ? '' : '/') + previewUrl)
  const r = await fetch(url)
  const blob = await r.blob()
  return new Promise((res, rej) => {
    const fr = new FileReader()
    fr.onload = () => res(String(fr.result))
    fr.onerror = rej
    fr.readAsDataURL(blob)
  })
}

interface AdminBildZuschneidenButtonProps {
  previewUrl: string
  onOpenCrop: (dataUrl: string) => void
}

export default function AdminBildZuschneidenButton({ previewUrl, onOpenCrop }: AdminBildZuschneidenButtonProps) {
  const [loading, setLoading] = React.useState(false)
  const handleClick = async () => {
    if (!previewUrl) return
    setLoading(true)
    try {
      const src = await previewUrlToDataUrl(previewUrl)
      onOpenCrop(src)
    } catch {
      alert('Bild konnte nicht geladen werden.')
    } finally {
      setLoading(false)
    }
  }
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      style={{
        padding: '0.5rem 0.75rem',
        background: 'rgba(95, 251, 241, 0.2)',
        border: '1px solid rgba(95, 251, 241, 0.5)',
        borderRadius: '8px',
        color: '#f4f7ff',
        fontSize: '0.85rem',
        cursor: loading ? 'wait' : 'pointer',
        marginLeft: '0.5rem'
      }}
    >
      {loading ? '⏳ Lade…' : '✂️ Bild zuschneiden'}
    </button>
  )
}
