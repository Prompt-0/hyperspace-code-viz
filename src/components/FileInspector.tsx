import React, { useState, useEffect } from 'react';
import { 
  X, 
  Code, 
  GitBranch, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Copy, 
  Check, 
  FileText, 
  Clock, 
  Eye,
  Loader2,
  RefreshCw
} from 'lucide-react';
import type { CodeNode } from '../types/codebase';
import { fetchRawFileContent } from '../utils/githubApi';
import { soundEffects } from '../utils/soundEffects';

interface FileInspectorProps {
  node: CodeNode | null;
  allNodes: CodeNode[];
  repoName: string;
  onClose: () => void;
  onFocusNode: (node: CodeNode) => void;
}

export const FileInspector: React.FC<FileInspectorProps> = ({
  node,
  allNodes,
  repoName,
  onClose,
  onFocusNode
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'deps' | 'history'>('code');
  const [copied, setCopied] = useState(false);
  const [codeContent, setCodeContent] = useState<string>('');
  const [isFetchingRaw, setIsFetchingRaw] = useState(false);

  useEffect(() => {
    if (node) {
      setCodeContent(node.content);
    }
  }, [node]);

  if (!node) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    soundEffects.playNodeSelect();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFetchLiveRaw = async () => {
    if (!repoName.includes('/')) return;
    const [owner, repo] = repoName.split('/');
    try {
      setIsFetchingRaw(true);
      soundEffects.playLaserBeam();
      const raw = await fetchRawFileContent(owner, repo, node.path);
      setCodeContent(raw);
      soundEffects.playWarpJump();
    } catch {
      // Keep existing content on fail
    } finally {
      setIsFetchingRaw(false);
    }
  };

  // Find dependency node objects
  const dependencies = node.dependencies
    .map(id => allNodes.find(n => n.id === id))
    .filter((n): n is CodeNode => n !== undefined);

  const dependents = node.dependents
    .map(id => allNodes.find(n => n.id === id))
    .filter((n): n is CodeNode => n !== undefined);

  return (
    <div className="fixed top-28 right-6 bottom-16 z-30 w-[480px] bg-slate-950/85 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-slide-in font-mono">
      {/* Drawer Header */}
      <div className="px-5 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_10px_rgba(0,243,255,0.3)]">
            <Code className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h2 className="text-base font-bold text-white truncate">{node.name}</h2>
            <p className="text-[11px] text-slate-400 truncate">{node.path}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Meta Stats Row */}
      <div className="grid grid-cols-3 gap-2 px-5 py-3 bg-slate-900/50 border-b border-slate-800 text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase">Category</span>
          <span className="text-cyan-400 font-semibold uppercase">{node.category}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase">Lines of Code</span>
          <span className="text-emerald-400 font-semibold">{node.linesOfCode} LOC</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase">Author</span>
          <span className="text-amber-300 truncate">{node.author}</span>
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex border-b border-slate-800 px-5 bg-slate-950">
        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 text-xs font-semibold transition-all ${
            activeTab === 'code'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Code View</span>
        </button>
        <button
          onClick={() => setActiveTab('deps')}
          className={`flex items-center space-x-2 py-2.5 px-3 border-b-2 text-xs font-semibold transition-all ${
            activeTab === 'deps'
              ? 'border-cyan-400 text-cyan-400 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Links ({dependencies.length + dependents.length})</span>
        </button>
      </div>

      {/* Tab Body Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* TAB 1: CODE VIEW */}
        {activeTab === 'code' && (
          <div className="relative">
            <div className="absolute top-2 right-2 z-10 flex items-center space-x-2">
              {repoName.includes('/') && (
                <button
                  onClick={handleFetchLiveRaw}
                  disabled={isFetchingRaw}
                  className="flex items-center space-x-1 bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:text-white px-2 py-1 rounded-md text-[11px] transition-all"
                  title="Fetch real source code from GitHub"
                >
                  {isFetchingRaw ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                  <span>Live GitHub</span>
                </button>
              )}
              <button
                onClick={handleCopyCode}
                className="flex items-center space-x-1 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-md text-[11px] transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-cyan-100 overflow-x-auto leading-relaxed shadow-inner">
              <code>
                {codeContent.split('\n').map((line, idx) => (
                  <div key={idx} className="flex">
                    <span className="w-8 select-none text-slate-600 text-right pr-3 shrink-0">{idx + 1}</span>
                    <span className="whitespace-pre">{line}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        )}

        {/* TAB 2: DEPENDENCIES & DEPENDENTS GRAPH */}
        {activeTab === 'deps' && (
          <div className="space-y-6">
            {/* Outgoing Dependencies */}
            <div>
              <h4 className="text-xs uppercase text-cyan-400 font-bold tracking-wider flex items-center gap-1.5 mb-3">
                <ArrowUpRight className="w-4 h-4 text-cyan-400" /> Imports ({dependencies.length})
              </h4>
              {dependencies.length === 0 ? (
                <div className="text-xs text-slate-500 italic bg-slate-900/40 p-3 rounded-xl border border-slate-800">No outgoing module imports.</div>
              ) : (
                <div className="space-y-2">
                  {dependencies.map(dep => (
                    <div
                      key={dep.id}
                      onClick={() => { onFocusNode(dep); soundEffects.playLaserBeam(); }}
                      className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-xl flex items-center justify-between cursor-pointer group transition-all"
                    >
                      <div>
                        <div className="text-xs text-white font-medium group-hover:text-cyan-300">{dep.name}</div>
                        <div className="text-[10px] text-slate-400">{dep.path}</div>
                      </div>
                      <Eye className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Incoming Dependents */}
            <div>
              <h4 className="text-xs uppercase text-pink-400 font-bold tracking-wider flex items-center gap-1.5 mb-3">
                <ArrowDownLeft className="w-4 h-4 text-pink-400" /> Imported By ({dependents.length})
              </h4>
              {dependents.length === 0 ? (
                <div className="text-xs text-slate-500 italic bg-slate-900/40 p-3 rounded-xl border border-slate-800">No other modules import this file.</div>
              ) : (
                <div className="space-y-2">
                  {dependents.map(dep => (
                    <div
                      key={dep.id}
                      onClick={() => { onFocusNode(dep); soundEffects.playLaserBeam(); }}
                      className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/40 rounded-xl flex items-center justify-between cursor-pointer group transition-all"
                    >
                      <div>
                        <div className="text-xs text-white font-medium group-hover:text-pink-300">{dep.name}</div>
                        <div className="text-[10px] text-slate-400">{dep.path}</div>
                      </div>
                      <Eye className="w-4 h-4 text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Drawer Footer */}
      <div className="px-5 py-3 bg-slate-950 border-t border-slate-900 text-[11px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Last modified {node.lastModified}</span>
        </span>
        <button
          onClick={() => onFocusNode(node)}
          className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
        >
          <span>Hyperspace Jump</span> 🚀
        </button>
      </div>
    </div>
  );
};
