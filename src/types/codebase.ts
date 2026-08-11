export type FileCategory = 
  | 'core' 
  | 'ui' 
  | 'utils' 
  | 'api' 
  | 'config' 
  | 'assets' 
  | 'tests';

export interface CodeNode {
  id: string;
  name: string;
  path: string;
  extension: string;
  category: FileCategory;
  linesOfCode: number;
  sizeBytes: number;
  lastModified: string;
  author: string;
  dependencies: string[]; // Node IDs that this node imports
  dependents: string[];   // Node IDs that import this node
  content: string;
  // 3D Layout coordinates (calculated or manually specified)
  position?: [number, number, number];
  color?: string;
  clusterRadius?: number;
  orbitalAngle?: number;
  commitActivityScore?: number; // 0 to 100 indicator for pulsing glow
}

export interface CommitRecord {
  id: string;
  hash: string;
  author: string;
  message: string;
  date: string;
  affectedFiles: string[]; // Array of Node IDs modified in this commit
  additions: number;
  deletions: number;
}

export interface Repository {
  id: string;
  name: string;
  description: string;
  icon: string;
  starCount: number;
  totalFiles: number;
  totalLines: number;
  nodes: CodeNode[];
  commits: CommitRecord[];
}

export interface FilterState {
  searchQuery: string;
  selectedCategory: FileCategory | 'all';
  minLines: number;
  maxLines: number;
  showDependenciesOnly: boolean;
}

export type CameraViewMode = 'galaxy' | 'topdown' | 'cluster' | 'hyperspace';
