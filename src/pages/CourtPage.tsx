import { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, RotateCcw, ArrowUpDown, Eye, EyeOff, Layers, Smartphone, Monitor, Undo2 } from 'lucide-react'
import BadmintonCourt, { type CourtTheme, type CourtOrientation } from '../components/BadmintonCourt'
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

  // Scores state
  const [scoreA, setScoreA] = useState(0)
  const [scoreB, setScoreB] = useState(0)
  const [canUndo, setCanUndo] = useState(false)
  const [lastScorer, setLastScorer] = useState<'sideA' | 'sideB' | null>(null)
  const [activeTapSide, setActiveTapSide] = useState<'side1' | 'side2' | null>(null)
  const [floatingPoint, setFloatingPoint] = useState<{
    target: 'sideA' | 'sideB'
    text: string
    key: number
  } | null>(null)

  // Court custom state
  const [theme, setTheme] = useState<CourtTheme>('emerald')
  const [showGuides, setShowGuides] = useState(true)
  const [isFlipped, setIsFlipped] = useState(false)
  const [servingPlayerId, setServingPlayerId] = useState<string | null>(
    players[0]?.id || null
  )

  // Responsive Orientation Detection
  const [detectedLandscape, setDetectedLandscape] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth > window.innerHeight
  })
  const [manualOverride, setManualOverride] = useState<'auto' | 'portrait' | 'landscape'>('auto')

  useEffect(() => {
    const handleResize = () => {
      setDetectedLandscape(window.innerWidth > window.innerHeight)
    }
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  const effectiveOrientation: CourtOrientation =
    manualOverride === 'auto'
      ? detectedLandscape
        ? 'landscape'
        : 'portrait'
      : manualOverride

  const isLandscape = effectiveOrientation === 'landscape'

  // Side A and Side B metadata
  const sideAName =
    mode === 'singles'
      ? players[0]?.name || 'Player 1'
      : teamColors
      ? 'Team A'
      : players[0]?.name && players[1]?.name
      ? `${players[0].name} & ${players[1].name}`
      : 'Team A'

  const sideBName =
    mode === 'singles'
      ? players[1]?.name || 'Player 2'
      : teamColors
      ? 'Team B'
      : players[2]?.name && players[3]?.name
      ? `${players[2].name} & ${players[3].name}`
      : 'Team B'

  const sideAColor =
    mode === 'singles'
      ? players[0]?.color || '#ef4444'
      : teamColors?.teamA || players[0]?.color || '#ef4444'

  const sideBColor =
    mode === 'singles'
      ? players[1]?.color || '#3b82f6'
      : teamColors?.teamB || players[2]?.color || '#3b82f6'

  // Score Awarding Logic
  const handleScoreSide = (courtSide: 'side1' | 'side2') => {
    // In court: Side 1 is Top (portrait) or Left (landscape)
    // If ends are flipped, Side 1 on court corresponds to Side B
    const targetTeam = courtSide === 'side1'
      ? (isFlipped ? 'sideB' : 'sideA')
      : (isFlipped ? 'sideA' : 'sideB')

    if (targetTeam === 'sideA') {
      setScoreA((prev) => prev + 1)
    } else {
      setScoreB((prev) => prev + 1)
    }

    setLastScorer(targetTeam)
    setCanUndo(true) // Can undo up to this 1 point

    // Visual tap feedback
    setActiveTapSide(courtSide)
    setTimeout(() => setActiveTapSide(null), 350)

    // Floating +1 animation
    setFloatingPoint({
      target: targetTeam,
      text: '+1',
      key: Date.now(),
    })

    // Haptic pulse if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(25)
    }
  }

  // Undo Last 1 Point Logic
  const handleUndo = () => {
    if (!canUndo || !lastScorer) return

    if (lastScorer === 'sideA') {
      setScoreA((prev) => Math.max(0, prev - 1))
    } else {
      setScoreB((prev) => Math.max(0, prev - 1))
    }

    setFloatingPoint({
      target: lastScorer,
      text: '-1',
      key: Date.now(),
    })

    // Undo is limited to last 1 point
    setCanUndo(false)
    setLastScorer(null)
  }

  // Reset Score
  const handleReset = () => {
    if (scoreA === 0 && scoreB === 0) return
    setScoreA(0)
    setScoreB(0)
    setCanUndo(false)
    setLastScorer(null)
  }

  const activeServer = players.find((p) => p.id === servingPlayerId) || players[0]

  const handleNextServer = () => {
    if (players.length === 0) return
    const currentIndex = players.findIndex((p) => p.id === activeServer?.id)
    const nextIndex = (currentIndex + 1) % players.length
    setServingPlayerId(players[nextIndex].id)
  }

  const toggleOrientationOverride = () => {
    if (manualOverride === 'auto') {
      setManualOverride(detectedLandscape ? 'portrait' : 'landscape')
    } else if (manualOverride === 'landscape') {
      setManualOverride('portrait')
    } else {
      setManualOverride('auto')
    }
  }

  return (
    <div className="h-full w-full flex flex-col page-enter bg-bg overflow-hidden relative">
      {/* Top action header */}
      <header className="flex items-center justify-between px-4 pt-3 pb-2 z-30 shrink-0">
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
            Tap court side to score • {isLandscape ? 'Landscape' : 'Portrait'}
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
      <div className="px-3 pb-2 flex items-center justify-between gap-2 z-30 shrink-0 flex-wrap">
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
          {/* Orientation Mode Toggle */}
          <button
            onClick={toggleOrientationOverride}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1 tap-scale cursor-pointer transition-colors ${
              manualOverride !== 'auto'
                ? 'bg-primary/20 border-primary/50 text-primary-light'
                : 'bg-surface/90 border-slate-700/60 text-slate-300 hover:bg-slate-700'
            }`}
            title={`Orientation: ${manualOverride} (Click to toggle)`}
          >
            {isLandscape ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            {isLandscape ? 'Landscape' : 'Portrait'}
          </button>

          {/* Switch Ends */}
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1 tap-scale cursor-pointer transition-colors ${
              isFlipped
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-surface/90 border-slate-700/60 text-slate-300 hover:bg-slate-700'
            }`}
            title="Switch court ends"
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
        <div className="mx-3 mb-1 px-3 py-1.5 bg-surface/60 backdrop-blur rounded-xl border border-slate-700/40 flex items-center justify-between text-xs z-30 shrink-0">
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

      {/* Court Canvas Area with Central Scoreboard Overlay */}
      <main className="flex-1 w-full flex items-center justify-center p-2 overflow-hidden relative">
        <BadmintonCourt
          mode={mode}
          players={players}
          teamColors={teamColors}
          theme={theme}
          orientation={effectiveOrientation}
          showGuides={showGuides}
          isFlipped={isFlipped}
          servingPlayerId={servingPlayerId}
          onSelectServer={(id) => setServingPlayerId(id)}
          onScoreSide={handleScoreSide}
          activeTapSide={activeTapSide}
        />

        {/* ======================================================== */}
        {/* LARGE SCOREBOARD IN THE CENTER OF THE PAGE               */}
        {/* ======================================================== */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto
                     bg-slate-950/90 border-2 border-white/20 backdrop-blur-xl shadow-2xl rounded-3xl
                     p-4 sm:p-5 flex flex-col items-center gap-3 transition-all select-none min-w-[280px] sm:min-w-[340px]"
          style={{
            boxShadow: `0 0 35px rgba(0,0,0,0.8), 0 0 15px ${sideAColor}25, 0 0 15px ${sideBColor}25`,
          }}
        >
          {/* Header Team Names */}
          <div className="w-full flex items-center justify-between gap-4 text-xs font-bold uppercase tracking-wider">
            {/* Side A Name */}
            <div
              className="flex items-center gap-1.5 cursor-pointer tap-scale"
              onClick={() => handleScoreSide(isFlipped ? 'side2' : 'side1')}
              title="Click to add point to Side A"
            >
              <span
                className="w-3 h-3 rounded-full border border-white/30 shadow-sm"
                style={{ backgroundColor: sideAColor }}
              />
              <span className="truncate max-w-[110px]" style={{ color: sideAColor }}>
                {sideAName}
              </span>
            </div>

            {/* Match Label */}
            <span className="text-[10px] text-slate-500 font-mono tracking-widest">
              SCORE
            </span>

            {/* Side B Name */}
            <div
              className="flex items-center gap-1.5 cursor-pointer tap-scale text-right"
              onClick={() => handleScoreSide(isFlipped ? 'side1' : 'side2')}
              title="Click to add point to Side B"
            >
              <span className="truncate max-w-[110px]" style={{ color: sideBColor }}>
                {sideBName}
              </span>
              <span
                className="w-3 h-3 rounded-full border border-white/30 shadow-sm"
                style={{ backgroundColor: sideBColor }}
              />
            </div>
          </div>

          {/* Large Center Score Digits */}
          <div className="flex items-center justify-center gap-5 sm:gap-7 my-1 relative">
            {/* Side A Score Digit */}
            <div
              onClick={() => handleScoreSide(isFlipped ? 'side2' : 'side1')}
              className="group cursor-pointer tap-scale flex flex-col items-center"
              title={`Tap to add point to ${sideAName}`}
            >
              <div
                className="text-5xl sm:text-7xl font-black font-mono tracking-tighter transition-transform group-hover:scale-105"
                style={{
                  color: sideAColor,
                  textShadow: `0 0 20px ${sideAColor}60`,
                }}
              >
                {scoreA}
              </div>
              <span className="text-[10px] text-slate-400 group-hover:text-white transition-colors mt-0.5">
                +1 pt
              </span>
            </div>

            {/* Center Separator Colon */}
            <div className="text-3xl sm:text-5xl font-black text-slate-600 font-mono select-none">
              :
            </div>

            {/* Side B Score Digit */}
            <div
              onClick={() => handleScoreSide(isFlipped ? 'side1' : 'side2')}
              className="group cursor-pointer tap-scale flex flex-col items-center"
              title={`Tap to add point to ${sideBName}`}
            >
              <div
                className="text-5xl sm:text-7xl font-black font-mono tracking-tighter transition-transform group-hover:scale-105"
                style={{
                  color: sideBColor,
                  textShadow: `0 0 20px ${sideBColor}60`,
                }}
              >
                {scoreB}
              </div>
              <span className="text-[10px] text-slate-400 group-hover:text-white transition-colors mt-0.5">
                +1 pt
              </span>
            </div>

            {/* Floating Point Notification (+1 / -1) */}
            {floatingPoint && (
              <div
                key={floatingPoint.key}
                className="absolute -top-7 text-sm font-black px-2.5 py-0.5 rounded-full pointer-events-none float-up-fade shadow-lg"
                style={{
                  left: floatingPoint.target === 'sideA' ? '20%' : '80%',
                  transform: 'translateX(-50%)',
                  backgroundColor:
                    floatingPoint.text === '+1'
                      ? floatingPoint.target === 'sideA'
                        ? sideAColor
                        : sideBColor
                      : '#64748b',
                  color: '#ffffff',
                }}
              >
                {floatingPoint.text}
              </div>
            )}
          </div>

          {/* Action Row: Undo & Reset */}
          <div className="w-full flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
            {/* Undo Button (Option to undo up to last 1 point) */}
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all tap-scale border ${
                canUndo
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 hover:bg-amber-500/30 cursor-pointer shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              }`}
              title={canUndo ? 'Undo last point' : 'Undo available for the last point'}
            >
              <Undo2 className="w-3.5 h-3.5" />
              Undo Last Pt
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              disabled={scoreA === 0 && scoreB === 0}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all tap-scale border ${
                scoreA > 0 || scoreB > 0
                  ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 cursor-pointer'
                  : 'bg-slate-900 border-slate-800 text-slate-700 cursor-not-allowed opacity-40'
              }`}
              title="Reset scores to 0-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Subtitle helper note */}
          <p className="text-[10px] text-slate-500 text-center">
            Tap either side of the court or scores above to add point
          </p>
        </div>
      </main>
    </div>
  )
}
