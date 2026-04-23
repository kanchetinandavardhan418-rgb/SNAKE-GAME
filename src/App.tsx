/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, Trophy, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SnakeGame from './components/SnakeGame';

interface Track {
  id: number;
  title: string;
  artist: string;
  url: string;
  cover: string;
}

const TRACKS: Track[] = [
  {
    id: 1,
    title: "Synthwave Sunset",
    artist: "AI Voyager",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Cyber District",
    artist: "Neon Pulse",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Neon Nights",
    artist: "Digital Echo",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
  }
];

export default function App() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const handleScoreUpdate = (newScore: number) => {
    setScore(newScore);
    if (newScore > highScore) {
      setHighScore(newScore);
    }
  };

  return (
    <div className="grid grid-cols-[280px_1fr] grid-rows-[60px_1fr_100px] h-screen w-full bg-[#111] overflow-hidden">
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={handleNext}
      />

      {/* Header */}
      <header className="col-span-2 bg-header-dark flex items-center px-6 justify-between border-b border-border-subtle z-20">
        <div className="neon-text-cyan font-black tracking-[2px] text-xl">SYNTH-SNAKE V1.0</div>
        
        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-[10px] uppercase opacity-60">High Score</div>
            <div className="text-lg font-mono font-bold">{highScore.toString().padStart(5, '0')}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase opacity-60">Current Score</div>
            <div className="text-2xl font-mono font-bold neon-text-pink">{score.toString().padStart(5, '0')}</div>
          </div>
        </div>
      </header>

      {/* Sidebar - Library */}
      <aside className="bg-panel-dark p-5 border-r border-border-subtle overflow-y-auto">
        <h3 className="text-[12px] uppercase text-[#555] mb-4 font-bold tracking-widest">Your Library</h3>
        <div className="space-y-2">
          {TRACKS.map((track, idx) => (
            <div 
              key={track.id}
              onClick={() => setCurrentTrackIndex(idx)}
              className={`p-3 rounded-lg transition-all cursor-pointer ${
                idx === currentTrackIndex 
                ? 'bg-neon-cyan/10 border-l-3 border-neon-cyan' 
                : 'bg-white/3 hover:bg-white/5'
              }`}
            >
              <div className="font-bold text-sm">{track.title}</div>
              <div className="text-xs opacity-60">{track.artist}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-white/5">
          <h3 className="text-[12px] uppercase text-[#555] mb-4 font-bold tracking-widest">Controls</h3>
          <ul className="text-[10px] space-y-2 text-white/40 font-mono">
            <li className="flex justify-between"><span>MOVE</span> <span className="text-neon-cyan">WASD / ARROWS</span></li>
            <li className="flex justify-between"><span>PAUSE</span> <span className="text-neon-cyan">SPACE</span></li>
          </ul>
        </div>
      </aside>

      {/* Main Game Area */}
      <main className="bg-cyber-black flex flex-col items-center justify-center relative p-8">
        <div className="relative w-full max-w-[500px] aspect-square neon-border bg-black">
          <SnakeGame onScoreUpdate={handleScoreUpdate} />
        </div>
        <div className="mt-6 text-[11px] color-[#444] tracking-widest uppercase opacity-40">
          Use Arrow keys to navigate the grid
        </div>
      </main>

      {/* Footer Player */}
      <footer className="col-span-2 bg-header-dark border-t border-border-subtle grid grid-cols-[280px_1fr_280px] items-center px-6 z-20">
        <div className="flex items-center gap-4">
          <motion.div 
            key={currentTrack.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-12 h-12 overflow-hidden bg-gradient-to-br from-neon-cyan to-neon-pink p-[1px]"
          >
            <img src={currentTrack.cover} className="w-full h-full object-cover" alt="" />
          </motion.div>
          <div>
            <div className="font-bold text-sm truncate max-w-[200px]">{currentTrack.title}</div>
            <div className="text-[11px] opacity-60">Now Playing</div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-6">
            <button onClick={handlePrev} className="text-white opacity-60 hover:opacity-100 transition-opacity">
              <SkipBack className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-12 h-12 rounded-full bg-neon-cyan text-black flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="fill-current" /> : <Play className="fill-current ml-1" />}
            </button>
            <button onClick={handleNext} className="text-white opacity-60 hover:opacity-100 transition-opacity">
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
          
          <div className="w-[400px] flex flex-col gap-1">
            <div className="flex justify-between text-[10px] opacity-40 font-mono">
              <span>00:45</span>
              <span>03:22</span>
            </div>
            <div className="h-[4px] bg-[#333] w-full rounded-full relative overflow-hidden">
              <motion.div 
                animate={{ width: isPlaying ? '100%' : '45%' }}
                transition={{ duration: 180, ease: "linear" }}
                className="h-full bg-neon-cyan rounded-full shadow-[0_0_8px_#00ffff]"
              />
            </div>
          </div>
        </div>

        <div className="text-right flex items-center justify-end gap-3">
          <span className="text-[11px] opacity-40 font-bold uppercase tracking-widest">Volume</span>
          <div className="w-24 h-[2px] bg-[#333] relative">
            <div className="absolute left-0 top-0 h-full w-[70%] bg-white" />
          </div>
        </div>
      </footer>
    </div>
  );
}
