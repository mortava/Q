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
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  const hasText = value.trim().length > 0

  return (
    <div
      className="shrink-0 p-4"
      style={{
        background: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-light)',
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div
          className="flex items-end gap-2 px-4 py-3"
          style={{
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border)',
            transition: 'var(--transition-fast)',
            boxShadow: 'var(--shadow-sm)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--tql-blue)'
            e.currentTarget.style.boxShadow = '0 0 0 2px var(--tql-blue-ring)'
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
            }
          }}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value)
              adjustHeight()
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask Q about TQL loan products..."
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-[15px] leading-relaxed min-h-[24px] max-h-[200px]"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-sans)',
            }}
          />
          {isStreaming ? (
            <button
              onClick={onStop}
              className="shrink-0 w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center cursor-pointer"
              style={{ transition: 'var(--transition-fast)' }}
              title="Stop generating"
            >
              <Square size={14} className="text-white" fill="white" />
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={!hasText || disabled}
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: hasText ? 'var(--tql-blue)' : 'var(--bg-secondary)',
                color: hasText ? 'var(--text-on-blue)' : 'var(--text-tertiary)',
                transition: 'var(--transition-fast)',
              }}
              title="Send message"
            >
              <ArrowUp size={18} />
            </button>
          )}
        </div>
        <p
          className="text-xs text-center mt-2"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Q is an AI assistant. Verify important guideline details with your TQL Account Executive.
        </p>
      </div>
    </div>
  )
}
