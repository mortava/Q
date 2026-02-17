import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { Message } from '../lib/store'
import MarkdownRenderer from './MarkdownRenderer'

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
}

export default function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isUser) {
    return (
      <div className="flex justify-end mb-6 message-animate">
        <div
          className="max-w-[75%] rounded-2xl rounded-br-[var(--radius-sm)] px-5 py-3 text-white text-[15px] leading-relaxed"
          style={{
            backgroundColor: 'var(--user-bubble)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {message.content}
        </div>
      </div>
    )
  }

  // Thinking/loading state — empty assistant message while streaming
  if (isStreaming && !message.content) {
    return (
      <div className="flex gap-3 mb-6 message-animate">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-1 ring-2 ring-white avatar-thinking"
          style={{ background: 'linear-gradient(135deg, #007BE0, #0062B3)' }}
        >
          Q
        </div>
        <div
          className="rounded-2xl rounded-tl-[var(--radius-sm)] px-5 py-4"
          style={{
            background: 'var(--bg-bot-message)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div className="flex items-center gap-1.5 h-5">
            <div
              className="w-2 h-2 rounded-full thinking-dot"
              style={{ background: 'var(--tql-blue)' }}
            />
            <div
              className="w-2 h-2 rounded-full thinking-dot"
              style={{ background: 'var(--tql-blue)' }}
            />
            <div
              className="w-2 h-2 rounded-full thinking-dot"
              style={{ background: 'var(--tql-blue)' }}
            />
          </div>
          <div
            className="text-xs italic mt-1.5"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Q is thinking...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 mb-6 group message-animate">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-1 ring-2 ring-white"
        style={{ background: 'linear-gradient(135deg, #007BE0, #0062B3)' }}
      >
        Q
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="rounded-2xl rounded-tl-[var(--radius-sm)] px-5 py-4 relative"
          style={{
            background: 'var(--bg-bot-message)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: '2px solid var(--tql-blue)',
          }}
        >
          <div className="text-[15px]" style={{ color: 'var(--text-primary)' }}>
            <MarkdownRenderer content={message.content} isStreaming={isStreaming} />
          </div>
        </div>
        {!isStreaming && message.content && (
          <div className="flex justify-end mt-1.5">
            <button
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg cursor-pointer relative"
              style={{
                color: 'var(--text-tertiary)',
                transition: 'var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)'
                e.currentTarget.style.background = 'var(--bg-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)'
                e.currentTarget.style.background = 'transparent'
              }}
              title="Copy message"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
