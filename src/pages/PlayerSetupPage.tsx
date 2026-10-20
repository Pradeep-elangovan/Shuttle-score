import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, User, ChevronRight } from 'lucide-react'

export interface PlayerInfo {
  name: string
  gender: 'male' | 'female' | 'other' | ''
  dob: string
}

const emptyPlayer = (): PlayerInfo => ({ name: '', gender: '', dob: '' })

export default function PlayerSetupPage() {
  const navigate = useNavigate()
  const { gameId } = useParams()
  const location = useLocation()
  const mode = (location.state as { mode?: string })?.mode ?? 'singles'
  const isSingles = mode === 'singles'
  const playerCount = isSingles ? 2 : 4

  const [players, setPlayers] = useState<PlayerInfo[]>(
    Array.from({ length: playerCount }, emptyPlayer)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updatePlayer = (index: number, field: keyof PlayerInfo, value: string) => {
    setPlayers((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
    // Clear error on edit
    setErrors((prev) => {
      const key = `${index}-${field}`
      if (prev[key]) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return prev
    })
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    players.forEach((p, i) => {
      if (!p.name.trim()) newErrors[`${i}-name`] = 'Name is required'
      if (!p.gender) newErrors[`${i}-gender`] = 'Select gender'
      if (!p.dob) newErrors[`${i}-dob`] = 'Enter date of birth'
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (!validate()) return
    navigate(`/game/${gameId}/court`, { state: { mode, players } })
  }

  // Label helpers
  const getPlayerLabel = (index: number): string => {
    if (isSingles) {
      return index === 0 ? 'Player 1' : 'Player 2'
    }
    // Doubles: Team A (0,1) and Team B (2,3)
    if (index < 2) return `Team A — Player ${index + 1}`
    return `Team B — Player ${index - 1}`
  }

  const getTeamHeader = (index: number): string | null => {
    if (isSingles) return null
    if (index === 0) return 'Team A'
    if (index === 2) return 'Team B'
    return null
  }

  const genderOptions: { value: PlayerInfo['gender']; label: string; icon: string }[] = [
    { value: 'male', label: 'Male', icon: '♂' },
    { value: 'female', label: 'Female', icon: '♀' },
    { value: 'other', label: 'Other', icon: '⚧' },
  ]

  return (
    <div className="h-full flex flex-col page-enter">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 pt-6 pb-2 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center tap-scale hover:bg-surface-light transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Player Details</h1>
          <p className="text-xs text-slate-400 capitalize">{mode} — {playerCount} players</p>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 overflow-y-auto px-5 py-4 space-y-5 pb-28">
        {players.map((player, index) => {
          const teamHeader = getTeamHeader(index)
          return (
            <div key={index}>
              {/* Team divider for doubles */}
              {teamHeader && (
                <div className="flex items-center gap-3 mb-4 mt-2">
                  <div className="h-px flex-1 bg-slate-700" />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary-light">
                    {teamHeader}
                  </span>
                  <div className="h-px flex-1 bg-slate-700" />
                </div>
              )}

              <div className="bg-surface rounded-2xl p-4 space-y-4 border border-slate-700/50">
                {/* Player header */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-light" />
                  </div>
                  <span className="text-sm font-semibold text-slate-300">
                    {getPlayerLabel(index)}
                  </span>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Name</label>
                  <input
                    type="text"
                    placeholder="Enter player name"
                    value={player.name}
                    onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                    className={`w-full bg-bg border ${
                      errors[`${index}-name`] ? 'border-red-500' : 'border-slate-700'
                    } rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 
                    focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors`}
                  />
                  {errors[`${index}-name`] && (
                    <p className="text-red-400 text-xs mt-1">{errors[`${index}-name`]}</p>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Gender</label>
                  <div className="flex gap-2">
                    {genderOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updatePlayer(index, 'gender', opt.value)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all tap-scale border ${
                          player.gender === opt.value
                            ? 'bg-primary/20 border-primary text-primary-light'
                            : `bg-bg ${
                                errors[`${index}-gender`] ? 'border-red-500' : 'border-slate-700'
                              } text-slate-400 hover:border-slate-500`
                        }`}
                      >
                        <span className="mr-1">{opt.icon}</span> {opt.label}
                      </button>
                    ))}
                  </div>
                  {errors[`${index}-gender`] && (
                    <p className="text-red-400 text-xs mt-1">{errors[`${index}-gender`]}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={player.dob}
                    onChange={(e) => updatePlayer(index, 'dob', e.target.value)}
                    className={`w-full bg-bg border ${
                      errors[`${index}-dob`] ? 'border-red-500' : 'border-slate-700'
                    } rounded-xl px-4 py-3 text-sm text-white 
                    focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors
                    [color-scheme:dark]`}
                  />
                  {errors[`${index}-dob`] && (
                    <p className="text-red-400 text-xs mt-1">{errors[`${index}-dob`]}</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </main>

      {/* Sticky bottom CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-bg via-bg/95 to-transparent pt-8">
        <button
          onClick={handleContinue}
          className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-4 rounded-2xl 
                     flex items-center justify-center gap-2 tap-scale transition-colors text-base shadow-lg shadow-primary/25"
        >
          Continue to Court
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
