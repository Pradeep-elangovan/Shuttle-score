import { useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Users, Shield } from 'lucide-react'
import ColorPicker, { PRESET_COLORS } from '../components/ColorPicker'
import PlayerAvatarUpload from '../components/PlayerAvatarUpload'

export interface PlayerInfo {
  id: string
  name: string
  gender: 'male' | 'female' | 'other' | ''
  dob: string
  color: string
  avatar?: string
}

export interface TeamColors {
  teamA: string
  teamB: string
}

export default function PlayerSetupPage() {
  const navigate = useNavigate()
  const { gameId } = useParams()
  const location = useLocation()
  const mode = (location.state as { mode?: string })?.mode ?? 'singles'
  const isSingles = mode === 'singles'
  const playerCount = isSingles ? 2 : 4

  // Team colors for doubles (Team A: Red, Team B: Blue default)
  const [teamColors, setTeamColors] = useState<TeamColors>({
    teamA: PRESET_COLORS[0], // #ef4444
    teamB: PRESET_COLORS[1], // #3b82f6
  })

  // Players state
  const [players, setPlayers] = useState<PlayerInfo[]>(() => {
    return Array.from({ length: playerCount }, (_, i) => {
      let defaultColor: string
      if (isSingles) {
        defaultColor = i === 0 ? PRESET_COLORS[0] : PRESET_COLORS[1]
      } else {
        defaultColor = i < 2 ? PRESET_COLORS[0] : PRESET_COLORS[1]
      }
      return {
        id: `player-${i + 1}`,
        name: '',
        gender: '',
        dob: '',
        color: defaultColor,
      }
    })
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update a single field on a player
  const updatePlayer = <K extends keyof PlayerInfo>(
    index: number,
    field: K,
    value: PlayerInfo[K]
  ) => {
    setPlayers((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })

    // Clear error
    const key = `${index}-${String(field)}`
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  // Update team color in doubles
  const handleTeamColorChange = (team: 'teamA' | 'teamB', newColor: string) => {
    setTeamColors((prev) => ({ ...prev, [team]: newColor }))
    setPlayers((prev) =>
      prev.map((player, index) => {
        if (team === 'teamA' && index < 2) {
          return { ...player, color: newColor }
        }
        if (team === 'teamB' && index >= 2) {
          return { ...player, color: newColor }
        }
        return player
      })
    )
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
    navigate(`/game/${gameId}/court`, {
      state: {
        mode,
        players,
        teamColors: isSingles ? undefined : teamColors,
      },
    })
  }

  const getPlayerLabel = (index: number): string => {
    if (isSingles) {
      return index === 0 ? 'Player 1' : 'Player 2'
    }
    if (index < 2) return `Team A — Player ${index + 1}`
    return `Team B — Player ${index - 1}`
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
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Player Details</h1>
          <p className="text-xs text-slate-400 capitalize">
            {mode} — {playerCount} players
          </p>
        </div>
      </header>

      {/* Main Form */}
      <main className="flex-1 overflow-y-auto px-5 py-4 space-y-6 pb-28">
        {/* DOUBLES: Team A Section */}
        {!isSingles && (
          <div className="bg-surface/80 rounded-2xl p-4 border border-slate-700/60 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
                  style={{ backgroundColor: `${teamColors.teamA}25` }}
                >
                  <Shield className="w-4 h-4" style={{ color: teamColors.teamA }} />
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-white">Team A</h2>
                  <p className="text-[11px] text-slate-400">Players 1 & 2</p>
                </div>
              </div>
              <span
                className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                style={{ backgroundColor: teamColors.teamA }}
              />
            </div>

            <ColorPicker
              label="Team A Color"
              value={teamColors.teamA}
              onChange={(c) => handleTeamColorChange('teamA', c)}
            />
          </div>
        )}

        {/* Players list */}
        {players.map((player, index) => {
          // If doubles, show Team B header right before index 2
          const showTeamBHeader = !isSingles && index === 2

          return (
            <div key={player.id} className="space-y-4">
              {showTeamBHeader && (
                <div className="bg-surface/80 rounded-2xl p-4 border border-slate-700/60 space-y-4 mt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md"
                        style={{ backgroundColor: `${teamColors.teamB}25` }}
                      >
                        <Users className="w-4 h-4" style={{ color: teamColors.teamB }} />
                      </div>
                      <div>
                        <h2 className="text-sm font-bold uppercase tracking-wider text-white">Team B</h2>
                        <p className="text-[11px] text-slate-400">Players 3 & 4</p>
                      </div>
                    </div>
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: teamColors.teamB }}
                    />
                  </div>

                  <ColorPicker
                    label="Team B Color"
                    value={teamColors.teamB}
                    onChange={(c) => handleTeamColorChange('teamB', c)}
                  />
                </div>
              )}

              {/* Player Card */}
              <div
                className="bg-surface rounded-2xl p-4 space-y-4 border transition-all"
                style={{
                  borderColor: `${player.color}40`,
                  boxShadow: `0 4px 20px -2px ${player.color}15`,
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                      style={{
                        backgroundColor: `${player.color}25`,
                        color: player.color,
                      }}
                    >
                      {index + 1}
                    </div>
                    <span className="text-sm font-semibold text-slate-200">
                      {getPlayerLabel(index)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: player.color }}
                    />
                  </div>
                </div>

                {/* Avatar / Photo Upload */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-2">
                    Player Photo (Optional)
                  </label>
                  <PlayerAvatarUpload
                    name={player.name}
                    avatar={player.avatar}
                    color={player.color}
                    onAvatarChange={(avatar) => updatePlayer(index, 'avatar', avatar)}
                  />
                </div>

                {/* Individual Color Picker (Singles only) */}
                {isSingles && (
                  <div className="pt-1">
                    <ColorPicker
                      label="Player Color"
                      value={player.color}
                      onChange={(c) => updatePlayer(index, 'color', c)}
                    />
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Player Name *
                  </label>
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
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Gender *
                  </label>
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
                    Date of Birth *
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
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-bg via-bg/95 to-transparent pt-8 shrink-0">
        <button
          onClick={handleContinue}
          className="w-full bg-primary hover:bg-primary-light text-white font-semibold py-4 rounded-2xl 
                     flex items-center justify-center gap-2 tap-scale transition-colors text-base shadow-lg shadow-primary/25 cursor-pointer"
        >
          Continue to Court
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
