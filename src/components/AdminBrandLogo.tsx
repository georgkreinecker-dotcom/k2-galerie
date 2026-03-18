/**
 * Admin-Brand-Logo – Header des Admin-Bereichs.
 * Zeigt entweder ein Bild (logoSrc) oder das Text-Logo (Markenname + „Admin“).
 */

import { PRODUCT_BRAND_NAME } from '../config/tenantConfig'
import { WERBEUNTERLAGEN_STIL } from '../config/marketingWerbelinie'

const s = WERBEUNTERLAGEN_STIL

interface AdminBrandLogoProps {
  /** Optional: Bild-URL für eigenes Admin-Logo (z. B. /admin-logo.svg). Wenn gesetzt, wird das Bild angezeigt. */
  logoSrc?: string
  /** Alt-Text für das Logo-Bild */
  logoAlt?: string
  /** Optional: Überschrift statt Produktname (z. B. "VK2 Vereinsplattform" im VK2-Admin). */
  title?: string
}

export default function AdminBrandLogo({ logoSrc, logoAlt = 'Admin', title }: AdminBrandLogoProps) {
  if (logoSrc) {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={logoSrc}
          alt={logoAlt}
          style={{
            height: 'clamp(2.5rem, 5vw, 3.25rem)',
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
          }}
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.15rem' }}>
      <span
        style={{
          fontFamily: s.fontHeading,
          fontSize: 'clamp(1.15rem, 3vw, 1.5rem)',
          fontWeight: 700,
          color: s.accent,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}
      >
        {title ?? PRODUCT_BRAND_NAME}
      </span>
      <span
        style={{
          color: s.muted,
          fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: s.fontBody,
        }}
      >
        Admin
      </span>
    </div>
  )
}
