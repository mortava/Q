import { Plus, MessageSquare, Trash2, PanelLeftClose, PanelLeft } from 'lucide-react'
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
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Group by date
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
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 shadow-sm transition-colors"
        title="Open sidebar"
      >
        <PanelLeft size={20} />
      </button>
    )
  }

  return (
    <div
      className="w-[280px] h-full flex flex-col shrink-0 text-slate-300"
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Q
          </div>
          <span className="font-semibold text-white text-sm">TQL Account Executive</span>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          title="Close sidebar"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 py-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-600 hover:bg-slate-700 text-sm text-slate-300 hover:text-white transition-colors"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {Object.entries(grouped).map(([dateLabel, convos]) => (
          <div key={dateLabel} className="mb-4">
            <div className="text-xs text-slate-500 font-medium px-2 mb-1.5 uppercase tracking-wider">
              {dateLabel}
            </div>
            {convos.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                  c.id === activeId
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
                onClick={() => onSelectConversation(c.id)}
              >
                <MessageSquare size={14} className="shrink-0" />
                <span className="flex-1 truncate">{c.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteConversation(c.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-600 text-slate-500 hover:text-red-400 transition-all"
                  title="Delete conversation"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700">
        <div className="text-xs text-slate-500">
          Powered by{' '}
          <span className="text-slate-400">Total Quality Lending</span>
        </div>
        <div className="text-xs text-slate-600 mt-0.5">NMLS #1933377</div>
      </div>
    </div>
  )
}
