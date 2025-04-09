import React, { useState, useEffect, useCallback } from 'react';
import { Ghost, Trophy, Gamepad2 } from 'lucide-react';
import { TetrisGame } from './components/TetrisGame';
import { LeaderboardModal } from './components/LeaderboardModal';
import { RainAnimation } from './components/RainAnimation';
import { TypewriterText } from './components/TypewriterText';

function App() {
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [highScores, setHighScores] = useState<Array<{name: string, score: number}>>([]);

  const handleStartGame = (name: string) => {
    if (name.trim()) {
      setPlayerName(name);
      setGameStarted(true);
    }
  };

  const handleGameOver = useCallback((score: number) => {
    const newScore = { name: playerName, score };
    setHighScores(prev => [...prev, newScore].sort((a, b) => b.score - a.score).slice(0, 10));
  }, [playerName]);

  return (
    <div className="min-h-screen bg-gray-900 text-pink-200 relative overflow-hidden">
      <RainAnimation />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600 glitch-text">
            +62 DIBUAT OLEH WEST/ESCBR
          </h1>
          <button
            onClick={() => setShowLeaderboard(true)}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto mb-4"
          >
            <Trophy size={20} /> Leaderboard
          </button>
        </header>

        {!gameStarted ? (
          <div className="max-w-md mx-auto bg-gray-800/80 p-8 rounded-lg backdrop-blur-sm shadow-xl border border-pink-500/30">
            <TypewriterText text="Enter your name to start playing..." className="text-xl mb-4" />
            <div className="flex gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Your name"
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                onClick={() => handleStartGame(playerName)}
                className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <Gamepad2 size={20} />
                Play
              </button>
            </div>
          </div>
        ) : (
          <TetrisGame onGameOver={handleGameOver} />
        )}
      </div>

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        scores={highScores}
      />
    </div>
  );
}

export default App;