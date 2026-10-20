import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import BadmintonCourt from '../components/BadmintonCourt'
import type { PlayerInfo, TeamColors } from './PlayerSetupPage'

export default function CourtPage() {
  const navigate = useNavigate()
  const { gameId } = useParams()
  const location = useLocation()
  const state = location.state as {
    mode?: string
    players?: PlayerInfo[]
    teamColors?: TeamColors
  } | null

  const mode = (state?.mode ?? 'singles') as 'singles' | 'doubles'
  const players = state?.players ?? []
  const teamColors = state?.teamColors

  return (
    <div className="h-full flex flex-col page-enter bg-bg">
      {/* Compact top bar */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2 z-10 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-surface/80 backdrop-blur flex items-center justify-center tap-scale hover:bg-surface-light transition-colors cursor-pointer border border-slate-700/50"
          aria-label="Back to player setup"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h1 className="text-sm font-bold capitalize tracking-wide">{gameId}</h1>
          <p className="text-[10px] text-slate-400 capitalize font-medium">
            {mode} • {players.length} Players
          </p>
        </div>

        <button
          onClick={() => navigate(`/game/${gameId}/players`, { state: { mode } })}
          className="w-9 h-9 rounded-xl bg-surface/80 backdrop-blur flex items-center justify-center tap-scale hover:bg-surface-light transition-colors cursor-pointer border border-slate-700/50"
          title="Edit players and colors"
          aria-label="Edit players and colors"
        >
          <RotateCcw className="w-4 h-4 text-slate-300" />
        </button>
      </header>

      {/* Court area */}
      <main className="flex-1 flex items-center justify-center px-2 pb-3 overflow-hidden">
        <BadmintonCourt
          mode={mode}
          players={players}
          teamColors={teamColors}
        />
      </main>
    </div>
  )
}
