import { ArrowUp, Square } from 'lucide-react'
import { useRef, useEffect, type KeyboardEvent } from 'react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onStop: () => void
  isStreaming: boolean
  disabled: boolean
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  isStreaming,
  disabled,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isStreaming && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isStreaming])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isStreaming) return
      if (value.trim()) onSend()
    }
  }

  const adjustHeight = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 180) + 'px'
  }

  const hasText = value.trim().length > 0

  const handleFocus = () => {
    if (wrapperRef.current) {
      wrapperRef.current.style.boxShadow = 'var(--shadow-input-focus)'
    }
  }

  const handleBlur = (e: React.FocusEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.relatedTarget as Node)) {
      wrapperRef.current.style.boxShadow = 'var(--shadow-input)'
    }
  }

  return (
    <div
      className="shrink-0 relative"
      style={{
        background: 'var(--background)',
        borderTop: '1px solid var(--border)',
        padding: '16px 24px 20px',
      }}
    >
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div
          ref={wrapperRef}
          className="flex items-end"
          style={{
            background: 'var(--bg-input)',
            borderRadius: '16px',
            border: 'none',
            boxShadow: 'var(--shadow-input)',
            padding: '10px 14px 10px 20px',
            gap: '8px',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              adjustHeight()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask Q anything about TQL loan products..."
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none"
            style={{
              fontSize: '15px',
              lineHeight: '1.5',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
              minHeight: '24px',
              maxHeight: '180px',
            }}
          />
          {isStreaming ? (
            <button
              onClick={onStop}
              className="shrink-0 flex items-center justify-center cursor-pointer"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#ef4444',
                border: 'none',
                color: 'white',
                transition: 'background 0.15s, transform 0.1s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#dc2626'
                e.currentTarget.style.transform = 'scale(1.04)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ef4444'
                e.currentTarget.style.transform = 'scale(1)'
              }}
              title="Stop generating"
            >
              <Square size={14} fill="white" />
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={!hasText || disabled}
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
          )}
        </div>
        <p
          className="text-center"
          style={{
            marginTop: '10px',
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
