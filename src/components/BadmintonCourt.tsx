import { useId } from 'react'
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
  isFlipped?: boolean
  onScoreSide?: (side: 'side1' | 'side2') => void
  activeTapSide?: 'side1' | 'side2' | null
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
  isFlipped = false,
  onScoreSide,
  activeTapSide,
}: BadmintonCourtProps) {
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
  }

  const courtPlayers: CourtPlayer[] = []

  if (isLandscape) {
    const leftCenterServiceX = backBoxDepth + (netPosition - shortServiceLineDist - backBoxDepth) / 2 // ~274
    const rightCenterServiceX = netPosition + shortServiceLineDist + (fullLength - backBoxDepth - (netPosition + shortServiceLineDist)) / 2 // ~1066

    if (mode === 'singles') {
      if (side1Players[0]) {
        courtPlayers.push({
          player: side1Players[0],
          x: leftCenterServiceX,
          y: fullBreadth / 2,
          radius: 46,
        })
      }
      if (side2Players[0]) {
        courtPlayers.push({
          player: side2Players[0],
          x: rightCenterServiceX,
          y: fullBreadth / 2,
          radius: 46,
        })
      }
    } else {
      if (side1Players[0]) {
        courtPlayers.push({
          player: side1Players[0],
          x: leftCenterServiceX,
          y: fullBreadth * 0.73,
          radius: 40,
        })
      }
      if (side1Players[1]) {
        courtPlayers.push({
          player: side1Players[1],
          x: leftCenterServiceX,
          y: fullBreadth * 0.27,
          radius: 40,
        })
      }

      if (side2Players[0]) {
        courtPlayers.push({
          player: side2Players[0],
          x: rightCenterServiceX,
          y: fullBreadth * 0.27,
          radius: 40,
        })
      }
      if (side2Players[1]) {
        courtPlayers.push({
          player: side2Players[1],
          x: rightCenterServiceX,
          y: fullBreadth * 0.73,
          radius: 40,
        })
      }
    }
  } else {
    const topCenterServiceY = backBoxDepth + (netPosition - shortServiceLineDist - backBoxDepth) / 2 // ~274
    const bottomCenterServiceY = netPosition + shortServiceLineDist + (fullLength - backBoxDepth - (netPosition + shortServiceLineDist)) / 2 // ~1066

    if (mode === 'singles') {
      if (side1Players[0]) {
        courtPlayers.push({
          player: side1Players[0],
          x: fullBreadth / 2,
          y: topCenterServiceY,
          radius: 46,
        })
      }
      if (side2Players[0]) {
        courtPlayers.push({
          player: side2Players[0],
          x: fullBreadth / 2,
          y: bottomCenterServiceY,
          radius: 46,
        })
      }
    } else {
      if (side1Players[0]) {
        courtPlayers.push({
          player: side1Players[0],
          x: fullBreadth * 0.26,
          y: topCenterServiceY,
          radius: 40,
        })
      }
      if (side1Players[1]) {
        courtPlayers.push({
          player: side1Players[1],
          x: fullBreadth * 0.74,
          y: topCenterServiceY,
          radius: 40,
        })
      }

      if (side2Players[0]) {
        courtPlayers.push({
          player: side2Players[0],
          x: fullBreadth * 0.26,
          y: bottomCenterServiceY,
          radius: 40,
        })
      }
      if (side2Players[1]) {
        courtPlayers.push({
          player: side2Players[1],
          x: fullBreadth * 0.74,
          y: bottomCenterServiceY,
          radius: 40,
        })
      }
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative select-none">
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

        {/* Side Ambient Glows */}
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
        {/* TAP FLASH OVERLAYS ON COURT TAP                          */}
        {/* ======================================================== */}
        {activeTapSide === 'side1' && (
          <rect
            x="0"
            y="0"
            width={isLandscape ? netPosition : courtW}
            height={isLandscape ? courtH : netPosition}
            fill={side1Color}
            opacity="0.35"
            pointerEvents="none"
            className="court-tap-flash"
          />
        )}
        {activeTapSide === 'side2' && (
          <rect
            x={isLandscape ? netPosition : 0}
            y={isLandscape ? 0 : netPosition}
            width={isLandscape ? fullLength - netPosition : courtW}
            height={isLandscape ? courtH : fullLength - netPosition}
            fill={side2Color}
            opacity="0.35"
            pointerEvents="none"
            className="court-tap-flash"
          />
        )}

        {/* ======================================================== */}
        {/* 3. SHADED TRAMLINES & ZONES                              */}
        {/* ======================================================== */}
        {isLandscape ? (
          <>
            {mode === 'singles' && (
              <>
                <rect x="0" y="0" width={courtW} height={sideAlleyWidth} fill="rgba(0,0,0,0.22)" pointerEvents="none" />
                <rect x="0" y={courtH - sideAlleyWidth} width={courtW} height={sideAlleyWidth} fill="rgba(0,0,0,0.22)" pointerEvents="none" />
              </>
            )}

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
            {mode === 'singles' && (
              <>
                <rect x="0" y="0" width={sideAlleyWidth} height={courtH} fill="rgba(0,0,0,0.22)" pointerEvents="none" />
                <rect x={courtW - sideAlleyWidth} y="0" width={sideAlleyWidth} height={courtH} fill="rgba(0,0,0,0.22)" pointerEvents="none" />
              </>
            )}

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
            {/* Singles Sidelines */}
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

            {/* Short Service Lines */}
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

            {/* Doubles Long Service Lines */}
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

            {/* Center Line */}
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
            {/* Singles Sidelines */}
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

            {/* Short Service Lines */}
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

            {/* Doubles Long Service Lines */}
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

            {/* Center Line */}
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
        {/* 5. TAP-TO-SCORE HIT AREAS ON COURT HALVES                */}
        {/* ======================================================== */}
        {isLandscape ? (
          <>
            <rect
              x="0"
              y="0"
              width={netPosition}
              height={courtH}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onScoreSide?.('side1')}
            />
            <rect
              x={netPosition}
              y="0"
              width={fullLength - netPosition}
              height={courtH}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onScoreSide?.('side2')}
            />
          </>
        ) : (
          <>
            <rect
              x="0"
              y="0"
              width={courtW}
              height={netPosition}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onScoreSide?.('side1')}
            />
            <rect
              x="0"
              y={netPosition}
              width={courtW}
              height={fullLength - netPosition}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => onScoreSide?.('side2')}
            />
          </>
        )}

        {/* ======================================================== */}
        {/* 6. REALISTIC 3D NET WITH POSTS & TENSION CORDS           */}
        {/* ======================================================== */}
        {isLandscape ? (
          <g filter={`url(#netShadow-${uniqueId})`}>
            <rect
              x={netPosition - 12}
              y="-20"
              width="24"
              height={courtH + 40}
              fill={`url(#netMesh-${uniqueId})`}
              rx="1"
            />
            <rect
              x={netPosition - 2}
              y="-20"
              width="5"
              height={courtH + 40}
              fill="#ffffff"
              rx="1"
            />
            <line x1={netPosition - 12} y1="-20" x2={netPosition - 12} y2={courtH + 20} stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
            <line x1={netPosition + 12} y1="-20" x2={netPosition + 12} y2={courtH + 20} stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />

            <g transform={`translate(${netPosition}, -8)`}>
              <ellipse cx="0" cy="5" rx="7" ry="3" fill="rgba(0,0,0,0.5)" />
              <rect x="-18" y="-6" width="36" height="12" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
              <circle cx="-18" cy="0" r="5" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
            </g>

            <g transform={`translate(${netPosition}, ${courtH + 8})`}>
              <ellipse cx="0" cy="5" rx="7" ry="3" fill="rgba(0,0,0,0.5)" />
              <rect x="-18" y="-6" width="36" height="12" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
              <circle cx="18" cy="0" r="5" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
            </g>
          </g>
        ) : (
          <g filter={`url(#netShadow-${uniqueId})`}>
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
            <line x1="-20" y1={netPosition - 10.5} x2={courtW + 20} y2={netPosition - 10.5} stroke="#94a3b8" strokeWidth="0.8" />
            <line x1="-20" y1={netPosition + 12} x2={courtW + 20} y2={netPosition + 12} stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />

            <g transform={`translate(-8, ${netPosition})`}>
              <ellipse cx="0" cy="5" rx="7" ry="3" fill="rgba(0,0,0,0.5)" />
              <rect x="-6" y="-18" width="12" height="36" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
              <circle cx="0" cy="-18" r="5" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
            </g>

            <g transform={`translate(${courtW + 8}, ${netPosition})`}>
              <ellipse cx="0" cy="5" rx="7" ry="3" fill="rgba(0,0,0,0.5)" />
              <rect x="-6" y="-18" width="12" height="36" rx="3" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
              <circle cx="0" cy="-18" r="5" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
            </g>
          </g>
        )}

        {/* ======================================================== */}
        {/* 7. BROADCAST END LABELS / TEAM BANNERS                   */}
        {/* ======================================================== */}
        {isLandscape ? (
          <>
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
                transform="rotate(-90 0 5)"
              >
                {isFlipped
                  ? mode === 'singles' ? 'SIDE B' : 'TEAM B'
                  : mode === 'singles' ? 'SIDE A' : 'TEAM A'}
              </text>
            </g>

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
                transform="rotate(90 0 5)"
              >
                {isFlipped
                  ? mode === 'singles' ? 'SIDE A' : 'TEAM A'
                  : mode === 'singles' ? 'SIDE B' : 'TEAM B'}
              </text>
            </g>
          </>
        ) : (
          <>
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
              <text x="-4" y="4" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" letterSpacing="0.1em">
                {isFlipped
                  ? mode === 'singles' ? 'SIDE B' : 'TEAM B'
                  : mode === 'singles' ? 'SIDE A' : 'TEAM A'}
              </text>
            </g>

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
              <text x="-4" y="4" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" letterSpacing="0.1em">
                {isFlipped
                  ? mode === 'singles' ? 'SIDE A' : 'TEAM A'
                  : mode === 'singles' ? 'SIDE B' : 'TEAM B'}
              </text>
            </g>
          </>
        )}

        {/* ======================================================== */}
        {/* 8. PLAYER TOKENS (POINTER-EVENTS-NONE: NOT TOUCH POINTS) */}
        {/* ======================================================== */}
        {courtPlayers.map((cp) => {
          const { player, x, y, radius } = cp
          const initials = getInitials(player.name, 'P')
          const pillWidth = Math.max(80, Math.min(140, (player.name.length || 6) * 10 + 24))

          return (
            <g
              key={player.id}
              className="pointer-events-none"
              filter={`url(#tokenShadow-${uniqueId})`}
            >
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
                stroke={player.color}
                strokeWidth="4"
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
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}
                >
                  {initials}
                </text>
              )}

              {/* Clean Name Badge (No colored dot / touch points) */}
              <g transform={`translate(${x}, ${y + radius + 16})`}>
                <rect
                  x={-pillWidth / 2}
                  y="-12"
                  width={pillWidth}
                  height="24"
                  rx="12"
                  fill="#0f172a"
                  fillOpacity="0.95"
                  stroke={player.color}
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="1.5"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
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
