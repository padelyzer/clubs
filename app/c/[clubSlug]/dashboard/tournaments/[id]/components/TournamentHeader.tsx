/**
 * TournamentHeader Component
 * Extracted from page.tsx (lines 1745-1803)
 */

type TournamentHeaderProps = {
  name: string
  clubName: string
  onBack: () => void
}

export function TournamentHeader({ name, clubName, onBack }: TournamentHeaderProps) {
  return (
    <div
      style={{
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#1f2937',
            letterSpacing: '-0.03em',
            marginBottom: '8px'
          }}
        >
          {name}
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          {clubName} • Gestiona todas las operaciones del torneo
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            background: '#10b981',
            color: '#1f2937',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#059669'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#10b981'
          }}
        >
          ← Volver a Club
        </button>
      </div>
    </div>
  )
}
