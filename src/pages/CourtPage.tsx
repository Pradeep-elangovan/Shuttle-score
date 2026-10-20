import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, Settings } from 'lucide-react'
import BadmintonCourt from '../components/BadmintonCourt'
import type { PlayerInfo } from './PlayerSetupPage'

export default function CourtPage() {
  const navigate = useNavigate()
  const { gameId } = useParams()
  const location = useLocation()
  const state = location.state as { mode?: string; players?: PlayerInfo[] } | null
  const mode = state?.mode ?? 'singles'
  const players = state?.players ?? []

  return (
    <div className="h-full flex flex-col page-enter bg-bg">
      {/* Compact top bar */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-surface/80 backdrop-blur flex items-center justify-center tap-scale hover:bg-surface-light transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <h1 className="text-sm font-bold capitalize">{gameId}</h1>
          <p className="text-[10px] text-slate-400 capitalize">{mode}</p>
        </div>

        <button
          className="w-9 h-9 rounded-xl bg-surface/80 backdrop-blur flex items-center justify-center tap-scale hover:bg-surface-light transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </header>

      {/* Court area */}
      <main className="flex-1 flex items-center justify-center px-3 pb-4 overflow-hidden">
        <BadmintonCourt mode={mode as 'singles' | 'doubles'} players={players} />
      </main>
    </div>
  )
}
