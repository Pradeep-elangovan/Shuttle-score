import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, User, Users } from 'lucide-react'

interface ModeOption {
  id: 'singles' | 'doubles'
  name: string
  description: string
  icon: React.ReactNode
  players: string
}

const modes: ModeOption[] = [
  {
    id: 'singles',
    name: 'Singles',
    description: '1 vs 1',
    icon: <User className="w-8 h-8" />,
    players: '2 players',
  },
  {
    id: 'doubles',
    name: 'Doubles',
    description: '2 vs 2',
    icon: <Users className="w-8 h-8" />,
    players: '4 players',
  },
]

export default function GameModePage() {
  const navigate = useNavigate()
  const { gameId } = useParams()

  const handleModeSelect = (mode: string) => {
    navigate(`/game/${gameId}/players`, { state: { mode } })
  }

  return (
    <div className="h-full flex flex-col page-enter">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center tap-scale hover:bg-surface-light transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold capitalize">{gameId}</h1>
          <p className="text-xs text-slate-400">Choose your match type</p>
        </div>
      </header>

      {/* Mode cards */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-12 gap-5">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleModeSelect(mode.id)}
            className="w-full max-w-sm bg-surface hover:bg-surface-light border border-transparent hover:border-primary/30 
                       rounded-3xl p-8 flex flex-col items-center gap-4 transition-all tap-scale cursor-pointer group"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/15 flex items-center justify-center text-primary-light group-hover:bg-primary/25 transition-colors">
              {mode.icon}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">{mode.name}</h2>
              <p className="text-slate-400 mt-1">{mode.description}</p>
            </div>
            <span className="text-xs bg-slate-700/60 text-slate-400 px-3 py-1.5 rounded-full">
              {mode.players}
            </span>
          </button>
        ))}
      </main>
    </div>
  )
}
