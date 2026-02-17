import { useState, useEffect, useRef, useCallback } from 'react'
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

  // Load conversations on mount
  useEffect(() => {
    const loaded = loadConversations()
    setConversations(loaded)
  }, [])

  // Save conversations on change
  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations)
    }
  }, [conversations])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages])

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const updateConversation = useCallback(
    (id: string, updater: (c: Conversation) => Conversation) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? updater(c) : c))
      )
    },
    []
  )

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

    // Create new conversation if none active
    if (!convoId) {
      const newConvo = createConversation()
      newConvo.title = generateTitle(text)
      currentConversations = [newConvo, ...conversations]
      setConversations(currentConversations)
      convoId = newConvo.id
      setActiveId(convoId)
    }

    // Add user message
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

    // Get all messages for context (including the new user message)
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
              msgs[msgs.length - 1] = {
                ...lastMsg,
                content: errorContent,
              }
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
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat}
        onSelectConversation={setActiveId}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <div className="h-14 flex items-center px-6 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Q
            </div>
            <span className="font-semibold text-slate-800 text-sm">
              {activeConversation?.title || 'Q'}
            </span>
          </div>
          <div className="ml-auto text-xs text-slate-400">
            llama-3.3-70b
          </div>
        </div>

        {/* Messages or Welcome */}
        {!activeConversation || activeConversation.messages.length === 0 ? (
          <WelcomeScreen onPromptClick={handlePromptClick} />
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-6">
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

        {/* Input */}
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
