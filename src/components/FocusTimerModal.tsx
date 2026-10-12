import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, X, Flame, Sparkles } from 'lucide-react';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({ isOpen, onClose }) => {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [sessionCount, setSessionCount] = useState(2);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setSessionCount(prev => prev + 1);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const selectDuration = (mins: number) => {
    setIsRunning(false);
    setTotalSeconds(mins * 60);
    setTimeLeft(mins * 60);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl glass-panel-glow border border-violet-500/30 p-6 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-600/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg text-white">Chuqur Diqqat Taymeri</h3>
              <p className="text-xs text-slate-400">Pomodoro diqqatni jamlash rejimi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Circular Timer Display */}
        <div className="relative flex items-center justify-center my-6">
          <svg className="w-56 h-56 transform -rotate-90">
            <circle
              cx="112"
              cy="112"
              r="98"
              className="text-slate-800"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="112"
              cy="112"
              r="98"
              stroke="url(#timerGradient)"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 98}
              strokeDashoffset={2 * Math.PI * 98 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="font-mono text-4xl font-bold tracking-tight text-white drop-shadow">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/40">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{sessionCount} ta seans bajarildi</span>
            </div>
          </div>
        </div>

        {/* Duration Selectors */}
        <div className="flex justify-center gap-2 mb-6">
          {[15, 25, 45, 60].map(mins => (
            <button
              key={mins}
              onClick={() => selectDuration(mins)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                totalSeconds === mins * 60
                  ? 'bg-violet-600/30 border-violet-400 text-white'
                  : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-white'
              }`}
            >
              {mins} daqiqa
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              setIsRunning(false);
              setTimeLeft(totalSeconds);
            }}
            className="p-3 rounded-xl bg-slate-800/60 border border-white/5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="Qayta boshlash"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium flex items-center gap-2 shadow-lg shadow-violet-600/25 hover:opacity-95 active:scale-95 transition-all"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" /> To‘xtatish
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" /> Boshlash
              </>
            )}
          </button>

          <button
            onClick={() => setIsSoundOn(!isSoundOn)}
            className={`p-3 rounded-xl border border-white/5 transition-colors ${
              isSoundOn ? 'bg-violet-950/40 text-violet-400' : 'bg-slate-800/60 text-slate-500'
            }`}
            title="Ovoz"
          >
            {isSoundOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
