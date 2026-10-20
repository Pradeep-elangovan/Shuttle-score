import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GameModePage from './pages/GameModePage'
import PlayerSetupPage from './pages/PlayerSetupPage'
import CourtPage from './pages/CourtPage'

export default function App() {
  return (
    <div className="h-full w-full relative overflow-hidden bg-bg">
      <Routes>
        <Route
          path="/"
          element={
            <div className="h-full w-full max-w-lg mx-auto">
              <HomePage />
            </div>
          }
        />
        <Route
          path="/game/:gameId/mode"
          element={
            <div className="h-full w-full max-w-lg mx-auto">
              <GameModePage />
            </div>
          }
        />
        <Route
          path="/game/:gameId/players"
          element={
            <div className="h-full w-full max-w-lg mx-auto">
              <PlayerSetupPage />
            </div>
          }
        />
        <Route path="/game/:gameId/court" element={<CourtPage />} />
      </Routes>
    </div>
  )
}
