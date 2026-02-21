import { useRef, useState } from 'react'

interface ImageDropZoneProps {
  imageUrl?: string
  onImage: (dataUrl: string) => void
  placeholder?: string
  aspectRatio?: string
  maxWidth?: number
  quality?: number
  style?: React.CSSProperties
  imgStyle?: React.CSSProperties
}

async function compressToDataUrl(file: File, maxWidth = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas nicht verfügbar'))
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = reject
      img.src = ev.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Universelle Bild-Ablage: Klicken ODER Foto reinziehen (Drag & Drop).
 * Funktioniert überall – Werke, Galerie-Gestaltung, Mitglieder, etc.
 */
export default function ImageDropZone({
  imageUrl,
  onImage,
  placeholder = 'Foto hierher ziehen oder klicken',
  aspectRatio = '4/3',
  maxWidth = 1200,
  quality = 0.7,
  style,
  imgStyle,
}: ImageDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    try {
      const dataUrl = await compressToDataUrl(file, maxWidth, quality)
      onImage(dataUrl)
    } catch {
      alert('Fehler beim Laden des Bildes')
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDragEnter={() => setDragging(true)}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={async (e) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) await handleFile(file)
      }}
      style={{
        cursor: 'pointer',
        width: '100%',
        aspectRatio,
        borderRadius: 10,
        overflow: 'hidden',
        border: dragging
          ? '2px solid var(--k2-accent, #5ffbf1)'
          : '2px dashed rgba(255,255,255,0.25)',
        background: imageUrl ? 'transparent' : 'rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'border-color 0.15s, opacity 0.15s',
        opacity: dragging ? 0.8 : 1,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (file) await handleFile(file)
          e.target.value = ''
        }}
      />
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Bild"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            ...imgStyle,
          }}
        />
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--k2-muted, #8fa0c9)',
          fontSize: '0.85rem',
          textAlign: 'center',
          padding: '1rem',
          pointerEvents: 'none',
        }}>
          <span style={{ fontSize: dragging ? '2.5rem' : '2rem', transition: 'font-size 0.15s' }}>
            {dragging ? '⬇️' : '📸'}
          </span>
          <span>{dragging ? 'Loslassen zum Ablegen' : placeholder}</span>
        </div>
      )}
    </div>
  )
}
