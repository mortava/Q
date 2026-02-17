import { useState, useEffect, useRef } from 'react'
import { ArrowUp } from 'lucide-react'

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void
  inputValue: string
  onInputChange: (value: string) => void
  onSend: () => void
}

const sampleQuestions = [
  'What are the DSCR loan requirements?',
  'Foreign National LTV limits?',
  'Compare loan programs for investors',
  'Cash-out refinance guidelines?',
  'Bank statement program details?',
  'What is TQL\'s closing timeline?',
  'Non-QM loan options available?',
  'What are the reserve requirements?',
]

export default function WelcomeScreen({
  onPromptClick,
  inputValue,
  onInputChange,
  onSend,
}: WelcomeScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Rotate sample questions with fade
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % sampleQuestions.length)
        setIsVisible(true)
      }, 500) // fade out duration
    }, 3500) // show each question for 3.5s

    return () => clearInterval(interval)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inputValue.trim()) onSend()
    }
  }

  const adjustHeight = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  const hasText = inputValue.trim().length > 0

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg-chat)' }}
    >
      {/* Centered Q Lettermark */}
      <div
        className="flex items-center justify-center"
        style={{ marginBottom: '24px' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-poppins)',
            fontSize: '72px',
            fontWeight: 600,
            color: 'var(--foreground)',
            lineHeight: 1,
          }}
        >
          Q
        </span>
      </div>

      {/* Rotating sample question */}
      <div
        style={{
          height: '28px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <button
          onClick={() => onPromptClick(sampleQuestions[currentIndex])}
          className="cursor-pointer"
          style={{
            fontFamily: 'var(--font-poppins)',
            fontSize: '15px',
            fontWeight: 400,
            color: 'var(--text-tertiary)',
            background: 'none',
            border: 'none',
            opacity: isVisible ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            letterSpacing: '-0.01em',
          }}
        >
          {sampleQuestions[currentIndex]}
        </button>
      </div>

      {/* Centered Input Box — no border */}
      <div style={{ width: '100%', maxWidth: '680px' }}>
        <div
          className="flex items-end"
          style={{
            background: 'var(--bg-input)',
            borderRadius: '16px',
            border: 'none',
            boxShadow: 'var(--shadow-input)',
            padding: '10px 14px 10px 20px',
            gap: '8px',
          }}
        >
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => {
              onInputChange(e.target.value)
              adjustHeight()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask Q anything about TQL loan products..."
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none"
            style={{
              fontSize: '15px',
              lineHeight: '1.5',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              minHeight: '24px',
              maxHeight: '120px',
            }}
          />
          <button
            onClick={onSend}
            disabled={!hasText}
            className="shrink-0 flex items-center justify-center disabled:cursor-not-allowed"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: 'none',
              background: hasText ? 'var(--interactive-accent)' : 'var(--bg-secondary)',
              color: hasText ? 'var(--background)' : 'var(--text-quaternary)',
              cursor: hasText ? 'pointer' : 'default',
              transition: 'background 0.15s, color 0.15s, transform 0.1s',
            }}
            onMouseEnter={(e) => {
              if (hasText) {
                e.currentTarget.style.background = 'var(--interactive-accent-hover)'
                e.currentTarget.style.transform = 'scale(1.04)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = hasText ? 'var(--interactive-accent)' : 'var(--bg-secondary)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            title="Send message"
          >
            <ArrowUp size={18} strokeWidth={2} />
          </button>
        </div>
        <p
          className="text-center"
          style={{
            marginTop: '12px',
            fontSize: '11px',
            color: 'var(--text-quaternary)',
          }}
        >
          Q is an AI assistant. Verify important guideline details with your TQL Account Executive.
        </p>
      </div>
    </div>
  )
}
