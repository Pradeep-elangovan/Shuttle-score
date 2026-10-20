import { useState, useId } from 'react'
import type { PlayerInfo, TeamColors } from '../pages/PlayerSetupPage'
import { getInitials } from '../utils/imageUtils'

export type CourtTheme = 'emerald' | 'olympic' | 'hardwood' | 'midnight'

interface BadmintonCourtProps {
  mode: 'singles' | 'doubles'
  players?: PlayerInfo[]
  teamColors?: TeamColors
  theme?: CourtTheme
  showGuides?: boolean
  isFlipped?: boolean
  servingPlayerId?: string | null
  onSelectServer?: (playerId: string) => void
}

interface ThemePalette {
  courtGradient: [string, string, string]
  apronColor: string
  apronBorder: string
  lineColor: string
  lineGlow: string
  woodGrain?: boolean
  neutralZoneTint: string
  doublesAlleyTint: string
}

const THEME_PALETTES: Record<CourtTheme, ThemePalette> = {
  emerald: {
    courtGradient: ['#1e7e43', '#166534', '#1e7e43'],
    apronColor: '#0f381e',
    apronBorder: '#0b2916',
    lineColor: '#ffffff',
    lineGlow: 'rgba(255,255,255,0.4)',
    neutralZoneTint: 'rgba(0,0,0,0.06)',
    doublesAlleyTint: 'rgba(0,0,0,0.08)',
  },
  olympic: {
    courtGradient: ['#0f766e', '#115e59', '#0f766e'],
    apronColor: '#042f2e',
    apronBorder: '#021f1e',
    lineColor: '#ffffff',
    lineGlow: 'rgba(255,255,255,0.45)',
    neutralZoneTint: 'rgba(0,0,0,0.08)',
    doublesAlleyTint: 'rgba(0,0,0,0.1)',
  },
  hardwood: {
    courtGradient: ['#ca8a04', '#a16207', '#ca8a04'],
    apronColor: '#451a03',
    apronBorder: '#290f02',
    lineColor: '#ffffff',
    lineGlow: 'rgba(255,255,255,0.35)',
    woodGrain: true,
    neutralZoneTint: 'rgba(0,0,0,0.07)',
    doublesAlleyTint: 'rgba(0,0,0,0.09)',
  },
  midnight: {
    courtGradient: ['#1e293b', '#0f172a', '#1e293b'],
    apronColor: '#050811',
    apronBorder: '#020408',
    lineColor: '#38bdf8',
    lineGlow: 'rgba(56,189,248,0.5)',
    neutralZoneTint: 'rgba(56,189,248,0.03)',
    doublesAlleyTint: 'rgba(0,0,0,0.2)',
  },
}

export default function BadmintonCourt({
  mode,
  players = [],
  teamColors,
  theme = 'emerald',
  showGuides = true,
  isFlipped = false,
  servingPlayerId,
  onSelectServer,
}: BadmintonCourtProps) {
  const [activeZone, setActiveZone] = useState<string | null>(null)
  const uniqueId = useId()

  const palette = THEME_PALETTES[theme]

  // BWF Official Court Dimensions in units (1m = 100 units)
  const fullWidth = 610 // 6.10m
  const courtHeight = 1340 // 13.40m
  const netY = courtHeight / 2 // 670 (0m center)

  const shortServiceLine = 198 // 1.98m from net
  const longServiceLineDoubles = 76 // 0.76m inside back boundary
  const sideTramWidth = 46 // 0.46m inside doubles sideline

  // Singles boundaries
  const singlesLeft = sideTramWidth // 46
  const singlesRight = fullWidth - sideTramWidth // 564
  const playLeft = mode === 'doubles' ? 0 : singlesLeft
  const playRight = mode === 'doubles' ? fullWidth : singlesRight
  const halfPlayWidth = (playRight - playLeft) / 2

  // Stadium apron padding
  const apronX = 54
  const apronY = 64

  // Colors for top / bottom sides
  const rawTopColor =
    mode === 'singles'
      ? players[0]?.color || '#ef4444'
      : teamColors?.teamA || players[0]?.color || '#ef4444'

  const rawBottomColor =
    mode === 'singles'
      ? players[1]?.color || '#3b82f6'
      : teamColors?.teamB || players[2]?.color || '#3b82f6'

  // When ends are switched:
  const topColor = isFlipped ? rawBottomColor : rawTopColor
  const bottomColor = isFlipped ? rawTopColor : rawBottomColor

  // Player positions on the court
  interface CourtPlayer {
    player: PlayerInfo
    side: 'top' | 'bottom'
    courtBox: 'even' | 'odd'
    x: number
    y: number
    radius: number
    roleLabel: string
  }

  const courtPlayers: CourtPlayer[] = []

  // Top Side service centers
  const topY = netY - shortServiceLine - (netY - shortServiceLine - (mode === 'doubles' ? longServiceLineDoubles : 0)) / 2 // ~270
  // Bottom Side service centers
  const bottomY = netY + shortServiceLine + (courtHeight - (mode === 'doubles' ? longServiceLineDoubles : 0) - (netY + shortServiceLine)) / 2 // ~1070

  const topPlayers = isFlipped ? players.slice(mode === 'singles' ? 1 : 2) : players.slice(0, mode === 'singles' ? 1 : 2)
  const bottomPlayers = isFlipped ? players.slice(0, mode === 'singles' ? 1 : 2) : players.slice(mode === 'singles' ? 1 : 2)

  if (mode === 'singles') {
    if (topPlayers[0]) {
      courtPlayers.push({
        player: topPlayers[0],
        side: 'top',
        courtBox: 'even',
        x: fullWidth / 2,
        y: topY,
        radius: 46,
        roleLabel: isFlipped ? 'Side B' : 'Side A',
      })
    }
    if (bottomPlayers[0]) {
      courtPlayers.push({
        player: bottomPlayers[0],
        side: 'bottom',
        courtBox: 'even',
        x: fullWidth / 2,
        y: bottomY,
        radius: 46,
        roleLabel: isFlipped ? 'Side A' : 'Side B',
      })
    }
  } else {
    // Doubles: 2 players per side
    // Top side: Left & Right service court positions
    if (topPlayers[0]) {
      courtPlayers.push({
        player: topPlayers[0],
        side: 'top',
        courtBox: 'even',
        x: playLeft + halfPlayWidth * 0.48,
        y: topY,
        radius: 40,
        roleLabel: 'Right / Even',
      })
    }
    if (topPlayers[1]) {
      courtPlayers.push({
        player: topPlayers[1],
        side: 'top',
        courtBox: 'odd',
        x: playLeft + halfPlayWidth * 1.52,
        y: topY,
        radius: 40,
        roleLabel: 'Left / Odd',
      })
    }

    // Bottom side: Left & Right service court positions
    if (bottomPlayers[0]) {
      courtPlayers.push({
        player: bottomPlayers[0],
        side: 'bottom',
        courtBox: 'odd',
        x: playLeft + halfPlayWidth * 0.48,
        y: bottomY,
        radius: 40,
        roleLabel: 'Left / Odd',
      })
    }
    if (bottomPlayers[1]) {
      courtPlayers.push({
        player: bottomPlayers[1],
        side: 'bottom',
        courtBox: 'even',
        x: playLeft + halfPlayWidth * 1.52,
        y: bottomY,
        radius: 40,
        roleLabel: 'Right / Even',
      })
    }
  }

  // Active server resolution
  const activeServer = courtPlayers.find((cp) => cp.player.id === servingPlayerId) || courtPlayers[0]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
      <svg
        viewBox={`-${apronX} -${apronY} ${fullWidth + apronX * 2} ${courtHeight + apronY * 2}`}
        className="w-full h-full max-h-full drop-shadow-2xl"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Main Court Surface Gradient */}
          <linearGradient id={`courtGrad-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={palette.courtGradient[0]} />
            <stop offset="50%" stopColor={palette.courtGradient[1]} />
            <stop offset="100%" stopColor={palette.courtGradient[2]} />
          </linearGradient>

          {/* Stadium Floodlight Reflection Overlay */}
          <radialGradient id={`lighting-${uniqueId}`} cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.02)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
          </radialGradient>

          {/* Side A / Top Ambient Glow */}
          <linearGradient id={`topGlow-${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={topColor} stopOpacity="0.25" />
            <stop offset="70%" stopColor={topColor} stopOpacity="0.05" />
            <stop offset="100%" stopColor={topColor} stopOpacity="0" />
          </linearGradient>

          {/* Side B / Bottom Ambient Glow */}
          <linearGradient id={`bottomGlow-${uniqueId}`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor={bottomColor} stopOpacity="0.25" />
            <stop offset="70%" stopColor={bottomColor} stopOpacity="0.05" />
            <stop offset="100%" stopColor={bottomColor} stopOpacity="0" />
          </linearGradient>

          {/* Diagonal Service Target Highlight */}
          <radialGradient id={`serviceTarget-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(251, 191, 36, 0.45)" />
            <stop offset="100%" stopColor="rgba(251, 191, 36, 0.05)" />
          </radialGradient>

          {/* Realistic Net Mesh Pattern */}
          <pattern id={`netMesh-${uniqueId}`} x="0" y="0" width="8" height="6" patternUnits="userSpaceOnUse">
            <rect width="8" height="6" fill="#1e293b" fillOpacity="0.65" />
            <line x1="0" y1="0" x2="8" y2="0" stroke="rgba(255,255,255,0.55)" strokeWidth="0.6" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
          </pattern>

          {/* Parquet / Wood grain stripe simulation */}
          {palette.woodGrain && (
            <pattern id={`woodPlanks-${uniqueId}`} width="610" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="610" y2="0" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
              <line x1="0" y1="10" x2="610" y2="10" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            </pattern>
          )}

          {/* 3D Net Shadow Filter */}
          <filter id={`netShadow-${uniqueId}`} x="-20%" y="-100%" width="140%" height="300%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
            <feOffset dx="0" dy="8" />
            <feComponentTransfer><feFuncA type="linear" slope="0.45" /></feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Player Avatar Clip Paths */}
          {courtPlayers.map((cp) => (
            <clipPath key={`clip-${cp.player.id}`} id={`clip-${uniqueId}-${cp.player.id}`}>
              <circle cx={cp.x} cy={cp.y} r={cp.radius} />
            </clipPath>
          ))}

          {/* Token Drop Shadow */}
          <filter id={`tokenShadow-${uniqueId}`} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="rgba(0,0,0,0.6)" />
          </filter>
        </defs>

        {/* ======================================================== */}
        {/* 1. STADIUM APRON / ARENA RUN-OFF SURROUND                */}
        {/* ======================================================== */}
        <rect
          x={-apronX}
          y={-apronY}
          width={fullWidth + apronX * 2}
          height={courtHeight + apronY * 2}
          rx="18"
          fill={palette.apronColor}
          stroke={palette.apronBorder}
          strokeWidth="3"
        />

        {/* Stadium perimeter line */}
        <rect
          x={-apronX + 10}
          y={-apronY + 10}
          width={fullWidth + (apronX - 10) * 2}
          height={courtHeight + (apronY - 10) * 2}
          rx="12"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.5"
          strokeDasharray="12 8"
        />

        {/* BWF Arena Title on Apron */}
        <text
          x={fullWidth / 2}
          y={-apronY + 28}
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)"
          fontSize="11"
          fontWeight="bold"
          letterSpacing="0.25em"
        >
          BWF REGULATION BADMINTON COURT • 13.40M × 6.10M
        </text>

        {/* ======================================================== */}
        {/* 2. MAIN COURT PLAYING SURFACE                           */}
        {/* ======================================================== */}
        <rect
          x="0"
          y="0"
          width={fullWidth}
          height={courtHeight}
          rx="6"
          fill={`url(#courtGrad-${uniqueId})`}
        />

        {/* Wood planks overlay if timber theme */}
        {palette.woodGrain && (
          <rect
            x="0"
            y="0"
            width={fullWidth}
            height={courtHeight}
            fill={`url(#woodPlanks-${uniqueId})`}
            pointerEvents="none"
          />
        )}

        {/* Stadium Overhead Floodlight Vignette */}
        <rect
          x="0"
          y="0"
          width={fullWidth}
          height={courtHeight}
          fill={`url(#lighting-${uniqueId})`}
          pointerEvents="none"
        />

        {/* Side A / Side B Ambient Team Glows */}
        <rect
          x="0"
          y="0"
          width={fullWidth}
          height={netY}
          fill={`url(#topGlow-${uniqueId})`}
          pointerEvents="none"
        />
        <rect
          x="0"
          y={netY}
          width={fullWidth}
          height={courtHeight - netY}
          fill={`url(#bottomGlow-${uniqueId})`}
          pointerEvents="none"
        />

        {/* ======================================================== */}
        {/* 3. SHADED FAULT & NON-SERVICE ZONES                      */}
        {/* ======================================================== */}
        {/* Singles Mode: Tramline Alleys Shaded */}
        {mode === 'singles' && (
          <>
            <rect
              x="0"
              y="0"
              width={sideTramWidth}
              height={courtHeight}
              fill="rgba(0,0,0,0.22)"
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

        {/* Doubles Mode: Back Service Alleys subtle shading */}
        {mode === 'doubles' && (
          <>
            <rect
              x="0"
              y="0"
              width={fullWidth}
              height={longServiceLineDoubles}
              fill={palette.doublesAlleyTint}
              pointerEvents="none"
            />
            <rect
              x="0"
              y={courtHeight - longServiceLineDoubles}
              width={fullWidth}
              height={longServiceLineDoubles}
              fill={palette.doublesAlleyTint}
              pointerEvents="none"
            />
          </>
        )}

        {/* Neutral Net Zone (1.98m from net on each side) */}
        <rect
          x="0"
          y={netY - shortServiceLine}
          width={fullWidth}
          height={shortServiceLine * 2}
          fill={palette.neutralZoneTint}
          pointerEvents="none"
        />

        {/* ======================================================== */}
        {/* 4. OFFICIAL BWF REGULATION COURT LINES                   */}
        {/* ======================================================== */}
        {/* Outer Doubles Boundary Box */}
        <rect
          x="0"
          y="0"
          width={fullWidth}
          height={courtHeight}
          fill="none"
          stroke={palette.lineColor}
          strokeWidth="4"
          rx="2"
          style={{ filter: `drop-shadow(0 0 3px ${palette.lineGlow})` }}
        />

        {/* Singles Sidelines (0.46m inside) */}
        <line
          x1={singlesLeft}
          y1="0"
          x2={singlesLeft}
          y2={courtHeight}
          stroke={palette.lineColor}
          strokeWidth={mode === 'singles' ? '3.5' : '2'}
          opacity={mode === 'singles' ? 1 : 0.55}
        />
        <line
          x1={singlesRight}
          y1="0"
          x2={singlesRight}
          y2={courtHeight}
          stroke={palette.lineColor}
          strokeWidth={mode === 'singles' ? '3.5' : '2'}
          opacity={mode === 'singles' ? 1 : 0.55}
        />

        {/* Short Service Lines (1.98m from net) */}
        <line
          x1="0"
          y1={netY - shortServiceLine}
          x2={fullWidth}
          y2={netY - shortServiceLine}
          stroke={palette.lineColor}
          strokeWidth="3.5"
        />
        <line
          x1="0"
          y1={netY + shortServiceLine}
          x2={fullWidth}
          y2={netY + shortServiceLine}
          stroke={palette.lineColor}
          strokeWidth="3.5"
        />

        {/* Doubles Long Service Lines (0.76m inside back boundary) */}
        {mode === 'doubles' && (
          <>
            <line
              x1="0"
              y1={longServiceLineDoubles}
              x2={fullWidth}
              y2={longServiceLineDoubles}
              stroke={palette.lineColor}
              strokeWidth="2.5"
              opacity="0.8"
            />
            <line
              x1="0"
              y1={courtHeight - longServiceLineDoubles}
              x2={fullWidth}
              y2={courtHeight - longServiceLineDoubles}
              stroke={palette.lineColor}
              strokeWidth="2.5"
              opacity="0.8"
            />
          </>
        )}

        {/* Center Lines (Runs ONLY between short service line and back boundary!) */}
        {/* Top Side Center Line */}
        <line
          x1={fullWidth / 2}
          y1="0"
          x2={fullWidth / 2}
          y2={netY - shortServiceLine}
          stroke={palette.lineColor}
          strokeWidth="3"
        />
        {/* Bottom Side Center Line */}
        <line
          x1={fullWidth / 2}
          y1={netY + shortServiceLine}
          x2={fullWidth / 2}
          y2={courtHeight}
          stroke={palette.lineColor}
          strokeWidth="3"
        />

        {/* ======================================================== */}
        {/* 5. TACTICAL / BWF MEASUREMENT & ZONE GUIDES              */}
        {/* ======================================================== */}
        {showGuides && (
          <g opacity="0.75" pointerEvents="none">
            {/* Net Neutral Zone label */}
            <text
              x={fullWidth / 2}
              y={netY - shortServiceLine / 2}
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize="12"
              fontWeight="bold"
              letterSpacing="0.1em"
            >
              NON-SERVICE ZONE (1.98M)
            </text>
            <text
              x={fullWidth / 2}
              y={netY + shortServiceLine / 2}
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize="12"
              fontWeight="bold"
              letterSpacing="0.1em"
            >
              NON-SERVICE ZONE (1.98M)
            </text>

            {/* Top Service Boxes: Right / Left indicators */}
            <text
              x={playLeft + halfPlayWidth * 0.5}
              y={netY - shortServiceLine - 30}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="13"
              fontWeight="bold"
            >
              RIGHT (EVEN)
            </text>
            <text
              x={playLeft + halfPlayWidth * 1.5}
              y={netY - shortServiceLine - 30}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="13"
              fontWeight="bold"
            >
              LEFT (ODD)
            </text>

            {/* Bottom Service Boxes: Left / Right indicators */}
            <text
              x={playLeft + halfPlayWidth * 0.5}
              y={netY + shortServiceLine + 40}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="13"
              fontWeight="bold"
            >
              LEFT (ODD)
            </text>
            <text
              x={playLeft + halfPlayWidth * 1.5}
              y={netY + shortServiceLine + 40}
              textAnchor="middle"
              fill="rgba(255,255,255,0.5)"
              fontSize="13"
              fontWeight="bold"
            >
              RIGHT (EVEN)
            </text>

            {/* Doubles back tramline label */}
            {mode === 'doubles' && (
              <>
                <text
                  x={fullWidth / 2}
                  y={longServiceLineDoubles / 2 + 4}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.45)"
                  fontSize="11"
                  fontWeight="600"
                >
                  DOUBLES BACK SERVICE ALLEY (0.76M)
                </text>
                <text
                  x={fullWidth / 2}
                  y={courtHeight - longServiceLineDoubles / 2 + 4}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.45)"
                  fontSize="11"
                  fontWeight="600"
                >
                  DOUBLES BACK SERVICE ALLEY (0.76M)
                </text>
              </>
            )}
          </g>
        )}

        {/* ======================================================== */}
        {/* 6. INTERACTIVE SERVICE COURT SECTORS                     */}
        {/* ======================================================== */}
        {[
          { id: 'top-left', name: 'Top Right (Even)', x: playLeft, y: mode === 'doubles' ? longServiceLineDoubles : 0, w: halfPlayWidth, h: netY - shortServiceLine - (mode === 'doubles' ? longServiceLineDoubles : 0) },
          { id: 'top-right', name: 'Top Left (Odd)', x: playLeft + halfPlayWidth, y: mode === 'doubles' ? longServiceLineDoubles : 0, w: halfPlayWidth, h: netY - shortServiceLine - (mode === 'doubles' ? longServiceLineDoubles : 0) },
          { id: 'bottom-left', name: 'Bottom Left (Odd)', x: playLeft, y: netY + shortServiceLine, w: halfPlayWidth, h: courtHeight - (netY + shortServiceLine) - (mode === 'doubles' ? longServiceLineDoubles : 0) },
          { id: 'bottom-right', name: 'Bottom Right (Even)', x: playLeft + halfPlayWidth, y: netY + shortServiceLine, w: halfPlayWidth, h: courtHeight - (netY + shortServiceLine) - (mode === 'doubles' ? longServiceLineDoubles : 0) },
        ].map((box) => {
          const isActive = activeZone === box.id
          return (
            <rect
              key={box.id}
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h}
              fill={isActive ? 'rgba(255,255,255,0.18)' : 'transparent'}
              stroke={isActive ? 'white' : 'transparent'}
              strokeWidth="2.5"
              className="cursor-pointer transition-colors"
              onClick={() => setActiveZone(activeZone === box.id ? null : box.id)}
            />
          )
        })}

        {/* ======================================================== */}
        {/* 7. REALISTIC 3D NET WITH POSTS & TENSION CORDS           */}
        {/* ======================================================== */}
        <g filter={`url(#netShadow-${uniqueId})`}>
          {/* Net Mesh Body (15.5cm wide in scaled units = ~20 units) */}
          <rect
            x="-20"
            y={netY - 12}
            width={fullWidth + 40}
            height="24"
            fill={`url(#netMesh-${uniqueId})`}
            rx="1"
          />

          {/* Net Top White Cord Tape (75mm white vinyl band) */}
          <rect
            x="-20"
            y={netY - 13}
            width={fullWidth + 40}
            height="5"
            fill="#ffffff"
            rx="1"
          />
          {/* Center net cable crease */}
          <line
            x1="-20"
            y1={netY - 10.5}
            x2={fullWidth + 20}
            y2={netY - 10.5}
            stroke="#94a3b8"
            strokeWidth="0.8"
          />

          {/* Bottom tape */}
          <line
            x1="-20"
            y1={netY + 12}
            x2={fullWidth + 20}
            y2={netY + 12}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.5"
          />

          {/* Left Steel Post (1.55m height post placed on doubles sideline) */}
          <g transform={`translate(-8, ${netY})`}>
            {/* Post shadow */}
            <ellipse cx="0" cy="5" rx="7" ry="3" fill="rgba(0,0,0,0.5)" />
            {/* Metallic cylinder post */}
            <rect x="-6" y="-18" width="12" height="36" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            <rect x="-4" y="-16" width="3" height="32" rx="1" fill="#94a3b8" opacity="0.6" />
            {/* Tension wheel / cap */}
            <circle cx="0" cy="-18" r="5" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
          </g>

          {/* Right Steel Post */}
          <g transform={`translate(${fullWidth + 8}, ${netY})`}>
            {/* Post shadow */}
            <ellipse cx="0" cy="5" rx="7" ry="3" fill="rgba(0,0,0,0.5)" />
            {/* Metallic cylinder post */}
            <rect x="-6" y="-18" width="12" height="36" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            <rect x="-4" y="-16" width="3" height="32" rx="1" fill="#94a3b8" opacity="0.6" />
            {/* Tension wheel / cap */}
            <circle cx="0" cy="-18" r="5" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
          </g>

          {/* Center Net Height Badge */}
          <g transform={`translate(${fullWidth / 2}, ${netY})`}>
            <rect x="-38" y="-7" width="76" height="14" rx="7" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
            <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
              NET • 1.524M
            </text>
          </g>
        </g>

        {/* ======================================================== */}
        {/* 8. BROADCAST END LABELS / TEAM BANNERS                   */}
        {/* ======================================================== */}
        {/* Top Side Banner */}
        <g transform={`translate(${fullWidth / 2}, -24)`}>
          <rect
            x="-110"
            y="-14"
            width="220"
            height="28"
            rx="14"
            fill="#0f172a"
            stroke={topColor}
            strokeWidth="2"
            filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))"
          />
          <circle cx="-92" cy="0" r="5" fill={topColor} />
          <text
            x="-4"
            y="4"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
            letterSpacing="0.1em"
          >
            {isFlipped
              ? mode === 'singles' ? 'SIDE B (BOTTOM)' : 'TEAM B'
              : mode === 'singles' ? 'SIDE A (TOP)' : 'TEAM A'}
          </text>
        </g>

        {/* Bottom Side Banner */}
        <g transform={`translate(${fullWidth / 2}, ${courtHeight + 24})`}>
          <rect
            x="-110"
            y="-14"
            width="220"
            height="28"
            rx="14"
            fill="#0f172a"
            stroke={bottomColor}
            strokeWidth="2"
            filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))"
          />
          <circle cx="-92" cy="0" r="5" fill={bottomColor} />
          <text
            x="-4"
            y="4"
            textAnchor="middle"
            fill="white"
            fontSize="12"
            fontWeight="bold"
            letterSpacing="0.1em"
          >
            {isFlipped
              ? mode === 'singles' ? 'SIDE A (TOP)' : 'TEAM A'
              : mode === 'singles' ? 'SIDE B (BOTTOM)' : 'TEAM B'}
          </text>
        </g>

        {/* ======================================================== */}
        {/* 9. PLAYER CARDS & TOKENS ON COURT                        */}
        {/* ======================================================== */}
        {courtPlayers.map((cp) => {
          const { player, x, y, radius, roleLabel } = cp
          const isServing = activeServer?.player.id === player.id
          const initials = getInitials(player.name, 'P')
          const pillWidth = Math.max(90, Math.min(150, (player.name.length || 6) * 10 + 36))

          return (
            <g
              key={player.id}
              onClick={(e) => {
                e.stopPropagation()
                onSelectServer?.(player.id)
              }}
              className="cursor-pointer transition-transform hover:scale-105"
              filter={`url(#tokenShadow-${uniqueId})`}
            >
              {/* Outer Pulsing Glow if this player is currently serving */}
              {isServing && (
                <circle
                  cx={x}
                  cy={y}
                  r={radius + 9}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  className="animate-spin"
                  style={{ transformOrigin: `${x}px ${y}px`, animationDuration: '8s' }}
                />
              )}

              {/* Player Avatar Mask or Colored Circle */}
              {player.avatar ? (
                <>
                  <circle cx={x} cy={y} r={radius} fill="#1e293b" />
                  <image
                    href={player.avatar}
                    x={x - radius}
                    y={y - radius}
                    width={radius * 2}
                    height={radius * 2}
                    clipPath={`url(#clip-${uniqueId}-${player.id})`}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </>
              ) : (
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={player.color}
                  fillOpacity="0.9"
                />
              )}

              {/* Multi-layered Bezel Border */}
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill="none"
                stroke={isServing ? '#fbbf24' : player.color}
                strokeWidth="4.5"
              />
              <circle
                cx={x}
                cy={y}
                r={radius - 3}
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.5"
              />

              {/* Initials Fallback if no photo */}
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
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}
                >
                  {initials}
                </text>
              )}

              {/* Serving Badge */}
              {isServing && (
                <g transform={`translate(${x + radius - 4}, ${y - radius + 4})`}>
                  <circle cx="0" cy="0" r="13" fill="#fbbf24" stroke="#ffffff" strokeWidth="2" />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    🏸
                  </text>
                </g>
              )}

              {/* Name Pill Badge positioned below avatar */}
              <g transform={`translate(${x}, ${y + radius + 18})`}>
                <rect
                  x={-pillWidth / 2}
                  y="-12"
                  width={pillWidth}
                  height="25"
                  rx="12.5"
                  fill="#0f172a"
                  fillOpacity="0.95"
                  stroke={isServing ? '#fbbf24' : player.color}
                  strokeWidth="1.5"
                />
                {/* Status Dot */}
                <circle cx={-pillWidth / 2 + 10} cy="0.5" r="4" fill={isServing ? '#fbbf24' : player.color} />
                {/* Player Name */}
                <text
                  x="4"
                  y="1.5"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {player.name || 'Player'}
                </text>
              </g>

              {/* Role / Court Position subtitle */}
              <g transform={`translate(${x}, ${y + radius + 38})`}>
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.7)"
                  fontSize="10"
                  fontWeight="600"
                  letterSpacing="0.05em"
                >
                  {isServing ? '★ SERVING' : roleLabel}
                </text>
              </g>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
