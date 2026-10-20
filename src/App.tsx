import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GameModePage from './pages/GameModePage'
import PlayerSetupPage from './pages/PlayerSetupPage'
import CourtPage from './pages/CourtPage'

export default function App() {
  return (
    <div className="h-full w-full max-w-lg mx-auto relative overflow-hidden">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game/:gameId/mode" element={<GameModePage />} />
        <Route path="/game/:gameId/players" element={<PlayerSetupPage />} />
        <Route path="/game/:gameId/court" element={<CourtPage />} />
      </Routes>
    </div>
  )
}
