import {
  HUNDRED_GENERATION_MAX_HOEHE_CM,
  type HundredGenerationMass,
} from '../../config/hundredGenerationMass'

type Props = {
  title: string
  mass: HundredGenerationMass
  /** Hell für Druck, dunkel für APf */
  variant?: 'screen' | 'print'
  className?: string
}

/** Vereinfachte Aufriss-Silhouette (Vorne) – nur für Maßverständnis, nicht fotorealistisch */
function silhouettePath(
  kind: HundredGenerationMass['silhouette'],
  x: number,
  y: number,
  w: number,
  h: number
): string {
  const cx = x + w / 2
  switch (kind) {
    case 'masse':
      return `M ${cx} ${y + h * 0.08}
        C ${x + w * 0.95} ${y + h * 0.05}, ${x + w * 0.98} ${y + h * 0.35}, ${x + w * 0.9} ${y + h * 0.5}
        C ${x + w * 0.98} ${y + h * 0.7}, ${x + w * 0.85} ${y + h * 0.95}, ${cx} ${y + h}
        C ${x + w * 0.15} ${y + h * 0.95}, ${x + w * 0.02} ${y + h * 0.7}, ${x + w * 0.1} ${y + h * 0.5}
        C ${x + w * 0.02} ${y + h * 0.35}, ${x + w * 0.05} ${y + h * 0.05}, ${cx} ${y + h * 0.08} Z`
    case 'axt':
      return `M ${x + w * 0.35} ${y + h}
        L ${x + w * 0.38} ${y + h * 0.55}
        L ${x + w * 0.12} ${y + h * 0.35}
        L ${x + w * 0.18} ${y + h * 0.12}
        L ${x + w * 0.55} ${y + h * 0.08}
        L ${x + w * 0.88} ${y + h * 0.22}
        L ${x + w * 0.72} ${y + h * 0.42}
        L ${x + w * 0.58} ${y + h * 0.55}
        L ${x + w * 0.62} ${y + h}
        Z`
    case 'stele':
      return `M ${x + w * 0.28} ${y + h}
        L ${x + w * 0.32} ${y + h * 0.35}
        L ${x + w * 0.22} ${y + h * 0.12}
        L ${x + w * 0.45} ${y + h * 0.02}
        L ${x + w * 0.78} ${y + h * 0.1}
        L ${x + w * 0.68} ${y + h * 0.35}
        L ${x + w * 0.72} ${y + h}
        Z`
    case 'facette':
      return `M ${cx} ${y + h * 0.05}
        L ${x + w * 0.88} ${y + h * 0.28}
        L ${x + w * 0.92} ${y + h * 0.7}
        L ${cx} ${y + h}
        L ${x + w * 0.08} ${y + h * 0.7}
        L ${x + w * 0.12} ${y + h * 0.28}
        Z`
    case 'gruppe':
      return `M ${x + w * 0.08} ${y + h}
        L ${x + w * 0.12} ${y + h * 0.45}
        L ${x + w * 0.28} ${y + h * 0.2}
        L ${x + w * 0.35} ${y + h}
        L ${x + w * 0.42} ${y + h}
        L ${x + w * 0.45} ${y + h * 0.15}
        L ${x + w * 0.58} ${y + h * 0.15}
        L ${x + w * 0.62} ${y + h}
        L ${x + w * 0.7} ${y + h}
        L ${x + w * 0.78} ${y + h * 0.35}
        L ${x + w * 0.95} ${y + h * 0.55}
        L ${x + w * 0.88} ${y + h}
        Z`
    case 'tuerme':
      return `M ${x + w * 0.15} ${y + h} L ${x + w * 0.2} ${y + h * 0.35} L ${x + w * 0.35} ${y + h * 0.35} L ${x + w * 0.38} ${y + h}
        L ${x + w * 0.55} ${y + h} L ${x + w * 0.58} ${y + h * 0.2} L ${x + w * 0.78} ${y + h * 0.2} L ${x + w * 0.82} ${y + h} Z`
    case 'segel':
      return `M ${x + w * 0.2} ${y + h} L ${x + w * 0.35} ${y + h * 0.55} L ${x + w * 0.25} ${y + h * 0.1} L ${x + w * 0.55} ${y + h * 0.25} L ${x + w * 0.75} ${y + h * 0.08} L ${x + w * 0.7} ${y + h * 0.55} L ${x + w * 0.8} ${y + h} Z`
    case 'kelch':
      return `M ${x + w * 0.25} ${y + h} L ${x + w * 0.35} ${y + h * 0.55} L ${x + w * 0.2} ${y + h * 0.35} L ${x + w * 0.3} ${y + h * 0.08} L ${x + w * 0.7} ${y + h * 0.08} L ${x + w * 0.8} ${y + h * 0.35} L ${x + w * 0.65} ${y + h * 0.55} L ${x + w * 0.75} ${y + h} Z`
    case 'ast':
      return `M ${x + w * 0.4} ${y + h} L ${x + w * 0.42} ${y + h * 0.4} L ${x + w * 0.15} ${y + h * 0.25} L ${x + w * 0.35} ${y + h * 0.15} L ${x + w * 0.45} ${y + h * 0.35} L ${x + w * 0.55} ${y + h * 0.05} L ${x + w * 0.7} ${y + h * 0.2} L ${x + w * 0.58} ${y + h * 0.4} L ${x + w * 0.6} ${y + h} Z`
    case 'zickzack':
      return `M ${x + w * 0.2} ${y + h} L ${x + w * 0.35} ${y + h * 0.7} L ${x + w * 0.2} ${y + h * 0.55} L ${x + w * 0.4} ${y + h * 0.35} L ${x + w * 0.25} ${y + h * 0.2} L ${x + w * 0.5} ${y + h * 0.05} L ${x + w * 0.75} ${y + h * 0.2} L ${x + w * 0.6} ${y + h * 0.35} L ${x + w * 0.8} ${y + h * 0.55} L ${x + w * 0.65} ${y + h * 0.7} L ${x + w * 0.8} ${y + h} Z`
    case 'spirale':
      return `M ${x + w * 0.35} ${y + h} L ${x + w * 0.4} ${y + h * 0.55} L ${x + w * 0.25} ${y + h * 0.4} L ${x + w * 0.45} ${y + h * 0.25} L ${x + w * 0.55} ${y + h * 0.08} L ${x + w * 0.75} ${y + h * 0.2} L ${x + w * 0.65} ${y + h * 0.45} L ${x + w * 0.7} ${y + h} Z`
    case 'kopf':
      return `M ${cx} ${y + h * 0.05}
        C ${x + w * 0.9} ${y + h * 0.1}, ${x + w * 0.95} ${y + h * 0.45}, ${x + w * 0.85} ${y + h * 0.7}
        L ${x + w * 0.7} ${y + h} L ${x + w * 0.3} ${y + h} L ${x + w * 0.15} ${y + h * 0.7}
        C ${x + w * 0.05} ${y + h * 0.45}, ${x + w * 0.1} ${y + h * 0.1}, ${cx} ${y + h * 0.05} Z`
    default:
      return `M ${x} ${y + h} L ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} Z`
  }
}

/**
 * Werkstatt-Maßskizze: Aufriss mit Höhe / Breite / Tiefe.
 * Max. Höhe der Serie: 50 cm.
 */
export function HundredGenerationMassSkizze({
  title,
  mass,
  variant = 'screen',
  className,
}: Props) {
  const isPrint = variant === 'print'
  const ink = isPrint ? '#1c1a18' : '#eef2f7'
  const muted = isPrint ? '#5c5650' : '#a8b3c4'
  const accent = isPrint ? '#8a6a10' : '#d4a017'
  const fill = isPrint ? '#f0ebe3' : 'rgba(212,160,23,0.12)'
  const stroke = isPrint ? '#1c1a18' : 'rgba(212,160,23,0.75)'

  const maxH = HUNDRED_GENERATION_MAX_HOEHE_CM
  const scale = mass.hoeheCm / maxH
  const viewW = 320
  const viewH = 280
  const padL = 56
  const padR = 72
  const padT = 28
  const padB = 48
  const drawH = (viewH - padT - padB) * scale
  const aspect = mass.breiteCm / mass.hoeheCm
  const drawW = Math.min(viewW - padL - padR, drawH * aspect * 1.15)
  const ox = padL + (viewW - padL - padR - drawW) / 2
  const oy = padT + (viewH - padT - padB - drawH)
  const path = silhouettePath(mass.silhouette, ox, oy, drawW, drawH)

  const dimX = ox + drawW + 14
  const topY = oy
  const botY = oy + drawH

  return (
    <div className={className} style={{ width: '100%' }}>
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        width="100%"
        role="img"
        aria-label={`Maßskizze ${title}: Höhe ${mass.hoeheCm} cm, Breite ${mass.breiteCm} cm, Tiefe ${mass.tiefeCm} cm. Maximum ${maxH} cm.`}
        style={{ display: 'block', maxWidth: 420, margin: '0 auto', background: isPrint ? '#fff' : 'transparent' }}
      >
        <text x={padL} y={18} fill={accent} fontSize={11} fontFamily="system-ui,sans-serif" fontWeight={600}>
          Maßskizze · Aufriss
        </text>
        <text x={viewW - 8} y={18} fill={muted} fontSize={10} fontFamily="system-ui,sans-serif" textAnchor="end">
          max. H {maxH} cm
        </text>

        {/* Max-Höhe-Referenzlinie */}
        <line
          x1={padL - 8}
          y1={padT}
          x2={padL - 8}
          y2={padT + (viewH - padT - padB)}
          stroke={muted}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.7}
        />
        <text
          x={padL - 12}
          y={padT + (viewH - padT - padB) / 2}
          fill={muted}
          fontSize={9}
          fontFamily="system-ui,sans-serif"
          transform={`rotate(-90 ${padL - 12} ${padT + (viewH - padT - padB) / 2})`}
          textAnchor="middle"
        >
          {maxH} cm max
        </text>

        <path d={path} fill={fill} stroke={stroke} strokeWidth={1.6} />

        {/* Höhenmaß */}
        <line x1={dimX} y1={topY} x2={dimX} y2={botY} stroke={ink} strokeWidth={1.2} />
        <line x1={dimX - 5} y1={topY} x2={dimX + 5} y2={topY} stroke={ink} strokeWidth={1.2} />
        <line x1={dimX - 5} y1={botY} x2={dimX + 5} y2={botY} stroke={ink} strokeWidth={1.2} />
        <text
          x={dimX + 10}
          y={(topY + botY) / 2}
          fill={ink}
          fontSize={12}
          fontFamily="system-ui,sans-serif"
          fontWeight={700}
          dominantBaseline="middle"
        >
          H {mass.hoeheCm} cm
        </text>

        {/* Breitenmaß */}
        <line x1={ox} y1={botY + 14} x2={ox + drawW} y2={botY + 14} stroke={ink} strokeWidth={1.2} />
        <line x1={ox} y1={botY + 9} x2={ox} y2={botY + 19} stroke={ink} strokeWidth={1.2} />
        <line x1={ox + drawW} y1={botY + 9} x2={ox + drawW} y2={botY + 19} stroke={ink} strokeWidth={1.2} />
        <text
          x={ox + drawW / 2}
          y={botY + 32}
          fill={ink}
          fontSize={11}
          fontFamily="system-ui,sans-serif"
          fontWeight={600}
          textAnchor="middle"
        >
          B {mass.breiteCm} cm
        </text>

        <text
          x={viewW / 2}
          y={viewH - 6}
          fill={muted}
          fontSize={10}
          fontFamily="system-ui,sans-serif"
          textAnchor="middle"
        >
          T {mass.tiefeCm} cm (Seite) · {title}
        </text>
      </svg>
    </div>
  )
}
