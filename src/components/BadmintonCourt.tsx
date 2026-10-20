import { useState } from 'react'
import type { PlayerInfo } from '../pages/PlayerSetupPage'

interface BadmintonCourtProps {
  mode: 'singles' | 'doubles'
  players?: PlayerInfo[]
}

interface CourtZone {
  id: string
  label: string
  side: 'top' | 'bottom'
}

export default function BadmintonCourt({ mode, players = [] }: BadmintonCourtProps) {
  const [activeZone, setActiveZone] = useState<string | null>(null)

  // Court dimensions (proportional to real court: 13.4m x 6.1m for doubles, 5.18m for singles)
  // We use SVG viewBox so it scales perfectly
  const fullWidth = 610 // always render full doubles boundary
  const courtHeight = 1340

  // Key measurements (scaled: 1m = ~100 units)
  const shortServiceLine = 198 // 1.98m from net
  const longServiceLineDoubles = 76 // 0.76m from back (doubles)
  const netY = courtHeight / 2
  const sideTramWidth = (fullWidth - 518) / 2 // ~46 each side

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

  // Compute zone rectangles
  const singlesLeft = mode === 'doubles' ? 0 : sideTramWidth
  const singlesRight = mode === 'doubles' ? fullWidth : fullWidth - sideTramWidth
  const playWidth = singlesRight - singlesLeft
  const halfPlayWidth = playWidth / 2

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

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        viewBox={`-20 -20 ${fullWidth + 40} ${courtHeight + 40}`}
        className="w-full h-full max-h-full"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Court surface gradient */}
          <linearGradient id="courtGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2d8a4e" />
            <stop offset="50%" stopColor="#268c47" />
            <stop offset="100%" stopColor="#2d8a4e" />
          </linearGradient>

          {/* Active zone highlight */}
          <radialGradient id="zoneHighlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(99, 102, 241, 0.35)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0.08)" />
          </radialGradient>

          {/* Net pattern */}
          <pattern id="netPattern" x="0" y="0" width="12" height="8" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="12" y2="0" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
            <line x1="6" y1="0" x2="6" y2="8" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          </pattern>

          {/* Shadow filter */}
          <filter id="lineShadow">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="rgba(255,255,255,0.15)" />
          </filter>
        </defs>

        {/* Court background / playing surface */}
        <rect
          x="0"
          y="0"
          width={fullWidth}
          height={courtHeight}
          rx="8"
          fill="url(#courtGradient)"
        />

        {/* Tram lines shading (doubles) — always shown for context */}
        {mode === 'singles' && (
          <>
            <rect x="0" y="0" width={sideTramWidth} height={courtHeight} fill="rgba(0,0,0,0.15)" rx="8" />
            <rect x={fullWidth - sideTramWidth} y="0" width={sideTramWidth} height={courtHeight} fill="rgba(0,0,0,0.15)" />
          </>
        )}

        {/* Interactive zones */}
        {zones.map((zone) => {
          const rect = getZoneRect(zone.id)
          const isActive = activeZone === zone.id
          return (
            <g key={zone.id} onClick={() => handleZoneTap(zone.id)} className="cursor-pointer">
              <rect
                x={rect.x}
                y={rect.y}
                width={rect.w}
                height={rect.h}
                fill={isActive ? 'url(#zoneHighlight)' : 'transparent'}
                stroke={isActive ? 'rgba(99, 102, 241, 0.5)' : 'transparent'}
                strokeWidth="2"
                rx="4"
              />
              {isActive && (
                <text
                  x={rect.x + rect.w / 2}
                  y={rect.y + rect.h / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="24"
                  fontWeight="600"
                  opacity="0.9"
                >
                  {zone.label}
                </text>
              )}
            </g>
          )
        })}

        {/* === Court Lines === */}
        {/* Outer boundary (doubles) */}
        <rect
          x="0"
          y="0"
          width={fullWidth}
          height={courtHeight}
          fill="none"
          stroke="white"
          strokeWidth="3"
          rx="4"
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
          opacity={mode === 'singles' ? '1' : '0.6'}
        />
        <line
          x1={fullWidth - sideTramWidth}
          y1="0"
          x2={fullWidth - sideTramWidth}
          y2={courtHeight}
          stroke="white"
          strokeWidth="2"
          opacity={mode === 'singles' ? '1' : '0.6'}
        />

        {/* Center line (splits service areas) */}
        <line
          x1={fullWidth / 2}
          y1={shortServiceLine}
          x2={fullWidth / 2}
          y2={netY - 0}
          stroke="white"
          strokeWidth="2"
          opacity="0.8"
        />
        <line
          x1={fullWidth / 2}
          y1={netY}
          x2={fullWidth / 2}
          y2={courtHeight - shortServiceLine}
          stroke="white"
          strokeWidth="2"
          opacity="0.8"
        />

        {/* Short service lines */}
        <line
          x1={singlesLeft}
          y1={netY - shortServiceLine}
          x2={singlesRight}
          y2={netY - shortServiceLine}
          stroke="white"
          strokeWidth="2"
        />
        <line
          x1={singlesLeft}
          y1={netY + shortServiceLine}
          x2={singlesRight}
          y2={netY + shortServiceLine}
          stroke="white"
          strokeWidth="2"
        />

        {/* Long service line (doubles only) */}
        {mode === 'doubles' && (
          <>
            <line
              x1="0"
              y1={longServiceLineDoubles}
              x2={fullWidth}
              y2={longServiceLineDoubles}
              stroke="white"
              strokeWidth="2"
              opacity="0.6"
            />
            <line
              x1="0"
              y1={courtHeight - longServiceLineDoubles}
              x2={fullWidth}
              y2={courtHeight - longServiceLineDoubles}
              stroke="white"
              strokeWidth="2"
              opacity="0.6"
            />
          </>
        )}

        {/* === Net === */}
        <rect
          x="-15"
          y={netY - 4}
          width={fullWidth + 30}
          height="8"
          fill="url(#netPattern)"
          stroke="white"
          strokeWidth="1.5"
          rx="2"
        />
        {/* Net posts */}
        <circle cx="-10" cy={netY} r="5" fill="#d4d4d8" stroke="white" strokeWidth="1" />
        <circle cx={fullWidth + 10} cy={netY} r="5" fill="#d4d4d8" stroke="white" strokeWidth="1" />

        {/* Side labels */}
        <text x={fullWidth / 2} y={netY - courtHeight * 0.38} textAnchor="middle" fill="white" fontSize={players.length > 0 ? "24" : "28"} fontWeight="700" opacity="0.3">
          {mode === 'singles'
            ? (players[0]?.name || 'SIDE A')
            : (players[0]?.name && players[1]?.name ? `${players[0].name} & ${players[1].name}` : 'TEAM A')}
        </text>
        <text x={fullWidth / 2} y={netY + courtHeight * 0.42} textAnchor="middle" fill="white" fontSize={players.length > 0 ? "24" : "28"} fontWeight="700" opacity="0.3">
          {mode === 'singles'
            ? (players[1]?.name || 'SIDE B')
            : (players[2]?.name && players[3]?.name ? `${players[2].name} & ${players[3].name}` : 'TEAM B')}
        </text>
      </svg>
    </div>
  )
}
