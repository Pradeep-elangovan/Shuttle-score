import { useState, useId } from 'react'
import type { PlayerInfo, TeamColors } from '../pages/PlayerSetupPage'
import { getInitials } from '../utils/imageUtils'

export type CourtTheme = 'emerald' | 'olympic' | 'hardwood' | 'midnight'
export type CourtOrientation = 'portrait' | 'landscape'

interface BadmintonCourtProps {
  mode: 'singles' | 'doubles'
  players?: PlayerInfo[]
  teamColors?: TeamColors
  theme?: CourtTheme
  orientation?: CourtOrientation
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
}

const THEME_PALETTES: Record<CourtTheme, ThemePalette> = {
  emerald: {
    courtGradient: ['#1e7e43', '#166534', '#1e7e43'],
    apronColor: '#0f381e',
    apronBorder: '#0b2916',
    lineColor: '#ffffff',
    lineGlow: 'rgba(255,255,255,0.4)',
    neutralZoneTint: 'rgba(0,0,0,0.06)',
  },
  olympic: {
    courtGradient: ['#0f766e', '#115e59', '#0f766e'],
    apronColor: '#042f2e',
    apronBorder: '#021f1e',
    lineColor: '#ffffff',
    lineGlow: 'rgba(255,255,255,0.45)',
    neutralZoneTint: 'rgba(0,0,0,0.08)',
  },
  hardwood: {
    courtGradient: ['#ca8a04', '#a16207', '#ca8a04'],
    apronColor: '#451a03',
    apronBorder: '#290f02',
    lineColor: '#ffffff',
    lineGlow: 'rgba(255,255,255,0.35)',
    woodGrain: true,
    neutralZoneTint: 'rgba(0,0,0,0.07)',
  },
  midnight: {
    courtGradient: ['#1e293b', '#0f172a', '#1e293b'],
    apronColor: '#050811',
    apronBorder: '#020408',
    lineColor: '#38bdf8',
    lineGlow: 'rgba(56,189,248,0.5)',
    neutralZoneTint: 'rgba(56,189,248,0.03)',
  },
}

export default function BadmintonCourt({
  mode,
  players = [],
  teamColors,
  theme = 'emerald',
  orientation = 'portrait',
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
  const isLandscape = orientation === 'landscape'

  // BWF Regulations (1m = 100 units)
  const fullLength = 1340 // 13.40m
  const fullBreadth = 610 // 6.10m
  const netPosition = fullLength / 2 // 670
  const shortServiceLineDist = 198 // 1.98m from net
  const backBoxDepth = 76 // 0.76m (Doubles long service line)
  const sideAlleyWidth = 46 // 0.46m (Singles sideline from doubles)

  // Apron Padding
  const apronX = isLandscape ? 64 : 54
  const apronY = isLandscape ? 54 : 64

  // Dimensions based on orientation
  const courtW = isLandscape ? fullLength : fullBreadth
  const courtH = isLandscape ? fullBreadth : fullLength

  // Colors for side 1 (Top/Left) and side 2 (Bottom/Right)
  const rawSide1Color =
    mode === 'singles'
      ? players[0]?.color || '#ef4444'
      : teamColors?.teamA || players[0]?.color || '#ef4444'

  const rawSide2Color =
    mode === 'singles'
      ? players[1]?.color || '#3b82f6'
      : teamColors?.teamB || players[2]?.color || '#3b82f6'

  const side1Color = isFlipped ? rawSide2Color : rawSide1Color
  const side2Color = isFlipped ? rawSide1Color : rawSide2Color

  // Player Partition
  const side1Players = isFlipped
    ? players.slice(mode === 'singles' ? 1 : 2)
    : players.slice(0, mode === 'singles' ? 1 : 2)
  const side2Players = isFlipped
    ? players.slice(0, mode === 'singles' ? 1 : 2)
    : players.slice(mode === 'singles' ? 1 : 2)

  // Player positions on court
  interface CourtPlayer {
    player: PlayerInfo
    x: number
    y: number
    radius: number
    roleLabel: string
  }

  const courtPlayers: CourtPlayer[] = []

  if (isLandscape) {
    // LANDSCAPE: Net is at X = 670, dividing Left (Side 1) and Right (Side 2)
    const leftCenterServiceX = backBoxDepth + (netPosition - shortServiceLineDist - backBoxDepth) / 2 // ~274
    const rightCenterServiceX = netPosition + shortServiceLineDist + (fullLength - backBoxDepth - (netPosition + shortServiceLineDist)) / 2 // ~1066

    if (mode === 'singles') {
      if (side1Players[0]) {
        courtPlayers.push({
          player: side1Players[0],
          x: leftCenterServiceX,
          y: fullBreadth / 2, // 305
          radius: 46,
          roleLabel: isFlipped ? 'Side B' : 'Side A',
        })
      }
      if (side2Players[0]) {
        courtPlayers.push({
          player: side2Players[0],
          x: rightCenterServiceX,
          y: fullBreadth / 2,
          radius: 46,
          roleLabel: isFlipped ? 'Side A' : 'Side B',
        })
      }
    } else {
      // Doubles Landscape: Left & Right service boxes are Top (Odd) & Bottom (Even) on each side
      if (side1Players[0]) {
        courtPlayers.push({
          player: side1Players[0],
          x: leftCenterServiceX,
          y: fullBreadth * 0.73, // Bottom / Even
          radius: 40,
          roleLabel: 'Right / Even',
        })
      }
      if (side1Players[1]) {
        courtPlayers.push({
          player: side1Players[1],
          x: leftCenterServiceX,
          y: fullBreadth * 0.27, // Top / Odd
          radius: 40,
          roleLabel: 'Left / Odd',
        })
      }

      if (side2Players[0]) {
        courtPlayers.push({
          player: side2Players[0],
          x: rightCenterServiceX,
          y: fullBreadth * 0.27, // Top / Odd
          radius: 40,
          roleLabel: 'Left / Odd',
        })
      }
      if (side2Players[1]) {
        courtPlayers.push({
          player: side2Players[1],
          x: rightCenterServiceX,
          y: fullBreadth * 0.73, // Bottom / Even
          radius: 40,
          roleLabel: 'Right / Even',
        })
      }
    }
  } else {
    // PORTRAIT: Net is at Y = 670, dividing Top (Side 1) and Bottom (Side 2)
    const topCenterServiceY = backBoxDepth + (netPosition - shortServiceLineDist - backBoxDepth) / 2 // ~274
    const bottomCenterServiceY = netPosition + shortServiceLineDist + (fullLength - backBoxDepth - (netPosition + shortServiceLineDist)) / 2 // ~1066

    if (mode === 'singles') {
      if (side1Players[0]) {
        courtPlayers.push({
          player: side1Players[0],
          x: fullBreadth / 2,
          y: topCenterServiceY,
          radius: 46,
          roleLabel: isFlipped ? 'Side B' : 'Side A',
        })
      }
      if (side2Players[0]) {
        courtPlayers.push({
          player: side2Players[0],
          x: fullBreadth / 2,
          y: bottomCenterServiceY,
          radius: 46,
          roleLabel: isFlipped ? 'Side A' : 'Side B',
        })
      }
    } else {
      // Doubles Portrait: Left & Right service boxes
      if (side1Players[0]) {
        courtPlayers.push({
          player: side1Players[0],
          x: fullBreadth * 0.26,
          y: topCenterServiceY,
          radius: 40,
          roleLabel: 'Right / Even',
        })
      }
      if (side1Players[1]) {
        courtPlayers.push({
          player: side1Players[1],
          x: fullBreadth * 0.74,
          y: topCenterServiceY,
          radius: 40,
          roleLabel: 'Left / Odd',
        })
      }

      if (side2Players[0]) {
        courtPlayers.push({
          player: side2Players[0],
          x: fullBreadth * 0.26,
          y: bottomCenterServiceY,
          radius: 40,
          roleLabel: 'Left / Odd',
        })
      }
      if (side2Players[1]) {
        courtPlayers.push({
          player: side2Players[1],
          x: fullBreadth * 0.74,
          y: bottomCenterServiceY,
          radius: 40,
          roleLabel: 'Right / Even',
        })
      }
    }
  }

  const activeServer =
    courtPlayers.find((cp) => cp.player.id === servingPlayerId) || courtPlayers[0]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
      {/* Zone Explainer Popover Toast */}
      {selectedZoneInfo && (
        <div
          onClick={() => setSelectedZoneInfo(null)}
          className="absolute top-2 left-4 right-4 z-30 max-w-md mx-auto bg-slate-900/95 border border-primary/40 
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
        viewBox={`-${apronX} -${apronY} ${courtW + apronX * 2} ${courtH + apronY * 2}`}
        className="w-full h-full max-h-full drop-shadow-2xl"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Main Court Surface Gradient */}
          <linearGradient
            id={`courtGrad-${uniqueId}`}
            x1="0%"
            y1="0%"
            x2={isLandscape ? '100%' : '0%'}
            y2={isLandscape ? '0%' : '100%'}
          >
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

          {/* Side 1 Glow */}
          <linearGradient
            id={`side1Glow-${uniqueId}`}
            x1="0%"
            y1="0%"
            x2={isLandscape ? '100%' : '0%'}
            y2={isLandscape ? '0%' : '100%'}
          >
            <stop offset="0%" stopColor={side1Color} stopOpacity="0.25" />
            <stop offset="70%" stopColor={side1Color} stopOpacity="0.05" />
            <stop offset="100%" stopColor={side1Color} stopOpacity="0" />
          </linearGradient>

          {/* Side 2 Glow */}
          <linearGradient
            id={`side2Glow-${uniqueId}`}
            x1={isLandscape ? '100%' : '0%'}
            y1={isLandscape ? '0%' : '100%'}
            x2="0%"
            y2="0%"
          >
            <stop offset="0%" stopColor={side2Color} stopOpacity="0.25" />
            <stop offset="70%" stopColor={side2Color} stopOpacity="0.05" />
            <stop offset="100%" stopColor={side2Color} stopOpacity="0" />
          </linearGradient>

          {/* Back Box Warning Hatch */}
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
            <pattern
              id={`woodPlanks-${uniqueId}`}
              width={isLandscape ? 20 : 610}
              height={isLandscape ? 610 : 20}
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2={isLandscape ? '0' : '610'}
                y2={isLandscape ? '610' : '0'}
                stroke="rgba(0,0,0,0.06)"
                strokeWidth="1"
              />
              <line
                x1={isLandscape ? '10' : '0'}
                y1={isLandscape ? '0' : '10'}
                x2={isLandscape ? '10' : '610'}
                y2={isLandscape ? '610' : '10'}
                stroke="rgba(255,255,255,0.04)"
                strokeWidth="0.5"
              />
            </pattern>
          )}

          {/* Net Shadow */}
          <filter id={`netShadow-${uniqueId}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
            <feOffset dx={isLandscape ? 8 : 0} dy={isLandscape ? 0 : 8} />
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
        {/* 1. STADIUM APRON / RUN-OFF PERIMETER                     */}
        {/* ======================================================== */}
        <rect
          x={-apronX}
          y={-apronY}
          width={courtW + apronX * 2}
          height={courtH + apronY * 2}
          rx="18"
          fill={palette.apronColor}
          stroke={palette.apronBorder}
          strokeWidth="3"
        />

        <rect
          x={-apronX + 10}
          y={-apronY + 10}
          width={courtW + (apronX - 10) * 2}
          height={courtH + (apronY - 10) * 2}
          rx="12"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1.5"
          strokeDasharray="12 8"
        />

        <text
          x={courtW / 2}
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
        {/* 2. COURT MAT SURFACE & LIGHTING                          */}
        {/* ======================================================== */}
        <rect
          x="0"
          y="0"
          width={courtW}
          height={courtH}
          rx="6"
          fill={`url(#courtGrad-${uniqueId})`}
        />

        {palette.woodGrain && (
          <rect
            x="0"
            y="0"
            width={courtW}
            height={courtH}
            fill={`url(#woodPlanks-${uniqueId})`}
            pointerEvents="none"
          />
        )}

        <rect
          x="0"
          y="0"
          width={courtW}
          height={courtH}
          fill={`url(#lighting-${uniqueId})`}
          pointerEvents="none"
        />

        {/* Side Glows */}
        {isLandscape ? (
          <>
            <rect
              x="0"
              y="0"
              width={netPosition}
              height={courtH}
              fill={`url(#side1Glow-${uniqueId})`}
              pointerEvents="none"
            />
            <rect
              x={netPosition}
              y="0"
              width={fullLength - netPosition}
              height={courtH}
              fill={`url(#side2Glow-${uniqueId})`}
              pointerEvents="none"
            />
          </>
        ) : (
          <>
            <rect
              x="0"
              y="0"
              width={courtW}
              height={netPosition}
              fill={`url(#side1Glow-${uniqueId})`}
              pointerEvents="none"
            />
            <rect
              x="0"
              y={netPosition}
              width={courtW}
              height={fullLength - netPosition}
              fill={`url(#side2Glow-${uniqueId})`}
              pointerEvents="none"
            />
          </>
        )}

        {/* ======================================================== */}
        {/* 3. THE BACK BOXES (0.76m Rear Service Alleys)            */}
        {/* ======================================================== */}
        {isLandscape ? (
          <>
            {/* Left Back Box (x = 0 to 76) */}
            <g
              className="cursor-pointer"
              onClick={() =>
                setSelectedZoneInfo({
                  id: 'left-back-box',
                  title: 'Left Back Box / Rear Gallery (0.76m)',
                  desc:
                    mode === 'doubles'
                      ? 'In Doubles: OUT for service (fault). IN during rallies.'
                      : 'In Singles: IN for both service and rallies (singles back service boundary is outer baseline).',
                })
              }
            >
              <rect
                x="0"
                y="0"
                width={backBoxDepth}
                height={courtH}
                fill={mode === 'doubles' ? `url(#backBoxHatch-${uniqueId})` : 'rgba(255,255,255,0.04)'}
                stroke={selectedZoneInfo?.id === 'left-back-box' ? '#fbbf24' : 'transparent'}
                strokeWidth="2"
              />
            </g>

            {/* Right Back Box (x = 1264 to 1340) */}
            <g
              className="cursor-pointer"
              onClick={() =>
                setSelectedZoneInfo({
                  id: 'right-back-box',
                  title: 'Right Back Box / Rear Gallery (0.76m)',
                  desc:
                    mode === 'doubles'
                      ? 'In Doubles: OUT for service (fault). IN during rallies.'
                      : 'In Singles: IN for both service and rallies (singles back service boundary is outer baseline).',
                })
              }
            >
              <rect
                x={fullLength - backBoxDepth}
                y="0"
                width={backBoxDepth}
                height={courtH}
                fill={mode === 'doubles' ? `url(#backBoxHatch-${uniqueId})` : 'rgba(255,255,255,0.04)'}
                stroke={selectedZoneInfo?.id === 'right-back-box' ? '#fbbf24' : 'transparent'}
                strokeWidth="2"
              />
            </g>

            {/* Singles Tramlines (Top & Bottom in landscape) */}
            {mode === 'singles' && (
              <>
                <rect x="0" y="0" width={courtW} height={sideAlleyWidth} fill="rgba(0,0,0,0.24)" pointerEvents="none" />
                <rect x="0" y={courtH - sideAlleyWidth} width={courtW} height={sideAlleyWidth} fill="rgba(0,0,0,0.24)" pointerEvents="none" />
              </>
            )}

            {/* Neutral Net Zone (1.98m around net: x = 472 to 868) */}
            <rect
              x={netPosition - shortServiceLineDist}
              y="0"
              width={shortServiceLineDist * 2}
              height={courtH}
              fill={palette.neutralZoneTint}
              pointerEvents="none"
            />
          </>
        ) : (
          <>
            {/* Top Back Box (y = 0 to 76) */}
            <g
              className="cursor-pointer"
              onClick={() =>
                setSelectedZoneInfo({
                  id: 'top-back-box',
                  title: 'Top Back Box / Rear Gallery (0.76m)',
                  desc:
                    mode === 'doubles'
                      ? 'In Doubles: OUT for service (fault). IN during rallies.'
                      : 'In Singles: IN for both service and rallies (singles back service boundary is outer baseline).',
                })
              }
            >
              <rect
                x="0"
                y="0"
                width={courtW}
                height={backBoxDepth}
                fill={mode === 'doubles' ? `url(#backBoxHatch-${uniqueId})` : 'rgba(255,255,255,0.04)'}
                stroke={selectedZoneInfo?.id === 'top-back-box' ? '#fbbf24' : 'transparent'}
                strokeWidth="2"
              />
            </g>

            {/* Bottom Back Box (y = 1264 to 1340) */}
            <g
              className="cursor-pointer"
              onClick={() =>
                setSelectedZoneInfo({
                  id: 'bottom-back-box',
                  title: 'Bottom Back Box / Rear Gallery (0.76m)',
                  desc:
                    mode === 'doubles'
                      ? 'In Doubles: OUT for service (fault). IN during rallies.'
                      : 'In Singles: IN for both service and rallies (singles back service boundary is outer baseline).',
                })
              }
            >
              <rect
                x="0"
                y={courtH - backBoxDepth}
                width={courtW}
                height={backBoxDepth}
                fill={mode === 'doubles' ? `url(#backBoxHatch-${uniqueId})` : 'rgba(255,255,255,0.04)'}
                stroke={selectedZoneInfo?.id === 'bottom-back-box' ? '#fbbf24' : 'transparent'}
                strokeWidth="2"
              />
            </g>

            {/* Singles Tramlines (Left & Right in portrait) */}
            {mode === 'singles' && (
              <>
                <rect x="0" y="0" width={sideAlleyWidth} height={courtH} fill="rgba(0,0,0,0.24)" pointerEvents="none" />
                <rect x={courtW - sideAlleyWidth} y="0" width={sideAlleyWidth} height={courtH} fill="rgba(0,0,0,0.24)" pointerEvents="none" />
              </>
            )}

            {/* Neutral Net Zone (1.98m around net: y = 472 to 868) */}
            <rect
              x="0"
              y={netPosition - shortServiceLineDist}
              width={courtW}
              height={shortServiceLineDist * 2}
              fill={palette.neutralZoneTint}
              pointerEvents="none"
            />
          </>
        )}

        {/* ======================================================== */}
        {/* 4. OFFICIAL BWF REGULATION COURT LINES                   */}
        {/* ======================================================== */}
        {/* Outer Boundary Box */}
        <rect
          x="0"
          y="0"
          width={courtW}
          height={courtH}
          fill="none"
          stroke={palette.lineColor}
          strokeWidth="4"
          rx="2"
          style={{ filter: `drop-shadow(0 0 3px ${palette.lineGlow})` }}
        />

        {isLandscape ? (
          <>
            {/* Singles Sidelines (Horizontal at y = 46 and y = 564) */}
            <line
              x1="0"
              y1={sideAlleyWidth}
              x2={courtW}
              y2={sideAlleyWidth}
              stroke={palette.lineColor}
              strokeWidth={mode === 'singles' ? '3.5' : '2'}
              opacity={mode === 'singles' ? 1 : 0.6}
            />
            <line
              x1="0"
              y1={courtH - sideAlleyWidth}
              x2={courtW}
              y2={courtH - sideAlleyWidth}
              stroke={palette.lineColor}
              strokeWidth={mode === 'singles' ? '3.5' : '2'}
              opacity={mode === 'singles' ? 1 : 0.6}
            />

            {/* Short Service Lines (Vertical at x = 472 and x = 868) */}
            <line
              x1={netPosition - shortServiceLineDist}
              y1="0"
              x2={netPosition - shortServiceLineDist}
              y2={courtH}
              stroke={palette.lineColor}
              strokeWidth="3.5"
            />
            <line
              x1={netPosition + shortServiceLineDist}
              y1="0"
              x2={netPosition + shortServiceLineDist}
              y2={courtH}
              stroke={palette.lineColor}
              strokeWidth="3.5"
            />

            {/* Doubles Long Service Lines / Back Box Lines (Vertical at x = 76 and x = 1264) */}
            <line
              x1={backBoxDepth}
              y1="0"
              x2={backBoxDepth}
              y2={courtH}
              stroke={palette.lineColor}
              strokeWidth="3.5"
              opacity={mode === 'doubles' ? 1 : 0.75}
            />
            <line
              x1={courtW - backBoxDepth}
              y1="0"
              x2={courtW - backBoxDepth}
              y2={courtH}
              stroke={palette.lineColor}
              strokeWidth="3.5"
              opacity={mode === 'doubles' ? 1 : 0.75}
            />

            {/* Center Line (Horizontal at y = 305, terminates at short service lines) */}
            <line
              x1="0"
              y1={courtH / 2}
              x2={netPosition - shortServiceLineDist}
              y2={courtH / 2}
              stroke={palette.lineColor}
              strokeWidth="3"
            />
            <line
              x1={netPosition + shortServiceLineDist}
              y1={courtH / 2}
              x2={courtW}
              y2={courtH / 2}
              stroke={palette.lineColor}
              strokeWidth="3"
            />
          </>
        ) : (
          <>
            {/* Singles Sidelines (Vertical at x = 46 and x = 564) */}
            <line
              x1={sideAlleyWidth}
              y1="0"
              x2={sideAlleyWidth}
              y2={courtH}
              stroke={palette.lineColor}
              strokeWidth={mode === 'singles' ? '3.5' : '2'}
              opacity={mode === 'singles' ? 1 : 0.6}
            />
            <line
              x1={courtW - sideAlleyWidth}
              y1="0"
              x2={courtW - sideAlleyWidth}
              y2={courtH}
              stroke={palette.lineColor}
              strokeWidth={mode === 'singles' ? '3.5' : '2'}
              opacity={mode === 'singles' ? 1 : 0.6}
            />

            {/* Short Service Lines (Horizontal at y = 472 and y = 868) */}
            <line
              x1="0"
              y1={netPosition - shortServiceLineDist}
              x2={courtW}
              y2={netPosition - shortServiceLineDist}
              stroke={palette.lineColor}
              strokeWidth="3.5"
            />
            <line
              x1="0"
              y1={netPosition + shortServiceLineDist}
              x2={courtW}
              y2={netPosition + shortServiceLineDist}
              stroke={palette.lineColor}
              strokeWidth="3.5"
            />

            {/* Doubles Long Service Lines (Horizontal at y = 76 and y = 1264) */}
            <line
              x1="0"
              y1={backBoxDepth}
              x2={courtW}
              y2={backBoxDepth}
              stroke={palette.lineColor}
              strokeWidth="3.5"
              opacity={mode === 'doubles' ? 1 : 0.75}
            />
            <line
              x1="0"
              y1={courtH - backBoxDepth}
              x2={courtW}
              y2={courtH - backBoxDepth}
              stroke={palette.lineColor}
              strokeWidth="3.5"
              opacity={mode === 'doubles' ? 1 : 0.75}
            />

            {/* Center Line (Vertical at x = 305, terminates at short service lines) */}
            <line
              x1={courtW / 2}
              y1="0"
              x2={courtW / 2}
              y2={netPosition - shortServiceLineDist}
              stroke={palette.lineColor}
              strokeWidth="3"
            />
            <line
              x1={courtW / 2}
              y1={netPosition + shortServiceLineDist}
              x2={courtW / 2}
              y2={courtH}
              stroke={palette.lineColor}
              strokeWidth="3"
            />
          </>
        )}

        {/* ======================================================== */}
        {/* 5. TACTICAL BACK BOX & SERVICE GUIDES                    */}
        {/* ======================================================== */}
        {showGuides && (
          <g pointerEvents="none">
            {isLandscape ? (
              <>
                {/* Left Back Box Badge */}
                <g transform={`translate(${backBoxDepth / 2}, ${courtH / 2})`}>
                  <rect
                    x="-24"
                    y="-70"
                    width="48"
                    height="140"
                    rx="12"
                    fill="#0f172a"
                    fillOpacity="0.88"
                    stroke={mode === 'doubles' ? '#ef4444' : '#10b981'}
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="-45"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    BACK
                  </text>
                  <text
                    x="0"
                    y="-30"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    BOX
                  </text>
                  <text
                    x="0"
                    y="-15"
                    textAnchor="middle"
                    fill={mode === 'doubles' ? '#f87171' : '#34d399'}
                    fontSize="9"
                    fontWeight="bold"
                  >
                    0.76M
                  </text>
                  <text
                    x="0"
                    y="15"
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.7)"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {mode === 'doubles' ? 'OUT' : 'IN'}
                  </text>
                  <text
                    x="0"
                    y="30"
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.7)"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {mode === 'doubles' ? 'SERVE' : 'SERVE'}
                  </text>
                </g>

                {/* Right Back Box Badge */}
                <g transform={`translate(${courtW - backBoxDepth / 2}, ${courtH / 2})`}>
                  <rect
                    x="-24"
                    y="-70"
                    width="48"
                    height="140"
                    rx="12"
                    fill="#0f172a"
                    fillOpacity="0.88"
                    stroke={mode === 'doubles' ? '#ef4444' : '#10b981'}
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="-45"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    BACK
                  </text>
                  <text
                    x="0"
                    y="-30"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    BOX
                  </text>
                  <text
                    x="0"
                    y="-15"
                    textAnchor="middle"
                    fill={mode === 'doubles' ? '#f87171' : '#34d399'}
                    fontSize="9"
                    fontWeight="bold"
                  >
                    0.76M
                  </text>
                  <text
                    x="0"
                    y="15"
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.7)"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {mode === 'doubles' ? 'OUT' : 'IN'}
                  </text>
                  <text
                    x="0"
                    y="30"
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.7)"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {mode === 'doubles' ? 'SERVE' : 'SERVE'}
                  </text>
                </g>

                {/* Non-Service Zone Labels */}
                <text
                  x={netPosition - shortServiceLineDist / 2}
                  y={courtH / 2}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.4)"
                  fontSize="12"
                  fontWeight="bold"
                  letterSpacing="0.1em"
                  transform={`rotate(-90 ${netPosition - shortServiceLineDist / 2} ${courtH / 2})`}
                >
                  NON-SERVICE ZONE (1.98M)
                </text>
                <text
                  x={netPosition + shortServiceLineDist / 2}
                  y={courtH / 2}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.4)"
                  fontSize="12"
                  fontWeight="bold"
                  letterSpacing="0.1em"
                  transform={`rotate(90 ${netPosition + shortServiceLineDist / 2} ${courtH / 2})`}
                >
                  NON-SERVICE ZONE (1.98M)
                </text>

                {/* Left Side Service Box Labels */}
                <text
                  x={netPosition - shortServiceLineDist - 30}
                  y={courtH * 0.74}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.55)"
                  fontSize="13"
                  fontWeight="bold"
                >
                  RIGHT (EVEN)
                </text>
                <text
                  x={netPosition - shortServiceLineDist - 30}
                  y={courtH * 0.26}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.55)"
                  fontSize="13"
                  fontWeight="bold"
                >
                  LEFT (ODD)
                </text>

                {/* Right Side Service Box Labels */}
                <text
                  x={netPosition + shortServiceLineDist + 30}
                  y={courtH * 0.26}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.55)"
                  fontSize="13"
                  fontWeight="bold"
                >
                  RIGHT (EVEN)
                </text>
                <text
                  x={netPosition + shortServiceLineDist + 30}
                  y={courtH * 0.74}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.55)"
                  fontSize="13"
                  fontWeight="bold"
                >
                  LEFT (ODD)
                </text>
              </>
            ) : (
              <>
                {/* Top Back Box Badge */}
                <g transform={`translate(${courtW / 2}, 38)`}>
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

                {/* Bottom Back Box Badge */}
                <g transform={`translate(${courtW / 2}, ${courtH - 38})`}>
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

                {/* Non-Service Zone Labels */}
                <text
                  x={courtW / 2}
                  y={netPosition - shortServiceLineDist / 2}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.4)"
                  fontSize="12"
                  fontWeight="bold"
                  letterSpacing="0.1em"
                >
                  NON-SERVICE ZONE (1.98M)
                </text>
                <text
                  x={courtW / 2}
                  y={netPosition + shortServiceLineDist / 2}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.4)"
                  fontSize="12"
                  fontWeight="bold"
                  letterSpacing="0.1em"
                >
                  NON-SERVICE ZONE (1.98M)
                </text>

                {/* Service Box Indicators */}
                <text
                  x={courtW * 0.25}
                  y={netPosition - shortServiceLineDist - 24}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.55)"
                  fontSize="13"
                  fontWeight="bold"
                >
                  RIGHT (EVEN)
                </text>
                <text
                  x={courtW * 0.75}
                  y={netPosition - shortServiceLineDist - 24}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.55)"
                  fontSize="13"
                  fontWeight="bold"
                >
                  LEFT (ODD)
                </text>

                <text
                  x={courtW * 0.25}
                  y={netPosition + shortServiceLineDist + 34}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.55)"
                  fontSize="13"
                  fontWeight="bold"
                >
                  LEFT (ODD)
                </text>
                <text
                  x={courtW * 0.75}
                  y={netPosition + shortServiceLineDist + 34}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.55)"
                  fontSize="13"
                  fontWeight="bold"
                >
                  RIGHT (EVEN)
                </text>
              </>
            )}
          </g>
        )}

        {/* ======================================================== */}
        {/* 6. REALISTIC 3D NET WITH POSTS & TENSION CORDS           */}
        {/* ======================================================== */}
        {isLandscape ? (
          <g filter={`url(#netShadow-${uniqueId})`}>
            {/* Vertical Net Mesh Body in Landscape (spanning from y=-20 to y=630) */}
            <rect
              x={netPosition - 12}
              y="-20"
              width="24"
              height={courtH + 40}
              fill={`url(#netMesh-${uniqueId})`}
              rx="1"
            />
            {/* White Top Cord Tape */}
            <rect
              x={netPosition - 2}
              y="-20"
              width="5"
              height={courtH + 40}
              fill="#ffffff"
              rx="1"
            />
            {/* Left tape border */}
            <line
              x1={netPosition - 12}
              y1="-20"
              x2={netPosition - 12}
              y2={courtH + 20}
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1.5"
            />
            {/* Right tape border */}
            <line
              x1={netPosition + 12}
              y1="-20"
              x2={netPosition + 12}
              y2={courtH + 20}
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1.5"
            />

            {/* Top Steel Post */}
            <g transform={`translate(${netPosition}, -8)`}>
              <ellipse cx="0" cy="5" rx="7" ry="3" fill="rgba(0,0,0,0.5)" />
              <rect x="-18" y="-6" width="36" height="12" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
              <circle cx="-18" cy="0" r="5" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
            </g>

            {/* Bottom Steel Post */}
            <g transform={`translate(${netPosition}, ${courtH + 8})`}>
              <ellipse cx="0" cy="5" rx="7" ry="3" fill="rgba(0,0,0,0.5)" />
              <rect x="-18" y="-6" width="36" height="12" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
              <circle cx="18" cy="0" r="5" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
            </g>

            {/* Net Center Measurement Badge */}
            <g transform={`translate(${netPosition}, ${courtH / 2})`}>
              <rect x="-7" y="-38" width="14" height="76" rx="7" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
              <text
                x="0"
                y="0"
                textAnchor="middle"
                dominantBaseline="central"
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                transform={`rotate(-90 0 0)`}
              >
                NET • 1.524M
              </text>
            </g>
          </g>
        ) : (
          <g filter={`url(#netShadow-${uniqueId})`}>
            {/* Horizontal Net Mesh Body in Portrait */}
            <rect
              x="-20"
              y={netPosition - 12}
              width={courtW + 40}
              height="24"
              fill={`url(#netMesh-${uniqueId})`}
              rx="1"
            />
            <rect
              x="-20"
              y={netPosition - 13}
              width={courtW + 40}
              height="5"
              fill="#ffffff"
              rx="1"
            />
            <line
              x1="-20"
              y1={netPosition - 10.5}
              x2={courtW + 20}
              y2={netPosition - 10.5}
              stroke="#94a3b8"
              strokeWidth="0.8"
            />
            <line
              x1="-20"
              y1={netPosition + 12}
              x2={courtW + 20}
              y2={netPosition + 12}
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1.5"
            />

            {/* Left Steel Post */}
            <g transform={`translate(-8, ${netPosition})`}>
              <ellipse cx="0" cy="5" rx="7" ry="3" fill="rgba(0,0,0,0.5)" />
              <rect x="-6" y="-18" width="12" height="36" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
              <circle cx="0" cy="-18" r="5" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
            </g>

            {/* Right Steel Post */}
            <g transform={`translate(${courtW + 8}, ${netPosition})`}>
              <ellipse cx="0" cy="5" rx="7" ry="3" fill="rgba(0,0,0,0.5)" />
              <rect x="-6" y="-18" width="12" height="36" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
              <circle cx="0" cy="-18" r="5" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
            </g>

            {/* Net Center Measurement Badge */}
            <g transform={`translate(${courtW / 2}, ${netPosition})`}>
              <rect x="-38" y="-7" width="76" height="14" rx="7" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />
              <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                NET • 1.524M
              </text>
            </g>
          </g>
        )}

        {/* ======================================================== */}
        {/* 7. BROADCAST END LABELS / TEAM BANNERS                   */}
        {/* ======================================================== */}
        {isLandscape ? (
          <>
            {/* Left Side Banner (on apron) */}
            <g transform={`translate(-28, ${courtH / 2})`}>
              <rect
                x="-14"
                y="-75"
                width="28"
                height="150"
                rx="14"
                fill="#0f172a"
                stroke={side1Color}
                strokeWidth="2"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))"
              />
              <circle cx="0" cy="-55" r="4.5" fill={side1Color} />
              <text
                x="0"
                y="5"
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="bold"
                letterSpacing="0.1em"
                transform={`rotate(-90 0 5)`}
              >
                {isFlipped
                  ? mode === 'singles' ? 'SIDE B (RIGHT)' : 'TEAM B'
                  : mode === 'singles' ? 'SIDE A (LEFT)' : 'TEAM A'}
              </text>
            </g>

            {/* Right Side Banner (on apron) */}
            <g transform={`translate(${courtW + 28}, ${courtH / 2})`}>
              <rect
                x="-14"
                y="-75"
                width="28"
                height="150"
                rx="14"
                fill="#0f172a"
                stroke={side2Color}
                strokeWidth="2"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))"
              />
              <circle cx="0" cy="-55" r="4.5" fill={side2Color} />
              <text
                x="0"
                y="5"
                textAnchor="middle"
                fill="white"
                fontSize="11"
                fontWeight="bold"
                letterSpacing="0.1em"
                transform={`rotate(90 0 5)`}
              >
                {isFlipped
                  ? mode === 'singles' ? 'SIDE A (LEFT)' : 'TEAM A'
                  : mode === 'singles' ? 'SIDE B (RIGHT)' : 'TEAM B'}
              </text>
            </g>
          </>
        ) : (
          <>
            {/* Top Side Banner */}
            <g transform={`translate(${courtW / 2}, -24)`}>
              <rect
                x="-110"
                y="-14"
                width="220"
                height="28"
                rx="14"
                fill="#0f172a"
                stroke={side1Color}
                strokeWidth="2"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))"
              />
              <circle cx="-92" cy="0" r="5" fill={side1Color} />
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
            <g transform={`translate(${courtW / 2}, ${courtH + 24})`}>
              <rect
                x="-110"
                y="-14"
                width="220"
                height="28"
                rx="14"
                fill="#0f172a"
                stroke={side2Color}
                strokeWidth="2"
                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.4))"
              />
              <circle cx="-92" cy="0" r="5" fill={side2Color} />
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
          </>
        )}

        {/* ======================================================== */}
        {/* 8. PLAYER TOKENS & SERVING BADGES                        */}
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
                <circle cx={x} cy={y} r={radius} fill={player.color} fillOpacity="0.9" />
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

              {/* Role Subtitle */}
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
