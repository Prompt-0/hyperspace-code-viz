import { useState, useMemo } from 'react';
import { CosmosCanvas } from './components/CosmosCanvas';
import { GalaxyHeader } from './components/GalaxyHeader';
import { FileInspector } from './components/FileInspector';
import { CommitTimeline } from './components/CommitTimeline';
import { RepoImporterModal } from './components/RepoImporterModal';
import { GitHubImportModal } from './components/GitHubImportModal';
import { HyperspaceWarpOverlay } from './components/HyperspaceWarpOverlay';
import { PRESET_REPOSITORIES } from './data/mockRepositories';
import type { Repository, CodeNode, CameraViewMode, FileCategory } from './types/codebase';
import { soundEffects } from './utils/soundEffects';

export function App() {
  const [repositories, setRepositories] = useState<Repository[]>(PRESET_REPOSITORIES);
  const [selectedRepo, setSelectedRepo] = useState<Repository>(PRESET_REPOSITORIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | 'all'>('all');
  const [selectedNode, setSelectedNode] = useState<CodeNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<CodeNode | null>(null);
  const [viewMode, setViewMode] = useState<CameraViewMode>('galaxy');
  const [activeCommitIndex, setActiveCommitIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isWarpMode, setIsWarpMode] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isGitHubImporterOpen, setIsGitHubImporterOpen] = useState(false);

  // Filter nodes based on search query & selected category
  const filteredNodes = useMemo(() => {
    return selectedRepo.nodes.filter(node => {
      const matchesSearch = 
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [selectedRepo, searchQuery, selectedCategory]);

  // Files affected by the current time-travel commit
  const activeCommitFiles = useMemo(() => {
    if (!selectedRepo.commits || selectedRepo.commits.length === 0) return [];
    const commit = selectedRepo.commits[activeCommitIndex] || selectedRepo.commits[0];
    return commit.affectedFiles || [];
  }, [selectedRepo, activeCommitIndex]);

  const handleSelectRepo = (repo: Repository) => {
    setSelectedRepo(repo);
    setSelectedNode(null);
    setHoveredNode(null);
    setActiveCommitIndex(0);
    soundEffects.playWarpJump();
  };

  const handleToggleSound = () => {
    const muted = soundEffects.toggleMute();
    setIsMuted(muted);
  };

  const handleToggleWarp = () => {
    setIsWarpMode(prev => !prev);
    soundEffects.playWarpJump();
  };

  const handleImportRepo = (newRepo: Repository) => {
    setRepositories(prev => [newRepo, ...prev]);
    setSelectedRepo(newRepo);
    setSelectedNode(null);
    setActiveCommitIndex(0);
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden text-white font-sans select-none">
      {/* 3D WebGL Canvas */}
      <CosmosCanvas
        nodes={filteredNodes}
        selectedNode={selectedNode}
        hoveredNode={hoveredNode}
        activeCommitFiles={activeCommitFiles}
        viewMode={viewMode}
        isWarpMode={isWarpMode}
        onSelectNode={setSelectedNode}
        onHoverNode={setHoveredNode}
      />

      {/* Speed Lines Light-Speed Warp Overlay */}
      <HyperspaceWarpOverlay isActive={isWarpMode} />

      {/* Futuristic Header */}
      <GalaxyHeader
        repositories={repositories}
        selectedRepo={selectedRepo}
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        viewMode={viewMode}
        isMuted={isMuted}
        isWarpMode={isWarpMode}
        onSelectRepo={handleSelectRepo}
        onSearchChange={setSearchQuery}
        onCategoryChange={setSelectedCategory}
        onViewModeChange={setViewMode}
        onToggleSound={handleToggleSound}
        onToggleWarp={handleToggleWarp}
        onOpenImporter={() => setIsImporterOpen(true)}
        onOpenGitHubImporter={() => setIsGitHubImporterOpen(true)}
      />

      {/* File Inspector Slide-over Drawer */}
      <FileInspector
        node={selectedNode}
        allNodes={selectedRepo.nodes}
        repoName={selectedRepo.name}
        onClose={() => setSelectedNode(null)}
        onFocusNode={(node) => {
          setSelectedNode(node);
          soundEffects.playWarpJump();
        }}
      />

      {/* Git Commit Time-Travel Player */}
      <CommitTimeline
        commits={selectedRepo.commits}
        activeCommitIndex={activeCommitIndex}
        onCommitChange={setActiveCommitIndex}
      />

      {/* Custom Repository Schema Importer Modal */}
      <RepoImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImportRepo={handleImportRepo}
      />

      {/* Live GitHub Repository Importer Modal */}
      <GitHubImportModal
        isOpen={isGitHubImporterOpen}
        onClose={() => setIsGitHubImporterOpen(false)}
        onImportRepo={handleImportRepo}
      />
    </div>
  );
}

export default App;
