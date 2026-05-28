import { describe, expect, it } from 'vitest'
import {
  K2_AGENTUR_MASTER_STRATEGIE_P1_URL,
  MASTER_STRATEGIE_P1_META,
  MASTER_STRATEGIE_P1_PILOT,
} from '../config/k2AgenturMasterStrategieP1'

describe('k2AgenturMasterStrategieP1', () => {
  it('liefert konsistente Pilot-Metadaten für P1 Google', () => {
    expect(MASTER_STRATEGIE_P1_META.kampagnenKey).toBe('p1-google-2026q2')
    expect(MASTER_STRATEGIE_P1_META.landingPfad).toContain('galerie-oeffentlich')
    expect(MASTER_STRATEGIE_P1_PILOT.erfolg).toMatch(/Lizenz/i)
  })

  it('Druck-URL ist der Schreibtisch-Pfad', () => {
    expect(K2_AGENTUR_MASTER_STRATEGIE_P1_URL).toBe(
      '/texte-schreibtisch/k2-agentur-master-strategie-p1.html',
    )
  })
})
