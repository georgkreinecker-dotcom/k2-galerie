import {
  MISSION_VISIT_ZEITFENSTER_OPTIONS,
  type MissionVisitZeitfensterTage,
} from '../../config/missionVisitZeitleiste'

type Props = {
  value: MissionVisitZeitfensterTage
  onChange: (tage: MissionVisitZeitfensterTage) => void
}

export default function MissionVisitZeitfensterPicker({ value, onChange }: Props) {
  return (
    <div
      className="mission-visit-zeitfenster-picker mission-visit-no-print"
      role="group"
      aria-label="Zeitfenster"
      style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}
    >
      <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginRight: '0.25rem' }}>Zeitfenster:</span>
      {MISSION_VISIT_ZEITFENSTER_OPTIONS.map((opt) => {
        const active = value === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={active}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '8px',
              border: active ? '1px solid #818cf8' : '1px solid rgba(148,163,184,0.35)',
              background: active ? 'rgba(99,102,241,0.35)' : 'rgba(15,23,42,0.5)',
              color: active ? '#e0e7ff' : '#cbd5e1',
              fontWeight: active ? 700 : 500,
              fontSize: '0.78rem',
              cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
