import React, { useState, useEffect, useCallback } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';

interface Props {
  onGameOver: (score: number) => void;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

const TETROMINOS = {
  I: { shape: [[1, 1, 1, 1]], color: 'bg-cyan-500' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-yellow-500' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-500' },
  L: { shape: [[1, 0], [1, 0], [1, 1]], color: 'bg-orange-500' },
  J: { shape: [[0, 1], [0, 1], [1, 1]], color: 'bg-blue-500' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-500' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-500' }
};

export const TetrisGame: React.FC<Props> = ({ onGameOver }) => {
  const [board, setBoard] = useState<string[][]>(Array(BOARD_HEIGHT).fill(Array(BOARD_WIDTH).fill('')));
  const [currentPiece, setCurrentPiece] = useState<any>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(1000);

  const createNewPiece = useCallback(() => {
    const pieces = Object.keys(TETROMINOS);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    return {
      shape: TETROMINOS[randomPiece as keyof typeof TETROMINOS].shape,
      color: TETROMINOS[randomPiece as keyof typeof TETROMINOS].color
    };
  }, []);

  const checkCollision = useCallback((piece: number[][], pos: { x: number, y: number }) => {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          const newY = pos.y + y;
          const newX = pos.x + x;
          if (
            newY >= BOARD_HEIGHT ||
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            (board[newY] && board[newY][newX])
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, [board]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece) return;
    const rotated = currentPiece.shape[0].map((_: any, i: number) =>
      currentPiece.shape.map((row: any) => row[row.length - 1 - i])
    );
    if (!checkCollision(rotated, position)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  }, [currentPiece, position, checkCollision]);

  const moveHorizontal = useCallback((dir: number) => {
    if (!currentPiece || gameOver) return;
    const newPos = { ...position, x: position.x + dir };
    if (!checkCollision(currentPiece.shape, newPos)) {
      setPosition(newPos);
    }
  }, [currentPiece, position, checkCollision, gameOver]);

  const moveDown = useCallback(() => {
    if (!currentPiece || gameOver) return;
    const newPos = { ...position, y: position.y + 1 };
    if (!checkCollision(currentPiece.shape, newPos)) {
      setPosition(newPos);
      return;
    }

    // Merge piece with board
    const newBoard = board.map(row => [...row]);
    currentPiece.shape.forEach((row: number[], y: number) => {
      row.forEach((value: number, x: number) => {
        if (value) {
          newBoard[position.y + y][position.x + x] = currentPiece.color;
        }
      });
    });

    // Check for completed lines
    let linesCleared = 0;
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (newBoard[y].every(cell => cell)) {
        newBoard.splice(y, 1);
        newBoard.unshift(Array(BOARD_WIDTH).fill(''));
        linesCleared++;
      }
    }

    // Update score
    if (linesCleared > 0) {
      setScore(prev => prev + (linesCleared * 100));
      setSpeed(prev => Math.max(200, prev - 50)); // Increase speed
    }

    setBoard(newBoard);
    setCurrentPiece(createNewPiece());
    setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });

    // Check game over
    if (checkCollision(currentPiece.shape, { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 })) {
      setGameOver(true);
      onGameOver(score);
    }
  }, [currentPiece, position, board, checkCollision, createNewPiece, gameOver, score, onGameOver]);

  useEffect(() => {
    if (!currentPiece) {
      setCurrentPiece(createNewPiece());
      setPosition({ x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 });
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return;
      switch (e.key) {
        case 'ArrowLeft':
          moveHorizontal(-1);
          break;
        case 'ArrowRight':
          moveHorizontal(1);
          break;
        case 'ArrowDown':
          moveDown();
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    const dropInterval = setInterval(moveDown, speed);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearInterval(dropInterval);
    };
  }, [currentPiece, createNewPiece, moveHorizontal, moveDown, rotatePiece, gameOver, speed]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-2xl font-bold">Score: {score}</div>
      <div className="relative bg-gray-800/80 p-4 rounded-lg backdrop-blur-sm border border-pink-500/30">
        <div style={{ width: BLOCK_SIZE * BOARD_WIDTH, height: BLOCK_SIZE * BOARD_HEIGHT }} className="relative">
          {/* Draw board */}
          {board.map((row, y) => row.map((color, x) => (
            <div
              key={`${x}-${y}`}
              className={`absolute border border-gray-700 ${color || 'bg-gray-900/50'}`}
              style={{
                width: BLOCK_SIZE,
                height: BLOCK_SIZE,
                top: y * BLOCK_SIZE,
                left: x * BLOCK_SIZE,
              }}
            />
          )))}
          
          {/* Draw current piece */}
          {currentPiece && currentPiece.shape.map((row: number[], y: number) =>
            row.map((value: number, x: number) => value ? (
              <div
                key={`piece-${x}-${y}`}
                className={`absolute ${currentPiece.color}`}
                style={{
                  width: BLOCK_SIZE,
                  height: BLOCK_SIZE,
                  top: (position.y + y) * BLOCK_SIZE,
                  left: (position.x + x) * BLOCK_SIZE,
                }}
              />
            ) : null)
          )}
        </div>

        {/* Mobile controls */}
        <div className="md:hidden mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={() => moveHorizontal(-1)}
            className="bg-pink-500/80 p-4 rounded-lg"
          >
            <ArrowLeft />
          </button>
          <button
            onClick={moveDown}
            className="bg-pink-500/80 p-4 rounded-lg"
          >
            <ArrowDown />
          </button>
          <button
            onClick={() => moveHorizontal(1)}
            className="bg-pink-500/80 p-4 rounded-lg"
          >
            <ArrowRight />
          </button>
          <button
            onClick={rotatePiece}
            className="col-span-3 bg-pink-500/80 p-4 rounded-lg"
          >
            <RotateCw />
          </button>
        </div>
      </div>

      {gameOver && (
        <div className="text-2xl font-bold text-red-500">Game Over!</div>
      )}
    </div>
  );
};