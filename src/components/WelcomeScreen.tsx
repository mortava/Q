interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void
}

const suggestions = [
  'What are the DSCR loan requirements?',
  'Foreign National LTV limits',
  'Compare loan programs for investors',
  'Cash-out refinance guidelines',
  'Bank statement program details',
  'What is TQL\'s closing timeline?',
]

export default function WelcomeScreen({ onPromptClick }: WelcomeScreenProps) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-6"
      style={{ minHeight: '60vh' }}
    >
      <div className="text-center">
        {/* Q Lettermark — large, transparent, Poppins */}
        <div
          className="flex items-center justify-center mx-auto"
          style={{
            width: '80px',
            height: '80px',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-poppins)',
              fontSize: '64px',
              fontWeight: 600,
              color: 'var(--foreground)',
              lineHeight: 1,
            }}
          >
            Q
          </span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-poppins)',
            fontSize: '28px',
            fontWeight: 600,
            color: 'var(--foreground)',
            marginTop: '20px',
          }}
        >
          How can I help you today?
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-poppins)',
            fontSize: '16px',
            color: 'var(--text-tertiary)',
            marginTop: '8px',
          }}
        >
          Your TQL Account Executive AI
        </p>
      </div>

      {/* Suggestion Chips — pill-shaped */}
      <div
        className="flex flex-wrap justify-center"
        style={{ gap: '8px', maxWidth: '680px', marginTop: '32px' }}
      >
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onPromptClick(s)}
            className="suggestion-chip"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}
