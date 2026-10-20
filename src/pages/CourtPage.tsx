import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, RotateCcw, ArrowUpDown, Eye, EyeOff, Layers } from 'lucide-react'
import BadmintonCourt, { type CourtTheme } from '../components/BadmintonCourt'
import type { PlayerInfo, TeamColors } from './PlayerSetupPage'

const THEMES: { id: CourtTheme; name: string; dot: string }[] = [
  { id: 'emerald', name: 'Emerald', dot: '#16a34a' },
  { id: 'olympic', name: 'Olympic', dot: '#0d9488' },
  { id: 'hardwood', name: 'Timber', dot: '#d97706' },
  { id: 'midnight', name: 'Midnight', dot: '#38bdf8' },
]

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

  // Court state
  const [theme, setTheme] = useState<CourtTheme>('emerald')
  const [showGuides, setShowGuides] = useState(true)
  const [isFlipped, setIsFlipped] = useState(false)
  const [servingPlayerId, setServingPlayerId] = useState<string | null>(
    players[0]?.id || null
  )

  const activeServer = players.find((p) => p.id === servingPlayerId) || players[0]

  const handleNextServer = () => {
    if (players.length === 0) return
    const currentIndex = players.findIndex((p) => p.id === activeServer?.id)
    const nextIndex = (currentIndex + 1) % players.length
    setServingPlayerId(players[nextIndex].id)
  }

  return (
    <div className="h-full flex flex-col page-enter bg-bg overflow-hidden">
      {/* Top action header */}
      <header className="flex items-center justify-between px-4 pt-3 pb-2 z-10 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-surface/80 backdrop-blur flex items-center justify-center tap-scale hover:bg-surface-light transition-colors cursor-pointer border border-slate-700/50"
          aria-label="Back to player setup"
        >
          <ArrowLeft className="w-4 h-4 text-slate-200" />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-sm font-bold capitalize tracking-wide text-white">{gameId}</h1>
            <span className="text-[10px] bg-primary/20 text-primary-light font-bold px-2 py-0.5 rounded-full uppercase">
              {mode}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 capitalize">
            {players.length} Players Configured
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

      {/* Court Tactical Toolbar */}
      <div className="px-3 pb-2 flex items-center justify-between gap-2 z-10 shrink-0 flex-wrap">
        {/* Theme Pills */}
        <div className="flex items-center bg-surface/90 border border-slate-700/60 rounded-xl p-1 gap-1">
          <Layers className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all tap-scale cursor-pointer ${
                theme === t.id
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.dot }} />
              {t.name}
            </button>
          ))}
        </div>

        {/* Tactical Actions */}
        <div className="flex items-center gap-1.5">
          {/* Switch Ends */}
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1 tap-scale cursor-pointer transition-colors ${
              isFlipped
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-surface/90 border-slate-700/60 text-slate-300 hover:bg-slate-700'
            }`}
            title="Switch court ends (Side A ↔ Side B)"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            Flip
          </button>

          {/* Guide Overlay Toggle */}
          <button
            onClick={() => setShowGuides(!showGuides)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1 tap-scale cursor-pointer transition-colors ${
              showGuides
                ? 'bg-primary/20 border-primary/50 text-primary-light'
                : 'bg-surface/90 border-slate-700/60 text-slate-400 hover:bg-slate-700'
            }`}
            title="Toggle BWF measurement markings & Odd/Even guides"
          >
            {showGuides ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Guides
          </button>
        </div>
      </div>

      {/* Serving HUD Strip */}
      {activeServer && (
        <div className="mx-3 mb-1 px-3 py-1.5 bg-surface/60 backdrop-blur rounded-xl border border-slate-700/40 flex items-center justify-between text-xs z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <span>🏸</span> Server:
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: activeServer.color }}
              />
              <span className="font-semibold text-white">
                {activeServer.name || 'Player 1'}
              </span>
            </div>
          </div>
          <button
            onClick={handleNextServer}
            className="text-[11px] font-medium text-primary-light hover:underline tap-scale cursor-pointer"
          >
            Switch Server →
          </button>
        </div>
      )}

      {/* Court Interactive Canvas */}
      <main className="flex-1 flex items-center justify-center px-2 pb-2 overflow-hidden relative">
        <BadmintonCourt
          mode={mode}
          players={players}
          teamColors={teamColors}
          theme={theme}
          showGuides={showGuides}
          isFlipped={isFlipped}
          servingPlayerId={servingPlayerId}
          onSelectServer={(id) => setServingPlayerId(id)}
        />
      </main>
    </div>
  )
}
