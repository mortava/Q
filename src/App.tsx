import { useState, useEffect, useRef } from 'react'
import { Menu, Sun, Monitor, Moon } from 'lucide-react'
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

type Theme = 'light' | 'system' | 'dark'

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('q-theme')
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'light') {
    root.setAttribute('data-theme', 'light')
  } else if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark')
  } else {
    root.removeAttribute('data-theme')
  }
}

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  const abortRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const streamContentRef = useRef('')

  const activeConversation = conversations.find((c) => c.id === activeId) || null

  // Theme management
  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem('q-theme', theme)
  }, [theme])

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
    <div className="h-full flex" style={{ background: 'var(--background)' }}>
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
        {/* Header */}
        <div
          className="flex items-center shrink-0"
          style={{
            height: '52px',
            padding: '0 20px',
            background: 'var(--background)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* Sidebar toggle */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center justify-center cursor-pointer mr-3"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                background: 'transparent',
                border: 'none',
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

          {/* Q text + title */}
          <div className="flex items-center gap-2.5">
            <span
              style={{
                fontFamily: 'var(--font-poppins)',
                fontSize: '22px',
                fontWeight: 600,
                color: 'var(--foreground)',
              }}
            >
              Q
            </span>
            {activeConversation?.title && activeConversation.title !== 'New Chat' && (
              <span
                className="truncate"
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  maxWidth: '300px',
                }}
              >
                {activeConversation.title}
              </span>
            )}
          </div>

          {/* Model badge */}
          <div className="ml-auto mr-28">
            <div
              className="flex items-center gap-1.5 cursor-default"
              style={{
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-full)',
                padding: '4px 12px',
              }}
            >
              C1 Generative UI
            </div>
          </div>
        </div>

        {/* Theme Switcher — fixed top-right */}
        <div className="theme-switcher">
          <button
            className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
            title="Light mode"
          >
            <Sun size={16} />
          </button>
          <button
            className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
            onClick={() => setTheme('system')}
            title="System preference"
          >
            <Monitor size={16} />
          </button>
          <button
            className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
            title="Dark mode"
          >
            <Moon size={16} />
          </button>
        </div>

        {/* Chat Area */}
        {!activeConversation || activeConversation.messages.length === 0 ? (
          <WelcomeScreen
            onPromptClick={handlePromptClick}
            inputValue={input}
            onInputChange={setInput}
            onSend={() => handleSend()}
          />
        ) : (
          <>
            <div
              className="flex-1 overflow-y-auto chat-scroll"
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

            <ChatInput
              value={input}
              onChange={setInput}
              onSend={() => handleSend()}
              onStop={handleStop}
              isStreaming={isStreaming}
              disabled={false}
            />
          </>
        )}
      </div>
    </div>
  )
}
