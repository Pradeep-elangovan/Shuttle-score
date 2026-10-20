import { useState } from 'react'
import type { PlayerInfo, TeamColors } from '../pages/PlayerSetupPage'
import { getInitials } from '../utils/imageUtils'

interface BadmintonCourtProps {
  mode: 'singles' | 'doubles'
  players?: PlayerInfo[]
  teamColors?: TeamColors
}

interface CourtZone {
  id: string
  label: string
  side: 'top' | 'bottom'
}

export default function BadmintonCourt({
  mode,
  players = [],
  teamColors,
}: BadmintonCourtProps) {
  const [activeZone, setActiveZone] = useState<string | null>(null)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  // Court dimensions (proportional to real court: 13.4m x 6.1m for doubles, 5.18m for singles)
  const fullWidth = 610 // always render full doubles boundary
  const courtHeight = 1340

  // Key measurements
  const shortServiceLine = 198 // 1.98m from net
  const longServiceLineDoubles = 76 // 0.76m from back (doubles)
  const netY = courtHeight / 2 // 670
  const sideTramWidth = (fullWidth - 518) / 2 // 46 on each side

  // Singles boundaries
  const singlesLeft = mode === 'doubles' ? 0 : sideTramWidth
  const singlesRight = mode === 'doubles' ? fullWidth : fullWidth - sideTramWidth
  const playWidth = singlesRight - singlesLeft
  const halfPlayWidth = playWidth / 2

  // Extract side / team colors
  const topColor =
    mode === 'singles'
      ? players[0]?.color || '#ef4444'
      : teamColors?.teamA || players[0]?.color || '#ef4444'

  const bottomColor =
    mode === 'singles'
      ? players[1]?.color || '#3b82f6'
      : teamColors?.teamB || players[2]?.color || '#3b82f6'

  // Court zones for tap interaction
  const zones: CourtZone[] = [
    { id: 'top-left-front', label: 'Left Service', side: 'top' },
    { id: 'top-right-front', label: 'Right Service', side: 'top' },
    { id: 'top-left-back', label: 'Left Rear', side: 'top' },
    { id: 'top-right-back', label: 'Right Rear', side: 'top' },
    { id: 'bottom-left-front', label: 'Left Service', side: 'bottom' },
    { id: 'bottom-right-front', label: 'Right Service', side: 'bottom' },
    { id: 'bottom-left-back', label: 'Left Rear', side: 'bottom' },
    { id: 'bottom-right-back', label: 'Right Rear', side: 'bottom' },
  ]

  const handleZoneTap = (zoneId: string) => {
    setActiveZone(activeZone === zoneId ? null : zoneId)
  }

  const getZoneRect = (zoneId: string) => {
    const isTop = zoneId.startsWith('top')
    const isLeft = zoneId.includes('-left-')
    const isFront = zoneId.includes('-front')

    const x = isLeft ? singlesLeft : singlesLeft + halfPlayWidth
    const w = halfPlayWidth

    let y: number, h: number

    if (isTop) {
      if (isFront) {
        y = netY - shortServiceLine
        h = shortServiceLine
      } else {
        const backEnd = mode === 'doubles' ? longServiceLineDoubles : 0
        y = backEnd
        h = netY - shortServiceLine - backEnd
      }
    } else {
      if (isFront) {
        y = netY
        h = shortServiceLine
      } else {
        const backEnd = mode === 'doubles' ? longServiceLineDoubles : 0
        y = netY + shortServiceLine
        h = courtHeight - (netY + shortServiceLine) - backEnd
      }
    }

    return { x, y, w, h }
  }

  // Calculate player positions on the court
  interface PlayerPosition {
    player: PlayerInfo
    x: number
    y: number
    radius: number
    teamLabel?: string
  }

  const playerPositions: PlayerPosition[] = []

  if (mode === 'singles') {
    // Player 1: Top Side center
    if (players[0]) {
      playerPositions.push({
        player: players[0],
        x: fullWidth / 2,
        y: netY - 260,
        radius: 46,
      })
    }
    // Player 2: Bottom Side center
    if (players[1]) {
      playerPositions.push({
        player: players[1],
        x: fullWidth / 2,
        y: netY + 260,
        radius: 46,
      })
    }
  } else {
    // Doubles:
    // Team A (Top): Player 1 (Left), Player 2 (Right)
    if (players[0]) {
      playerPositions.push({
        player: { ...players[0], color: topColor },
        x: singlesLeft + halfPlayWidth * 0.45,
        y: netY - 260,
        radius: 40,
        teamLabel: 'Team A',
      })
    }
    if (players[1]) {
      playerPositions.push({
        player: { ...players[1], color: topColor },
        x: singlesLeft + halfPlayWidth * 1.55,
        y: netY - 260,
        radius: 40,
        teamLabel: 'Team A',
      })
    }
    // Team B (Bottom): Player 3 (Left), Player 4 (Right)
    if (players[2]) {
      playerPositions.push({
        player: { ...players[2], color: bottomColor },
        x: singlesLeft + halfPlayWidth * 0.45,
        y: netY + 260,
        radius: 40,
        teamLabel: 'Team B',
      })
    }
    if (players[3]) {
      playerPositions.push({
        player: { ...players[3], color: bottomColor },
        x: singlesLeft + halfPlayWidth * 1.55,
        y: netY + 260,
        radius: 40,
        teamLabel: 'Team B',
      })
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
      <svg
        viewBox={`-24 -36 ${fullWidth + 48} ${courtHeight + 72}`}
        className="w-full h-full max-h-full"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Court base green gradient */}
          <linearGradient id="courtGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#257a44" />
            <stop offset="50%" stopColor="#1e6b3b" />
            <stop offset="100%" stopColor="#257a44" />
          </linearGradient>

          {/* Top side (Side A / Team A) ambient colored tint */}
          <linearGradient id="topSideTint" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={topColor} stopOpacity="0.22" />
            <stop offset="70%" stopColor={topColor} stopOpacity="0.06" />
            <stop offset="100%" stopColor={topColor} stopOpacity="0.0" />
          </linearGradient>

          {/* Bottom side (Side B / Team B) ambient colored tint */}
          <linearGradient id="bottomSideTint" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={bottomColor} stopOpacity="0.22" />
            <stop offset="70%" stopColor={bottomColor} stopOpacity="0.06" />
            <stop offset="100%" stopColor={bottomColor} stopOpacity="0.0" />
          </linearGradient>

          {/* Active zone highlight */}
          <radialGradient id="zoneHighlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.28)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
          </radialGradient>

          {/* Net pattern */}
          <pattern id="netPattern" x="0" y="0" width="12" height="8" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="12" y2="0" stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" />
            <line x1="6" y1="0" x2="6" y2="8" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
          </pattern>

          {/* Dynamic Clip paths for each player avatar photo */}
          {playerPositions.map((pos) => (
            <clipPath key={`clip-${pos.player.id}`} id={`clip-${pos.player.id}`}>
              <circle cx={pos.x} cy={pos.y} r={pos.radius} />
            </clipPath>
          ))}

          {/* Drop shadows */}
          <filter id="avatarShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.45)" />
          </filter>
        </defs>

        {/* Outer Court Background */}
        <rect
          x="0"
          y="0"
          width={fullWidth}
          height={courtHeight}
          rx="12"
          fill="url(#courtGradient)"
        />

        {/* Ambient Side Tinting reflecting assigned player/team colors */}
        <rect
          x="0"
          y="0"
          width={fullWidth}
          height={netY}
          rx="12"
          fill="url(#topSideTint)"
          pointerEvents="none"
        />
        <rect
          x="0"
          y={netY}
          width={fullWidth}
          height={courtHeight - netY}
          rx="12"
          fill="url(#bottomSideTint)"
          pointerEvents="none"
        />

        {/* Singles tramlines shading (when in singles mode) */}
        {mode === 'singles' && (
          <>
            <rect
              x="0"
              y="0"
              width={sideTramWidth}
              height={courtHeight}
              fill="rgba(0,0,0,0.22)"
              rx="12"
              pointerEvents="none"
            />
            <rect
              x={fullWidth - sideTramWidth}
              y="0"
              width={sideTramWidth}
              height={courtHeight}
              fill="rgba(0,0,0,0.22)"
              pointerEvents="none"
            />
          </>
        )}

        {/* Interactive Court Service Zones */}
        {zones.map((zone) => {
          const rect = getZoneRect(zone.id)
          const isActive = activeZone === zone.id
          return (
            <g
              key={zone.id}
              onClick={() => handleZoneTap(zone.id)}
              className="cursor-pointer transition-all"
            >
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.w}
                height={rect.h}
                fill={isActive ? 'url(#zoneHighlight)' : 'transparent'}
                stroke={isActive ? 'rgba(255, 255, 255, 0.7)' : 'transparent'}
                strokeWidth="2.5"
                rx="4"
              />
              {isActive && (
                <text
                  x={rect.x + rect.w / 2}
                  y={rect.y + rect.h / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="22"
                  fontWeight="600"
                  opacity="0.85"
                  pointerEvents="none"
                >
                  {zone.label}
                </text>
              )}
            </g>
          )
        })}

        {/* === Court Boundary Lines === */}
        {/* Outer doubles boundary */}
        <rect
          x="0"
          y="0"
          width={fullWidth}
          height={courtHeight}
          fill="none"
          stroke="white"
          strokeWidth="3.5"
          rx="8"
          className="court-line-glow"
        />

        {/* Singles sidelines */}
        <line
          x1={sideTramWidth}
          y1="0"
          x2={sideTramWidth}
          y2={courtHeight}
          stroke="white"
          strokeWidth="2"
          opacity={mode === 'singles' ? '1' : '0.55'}
        />
        <line
          x1={fullWidth - sideTramWidth}
          y1="0"
          x2={fullWidth - sideTramWidth}
          y2={courtHeight}
          stroke="white"
          strokeWidth="2"
          opacity={mode === 'singles' ? '1' : '0.55'}
        />

        {/* Center lines */}
        <line
          x1={fullWidth / 2}
          y1={shortServiceLine}
          x2={fullWidth / 2}
          y2={netY}
          stroke="white"
          strokeWidth="2"
          opacity="0.85"
        />
        <line
          x1={fullWidth / 2}
          y1={netY}
          x2={fullWidth / 2}
          y2={courtHeight - shortServiceLine}
          stroke="white"
          strokeWidth="2"
          opacity="0.85"
        />

        {/* Short service lines */}
        <line
          x1={singlesLeft}
          y1={netY - shortServiceLine}
          x2={singlesRight}
          y2={netY - shortServiceLine}
          stroke="white"
          strokeWidth="2.5"
        />
        <line
          x1={singlesLeft}
          y1={netY + shortServiceLine}
          x2={singlesRight}
          y2={netY + shortServiceLine}
          stroke="white"
          strokeWidth="2.5"
        />

        {/* Doubles long service lines */}
        {mode === 'doubles' && (
          <>
            <line
              x1="0"
              y1={longServiceLineDoubles}
              x2={fullWidth}
              y2={longServiceLineDoubles}
              stroke="white"
              strokeWidth="2"
              opacity="0.65"
            />
            <line
              x1="0"
              y1={courtHeight - longServiceLineDoubles}
              x2={fullWidth}
              y2={courtHeight - longServiceLineDoubles}
              stroke="white"
              strokeWidth="2"
              opacity="0.65"
            />
          </>
        )}

        {/* === Side / Team Top & Bottom Banners === */}
        {/* Top Side Banner */}
        <g transform={`translate(${fullWidth / 2}, 24)`}>
          <rect
            x="-80"
            y="-16"
            width="160"
            height="26"
            rx="13"
            fill="#0f172a"
            fillOpacity="0.85"
            stroke={topColor}
            strokeWidth="1.5"
          />
          <circle cx="-62" cy="-3" r="5" fill={topColor} />
          <text
            x="0"
            y="-2"
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize="12"
            fontWeight="bold"
            letterSpacing="0.08em"
          >
            {mode === 'singles' ? 'SIDE A' : 'TEAM A'}
          </text>
        </g>

        {/* Bottom Side Banner */}
        <g transform={`translate(${fullWidth / 2}, ${courtHeight - 24})`}>
          <rect
            x="-80"
            y="-10"
            width="160"
            height="26"
            rx="13"
            fill="#0f172a"
            fillOpacity="0.85"
            stroke={bottomColor}
            strokeWidth="1.5"
          />
          <circle cx="-62" cy="3" r="5" fill={bottomColor} />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize="12"
            fontWeight="bold"
            letterSpacing="0.08em"
          >
            {mode === 'singles' ? 'SIDE B' : 'TEAM B'}
          </text>
        </g>

        {/* === Court Net === */}
        <g>
          {/* Net shadow */}
          <rect
            x="-18"
            y={netY - 2}
            width={fullWidth + 36}
            height="10"
            fill="rgba(0,0,0,0.3)"
          />
          {/* Net mesh */}
          <rect
            x="-16"
            y={netY - 5}
            width={fullWidth + 32}
            height="10"
            fill="url(#netPattern)"
            stroke="white"
            strokeWidth="1.5"
            rx="2"
          />
          {/* Net top tape */}
          <line
            x1="-16"
            y1={netY - 5}
            x2={fullWidth + 16}
            y2={netY - 5}
            stroke="white"
            strokeWidth="2.5"
          />
          {/* Net posts */}
          <circle cx="-12" cy={netY} r="6" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
          <circle cx={fullWidth + 12} cy={netY} r="6" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
        </g>

        {/* === PLAYER AVATARS & COLOR RINGS ON COURT === */}
        {playerPositions.map((pos) => {
          const { player, x, y, radius } = pos
          const isSelected = selectedPlayerId === player.id
          const initials = getInitials(player.name, 'P')
          const pillWidth = Math.max(90, Math.min(150, (player.name.length || 6) * 11 + 30))

          return (
            <g
              key={player.id}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedPlayerId(isSelected ? null : player.id)
              }}
              className="cursor-pointer"
              filter="url(#avatarShadow)"
            >
              {/* Outer pulsing ring if selected */}
              {isSelected && (
                <circle
                  cx={x}
                  cy={y}
                  r={radius + 8}
                  fill="none"
                  stroke={player.color}
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  opacity="0.85"
                />
              )}

              {/* Player Avatar or Initial Circle */}
              {player.avatar ? (
                <>
                  <circle
                    cx={x}
                    cy={y}
                    r={radius}
                    fill="#1e293b"
                  />
                  <image
                    href={player.avatar}
                    x={x - radius}
                    y={y - radius}
                    width={radius * 2}
                    height={radius * 2}
                    clipPath={`url(#clip-${player.id})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </>
              ) : (
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={player.color}
                  fillOpacity="0.88"
                />
              )}

              {/* Colored border ring denoting player/team color */}
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill="none"
                stroke={player.color}
                strokeWidth="4"
              />

              {/* Initial text if no avatar photo */}
              {!player.avatar && (
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize={radius > 42 ? '24' : '20'}
                  fontWeight="bold"
                  letterSpacing="0.04em"
                  pointerEvents="none"
                >
                  {initials}
                </text>
              )}

              {/* Player Name Pill Badge positioned below avatar */}
              <g transform={`translate(${x}, ${y + radius + 18})`}>
                <rect
                  x={-pillWidth / 2}
                  y="-12"
                  width={pillWidth}
                  height="24"
                  rx="12"
                  fill="#0f172a"
                  fillOpacity="0.9"
                  stroke={player.color}
                  strokeWidth="1.5"
                />
                {/* Color dot */}
                <circle cx={-pillWidth / 2 + 10} cy="0" r="4" fill={player.color} />
                {/* Name string */}
                <text
                  x="4"
                  y="1"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="12"
                  fontWeight="600"
                  pointerEvents="none"
                >
                  {player.name || 'Player'}
                </text>
              </g>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
