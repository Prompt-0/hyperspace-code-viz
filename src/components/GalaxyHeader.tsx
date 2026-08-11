import React from 'react';
import { 
  Sparkles, 
  Search, 
  Volume2, 
  VolumeX, 
  Zap, 
  FolderPlus, 
  Layers, 
  Globe, 
  Target, 
  Compass,
  GitBranch
} from 'lucide-react';
import type { Repository, CameraViewMode, FileCategory } from '../types/codebase';

interface GalaxyHeaderProps {
  repositories: Repository[];
  selectedRepo: Repository;
  searchQuery: string;
  selectedCategory: FileCategory | 'all';
  viewMode: CameraViewMode;
  isMuted: boolean;
  isWarpMode: boolean;
  onSelectRepo: (repo: Repository) => void;
  onSearchChange: (query: string) => void;
  onCategoryChange: (cat: FileCategory | 'all') => void;
  onViewModeChange: (mode: CameraViewMode) => void;
  onToggleSound: () => void;
  onToggleWarp: () => void;
  onOpenImporter: () => void;
  onOpenGitHubImporter: () => void;
}

const CATEGORIES: { id: FileCategory | 'all'; label: string; color: string }[] = [
  { id: 'all', label: 'All Modules', color: 'border-cyan-500/40 text-cyan-300' },
  { id: 'core', label: 'Core', color: 'border-cyan-400 text-cyan-400' },
  { id: 'ui', label: 'UI', color: 'border-pink-500 text-pink-400' },
  { id: 'utils', label: 'Utils', color: 'border-amber-400 text-amber-300' },
  { id: 'api', label: 'API & Sandbox', color: 'border-purple-500 text-purple-400' },
  { id: 'config', label: 'Config', color: 'border-emerald-500 text-emerald-400' }
];

export const GalaxyHeader: React.FC<GalaxyHeaderProps> = ({
  repositories,
  selectedRepo,
  searchQuery,
  selectedCategory,
  viewMode,
  isMuted,
  isWarpMode,
  onSelectRepo,
  onSearchChange,
  onCategoryChange,
  onViewModeChange,
  onToggleSound,
  onToggleWarp,
  onOpenImporter,
  onOpenGitHubImporter
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 px-6 py-4 flex flex-col gap-3 backdrop-blur-xl bg-slate-950/70 border-b border-cyan-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)] font-mono">
      {/* Top Bar: Title & Primary Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        
        {/* Brand Logo & Repo Selector */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-fuchsia-600 p-[1px] shadow-[0_0_20px_rgba(0,243,255,0.4)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-fuchsia-400">
                HYPERSPACE<span className="text-white font-sans text-xs ml-2 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40">v3.0 LIVE</span>
              </h1>
              <p className="text-xs text-slate-400 font-mono">Interactive 3D Codebase Galaxy Topology</p>
            </div>
          </div>

          {/* Repository Selector Dropdown */}
          <div className="relative flex items-center">
            <select
              value={selectedRepo.id}
              onChange={(e) => {
                const found = repositories.find(r => r.id === e.target.value);
                if (found) onSelectRepo(found);
              }}
              className="appearance-none bg-slate-900/90 text-slate-200 border border-cyan-500/30 rounded-xl px-4 py-2 pr-10 text-sm font-mono focus:outline-none focus:border-cyan-400 shadow-inner cursor-pointer hover:bg-slate-800/80 transition-colors"
            >
              {repositories.map(repo => (
                <option key={repo.id} value={repo.id} className="bg-slate-900 text-white">
                  {repo.name} ({repo.totalFiles} files • {repo.totalLines} LOC)
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 text-cyan-400">
              ▼
            </div>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search file, symbol, path..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-56 bg-slate-900/80 border border-cyan-500/30 text-white text-xs font-mono rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-slate-500"
            />
          </div>

          {/* Camera View Mode Toggle Buttons */}
          <div className="flex bg-slate-900/80 border border-slate-800 rounded-xl p-1 font-mono text-xs">
            <button
              onClick={() => onViewModeChange('galaxy')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition-all ${
                viewMode === 'galaxy' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,243,255,0.2)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Galaxy</span>
            </button>
            <button
              onClick={() => onViewModeChange('topdown')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition-all ${
                viewMode === 'topdown' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,243,255,0.2)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Radar</span>
            </button>
            <button
              onClick={() => onViewModeChange('cluster')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg transition-all ${
                viewMode === 'cluster' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,243,255,0.2)]' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Cluster</span>
            </button>
          </div>

          {/* Warp Speed Toggle */}
          <button
            onClick={onToggleWarp}
            className={`p-2 rounded-xl border transition-all ${
              isWarpMode 
                ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300 shadow-[0_0_15px_rgba(255,0,255,0.5)] animate-pulse' 
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle Hyperspace Speed Mode"
          >
            <Zap className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-all ${
              !isMuted 
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_12px_rgba(0,243,255,0.3)]' 
                : 'bg-slate-900/80 border-slate-800 text-slate-500'
            }`}
            title="Toggle Audio Feedback"
          >
            {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Connect Live GitHub Button */}
          <button
            onClick={onOpenGitHubImporter}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-[0_0_15px_rgba(255,0,255,0.3)] transition-all"
          >
            <GitBranch className="w-4 h-4" />
            <span>GitHub Live</span>
          </button>

          {/* Load Custom JSON Button */}
          <button
            onClick={onOpenImporter}
            className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-semibold text-xs px-3 py-2 rounded-xl transition-all"
          >
            <FolderPlus className="w-4 h-4" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Category Pills & Live Metrics Bar */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono uppercase text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-400" /> Filter:
          </span>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`text-xs font-mono px-2.5 py-1 rounded-lg border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-white font-medium border-cyan-400 shadow-[0_0_8px_rgba(0,243,255,0.2)]'
                  : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Quick Stats Summary */}
        <div className="flex items-center space-x-5 text-xs font-mono text-slate-400">
          <div><span className="text-cyan-400 font-bold">{selectedRepo.totalFiles}</span> Files</div>
          <div><span className="text-fuchsia-400 font-bold">{selectedRepo.totalLines.toLocaleString()}</span> LOC</div>
          <div><span className="text-amber-400 font-bold">★ {selectedRepo.starCount.toLocaleString()}</span> Stars</div>
        </div>
      </div>
    </header>
  );
};
