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
      wrapperRef.current.style.borderColor = 'var(--tql-blue)'
      wrapperRef.current.style.boxShadow = 'var(--shadow-input-focus)'
    }
  }

  const handleBlur = (e: React.FocusEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(e.relatedTarget as Node)) {
      wrapperRef.current.style.borderColor = 'var(--border)'
      wrapperRef.current.style.boxShadow = 'var(--shadow-input)'
    }
  }

  return (
    <div
      className="shrink-0 relative input-fade"
      style={{
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-light)',
        padding: '16px 24px 20px',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div
          ref={wrapperRef}
          className="flex items-end"
          style={{
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-xl)',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-input)',
            padding: '10px 14px 10px 20px',
            gap: '8px',
            transition: 'border-color var(--duration-fast), box-shadow var(--duration-fast)',
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
              fontSize: '14.5px',
              lineHeight: '1.5',
              color: 'var(--text-primary)',
              letterSpacing: '-0.006em',
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
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-full)',
                background: '#ef4444',
                transition: 'background var(--duration-base) var(--ease-out), transform var(--duration-fast)',
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
              <Square size={14} className="text-white" fill="white" />
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={!hasText || disabled}
              className="shrink-0 flex items-center justify-center disabled:cursor-not-allowed"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-full)',
                background: hasText ? 'var(--tql-blue)' : 'var(--bg-secondary)',
                color: hasText ? 'var(--text-on-blue)' : 'var(--text-quaternary)',
                cursor: hasText ? 'pointer' : 'default',
                transition: 'background var(--duration-base) var(--ease-out), color var(--duration-base), transform var(--duration-fast)',
              }}
              onMouseEnter={(e) => {
                if (hasText) {
                  e.currentTarget.style.background = 'var(--tql-blue-hover)'
                  e.currentTarget.style.transform = 'scale(1.04)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = hasText ? 'var(--tql-blue)' : 'var(--bg-secondary)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
              title="Send message"
            >
              <ArrowUp size={16} strokeWidth={2} />
            </button>
          )}
        </div>
        <p
          className="text-center"
          style={{
            marginTop: '10px',
            fontSize: '11px',
            color: 'var(--text-quaternary)',
            letterSpacing: '0.005em',
          }}
        >
          Q is an AI assistant. Verify important guideline details with your TQL Account Executive.
        </p>
      </div>
    </div>
  )
}
