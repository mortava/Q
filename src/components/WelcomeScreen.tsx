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
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="text-center mb-10">
        {/* Q Avatar with glow */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 q-glow"
          style={{ background: 'linear-gradient(135deg, #007BE0, #0062B3)' }}
        >
          Q
        </div>
        <h1
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          Hi, I'm Q
        </h1>
        <p
          className="text-base mb-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          Your AI Account Executive Assistant
        </p>
        <p
          className="text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Ask me anything about TQL loan products, guidelines, and scenarios.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {suggestions.map((s) => (
          <button
            key={s.title}
            onClick={() => onPromptClick(s.prompt)}
            className="flex items-start gap-3 p-4 text-left cursor-pointer group"
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              transition: 'var(--transition-base)',
              maxWidth: '240px',
              width: '100%',
              justifySelf: 'center',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--tql-blue)'
              e.currentTarget.style.boxShadow = 'var(--shadow-md)'
              e.currentTarget.style.transform = 'scale(1.02)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-light)'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <span className="text-2xl shrink-0 mt-0.5">{s.emoji}</span>
            <div
              className="text-sm font-medium leading-snug"
              style={{ color: 'var(--text-primary)' }}
            >
              {s.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
