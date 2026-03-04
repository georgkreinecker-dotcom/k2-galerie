/**
 * Ein Tool für alle gleichen Anwendungen: Bildverarbeitung überall gleich.
 * K2/ök2/VK2 – überall wo Bilder bearbeitet werden (Werke, Willkommensbild, Galerie-Karte, VK2-Karten).
 */

import React from 'react'
import { BACKGROUND_PRESETS, type BackgroundPresetKey } from '../utils/professionalImageBackground'

export type ImageProcessingMode = 'original' | 'freigestellt' | 'vollkachel'

export interface ImageProcessingOptionsProps {
  mode: ImageProcessingMode
  onModeChange: (mode: ImageProcessingMode) => void
  backgroundPreset: BackgroundPresetKey
  onBackgroundPresetChange: (preset: BackgroundPresetKey) => void
  /** Nur bei Werken: Option "Vollkachelform" (Bild füllt Kachel). Bei Seitengestaltung false. */
  showVollkachel?: boolean
  /** Styling: inline styles für Container (z. B. dunkler Admin-Hintergrund). */
  style?: React.CSSProperties
}

const PRESET_LABELS: Record<BackgroundPresetKey, string> = {
  hell: 'Hell (klassisch)',
  weiss: 'Weiß',
  warm: 'Warm',
  kuehl: 'Kühl',
  dunkel: 'Dunkel'
}

export function ImageProcessingOptions({
  mode,
  onModeChange,
  backgroundPreset,
  onBackgroundPresetChange,
  showVollkachel = false,
  style = {}
}: ImageProcessingOptionsProps) {
  return (
    <div
      style={{
        padding: '0.75rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '10px',
        border: '1px solid rgba(95, 251, 241, 0.2)',
        ...style
      }}
    >
      <span
        style={{
          fontSize: '0.8rem',
          color: '#8fa0c9',
          fontWeight: 500,
          display: 'block',
          marginBottom: '0.5rem'
        }}
      >
        Bildverarbeitung
      </span>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flexDirection: 'column' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#f4f7ff' }}>
          <input
            type="radio"
            name="image-processing-mode"
            checked={mode === 'freigestellt'}
            onChange={() => onModeChange('freigestellt')}
          />
          Foto freistellen (mit Pro-Hintergrund)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#f4f7ff' }}>
          <input
            type="radio"
            name="image-processing-mode"
            checked={mode === 'original'}
            onChange={() => onModeChange('original')}
          />
          Original benutzen
        </label>
        {showVollkachel && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#f4f7ff' }}>
            <input
              type="radio"
              name="image-processing-mode"
              checked={mode === 'vollkachel'}
              onChange={() => onModeChange('vollkachel')}
            />
            Vollkachelform (Bild füllt Kachel)
          </label>
        )}
      </div>
      {mode === 'freigestellt' && (
        <div style={{ marginTop: '0.75rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '0.35rem' }}>
            Hintergrund
          </label>
          <select
            value={backgroundPreset}
            onChange={(e) => onBackgroundPresetChange(e.target.value as BackgroundPresetKey)}
            style={{
              padding: '0.4rem 0.6rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          >
            {(Object.keys(BACKGROUND_PRESETS) as BackgroundPresetKey[]).map((key) => (
              <option key={key} value={key}>
                {PRESET_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
