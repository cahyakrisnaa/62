import React from 'react';
import { Trophy, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  scores: Array<{name: string; score: number}>;
}

export const LeaderboardModal: React.FC<Props> = ({ isOpen, onClose, scores }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-pink-500/30 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-2">
          {scores.map((score, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 rounded bg-gray-700/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-pink-500 font-bold">{index + 1}</span>
                <span>{score.name}</span>
              </div>
              <span className="font-mono">{score.score}</span>
            </div>
          ))}
          {scores.length === 0 && (
            <p className="text-center text-gray-400">No scores yet!</p>
          )}
        </div>
      </div>
    </div>
  );
};