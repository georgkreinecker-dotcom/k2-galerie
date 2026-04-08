import { describe, expect, it } from 'vitest'
import { receiptPdfHeightMmFromCanvas } from '../utils/receiptRollPdf'

describe('receiptRollPdf', () => {
  it('receiptPdfHeightMmFromCanvas: Seitenhöhe aus Seitenverhältnis', () => {
    const c = document.createElement('canvas')
    c.width = 100
    c.height = 300
    expect(receiptPdfHeightMmFromCanvas(c, 80)).toBeCloseTo(240, 5)
  })
})
