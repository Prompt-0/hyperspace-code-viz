import React, { useState } from 'react';
import { X, GitBranch, Key, Sparkles, Loader2, AlertCircle, CheckCircle2, Globe } from 'lucide-react';
import type { Repository } from '../types/codebase';
import { fetchLiveGitHubRepo, getGitHubPAT, setGitHubPAT, parseGitHubUrl } from '../utils/githubApi';
import { soundEffects } from '../utils/soundEffects';

interface GitHubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportRepo: (repo: Repository) => void;
}

const POPULAR_REPOS = [
  { name: 'facebook/react', label: 'React Core Engine' },
  { name: 'mrdoob/three.js', label: 'Three.js WebGL' },
  { name: 'lucide-icons/lucide', label: 'Lucide Icon Library' },
  { name: 'tailwindlabs/tailwindcss', label: 'Tailwind CSS Engine' }
];

export const GitHubImportModal: React.FC<GitHubImportModalProps> = ({
  isOpen,
  onClose,
  onImportRepo
}) => {
  const [repoInput, setRepoInput] = useState('facebook/react');
  const [patToken, setPatToken] = useState(getGitHubPAT());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveToken = () => {
    setGitHubPAT(patToken);
    soundEffects.playNodeSelect();
  };

  const handleFetchRepo = async (targetRepo?: string) => {
    const inputToUse = targetRepo || repoInput;
    const parsed = parseGitHubUrl(inputToUse);
    if (!parsed) {
      setError('Please enter a valid GitHub repository URL or owner/repo format (e.g. facebook/react).');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      soundEffects.playLaserBeam();

      const liveRepo = await fetchLiveGitHubRepo(parsed.owner, parsed.repo);
      onImportRepo(liveRepo);
      soundEffects.playWarpJump();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to fetch GitHub repository.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-6 animate-fade-in font-mono">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(0,243,255,0.25)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Connect Live GitHub Repository <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              </h3>
              <p className="text-xs text-slate-400">Visualize any public or private GitHub repository in 3D</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-950/70 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Repo Input Box */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Repository URL or Owner/Repo
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="e.g. facebook/react or https://github.com/mrdoob/three.js"
                className="flex-1 bg-slate-950 border border-slate-800 text-cyan-100 text-xs font-mono rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
              <button
                onClick={() => handleFetchRepo()}
                disabled={isLoading}
                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs px-5 py-3 rounded-xl shadow-[0_0_15px_rgba(0,243,255,0.4)] transition-all disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{isLoading ? 'Fetching Tree...' : 'Fetch Live 3D'}</span>
              </button>
            </div>
          </div>

          {/* Quick-Load Presets */}
          <div className="space-y-2">
            <span className="text-[11px] text-slate-400 font-mono">Popular Open-Source Presets:</span>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_REPOS.map(repo => (
                <button
                  key={repo.name}
                  onClick={() => {
                    setRepoInput(repo.name);
                    handleFetchRepo(repo.name);
                  }}
                  disabled={isLoading}
                  className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-left transition-all group"
                >
                  <div className="text-xs font-semibold text-white group-hover:text-cyan-300">{repo.name}</div>
                  <div className="text-[10px] text-slate-500">{repo.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Personal Access Token (PAT) Accordion */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <label className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> Optional Personal Access Token (PAT)
            </label>
            <p className="text-[11px] text-slate-400">
              GitHub allows 60 requests/hr for unauthenticated calls, or 5,000 requests/hr with a PAT. Token is stored strictly locally in your browser storage.
            </p>
            <div className="flex space-x-2">
              <input
                type="password"
                value={patToken}
                onChange={(e) => setPatToken(e.target.value)}
                placeholder="github_pat_..."
                className="flex-1 bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono rounded-xl px-4 py-2 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleSaveToken}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                Save PAT Token
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
