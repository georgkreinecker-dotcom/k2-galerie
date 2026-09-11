import {
  HUNDRED_GENERATION_MAX_HOEHE_CM,
  type HundredGenerationMass,
} from '../../config/hundredGenerationMass'

type Props = {
  title: string
  mass: HundredGenerationMass
  /** Echte Vorne-Ansicht – Form 1:1 wie das Objekt */
  imageSrc: string
  /** Hell für Druck, dunkel für APf */
  variant?: 'screen' | 'print'
  className?: string
}

/**
 * Werkstatt-Maßskizze: echte Vorne-Ansicht + Maßlinien H/B/T.
 * Max. Höhe der Serie: 50 cm. Keine Schema-Silhouette – Form = Objektfoto.
 */
export function HundredGenerationMassSkizze({
  title,
  mass,
  imageSrc,
  variant = 'screen',
  className,
}: Props) {
  const isPrint = variant === 'print'
  const ink = isPrint ? '#1c1a18' : '#eef2f7'
  const muted = isPrint ? '#5c5650' : '#a8b3c4'
  const accent = isPrint ? '#8a6a10' : '#d4a017'
  const frame = isPrint ? '#c8c0b4' : 'rgba(212,160,23,0.45)'
  const panelBg = isPrint ? '#f7f4ef' : '#0a0c10'

  const maxH = HUNDRED_GENERATION_MAX_HOEHE_CM
  const scale = mass.hoeheCm / maxH
  const viewW = 360
  const viewH = 320
  const padL = 52
  const padR = 78
  const padT = 36
  const padB = 52
  const maxDrawH = viewH - padT - padB
  const maxDrawW = viewW - padL - padR
  const drawH = maxDrawH * scale
  const aspect = mass.breiteCm / Math.max(mass.hoeheCm, 1)
  const drawW = Math.min(maxDrawW, drawH * aspect * 1.05)
  const ox = padL + (maxDrawW - drawW) / 2
  const oy = padT + (maxDrawH - drawH)
  const dimX = ox + drawW + 12
  const topY = oy
  const botY = oy + drawH

  return (
    <div className={className} style={{ width: '100%' }}>
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        width="100%"
        role="img"
        aria-label={`Maßskizze ${title}: Höhe ${mass.hoeheCm} cm, Breite ${mass.breiteCm} cm, Tiefe ${mass.tiefeCm} cm. Maximum ${maxH} cm. Form = Vorne-Ansicht.`}
        style={{
          display: 'block',
          maxWidth: 460,
          margin: '0 auto',
          background: isPrint ? '#fff' : 'transparent',
        }}
      >
        <text
          x={padL}
          y={18}
          fill={accent}
          fontSize={11}
          fontFamily="system-ui,sans-serif"
          fontWeight={600}
        >
          Maßskizze · Vorne (Objekt)
        </text>
        <text
          x={viewW - 8}
          y={18}
          fill={muted}
          fontSize={10}
          fontFamily="system-ui,sans-serif"
          textAnchor="end"
        >
          max. H {maxH} cm
        </text>

        {/* Max-Höhe-Referenz */}
        <line
          x1={padL - 10}
          y1={padT}
          x2={padL - 10}
          y2={padT + maxDrawH}
          stroke={muted}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.75}
        />
        <text
          x={padL - 14}
          y={padT + maxDrawH / 2}
          fill={muted}
          fontSize={9}
          fontFamily="system-ui,sans-serif"
          transform={`rotate(-90 ${padL - 14} ${padT + maxDrawH / 2})`}
          textAnchor="middle"
        >
          {maxH} cm max
        </text>

        {/* Bildrahmen in Maß-Proportion */}
        <rect
          x={ox - 1}
          y={oy - 1}
          width={drawW + 2}
          height={drawH + 2}
          fill={panelBg}
          stroke={frame}
          strokeWidth={1.2}
        />
        <image
          href={imageSrc}
          x={ox}
          y={oy}
          width={drawW}
          height={drawH}
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Höhenmaß */}
        <line x1={dimX} y1={topY} x2={dimX} y2={botY} stroke={ink} strokeWidth={1.3} />
        <line x1={dimX - 5} y1={topY} x2={dimX + 5} y2={topY} stroke={ink} strokeWidth={1.3} />
        <line x1={dimX - 5} y1={botY} x2={dimX + 5} y2={botY} stroke={ink} strokeWidth={1.3} />
        <text
          x={dimX + 9}
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
        <line
          x1={ox}
          y1={botY + 12}
          x2={ox + drawW}
          y2={botY + 12}
          stroke={ink}
          strokeWidth={1.3}
        />
        <line x1={ox} y1={botY + 7} x2={ox} y2={botY + 17} stroke={ink} strokeWidth={1.3} />
        <line
          x1={ox + drawW}
          y1={botY + 7}
          x2={ox + drawW}
          y2={botY + 17}
          stroke={ink}
          strokeWidth={1.3}
        />
        <text
          x={ox + drawW / 2}
          y={botY + 30}
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
          T {mass.tiefeCm} cm (Seite) · ohne Sockel · {title}
        </text>
      </svg>
    </div>
  )
}
