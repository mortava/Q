import { Send, Square } from 'lucide-react'
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

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      <div className="max-w-3xl mx-auto relative">
        <div className="flex items-end gap-2 bg-slate-50 rounded-2xl border border-slate-200 px-4 py-3 focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)] transition-all">
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
            className="flex-1 bg-transparent outline-none resize-none text-[15px] text-slate-800 placeholder-slate-400 max-h-[200px] leading-relaxed"
          />
          {isStreaming ? (
            <button
              onClick={onStop}
              className="shrink-0 w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
              title="Stop generating"
            >
              <Square size={14} className="text-white" fill="white" />
            </button>
          ) : (
            <button
              onClick={onSend}
              disabled={!value.trim() || disabled}
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: value.trim() ? 'var(--accent)' : '#94a3b8',
              }}
              title="Send message"
            >
              <Send size={16} className="text-white" />
            </button>
          )}
        </div>
        <p className="text-xs text-slate-400 text-center mt-2">
          Q is an AI assistant. Verify important guideline details with your TQL Account Executive.
        </p>
      </div>
    </div>
  )
}
