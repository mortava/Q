import { useState, useEffect, useRef, useCallback } from 'react'
import { Menu, Zap } from 'lucide-react'
import Sidebar from './components/Sidebar'
import WelcomeScreen from './components/WelcomeScreen'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import {
  type Conversation,
  loadConversations,
  saveConversations,
  createConversation,
  createMessage,
  generateTitle,
} from './lib/store'
import { streamChat } from './lib/api'

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const abortRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const streamContentRef = useRef('')

  const activeConversation = conversations.find((c) => c.id === activeId) || null

  useEffect(() => {
    const loaded = loadConversations()
    setConversations(loaded)
  }, [])

  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations)
    }
  }, [conversations])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false)
      else setSidebarOpen(true)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleNewChat = () => {
    const newConvo = createConversation()
    setConversations((prev) => [newConvo, ...prev])
    setActiveId(newConvo.id)
    setInput('')
  }

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText || input).trim()
    if (!text || isStreaming) return

    let convoId = activeId
    let currentConversations = conversations

    if (!convoId) {
      const newConvo = createConversation()
      newConvo.title = generateTitle(text)
      currentConversations = [newConvo, ...conversations]
      setConversations(currentConversations)
      convoId = newConvo.id
      setActiveId(convoId)
    }

    const userMsg = createMessage('user', text)
    const assistantMsg = createMessage('assistant', '')

    const targetId = convoId
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== targetId) return c
        const updated = {
          ...c,
          messages: [...c.messages, userMsg, assistantMsg],
          updatedAt: Date.now(),
        }
        if (c.messages.length === 0) {
          updated.title = generateTitle(text)
        }
        return updated
      })
    )

    setInput('')
    setIsStreaming(true)
    streamContentRef.current = ''

    const abort = new AbortController()
    abortRef.current = abort

    const convo = currentConversations.find((c) => c.id === targetId)
    const allMessages = [...(convo?.messages || []), userMsg]

    await streamChat(
      allMessages,
      (chunk) => {
        streamContentRef.current += chunk
        const content = streamContentRef.current
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== targetId) return c
            const msgs = [...c.messages]
            const lastMsg = msgs[msgs.length - 1]
            if (lastMsg && lastMsg.role === 'assistant') {
              msgs[msgs.length - 1] = { ...lastMsg, content }
            }
            return { ...c, messages: msgs, updatedAt: Date.now() }
          })
        )
      },
      () => {
        setIsStreaming(false)
        abortRef.current = null
      },
      (error) => {
        console.error('Stream error:', error)
        const errorContent =
          streamContentRef.current ||
          'Sorry, I encountered an error. Please try again or contact TQL at (800) 304-1925.'
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== targetId) return c
            const msgs = [...c.messages]
            const lastMsg = msgs[msgs.length - 1]
            if (lastMsg && lastMsg.role === 'assistant') {
              msgs[msgs.length - 1] = { ...lastMsg, content: errorContent }
            }
            return { ...c, messages: msgs }
          })
        )
        setIsStreaming(false)
        abortRef.current = null
      },
      abort.signal
    )
  }

  const handleStop = () => {
    abortRef.current?.abort()
    setIsStreaming(false)
    abortRef.current = null
  }

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (activeId === id) setActiveId(null)
  }

  const handlePromptClick = (prompt: string) => {
    handleSend(prompt)
  }

  return (
    <div className="h-full flex">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
        onSelectConversation={setActiveId}
        onDeleteConversation={handleDeleteConversation}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header Bar — frosted glass */}
        <div
          className="flex items-center shrink-0"
          style={{
            height: '52px',
            padding: '0 20px',
            background: 'rgba(250, 250, 250, 0.82)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          {/* Sidebar toggle (visible when sidebar is closed) */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center cursor-pointer mr-3"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
              title="Open sidebar"
            >
              <Menu size={18} />
            </button>
          )}

          {/* Q avatar + title */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center text-white font-bold"
              style={{
                width: '28px',
                height: '28px',
                fontSize: '11px',
                background: 'linear-gradient(135deg, #0071E3 0%, #4682B4 100%)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.04)',
              }}
            >
              Q
            </div>
            <span
              className="truncate"
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
                maxWidth: '300px',
              }}
            >
              {activeConversation?.title || 'Q'}
            </span>
          </div>

          {/* Model badge */}
          <div className="ml-auto">
            <div
              className="flex items-center gap-1.5 cursor-default"
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                padding: '3px 10px 3px 8px',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-strong)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-tertiary)'
              }}
            >
              <Zap size={12} style={{ color: 'var(--tql-gold)' }} />
              <span>Groq Llama 3.3 70B</span>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        {!activeConversation || activeConversation.messages.length === 0 ? (
          <div
            className="flex-1 flex flex-col"
            style={{ background: 'var(--bg-chat)' }}
          >
            <WelcomeScreen onPromptClick={handlePromptClick} />
          </div>
        ) : (
          <div
            className="flex-1 overflow-y-auto chat-scroll chat-fade-top"
            style={{
              background: 'var(--bg-chat)',
              scrollBehavior: 'smooth',
            }}
          >
            <div
              className="mx-auto"
              style={{ maxWidth: '720px', padding: '32px 24px 24px' }}
            >
              {activeConversation.messages.map((msg, i) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isStreaming={
                    isStreaming &&
                    i === activeConversation.messages.length - 1 &&
                    msg.role === 'assistant'
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <ChatInput
          value={input}
          onChange={setInput}
          onSend={() => handleSend()}
          onStop={handleStop}
          isStreaming={isStreaming}
          disabled={false}
        />
      </div>
    </div>
  )
}
