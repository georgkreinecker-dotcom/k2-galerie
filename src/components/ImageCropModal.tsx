import React, { useState, useRef, useCallback, useEffect } from 'react'
import { cropImageToDataUrl, type CropRect } from '../utils/cropImageToDataUrl'

/** Kachel-Seitenverhältnis (Breite : Höhe) wie in GalerieVorschauPage */
const KACHEL_ASPECT = 5 / 6

interface ImageCropModalProps {
  imageSrc: string
  aspectRatio?: number
  onApply: (dataUrl: string) => void
  onCancel: () => void
}

function getInitialCrop(aspectRatio: number): CropRect {
  const size = 0.85
  let w: number
  let h: number
  if (aspectRatio >= 1) {
    w = size
    h = Math.min(1, size / aspectRatio)
  } else {
    h = size
    w = Math.min(1, size * aspectRatio)
  }
  return {
    x: (1 - w) / 2,
    y: (1 - h) / 2,
    width: w,
    height: h
  }
}

const MIN_CROP_SIZE = 0.08

export default function ImageCropModal({
  imageSrc,
  aspectRatio = KACHEL_ASPECT,
  onApply,
  onCancel
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<CropRect>(() => getInitialCrop(aspectRatio))
  const [applying, setApplying] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const dragRef = useRef<{ startX: number; startY: number; startCropX: number; startCropY: number } | null>(null)

  const clampCrop = useCallback((c: CropRect): CropRect => ({
    x: Math.max(0, Math.min(1 - c.width, c.x)),
    y: Math.max(0, Math.min(1 - c.height, c.y)),
    width: c.width,
    height: c.height
  }), [])

  /** Bild-Koordinaten (0–1) aus Client-XY */
  const clientToNorm = useCallback((clientX: number, clientY: number): { x: number; y: number } | null => {
    if (!imgRef.current) return null
    const r = imgRef.current.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(1, (clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (clientY - r.top) / r.height))
    }
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    if (!imgRef.current) return
    dragRef.current = { startX: e.clientX, startY: e.clientY, startCropX: crop.x, startCropY: crop.y }
    setIsDragging(true)
  }, [crop.x, crop.y])

  /** Resize: Griff unten-rechts ziehen → Zuschnitt vergrößern/verkleinern (Seitenverhältnis bleibt) */
  const handleResizeDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
  }, [])

  const handleResizeTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation()
    setIsResizing(true)
  }, [])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e: MouseEvent) => {
      if (!imgRef.current || !dragRef.current) return
      const r = imgRef.current.getBoundingClientRect()
      const dx = (e.clientX - dragRef.current.startX) / r.width
      const dy = (e.clientY - dragRef.current.startY) / r.height
      setCrop(prev => clampCrop({
        ...prev,
        x: dragRef.current!.startCropX + dx,
        y: dragRef.current!.startCropY + dy
      }))
    }
    const onUp = () => {
      dragRef.current = null
      setIsDragging(false)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [isDragging, clampCrop])

  useEffect(() => {
    if (!isResizing || !imgRef.current) return
    const updateCrop = (clientX: number, clientY: number) => {
      const norm = clientToNorm(clientX, clientY)
      if (!norm) return
      setCrop(prev => {
        let w = norm.x - prev.x
        let h = norm.y - prev.y
        if (w < MIN_CROP_SIZE) w = MIN_CROP_SIZE
        if (h < MIN_CROP_SIZE) h = MIN_CROP_SIZE
        if (w / h > aspectRatio) h = w / aspectRatio
        else w = h * aspectRatio
        const maxW = 1 - prev.x
        const maxH = 1 - prev.y
        if (w > maxW) { w = maxW; h = w / aspectRatio }
        if (h > maxH) { h = maxH; w = h * aspectRatio }
        if (w < MIN_CROP_SIZE) w = MIN_CROP_SIZE
        if (h < MIN_CROP_SIZE) h = MIN_CROP_SIZE
        return { ...prev, width: w, height: h }
      })
    }
    const onMove = (e: MouseEvent) => updateCrop(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length) updateCrop(e.touches[0].clientX, e.touches[0].clientY)
    }
    const onUp = () => setIsResizing(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onUp)
    window.addEventListener('touchcancel', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onUp)
      window.removeEventListener('touchcancel', onUp)
    }
  }, [isResizing, aspectRatio, clientToNorm])

  /** Mausrad: Zuschnitt vergrößern (reinzoom) / verkleinern (rauszoom) um Bildmitte */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.05 : -0.05
    setCrop(prev => {
      const cx = prev.x + prev.width / 2
      const cy = prev.y + prev.height / 2
      let w = prev.width - delta
      let h = prev.height - delta
      const minSize = MIN_CROP_SIZE
      if (w < minSize) w = minSize
      if (h < minSize) h = minSize
      if (w / h > aspectRatio) h = w / aspectRatio
      else w = h * aspectRatio
      if (w > 1) w = 1
      if (h > 1) h = 1
      const nx = cx - w / 2
      const ny = cy - h / 2
      const x = Math.max(0, Math.min(1 - w, nx))
      const y = Math.max(0, Math.min(1 - h, ny))
      return { x, y, width: w, height: h }
    })
  }, [aspectRatio])

  const handleApply = useCallback(async () => {
    setApplying(true)
    try {
      const dataUrl = await cropImageToDataUrl(imageSrc, crop, { maxSize: 1000, quality: 0.8 })
      onApply(dataUrl)
    } catch (err) {
      console.warn('Zuschnitt fehlgeschlagen:', err)
      alert('Zuschnitt konnte nicht übernommen werden.')
    } finally {
      setApplying(false)
    }
  }, [imageSrc, crop, onApply])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        style={{
          background: '#1a1a2e',
          borderRadius: '12px',
          padding: '1rem',
          maxWidth: '95vw',
          maxHeight: '95vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: 0, color: '#f4f7ff', fontSize: '1rem' }}>Bild zuschneiden</h3>
        <p style={{ margin: 0, color: '#8fa0c9', fontSize: '0.85rem' }}>
          Zuschnitt verschieben oder an der Ecke vergrößern/verkleinern – genau den Ausschnitt markieren, der die Kachel füllen soll. Mausrad: Größe ändern. Dann „Übernehmen“.
        </p>
        <div
          style={{ position: 'relative', maxHeight: '70vh', lineHeight: 0 }}
          onWheel={handleWheel}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Zuschnitt"
            style={{ maxWidth: '80vw', maxHeight: '70vh', width: 'auto', height: 'auto', display: 'block', verticalAlign: 'middle' }}
            draggable={false}
          />
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none'
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: `${crop.x * 100}%`,
                top: `${crop.y * 100}%`,
                width: `${crop.width * 100}%`,
                height: `${crop.height * 100}%`,
                border: '2px solid #5ffbf1',
                boxSizing: 'border-box',
                pointerEvents: 'auto',
                cursor: isResizing ? 'nwse-resize' : 'move'
              }}
              onMouseDown={handleMouseDown}
            >
              {/* Griff unten-rechts: Zuschnitt vergrößern/verkleinern */}
              <div
                role="button"
                tabIndex={0}
                aria-label="Zuschnitt vergrößern oder verkleinern"
                onMouseDown={handleResizeDown}
                onTouchStart={handleResizeTouchStart}
                style={{
                  position: 'absolute',
                  right: -2,
                  bottom: -2,
                  width: 24,
                  height: 24,
                  background: '#5ffbf1',
                  borderRadius: '0 0 4px 0',
                  cursor: 'nwse-resize',
                  boxShadow: '0 0 0 2px #1a1a2e'
                }}
              />
            </div>
            {/* Dunkle Streifen außerhalb des Zuschnitts */}
            <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: `${crop.y * 100}%`, background: 'rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'absolute', left: 0, bottom: 0, right: 0, height: `${(1 - crop.y - crop.height) * 100}%`, background: 'rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'absolute', left: 0, top: `${crop.y * 100}%`, width: `${crop.x * 100}%`, height: `${crop.height * 100}%`, background: 'rgba(0,0,0,0.5)' }} />
            <div style={{ position: 'absolute', right: 0, top: `${crop.y * 100}%`, width: `${(1 - crop.x - crop.width) * 100}%`, height: `${crop.height * 100}%`, background: 'rgba(0,0,0,0.5)' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid rgba(95,251,241,0.5)',
              borderRadius: '8px',
              color: '#f4f7ff',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={applying}
            style={{
              padding: '0.5rem 1rem',
              background: applying ? 'rgba(95,251,241,0.3)' : 'rgba(95, 251, 241, 0.25)',
              border: '1px solid #5ffbf1',
              borderRadius: '8px',
              color: '#f4f7ff',
              cursor: applying ? 'wait' : 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {applying ? '⏳ …' : 'Zuschnitt übernehmen'}
          </button>
        </div>
      </div>
    </div>
  )
}
