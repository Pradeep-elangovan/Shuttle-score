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
    doublesAlleyTint: 'rgba(239, 68, 68, 0.12)',
  },
  olympic: {
    courtGradient: ['#0f766e', '#115e59', '#0f766e'],
    apronColor: '#042f2e',
    apronBorder: '#021f1e',
    lineColor: '#ffffff',
    lineGlow: 'rgba(255,255,255,0.45)',
    neutralZoneTint: 'rgba(0,0,0,0.08)',
    doublesAlleyTint: 'rgba(239, 68, 68, 0.12)',
  },
  hardwood: {
    courtGradient: ['#ca8a04', '#a16207', '#ca8a04'],
    apronColor: '#451a03',
    apronBorder: '#290f02',
    lineColor: '#ffffff',
    lineGlow: 'rgba(255,255,255,0.35)',
    woodGrain: true,
    neutralZoneTint: 'rgba(0,0,0,0.07)',
    doublesAlleyTint: 'rgba(239, 68, 68, 0.12)',
  },
  midnight: {
    courtGradient: ['#1e293b', '#0f172a', '#1e293b'],
    apronColor: '#050811',
    apronBorder: '#020408',
    lineColor: '#38bdf8',
    lineGlow: 'rgba(56,189,248,0.5)',
    neutralZoneTint: 'rgba(56,189,248,0.03)',
    doublesAlleyTint: 'rgba(239, 68, 68, 0.15)',
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
  const [selectedZoneInfo, setSelectedZoneInfo] = useState<{
    id: string
    title: string
    desc: string
  } | null>(null)

  const uniqueId = useId()
  const palette = THEME_PALETTES[theme]

  // BWF Official Court Dimensions in units (1m = 100 units)
  const fullWidth = 610 // 6.10m
  const courtHeight = 1340 // 13.40m
  const netY = courtHeight / 2 // 670 (0m center)

  const shortServiceLine = 198 // 1.98m from net (y = 472 and y = 868)
  const longServiceLineDoubles = 76 // 0.76m (76cm) inside back boundary
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
    x: number
    y: number
    radius: number
    roleLabel: string
  }

  const courtPlayers: CourtPlayer[] = []

  // Top Side service centers (centered in main service box between y=76 and y=472)
  const topY = longServiceLineDoubles + (netY - shortServiceLine - longServiceLineDoubles) / 2 // 76 + 396/2 = 274
  // Bottom Side service centers (centered in main service box between y=868 and y=1264)
  const bottomY = netY + shortServiceLine + (courtHeight - longServiceLineDoubles - (netY + shortServiceLine)) / 2 // 868 + 396/2 = 1066

  const topPlayers = isFlipped
    ? players.slice(mode === 'singles' ? 1 : 2)
    : players.slice(0, mode === 'singles' ? 1 : 2)
  const bottomPlayers = isFlipped
    ? players.slice(0, mode === 'singles' ? 1 : 2)
    : players.slice(mode === 'singles' ? 1 : 2)

  if (mode === 'singles') {
    if (topPlayers[0]) {
      courtPlayers.push({
        player: topPlayers[0],
        side: 'top',
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
        x: fullWidth / 2,
        y: bottomY,
        radius: 46,
        roleLabel: isFlipped ? 'Side A' : 'Side B',
      })
    }
  } else {
    // Doubles: 2 players per side
    if (topPlayers[0]) {
      courtPlayers.push({
        player: topPlayers[0],
        side: 'top',
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
        x: playLeft + halfPlayWidth * 1.52,
        y: topY,
        radius: 40,
        roleLabel: 'Left / Odd',
      })
    }

    if (bottomPlayers[0]) {
      courtPlayers.push({
        player: bottomPlayers[0],
        side: 'bottom',
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
      {/* Zone Info Toast / Explainer Popover */}
      {selectedZoneInfo && (
        <div
          onClick={() => setSelectedZoneInfo(null)}
          className="absolute top-2 left-4 right-4 z-30 bg-slate-900/95 border border-primary/40 
                     rounded-2xl p-3 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 cursor-pointer animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex-1">
            <h3 className="text-xs font-bold text-primary-light flex items-center gap-1.5">
              <span>🏸</span> {selectedZoneInfo.title}
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              {selectedZoneInfo.desc}
            </p>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded-md shrink-0">
            Dismiss ✕
          </span>
        </div>
      )}

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

          {/* Stadium Floodlight Vignette */}
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

          {/* Back Box Diagonal Hatch Warning Pattern for Doubles */}
          <pattern
            id={`backBoxHatch-${uniqueId}`}
            width="14"
            height="14"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <rect width="14" height="14" fill="rgba(239, 68, 68, 0.08)" />
            <line x1="0" y1="0" x2="0" y2="14" stroke="rgba(239, 68, 68, 0.28)" strokeWidth="2.5" />
          </pattern>

          {/* Net Mesh Pattern */}
          <pattern id={`netMesh-${uniqueId}`} x="0" y="0" width="8" height="6" patternUnits="userSpaceOnUse">
            <rect width="8" height="6" fill="#1e293b" fillOpacity="0.65" />
            <line x1="0" y1="0" x2="8" y2="0" stroke="rgba(255,255,255,0.55)" strokeWidth="0.6" />
            <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />
          </pattern>

          {/* Wood Planks Overlay */}
          {palette.woodGrain && (
            <pattern id={`woodPlanks-${uniqueId}`} width="610" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="610" y2="0" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
              <line x1="0" y1="10" x2="610" y2="10" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            </pattern>
          )}

          {/* Net Shadow */}
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
        {/* 1. STADIUM APRON / ARENA SURROUND                        */}
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
        {/* 2. MAIN COURT SURFACE & LIGHTING                         */}
        {/* ======================================================== */}
        <rect
          x="0"
          y="0"
          width={fullWidth}
          height={courtHeight}
          rx="6"
          fill={`url(#courtGrad-${uniqueId})`}
        />

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

        <rect
          x="0"
          y="0"
          width={fullWidth}
          height={courtHeight}
          fill={`url(#lighting-${uniqueId})`}
          pointerEvents="none"
        />

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
        {/* 3. THE BACK BOXES (0.76m Rear Gallery / Service Limit)   */}
        {/* ======================================================== */}
        {/* Top Back Box Area (y = 0 to y = 76) */}
        <g
          className="cursor-pointer"
          onClick={() =>
            setSelectedZoneInfo({
              id: 'top-back-box',
              title: 'Top Back Box / Rear Gallery (0.76m)',
              desc:
                mode === 'doubles'
                  ? 'In Doubles: OUT for service (serves landing here are a fault). IN during rallies.'
                  : 'In Singles: IN for both service and rallies (singles back service boundary is the outer baseline).',
            })
          }
        >
          <rect
            x="0"
            y="0"
            width={fullWidth}
            height={longServiceLineDoubles}
            fill={mode === 'doubles' ? `url(#backBoxHatch-${uniqueId})` : 'rgba(255,255,255,0.04)'}
            stroke={selectedZoneInfo?.id === 'top-back-box' ? '#fbbf24' : 'transparent'}
            strokeWidth="2"
          />
        </g>

        {/* Bottom Back Box Area (y = 1264 to y = 1340) */}
        <g
          className="cursor-pointer"
          onClick={() =>
            setSelectedZoneInfo({
              id: 'bottom-back-box',
              title: 'Bottom Back Box / Rear Gallery (0.76m)',
              desc:
                mode === 'doubles'
                  ? 'In Doubles: OUT for service (serves landing here are a fault). IN during rallies.'
                  : 'In Singles: IN for both service and rallies (singles back service boundary is the outer baseline).',
            })
          }
        >
          <rect
            x="0"
            y={courtHeight - longServiceLineDoubles}
            width={fullWidth}
            height={longServiceLineDoubles}
            fill={mode === 'doubles' ? `url(#backBoxHatch-${uniqueId})` : 'rgba(255,255,255,0.04)'}
            stroke={selectedZoneInfo?.id === 'bottom-back-box' ? '#fbbf24' : 'transparent'}
            strokeWidth="2"
          />
        </g>

        {/* Side Tramlines (when in singles mode: OUT for both serve & rally) */}
        {mode === 'singles' && (
          <>
            <rect
              x="0"
              y="0"
              width={sideTramWidth}
              height={courtHeight}
              fill="rgba(0,0,0,0.24)"
              pointerEvents="none"
            />
            <rect
              x={fullWidth - sideTramWidth}
              y="0"
              width={sideTramWidth}
              height={courtHeight}
              fill="rgba(0,0,0,0.24)"
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
        {/* 4. OFFICIAL BWF REGULATION COURT LINES (ALL DRAWN)       */}
        {/* ======================================================== */}
        {/* Outer Boundary Box (13.4m × 6.1m) */}
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
          opacity={mode === 'singles' ? 1 : 0.6}
        />
        <line
          x1={singlesRight}
          y1="0"
          x2={singlesRight}
          y2={courtHeight}
          stroke={palette.lineColor}
          strokeWidth={mode === 'singles' ? '3.5' : '2'}
          opacity={mode === 'singles' ? 1 : 0.6}
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

        {/* ======================================================== */}
        {/* DOUBLES LONG SERVICE LINES / BACK BOX BOUNDARY (0.76m)   */}
        {/* ALWAYS DRAWN CLEARLY ON BOTH SIDES REGARDLESS OF MODE!   */}
        {/* ======================================================== */}
        {/* Top Back Box Line (y = 76) */}
        <line
          x1="0"
          y1={longServiceLineDoubles}
          x2={fullWidth}
          y2={longServiceLineDoubles}
          stroke={palette.lineColor}
          strokeWidth="3.5"
          opacity={mode === 'doubles' ? 1 : 0.75}
        />
        {/* Bottom Back Box Line (y = 1264) */}
        <line
          x1="0"
          y1={courtHeight - longServiceLineDoubles}
          x2={fullWidth}
          y2={courtHeight - longServiceLineDoubles}
          stroke={palette.lineColor}
          strokeWidth="3.5"
          opacity={mode === 'doubles' ? 1 : 0.75}
        />

        {/* Center Lines (Runs between Short Service Line and Back Boundary, dividing Back Box too!) */}
        {/* Top Center Line */}
        <line
          x1={fullWidth / 2}
          y1="0"
          x2={fullWidth / 2}
          y2={netY - shortServiceLine}
          stroke={palette.lineColor}
          strokeWidth="3"
        />
        {/* Bottom Center Line */}
        <line
          x1={fullWidth / 2}
          y1={netY + shortServiceLine}
          x2={fullWidth / 2}
          y2={courtHeight}
          stroke={palette.lineColor}
          strokeWidth="3"
        />

        {/* ======================================================== */}
        {/* 5. BACK BOX LABELS & TACTICAL GUIDES                     */}
        {/* ======================================================== */}
        {showGuides && (
          <g pointerEvents="none">
            {/* Top Back Box Prominent Badge */}
            <g transform={`translate(${fullWidth / 2}, 38)`}>
              <rect
                x="-125"
                y="-13"
                width="250"
                height="26"
                rx="13"
                fill="#0f172a"
                fillOpacity="0.88"
                stroke={mode === 'doubles' ? '#ef4444' : '#10b981'}
                strokeWidth="1.5"
              />
              <circle cx="-106" cy="0" r="4.5" fill={mode === 'doubles' ? '#ef4444' : '#10b981'} />
              <text
                x="6"
                y="3.5"
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="bold"
                letterSpacing="0.06em"
              >
                {mode === 'doubles' ? 'BACK BOX (0.76M) • OUT ON SERVE' : 'BACK BOX (0.76M) • IN'}
              </text>
            </g>

            {/* Bottom Back Box Prominent Badge */}
            <g transform={`translate(${fullWidth / 2}, ${courtHeight - 38})`}>
              <rect
                x="-125"
                y="-13"
                width="250"
                height="26"
                rx="13"
                fill="#0f172a"
                fillOpacity="0.88"
                stroke={mode === 'doubles' ? '#ef4444' : '#10b981'}
                strokeWidth="1.5"
              />
              <circle cx="-106" cy="0" r="4.5" fill={mode === 'doubles' ? '#ef4444' : '#10b981'} />
              <text
                x="6"
                y="3.5"
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="bold"
                letterSpacing="0.06em"
              >
                {mode === 'doubles' ? 'BACK BOX (0.76M) • OUT ON SERVE' : 'BACK BOX (0.76M) • IN'}
              </text>
            </g>

            {/* Non-Service Zone Labels (1.98m from net) */}
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

            {/* Main Service Box Indicators */}
            <text
              x={playLeft + halfPlayWidth * 0.5}
              y={netY - shortServiceLine - 24}
              textAnchor="middle"
              fill="rgba(255,255,255,0.55)"
              fontSize="13"
              fontWeight="bold"
            >
              RIGHT (EVEN)
            </text>
            <text
              x={playLeft + halfPlayWidth * 1.5}
              y={netY - shortServiceLine - 24}
              textAnchor="middle"
              fill="rgba(255,255,255,0.55)"
              fontSize="13"
              fontWeight="bold"
            >
              LEFT (ODD)
            </text>

            <text
              x={playLeft + halfPlayWidth * 0.5}
              y={netY + shortServiceLine + 34}
              textAnchor="middle"
              fill="rgba(255,255,255,0.55)"
              fontSize="13"
              fontWeight="bold"
            >
              LEFT (ODD)
            </text>
            <text
              x={playLeft + halfPlayWidth * 1.5}
              y={netY + shortServiceLine + 34}
              textAnchor="middle"
              fill="rgba(255,255,255,0.55)"
              fontSize="13"
              fontWeight="bold"
            >
              RIGHT (EVEN)
            </text>
          </g>
        )}

        {/* ======================================================== */}
        {/* 6. INTERACTIVE MAIN SERVICE SECTORS                      */}
        {/* ======================================================== */}
        {[
          {
            id: 'top-right-even',
            title: 'Top Right Service Box (Even)',
            desc: 'Serving from Even score (0, 2, 4...) diagonally to Bottom Right (Even).',
            x: playLeft,
            y: longServiceLineDoubles,
            w: halfPlayWidth,
            h: netY - shortServiceLine - longServiceLineDoubles,
          },
          {
            id: 'top-left-odd',
            title: 'Top Left Service Box (Odd)',
            desc: 'Serving from Odd score (1, 3, 5...) diagonally to Bottom Left (Odd).',
            x: playLeft + halfPlayWidth,
            y: longServiceLineDoubles,
            w: halfPlayWidth,
            h: netY - shortServiceLine - longServiceLineDoubles,
          },
          {
            id: 'bottom-left-odd',
            title: 'Bottom Left Service Box (Odd)',
            desc: 'Serving from Odd score (1, 3, 5...) diagonally to Top Left (Odd).',
            x: playLeft,
            y: netY + shortServiceLine,
            w: halfPlayWidth,
            h: courtHeight - longServiceLineDoubles - (netY + shortServiceLine),
          },
          {
            id: 'bottom-right-even',
            title: 'Bottom Right Service Box (Even)',
            desc: 'Serving from Even score (0, 2, 4...) diagonally to Top Right (Even).',
            x: playLeft + halfPlayWidth,
            y: netY + shortServiceLine,
            w: halfPlayWidth,
            h: courtHeight - longServiceLineDoubles - (netY + shortServiceLine),
          },
        ].map((box) => {
          const isActive = selectedZoneInfo?.id === box.id
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
              onClick={() =>
                setSelectedZoneInfo(isActive ? null : { id: box.id, title: box.title, desc: box.desc })
              }
            />
          )
        })}

        {/* ======================================================== */}
        {/* 7. REALISTIC 3D NET WITH POSTS & TENSION CORDS           */}
        {/* ======================================================== */}
        <g filter={`url(#netShadow-${uniqueId})`}>
          <rect
            x="-20"
            y={netY - 12}
            width={fullWidth + 40}
            height="24"
            fill={`url(#netMesh-${uniqueId})`}
            rx="1"
          />

          <rect
            x="-20"
            y={netY - 13}
            width={fullWidth + 40}
            height="5"
            fill="#ffffff"
            rx="1"
          />
          <line
            x1="-20"
            y1={netY - 10.5}
            x2={fullWidth + 20}
            y2={netY - 10.5}
            stroke="#94a3b8"
            strokeWidth="0.8"
          />

          <line
            x1="-20"
            y1={netY + 12}
            x2={fullWidth + 20}
            y2={netY + 12}
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.5"
          />

          {/* Left Steel Post */}
          <g transform={`translate(-8, ${netY})`}>
            <ellipse cx="0" cy="5" rx="7" ry="3" fill="rgba(0,0,0,0.5)" />
            <rect x="-6" y="-18" width="12" height="36" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            <rect x="-4" y="-16" width="3" height="32" rx="1" fill="#94a3b8" opacity="0.6" />
            <circle cx="0" cy="-18" r="5" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
          </g>

          {/* Right Steel Post */}
          <g transform={`translate(${fullWidth + 8}, ${netY})`}>
            <ellipse cx="0" cy="5" rx="7" ry="3" fill="rgba(0,0,0,0.5)" />
            <rect x="-6" y="-18" width="12" height="36" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
            <rect x="-4" y="-16" width="3" height="32" rx="1" fill="#94a3b8" opacity="0.6" />
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
        {/* Top Side Banner (on apron) */}
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

        {/* Bottom Side Banner (on apron) */}
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
                <circle cx={-pillWidth / 2 + 10} cy="0.5" r="4" fill={isServing ? '#fbbf24' : player.color} />
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
