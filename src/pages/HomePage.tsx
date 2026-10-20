import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import ShuttlecockIcon from '../components/icons/ShuttlecockIcon'

interface GameOption {
  id: string
  name: string
  icon: React.ReactNode
  available: boolean
  description: string
}

const games: GameOption[] = [
  {
    id: 'badminton',
    name: 'Badminton',
    icon: <ShuttlecockIcon className="w-10 h-10" />,
    available: true,
    description: 'Singles & Doubles',
  },
  {
    id: 'table-tennis',
    name: 'Table Tennis',
    icon: <span className="text-3xl">🏓</span>,
    available: false,
    description: 'Coming soon',
  },
  {
    id: 'tennis',
    name: 'Tennis',
    icon: <span className="text-3xl">🎾</span>,
    available: false,
    description: 'Coming soon',
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    icon: <span className="text-3xl">🏐</span>,
    available: false,
    description: 'Coming soon',
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="h-full flex flex-col page-enter">
      {/* Header */}
      <header className="pt-12 pb-6 px-6 text-center">
        <div className="shuttle-float inline-block mb-4">
          <ShuttlecockIcon className="w-16 h-16 text-accent" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Shuttle<span className="text-primary-light">Score</span>
        </h1>
        <p className="text-slate-400 mt-2 text-sm">Track your game. Own the court.</p>
      </header>

      {/* Game Selection */}
      <main className="flex-1 px-5 pb-8 overflow-y-auto">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4 px-1">
          Select a game
        </h2>

        <div className="space-y-3">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => game.available && navigate(`/game/${game.id}/mode`)}
              disabled={!game.available}
              className={`
                w-full flex items-center gap-4 p-4 rounded-2xl transition-all tap-scale
                ${
                  game.available
                    ? 'bg-surface hover:bg-surface-light active:bg-surface-light cursor-pointer border border-transparent hover:border-primary/30'
                    : 'bg-surface/40 opacity-50 cursor-not-allowed'
                }
              `}
            >
              <div
                className={`
                  w-14 h-14 rounded-xl flex items-center justify-center shrink-0
                  ${game.available ? 'bg-primary/15' : 'bg-slate-700/30'}
                `}
              >
                {game.icon}
              </div>
              <div className="flex-1 text-left">
                <span className="text-lg font-semibold block">{game.name}</span>
                <span
                  className={`text-sm ${game.available ? 'text-slate-400' : 'text-slate-500'}`}
                >
                  {game.description}
                </span>
              </div>
              {game.available && (
                <ChevronRight className="w-5 h-5 text-slate-500" />
              )}
              {!game.available && (
                <span className="text-xs bg-slate-700/60 text-slate-400 px-2.5 py-1 rounded-full">
                  Soon
                </span>
              )}
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-slate-600">v0.1.0</p>
      </footer>
    </div>
  )
}
