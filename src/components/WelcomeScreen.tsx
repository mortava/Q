import { Building2, FileText, DollarSign, Clock } from 'lucide-react'

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void
}

const suggestions = [
  {
    icon: Building2,
    title: 'DSCR Programs',
    prompt: 'What DSCR loan programs does TQL offer? What property types are eligible?',
  },
  {
    icon: FileText,
    title: 'Foreign National',
    prompt: 'What are the requirements for TQL Foreign National loans?',
  },
  {
    icon: DollarSign,
    title: 'Bank Statement',
    prompt: 'How does TQL\'s bank statement loan program work? What documentation is needed?',
  },
  {
    icon: Clock,
    title: 'Closing Timeline',
    prompt: 'What is TQL\'s typical closing timeline and what makes the process efficient?',
  },
]

export default function WelcomeScreen({ onPromptClick }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="text-center mb-10">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-4xl font-bold mx-auto mb-5 shadow-lg"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Q
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          How can I help you today?
        </h1>
        <p className="text-slate-500 text-lg">
          I'm Q, your TQL Account Executive AI. Ask me about loan products, guidelines, and scenarios.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {suggestions.map((s) => (
          <button
            key={s.title}
            onClick={() => onPromptClick(s.prompt)}
            className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 hover:border-[var(--accent)] hover:bg-slate-50 text-left transition-all group"
          >
            <s.icon
              size={20}
              className="text-slate-400 group-hover:text-[var(--accent)] mt-0.5 shrink-0 transition-colors"
            />
            <div>
              <div className="font-medium text-slate-700 text-sm">{s.title}</div>
              <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{s.prompt}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
