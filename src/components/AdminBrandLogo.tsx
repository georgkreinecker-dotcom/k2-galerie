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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <span
        style={{
          fontFamily: s.fontHeading,
          fontSize: 'clamp(2rem, 6vw, 3rem)',
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
          marginTop: '0.35rem',
          display: 'block',
          color: s.muted,
          fontSize: 'clamp(0.8rem, 2.2vw, 1rem)',
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
