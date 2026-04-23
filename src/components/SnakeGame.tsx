/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
}

interface SnakeGameProps {
  onScoreUpdate: (score: number) => void;
}

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 2;
const MIN_SPEED = 60;

export default function SnakeGame({ onScoreUpdate }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Game state refs (to avoid re-renders)
  const snake = useRef<Point[]>([{ x: 10, y: 10 }]);
  const food = useRef<Point>({ x: 5, y: 5 });
  const direction = useRef<Point>({ x: 1, y: 0 });
  const nextDirection = useRef<Point>({ x: 1, y: 0 });
  const speed = useRef(INITIAL_SPEED);
  const lastTime = useRef(0);
  const shakeTime = useRef(0);

  const resetGame = () => {
    snake.current = [{ x: 10, y: 10 }];
    direction.current = { x: 1, y: 0 };
    nextDirection.current = { x: 1, y: 0 };
    speed.current = INITIAL_SPEED;
    setScore(0);
    onScoreUpdate(0);
    setIsGameOver(false);
    setIsPaused(false);
    spawnFood();
  };

  const spawnFood = () => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    food.current = { x, y };

    // Don't spawn on snake
    if (snake.current.some(p => p.x === x && p.y === y)) {
      spawnFood();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { code } = e;
      if (code === 'Space') {
        if (isGameOver) {
          resetGame();
        } else {
          setIsPaused(p => !p);
        }
        return;
      }

      if (isPaused || isGameOver) return;

      switch (code) {
        case 'ArrowUp':
        case 'KeyW':
          if (direction.current.y === 0) nextDirection.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 'KeyS':
          if (direction.current.y === 0) nextDirection.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'KeyA':
          if (direction.current.x === 0) nextDirection.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'KeyD':
          if (direction.current.x === 0) nextDirection.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, isGameOver]);

  const update = () => {
    direction.current = nextDirection.current;
    const head = { ...snake.current[0] };
    head.x += direction.current.x;
    head.y += direction.current.y;

    // Check collisions
    if (
      head.x < 0 || head.x >= GRID_SIZE ||
      head.y < 0 || head.y >= GRID_SIZE ||
      snake.current.some(p => p.x === head.x && p.y === head.y)
    ) {
      setIsGameOver(true);
      return;
    }

    snake.current.unshift(head);

    // Eat food
    if (head.x === food.current.x && head.y === food.current.y) {
      setScore(s => {
        const next = s + 10;
        onScoreUpdate(next);
        return next;
      });
      speed.current = Math.max(MIN_SPEED, speed.current - SPEED_INCREMENT);
      shakeTime.current = 10;
      spawnFood();
    } else {
      snake.current.pop();
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const cellW = width / GRID_SIZE;
    const cellH = height / GRID_SIZE;

    ctx.clearRect(0, 0, width, height);

    // Apply shake
    if (shakeTime.current > 0) {
      const shakeX = (Math.random() - 0.5) * 5;
      const shakeY = (Math.random() - 0.5) * 5;
      ctx.translate(shakeX, shakeY);
      shakeTime.current--;
    }

    // Grid (Subtle)
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellW, 0);
      ctx.lineTo(i * cellW, height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * cellH);
      ctx.lineTo(width, i * cellH);
      ctx.stroke();
    }

    // Food
    ctx.fillStyle = '#ff00ff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff00ff';
    ctx.beginPath();
    ctx.arc(
      food.current.x * cellW + cellW / 2,
      food.current.y * cellH + cellH / 2,
      cellW / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Snake
    snake.current.forEach((p, i) => {
      const alpha = 1 - (i / snake.current.length) * 0.5;
      ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
      ctx.shadowBlur = i === 0 ? 15 : 5;
      ctx.shadowColor = '#00ffff';
      
      const padding = 2;
      ctx.fillRect(
        p.x * cellW + padding,
        p.y * cellH + padding,
        cellW - padding * 2,
        cellH - padding * 2
      );
    });

    ctx.shadowBlur = 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;

    const loop = (timestamp: number) => {
      if (!isPaused && !isGameOver) {
        if (timestamp - lastTime.current > speed.current) {
          update();
          lastTime.current = timestamp;
        }
      }
      
      draw(ctx, canvas.width, canvas.height);
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [isPaused, isGameOver]);

  const handleCanvasClick = () => {
    if (isGameOver) {
      resetGame();
    } else {
      setIsPaused(p => !p);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer group" onClick={handleCanvasClick}>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="w-full h-full"
      />

      {(isPaused || isGameOver) && (
        <div className="absolute inset-0 bg-cyber-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
          {isGameOver ? (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <h2 className="text-4xl font-display font-bold text-neon-pink neon-glow-pink">SYSTEM CRASH</h2>
              <p className="text-white/60 font-mono text-sm tracking-widest uppercase">Score: {score}</p>
              <button 
                className="mt-6 px-8 py-3 bg-neon-cyan text-cyber-black font-bold uppercase rounded-full hover:scale-105 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  resetGame();
                }}
              >
                Reboot System
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in duration-300">
              <h2 className="text-4xl font-display font-bold text-neon-cyan neon-glow-cyan">LEVEL PAUSED</h2>
              <p className="text-white/60 font-mono text-sm tracking-widest uppercase">Ready to Hack?</p>
              <button 
                className="mt-6 px-8 py-3 bg-neon-pink text-white font-bold uppercase rounded-full hover:scale-105 transition-transform"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaused(false);
                }}
              >
                Resume Sequence
              </button>
            </div>
          )}
          <p className="absolute bottom-8 text-[10px] text-white/30 font-mono animate-pulse">
            PRESS [SPACE] OR CLICK TO INTERACT
          </p>
        </div>
      )}
    </div>
  );
}
