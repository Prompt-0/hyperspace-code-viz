import React, { useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, GitCommit, Calendar, Plus, Minus, User } from 'lucide-react';
import type { CommitRecord } from '../types/codebase';
import { soundEffects } from '../utils/soundEffects';

interface CommitTimelineProps {
  commits: CommitRecord[];
  activeCommitIndex: number;
  onCommitChange: (index: number) => void;
}

export const CommitTimeline: React.FC<CommitTimelineProps> = ({
  commits,
  activeCommitIndex,
  onCommitChange
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play timeline loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying && commits.length > 0) {
      timer = setInterval(() => {
        onCommitChange((activeCommitIndex + 1) % commits.length);
        soundEffects.playLaserBeam();
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, activeCommitIndex, commits, onCommitChange]);

  if (!commits || commits.length === 0) return null;

  const activeCommit = commits[activeCommitIndex] || commits[0];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-[640px] max-w-[90vw] glass-panel px-6 py-4 rounded-2xl border border-cyan-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.9)] backdrop-blur-xl font-mono text-xs flex flex-col gap-3">
      {/* Control Bar & Commit Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <GitCommit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-cyan-400 font-bold">{activeCommit.hash}</span>
              <span className="text-slate-300 font-medium truncate max-w-[280px]">{activeCommit.message}</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center space-x-3 mt-0.5">
              <span className="flex items-center space-x-1"><User className="w-3 h-3 text-slate-500" /> {activeCommit.author}</span>
              <span className="flex items-center space-x-1"><Calendar className="w-3 h-3 text-slate-500" /> {activeCommit.date}</span>
            </div>
          </div>
        </div>

        {/* Diff Stats Badge */}
        <div className="flex items-center space-x-2 text-xs font-semibold">
          <span className="text-emerald-400 flex items-center"><Plus className="w-3 h-3" />{activeCommit.additions}</span>
          <span className="text-rose-400 flex items-center"><Minus className="w-3 h-3" />{activeCommit.deletions}</span>
        </div>
      </div>

      {/* Timeline Slider & Play Controls */}
      <div className="flex items-center space-x-4 pt-1">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onCommitChange(Math.max(0, activeCommitIndex - 1))}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              soundEffects.playNodeSelect();
            }}
            className="p-2 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold transition-all shadow-[0_0_12px_rgba(0,243,255,0.4)]"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={() => onCommitChange((activeCommitIndex + 1) % commits.length)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Scrub Slider */}
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min="0"
            max={commits.length - 1}
            value={activeCommitIndex}
            onChange={(e) => {
              onCommitChange(Number(e.target.value));
              soundEffects.playLaserBeam();
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Commit {activeCommitIndex + 1} / {commits.length}
        </div>
      </div>
    </div>
  );
};
