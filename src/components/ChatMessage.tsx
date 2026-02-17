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
      <div className="flex justify-end mb-6">
        <div
          className="max-w-[75%] rounded-2xl rounded-br-md px-5 py-3 text-white text-[15px] leading-relaxed"
          style={{ backgroundColor: 'var(--user-bubble)' }}
        >
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 mb-6 group">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-1"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        Q
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] text-slate-800">
          <MarkdownRenderer content={message.content} isStreaming={isStreaming} />
        </div>
        {!isStreaming && message.content && (
          <button
            onClick={handleCopy}
            className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-600 p-1 rounded"
            title="Copy message"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  )
}
