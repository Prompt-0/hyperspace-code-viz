import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Repository } from '../types/codebase';
import { soundEffects } from '../utils/soundEffects';

interface RepoImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportRepo: (repo: Repository) => void;
}

const SAMPLE_CUSTOM_JSON = JSON.stringify({
  id: 'my-custom-app',
  name: 'NextGen AI Workspace App',
  description: 'Custom uploaded codebase structure with frontend, API routes, and database models.',
  icon: 'Zap',
  starCount: 540,
  totalFiles: 4,
  totalLines: 1890,
  commits: [
    {
      id: 'c1',
      hash: 'a1b2c3',
      author: 'Developer User',
      message: 'initial commit of custom workspace app',
      date: '2026-08-10 14:00',
      affectedFiles: ['main-entry', 'api-router'],
      additions: 450,
      deletions: 0
    }
  ],
  nodes: [
    {
      id: 'main-entry',
      name: 'index.tsx',
      path: 'src/index.tsx',
      extension: 'tsx',
      category: 'ui',
      linesOfCode: 420,
      sizeBytes: 15400,
      lastModified: 'Just now',
      author: 'Developer User',
      dependencies: ['api-router', 'theme-config'],
      dependents: [],
      content: 'export default function App() { return <div>Hello Hyperspace</div>; }',
      position: [0, 0, 0]
    },
    {
      id: 'api-router',
      name: 'router.ts',
      path: 'src/api/router.ts',
      extension: 'ts',
      category: 'api',
      linesOfCode: 680,
      sizeBytes: 24000,
      lastModified: '1 hour ago',
      author: 'Developer User',
      dependencies: ['db-client'],
      dependents: ['main-entry'],
      content: 'export class Router { route(req: Request) { return new Response("OK"); } }',
      position: [-16, 12, 10]
    },
    {
      id: 'db-client',
      name: 'db.ts',
      path: 'src/db/db.ts',
      extension: 'ts',
      category: 'core',
      linesOfCode: 550,
      sizeBytes: 19000,
      lastModified: 'Yesterday',
      author: 'Database Specialist',
      dependencies: [],
      dependents: ['api-router'],
      content: 'export const db = new DatabaseClient({ uri: "postgresql://localhost:5432" });',
      position: [18, -10, -12]
    },
    {
      id: 'theme-config',
      name: 'theme.ts',
      path: 'src/theme.ts',
      extension: 'ts',
      category: 'config',
      linesOfCode: 240,
      sizeBytes: 8500,
      lastModified: '2 days ago',
      author: 'UI Designer',
      dependencies: [],
      dependents: ['main-entry'],
      content: 'export const theme = { primary: "#00f3ff", bg: "#030712" };',
      position: [-10, -15, 14]
    }
  ]
}, null, 2);

export const RepoImporterModal: React.FC<RepoImporterModalProps> = ({
  isOpen,
  onClose,
  onImportRepo
}) => {
  const [jsonText, setJsonText] = useState(SAMPLE_CUSTOM_JSON);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImport = () => {
    try {
      setError(null);
      const parsed = JSON.parse(jsonText);
      if (!parsed.id || !parsed.name || !Array.isArray(parsed.nodes)) {
        throw new Error('Invalid schema! Must contain id, name, and nodes array.');
      }
      onImportRepo(parsed);
      soundEffects.playWarpJump();
      onClose();
    } catch (err: any) {
      setError(err.message || 'JSON Parsing Error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-6 animate-fade-in font-mono">
      <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(0,243,255,0.2)] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import Custom Codebase JSON</h3>
              <p className="text-xs text-slate-400">Paste your custom repository node graph schema</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>JSON Repository Schema:</span>
            <button
              onClick={() => setJsonText(SAMPLE_CUSTOM_JSON)}
              className="text-cyan-400 hover:underline"
            >
              Reset Sample Template
            </button>
          </div>

          <textarea
            rows={12}
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-cyan-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(0,243,255,0.4)] transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Parse & Render Galaxy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
