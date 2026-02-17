import { Copy, Check } from 'lucide-react'
import { useState, lazy, Suspense } from 'react'
import type { Message } from '../lib/store'
import MarkdownRenderer from './MarkdownRenderer'

// Lazy-load C1Component so it doesn't crash the whole app if it fails
const C1Component = lazy(() =>
  import('@thesysai/genui-sdk').then((mod) => ({ default: mod.C1Component }))
)

interface ChatMessageProps {
  message: Message
  isStreaming?: boolean
}

function C1Wrapper({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  return (
    <div className="c1-response-wrapper">
      <Suspense fallback={<MarkdownRenderer content={content} isStreaming={isStreaming} />}>
        <C1Component c1Response={content} isStreaming={isStreaming} />
      </Suspense>
    </div>
  )
}

export default function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [useMarkdown, setUseMarkdown] = useState(false)
  const isUser = message.role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isUser) {
    return (
      <div className="flex justify-end message-enter" style={{ marginBottom: '20px' }}>
        <div
          style={{
            maxWidth: '72%',
            background: 'var(--chat-user-bg)',
            color: 'var(--chat-user-text)',
            borderRadius: '18px 18px 4px 18px',
            padding: '12px 16px',
            fontSize: '15px',
            lineHeight: '1.55',
            fontWeight: 400,
          }}
        >
          {message.content}
        </div>
      </div>
    )
  }

  // Thinking/loading state
  if (isStreaming && !message.content) {
    return (
      <div className="flex items-start message-enter" style={{ gap: '12px', marginBottom: '24px' }}>
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: '36px', height: '36px' }}
        >
          <span
            style={{
              fontFamily: 'var(--font-poppins)',
              fontSize: '24px',
              fontWeight: 600,
              color: 'var(--foreground)',
            }}
          >
            Q
          </span>
        </div>
        <div style={{ padding: '8px 0' }}>
          <div className="flex items-center gap-1 h-5">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            Q is thinking...
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    if (useMarkdown) {
      return <MarkdownRenderer content={message.content} isStreaming={isStreaming} />
    }
    try {
      return <C1Wrapper content={message.content} isStreaming={isStreaming ?? false} />
    } catch {
      setUseMarkdown(true)
      return <MarkdownRenderer content={message.content} isStreaming={isStreaming} />
    }
  }

  return (
    <div
      className="flex items-start message-enter"
      style={{ gap: '12px', marginBottom: '24px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex items-center justify-center shrink-0"
        style={{ width: '36px', height: '36px' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-poppins)',
            fontSize: '24px',
            fontWeight: 600,
            color: 'var(--foreground)',
          }}
        >
          Q
        </span>
      </div>

      <div className="flex-1 min-w-0 relative" style={{ maxWidth: 'calc(100% - 48px)' }}>
        <div style={{ padding: '4px 0' }}>
          {renderContent()}
        </div>

        {!isStreaming && message.content && (
          <button
            onClick={handleCopy}
            className="flex items-center justify-center cursor-pointer"
            style={{
              position: 'absolute',
              top: '4px',
              right: '0px',
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              border: 'none',
              color: copied ? '#22c55e' : 'var(--text-quaternary)',
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.15s, background 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)'
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
  )
}
