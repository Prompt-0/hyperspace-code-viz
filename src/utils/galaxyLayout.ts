import type { CodeNode, FileCategory } from '../types/codebase';

export function getFileCategory(path: string): FileCategory {
  const lower = path.toLowerCase();
  if (lower.includes('test') || lower.includes('spec') || lower.endsWith('.test.ts')) return 'tests';
  if (lower.includes('ui') || lower.includes('component') || lower.endsWith('.tsx') || lower.endsWith('.jsx') || lower.endsWith('.css')) return 'ui';
  if (lower.includes('api') || lower.includes('route') || lower.includes('service') || lower.includes('server')) return 'api';
  if (lower.includes('config') || lower.includes('.json') || lower.includes('env')) return 'config';
  if (lower.includes('util') || lower.includes('helper') || lower.includes('lib')) return 'utils';
  if (lower.includes('asset') || lower.includes('public') || lower.endsWith('.png') || lower.endsWith('.svg')) return 'assets';
  return 'core';
}

export function computeHierarchicalGalaxyLayout(nodes: CodeNode[]): CodeNode[] {
  // Group nodes by directory path depth
  const depthMap = new Map<number, CodeNode[]>();

  nodes.forEach(node => {
    const depth = (node.path.match(/\//g) || []).length;
    if (!depthMap.has(depth)) {
      depthMap.set(depth, []);
    }
    depthMap.get(depth)!.push(node);
  });

  const processedNodes: CodeNode[] = [];

  depthMap.forEach((depthNodes, depth) => {
    const ringRadius = 18 + depth * 22; // Concentric ring radius
    const count = depthNodes.length;
    const spiralArmAngleOffset = (depth * Math.PI) / 4;

    depthNodes.forEach((node, index) => {
      const angle = spiralArmAngleOffset + (index / count) * Math.PI * 2;
      // Slight vertical wave offset to give 3D depth
      const heightY = Math.sin(angle * 3 + depth) * 12;

      const posX = Math.cos(angle) * ringRadius;
      const posZ = Math.sin(angle) * ringRadius;

      processedNodes.push({
        ...node,
        position: [posX, heightY, posZ]
      });
    });
  });

  return processedNodes;
}
