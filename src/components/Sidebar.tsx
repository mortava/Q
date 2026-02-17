import { Plus, MessageSquare, Trash2, ChevronLeft, Settings } from 'lucide-react'
import { useEffect } from 'react'
import type { Conversation } from '../lib/store'

interface SidebarProps {
  conversations: Conversation[]
  activeId: string | null
  isOpen: boolean
  onToggle: () => void
  onNewChat: () => void
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
}

export default function Sidebar({
  conversations,
  activeId,
  isOpen,
  onToggle,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
}: SidebarProps) {
  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onToggle])

  const formatDate = (ts: number) => {
    const d = new Date(ts)
    const now = new Date()
    if (d.toDateString() === now.toDateString()) return 'Today'
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 7)
    if (d >= weekAgo) return 'Previous 7 Days'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const grouped: Record<string, Conversation[]> = {}
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)
  for (const c of sorted) {
    const label = formatDate(c.updatedAt)
    if (!grouped[label]) grouped[label] = []
    grouped[label].push(c)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-40 md:hidden"
        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
        onClick={onToggle}
      />

      <div
        className="w-[280px] h-full flex flex-col shrink-0 z-50 fixed md:relative"
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          willChange: 'transform',
        }}
      >
        {/* Logo Area */}
        <div
          className="flex items-center justify-between"
          style={{
            height: '60px',
            padding: '16px 16px 12px 16px',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center text-white font-bold"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0071E3 0%, #4682B4 100%)',
                fontSize: '13px',
              }}
            >
              Q
            </div>
            <span
              className="text-white"
              style={{
                fontSize: '16px',
                fontWeight: 600,
                letterSpacing: '-0.02em',
              }}
            >
              Q Agent
            </span>
          </div>
          <button
            onClick={onToggle}
            className="flex items-center justify-center cursor-pointer"
            style={{
              width: '20px',
              height: '20px',
              borderRadius: 'var(--radius-xs)',
              color: 'var(--sidebar-text)',
              transition: 'background var(--duration-fast) var(--ease-in-out), color var(--duration-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--sidebar-hover)'
              e.currentTarget.style.color = 'var(--sidebar-text-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--sidebar-text)'
            }}
            title="Close sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* New Chat Button */}
        <div style={{ padding: '0 16px', marginBottom: '16px' }}>
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-center cursor-pointer"
            style={{
              height: '40px',
              background: 'transparent',
              border: '1px solid var(--sidebar-divider)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--sidebar-text-hover)',
              fontSize: '13px',
              fontWeight: 500,
              gap: '8px',
              transition: 'background var(--duration-fast) var(--ease-in-out), border-color var(--duration-fast), color var(--duration-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--sidebar-hover)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'var(--sidebar-divider)'
              e.currentTarget.style.color = 'var(--sidebar-text-hover)'
            }}
          >
            <Plus size={14} />
            New Chat
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            background: 'var(--sidebar-divider)',
            margin: '0 16px 12px 16px',
          }}
        />

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto chat-scroll">
          {Object.entries(grouped).map(([dateLabel, convos]) => (
            <div key={dateLabel}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--sidebar-text)',
                  padding: '8px 16px 6px 16px',
                }}
              >
                {dateLabel}
              </div>
              {convos.map((c) => {
                const isActive = c.id === activeId
                return (
                  <div
                    key={c.id}
                    className="group flex items-center cursor-pointer"
                    style={{
                      padding: '7px 12px',
                      margin: '1px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px',
                      color: isActive ? 'white' : 'var(--sidebar-text-hover)',
                      background: isActive ? 'var(--sidebar-active)' : 'transparent',
                      borderLeft: isActive ? '2px solid var(--sidebar-active-border)' : '2px solid transparent',
                      transition: 'background var(--duration-fast) var(--ease-in-out), color var(--duration-fast)',
                    }}
                    onClick={() => onSelectConversation(c.id)}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--sidebar-hover)'
                        e.currentTarget.style.color = 'white'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--sidebar-text-hover)'
                      }
                    }}
                  >
                    <MessageSquare
                      size={14}
                      className="shrink-0"
                      style={{ color: 'var(--sidebar-text)', marginRight: '8px' }}
                    />
                    <span className="flex-1 truncate">{c.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteConversation(c.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer"
                      style={{
                        padding: '4px',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--sidebar-text)',
                        transition: 'opacity var(--duration-fast), color var(--duration-fast)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#f87171'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--sidebar-text)'
                      }}
                      title="Delete conversation"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div
          style={{
            borderTop: '1px solid var(--sidebar-divider)',
          }}
        >
          <div style={{ padding: '12px 16px' }}>
            <div
              style={{
                fontSize: '11px',
                color: 'var(--sidebar-text)',
                letterSpacing: '0.01em',
              }}
            >
              Powered by Total Quality Lending
            </div>
            <div
              style={{
                fontSize: '10px',
                color: 'var(--sidebar-text)',
                opacity: 0.6,
                marginTop: '2px',
              }}
            >
              NMLS #1933377
            </div>
          </div>
          <button
            className="flex items-center justify-center cursor-pointer"
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '16px',
              padding: '8px',
              color: 'var(--sidebar-text)',
              transition: 'color var(--duration-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--sidebar-text)'
            }}
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>
    </>
  )
}
