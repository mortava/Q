interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void
}

const suggestions = [
  {
    emoji: '\uD83D\uDCCA',
    title: 'What are the DSCR loan requirements?',
    prompt: 'What are the DSCR loan requirements?',
  },
  {
    emoji: '\uD83C\uDF0E',
    title: 'Foreign National LTV limits',
    prompt: 'What are the Foreign National LTV limits?',
  },
  {
    emoji: '\uD83C\uDFE0',
    title: 'Compare loan programs for investors',
    prompt: 'Compare loan programs for investors',
  },
  {
    emoji: '\uD83D\uDCB0',
    title: 'Cash-out refinance guidelines',
    prompt: 'What are the cash-out refinance guidelines?',
  },
]

export default function WelcomeScreen({ onPromptClick }: WelcomeScreenProps) {
  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-6"
      style={{ minHeight: '60vh' }}
    >
      <div className="text-center">
        {/* Q Avatar with glow */}
        <div
          className="flex items-center justify-center text-white mx-auto q-glow"
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          Q
        </div>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            marginTop: '24px',
          }}
        >
          Hi, I'm Q
        </h1>
        <p
          style={{
            fontSize: '15px',
            fontWeight: 400,
            color: 'var(--text-secondary)',
            marginTop: '6px',
            letterSpacing: '-0.01em',
          }}
        >
          Your AI Deal Desk Assistant
        </p>
        <p
          style={{
            fontSize: '13.5px',
            color: 'var(--text-tertiary)',
            marginTop: '4px',
            maxWidth: '380px',
            textAlign: 'center',
            lineHeight: '1.55',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Ask me about Guidelines, Products, Scenarios, and Anything TQL...
        </p>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 w-full"
        style={{ gap: '12px', maxWidth: '540px', marginTop: '32px' }}
      >
        {suggestions.map((s) => (
          <button
            key={s.title}
            onClick={() => onPromptClick(s.prompt)}
            className="flex items-start gap-3 text-left cursor-pointer"
            style={{
              padding: '14px 16px',
              background: 'var(--bg-bot-message)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-card)',
              transition: 'box-shadow var(--duration-slow) var(--ease-out), border-color var(--duration-fast), transform var(--duration-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--tql-blue)'
              e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-light)'
              e.currentTarget.style.boxShadow = 'var(--shadow-card)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <span className="text-xl shrink-0 mt-0.5">{s.emoji}</span>
            <span
              style={{
                fontSize: '13.5px',
                fontWeight: 500,
                lineHeight: '1.45',
                color: 'var(--text-primary)',
                letterSpacing: '-0.006em',
              }}
            >
              {s.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
