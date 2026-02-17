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
  const [hovered, setHovered] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isUser) {
    return (
      <div className="flex justify-end message-enter" style={{ marginBottom: '24px' }}>
        <div
          className="text-white"
          style={{
            maxWidth: '72%',
            background: 'var(--user-bubble)',
            borderRadius: '20px 20px 6px 20px',
            padding: '12px 18px',
            fontSize: '14.5px',
            lineHeight: '1.55',
            fontWeight: 400,
            boxShadow: '0 1px 3px rgba(0, 113, 227, 0.15), 0 1px 2px rgba(0, 113, 227, 0.1)',
            transition: 'transform var(--duration-fast), box-shadow var(--duration-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-0.5px)'
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 113, 227, 0.2), 0 1px 3px rgba(0, 113, 227, 0.12)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 113, 227, 0.15), 0 1px 2px rgba(0, 113, 227, 0.1)'
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
      <div className="flex items-start message-enter" style={{ gap: '14px', marginBottom: '28px' }}>
        <div
          className="flex items-center justify-center text-white font-bold shrink-0 avatar-thinking"
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.04), var(--shadow-sm)',
          }}
        >
          Q
        </div>
        <div
          style={{
            background: 'var(--bg-bot-message)',
            borderRadius: '4px 18px 18px 18px',
            padding: '18px 22px',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center gap-1 h-5">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
          <div
            className="italic"
            style={{
              fontSize: '11px',
              color: 'var(--text-quaternary)',
              marginTop: '6px',
            }}
          >
            Q is thinking...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex items-start message-enter"
      style={{ gap: '14px', marginBottom: '28px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Avatar */}
      <div
        className="flex items-center justify-center text-white font-bold shrink-0"
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #0071E3 0%, #005BB5 100%)',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          boxShadow: '0 0 0 1px rgba(0,0,0,0.04), var(--shadow-sm)',
        }}
      >
        Q
      </div>

      {/* Message Card */}
      <div className="flex-1 min-w-0" style={{ maxWidth: 'calc(100% - 44px)' }}>
        <div
          className="relative"
          style={{
            background: 'var(--bg-bot-message)',
            borderRadius: '4px 18px 18px 18px',
            padding: '18px 22px',
            border: '1px solid var(--border-light)',
            boxShadow: hovered ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
            transition: `box-shadow var(--duration-slow) var(--ease-out)`,
          }}
        >
          <MarkdownRenderer content={message.content} isStreaming={isStreaming} />

          {/* Copy button */}
          {!isStreaming && message.content && (
            <button
              onClick={handleCopy}
              className="flex items-center justify-center cursor-pointer"
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                color: copied ? '#22c55e' : 'var(--text-quaternary)',
                opacity: hovered ? 1 : 0,
                transition: `opacity var(--duration-base), background var(--duration-fast), color var(--duration-fast)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)'
                if (!copied) e.currentTarget.style.color = 'var(--text-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                if (!copied) e.currentTarget.style.color = 'var(--text-quaternary)'
              }}
              title="Copy message"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
