import { Plus, MessageSquare, Trash2, PanelLeftClose, Menu, Settings } from 'lucide-react'
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

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-[var(--radius-sm)] cursor-pointer"
        style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-light)',
          color: 'var(--text-secondary)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'var(--transition-fast)',
        }}
        title="Open sidebar"
      >
        <Menu size={20} />
      </button>
    )
  }

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
        onClick={onToggle}
      />

      <div
        className="w-[280px] h-full flex flex-col shrink-0 z-50 fixed md:relative"
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          transition: 'width var(--transition-slow)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 flex items-center justify-center text-white font-bold text-base"
              style={{
                background: 'linear-gradient(135deg, #007BE0, #0062B3)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              Q
            </div>
            <span className="font-semibold text-white text-base">Q Agent</span>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg cursor-pointer"
            style={{
              color: 'var(--sidebar-text)',
              transition: 'var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--sidebar-hover)'
              e.currentTarget.style.color = 'var(--sidebar-text-active)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--sidebar-text)'
            }}
            title="Close sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* New Chat */}
        <div className="px-3 py-3">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-3 h-11 rounded-lg text-sm text-white cursor-pointer"
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--sidebar-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          {Object.entries(grouped).map(([dateLabel, convos]) => (
            <div key={dateLabel} className="mb-4">
              <div
                className="text-[11px] font-semibold px-2 mb-2 uppercase tracking-wider"
                style={{ color: 'var(--sidebar-text)' }}
              >
                {dateLabel}
              </div>
              {convos.map((c) => {
                const isActive = c.id === activeId
                return (
                  <div
                    key={c.id}
                    className="group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-sm"
                    style={{
                      background: isActive ? 'var(--sidebar-active)' : 'transparent',
                      color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                      borderLeft: isActive ? '2px solid var(--tql-blue)' : '2px solid transparent',
                      transition: 'var(--transition-fast)',
                    }}
                    onClick={() => onSelectConversation(c.id)}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--sidebar-hover)'
                        e.currentTarget.style.color = 'var(--sidebar-text-active)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--sidebar-text)'
                      }
                    }}
                  >
                    <MessageSquare size={14} className="shrink-0 opacity-60" />
                    <span className="flex-1 truncate">{c.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteConversation(c.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded cursor-pointer"
                      style={{ transition: 'var(--transition-fast)' }}
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

        {/* Footer */}
        <div
          className="px-4 py-3 flex items-center justify-between"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <div className="text-[11px]" style={{ color: 'var(--sidebar-text)' }}>
              Powered by{' '}
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Total Quality Lending</span>
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
              NMLS #1933377
            </div>
          </div>
          <button
            className="p-1.5 rounded-lg cursor-pointer"
            style={{ color: 'var(--sidebar-text)', transition: 'var(--transition-fast)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--sidebar-text-active)'
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
