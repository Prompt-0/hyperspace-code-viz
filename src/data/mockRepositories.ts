import type { Repository } from '../types/codebase';

export const PRESET_REPOSITORIES: Repository[] = [
  {
    id: 'antigravity-ai',
    name: 'Antigravity AI Agentic Framework',
    description: 'Autonomous multi-agent orchestration runtime with neural memory synthesis and zero-delay subagent streaming.',
    icon: 'Brain',
    starCount: 14200,
    totalFiles: 18,
    totalLines: 12450,
    commits: [
      {
        id: 'c1',
        hash: '9f8e7d6',
        author: 'Antigravity Core Lead',
        message: 'feat: add reactive multi-agent loop with subagent state management',
        date: '2026-08-10 12:30',
        affectedFiles: ['agent-loop', 'subagent-manager', 'memory-synthesizer'],
        additions: 340,
        deletions: 42
      },
      {
        id: 'c2',
        hash: '8a7b6c5',
        author: 'DeepMind Architect',
        message: 'perf: optimize AST search and semantic ripgrep indexing',
        date: '2026-08-09 18:45',
        affectedFiles: ['code-indexer', 'ast-parser', 'tool-executor'],
        additions: 190,
        deletions: 110
      },
      {
        id: 'c3',
        hash: '7c6b5a4',
        author: 'Quantum Dev',
        message: 'security: implement strictly scoped container runtime sandbox',
        date: '2026-08-08 10:15',
        affectedFiles: ['sandbox-runner', 'ipc-bridge'],
        additions: 512,
        deletions: 15
      }
    ],
    nodes: [
      {
        id: 'agent-loop',
        name: 'AgentOrchestrator.ts',
        path: 'src/core/AgentOrchestrator.ts',
        extension: 'ts',
        category: 'core',
        linesOfCode: 1280,
        sizeBytes: 45200,
        lastModified: '2 mins ago',
        author: 'Antigravity Core Lead',
        dependencies: ['memory-synthesizer', 'subagent-manager', 'tool-executor'],
        dependents: [],
        content: `import { Synthesizer } from './MemorySynthesizer';
import { SubagentManager } from './SubagentManager';
import { ToolExecutor } from '../tools/ToolExecutor';

export class AgentOrchestrator {
  private memory: Synthesizer;
  private manager: SubagentManager;
  private tools: ToolExecutor;

  constructor(config: OrchestratorConfig) {
    this.memory = new Synthesizer(config.memoryLimit);
    this.manager = new SubagentManager();
    this.tools = new ToolExecutor();
  }

  public async runStep(userInput: string): Promise<AgentResponse> {
    const context = await this.memory.synthesizeContext(userInput);
    const subagents = this.manager.getActiveSubagents();
    
    // Evaluate parallel execution branches
    const toolCall = await this.tools.evaluateNextAction(context, subagents);
    if (toolCall.isSubagentInvocation) {
      return this.manager.spawnChildAgent(toolCall.subagentPrompt);
    }
    
    return this.tools.executeCommand(toolCall);
  }
}`,
        position: [0, 0, 0],
        commitActivityScore: 95
      },
      {
        id: 'memory-synthesizer',
        name: 'MemorySynthesizer.ts',
        path: 'src/core/MemorySynthesizer.ts',
        extension: 'ts',
        category: 'core',
        linesOfCode: 840,
        sizeBytes: 28400,
        lastModified: '1 hour ago',
        author: 'Antigravity Core Lead',
        dependencies: ['ast-parser'],
        dependents: ['agent-loop'],
        content: `export class Synthesizer {
  private vectorCache: Map<string, Float32Array> = new Map();

  public async synthesizeContext(prompt: string): Promise<ContextWindow> {
    const embeddings = await this.computeEmbeddings(prompt);
    const topK = this.findNearestNeighbors(embeddings, 10);
    return {
      structuredMemory: topK,
      rawPrompt: prompt,
      timestamp: Date.now()
    };
  }

  private findNearestNeighbors(query: Float32Array, k: number) {
    // High-performance cosine similarity check
    return Array.from(this.vectorCache.entries())
      .map(([id, vec]) => ({ id, score: this.cosineSim(query, vec) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
  }

  private cosineSim(a: Float32Array, b: Float32Array): number {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}`,
        position: [-15, 8, 12],
        commitActivityScore: 80
      },
      {
        id: 'subagent-manager',
        name: 'SubagentManager.ts',
        path: 'src/core/SubagentManager.ts',
        extension: 'ts',
        category: 'core',
        linesOfCode: 920,
        sizeBytes: 31000,
        lastModified: '3 hours ago',
        author: 'DeepMind Architect',
        dependencies: ['ipc-bridge', 'sandbox-runner'],
        dependents: ['agent-loop'],
        content: `export class SubagentManager {
  private activeWorkers: Map<string, Worker> = new Map();

  public spawnChildAgent(role: string): AgentResponse {
    const workerId = 'agent-' + Math.random().toString(36).substr(2, 9);
    console.log(\`[SubagentManager] Spawning isolated subagent \${workerId} for role: \${role}\`);
    return {
      status: 'SPAWNED',
      conversationId: workerId
    };
  }
}`,
        position: [18, -6, -10],
        commitActivityScore: 75
      },
      {
        id: 'tool-executor',
        name: 'ToolExecutor.ts',
        path: 'src/tools/ToolExecutor.ts',
        extension: 'ts',
        category: 'utils',
        linesOfCode: 1420,
        sizeBytes: 52000,
        lastModified: 'Yesterday',
        author: 'Quantum Dev',
        dependencies: ['code-indexer', 'sandbox-runner'],
        dependents: ['agent-loop'],
        content: `export class ToolExecutor {
  public async evaluateNextAction(context: any, subagents: any[]) {
    return {
      isSubagentInvocation: false,
      toolName: 'grep_search',
      args: { query: 'export class' }
    };
  }
  public async executeCommand(action: any) {
    return { success: true, result: 'Match found in 4 files' };
  }
}`,
        position: [10, 16, 14],
        commitActivityScore: 40
      },
      {
        id: 'ast-parser',
        name: 'ASTParser.ts',
        path: 'src/parser/ASTParser.ts',
        extension: 'ts',
        category: 'utils',
        linesOfCode: 650,
        sizeBytes: 21000,
        lastModified: '2 days ago',
        author: 'DeepMind Architect',
        dependencies: [],
        dependents: ['memory-synthesizer', 'code-indexer'],
        content: `export class ASTParser {
  public parseSymbols(codeContent: string) {
    const regex = /(?:class|function|interface|type)\\s+([A-Za-z0-9_]+)/g;
    const symbols = [];
    let match;
    while ((match = regex.exec(codeContent)) !== null) {
      symbols.push(match[1]);
    }
    return symbols;
  }
}`,
        position: [-22, -14, 8],
        commitActivityScore: 20
      },
      {
        id: 'code-indexer',
        name: 'CodebaseIndexer.ts',
        path: 'src/parser/CodebaseIndexer.ts',
        extension: 'ts',
        category: 'utils',
        linesOfCode: 780,
        sizeBytes: 26000,
        lastModified: '2 days ago',
        author: 'DeepMind Architect',
        dependencies: ['ast-parser'],
        dependents: ['tool-executor'],
        content: `export class CodebaseIndexer {
  private fileIndex: Map<string, string[]> = new Map();
  public buildIndex(files: string[]) {
    console.log('[Indexer] Indexed ' + files.length + ' files successfully');
  }
}`,
        position: [-8, 20, -18],
        commitActivityScore: 30
      },
      {
        id: 'sandbox-runner',
        name: 'ContainerSandbox.ts',
        path: 'src/sandbox/ContainerSandbox.ts',
        extension: 'ts',
        category: 'api',
        linesOfCode: 1100,
        sizeBytes: 41000,
        lastModified: '3 days ago',
        author: 'Quantum Dev',
        dependencies: ['ipc-bridge'],
        dependents: ['subagent-manager', 'tool-executor'],
        content: `export class ContainerSandbox {
  public executeIsolatedCommand(cmd: string) {
    return { exitCode: 0, stdout: 'Sandbox execution cleanly completed' };
  }
}`,
        position: [24, 10, -20],
        commitActivityScore: 60
      },
      {
        id: 'ipc-bridge',
        name: 'IPCBridge.ts',
        path: 'src/sandbox/IPCBridge.ts',
        extension: 'ts',
        category: 'api',
        linesOfCode: 430,
        sizeBytes: 15000,
        lastModified: '4 days ago',
        author: 'Quantum Dev',
        dependencies: [],
        dependents: ['sandbox-runner', 'subagent-manager'],
        content: `export class IPCBridge {
  public transmitMessage(channel: string, payload: any) {
    window.postMessage({ channel, payload }, '*');
  }
}`,
        position: [12, -22, 10],
        commitActivityScore: 10
      },
      {
        id: 'ui-hud',
        name: 'HyperspaceHUD.tsx',
        path: 'src/ui/HyperspaceHUD.tsx',
        extension: 'tsx',
        category: 'ui',
        linesOfCode: 950,
        sizeBytes: 34000,
        lastModified: '5 mins ago',
        author: 'Antigravity Frontend Team',
        dependencies: ['agent-loop', 'ui-theme'],
        dependents: [],
        content: `export const HyperspaceHUD = () => {
  return <div className="sci-fi-hud">System Active</div>;
}`,
        position: [0, -18, -25],
        commitActivityScore: 90
      },
      {
        id: 'ui-theme',
        name: 'CosmicTheme.ts',
        path: 'src/ui/CosmicTheme.ts',
        extension: 'ts',
        category: 'ui',
        linesOfCode: 310,
        sizeBytes: 9800,
        lastModified: '1 week ago',
        author: 'Antigravity Frontend Team',
        dependencies: [],
        dependents: ['ui-hud'],
        content: `export const CosmicTheme = {
  bg: '#030712',
  cyanGlow: '#00f3ff',
  magentaGlow: '#ff0055',
  goldGlow: '#ffb700'
};`,
        position: [-16, -5, -28],
        commitActivityScore: 5
      }
    ]
  },
  {
    id: 'react-19-core',
    name: 'React 19 Reconciler Engine',
    description: 'Next-generation concurrent React Fiber scheduler with Server Components, Actions, and async asset preloading.',
    icon: 'Code2',
    starCount: 228000,
    totalFiles: 14,
    totalLines: 18900,
    commits: [
      {
        id: 'rc1',
        hash: 'e4d3c2b',
        author: 'Dan Abramov',
        message: 'feat: add async Action transitions with automatic optimistic state rollback',
        date: '2026-08-05 14:00',
        affectedFiles: ['react-reconciler', 'react-fiber-workloop'],
        additions: 610,
        deletions: 89
      }
    ],
    nodes: [
      {
        id: 'react-reconciler',
        name: 'ReactFiberReconciler.js',
        path: 'packages/react-reconciler/src/ReactFiberReconciler.js',
        extension: 'js',
        category: 'core',
        linesOfCode: 2400,
        sizeBytes: 89000,
        lastModified: 'Yesterday',
        author: 'Dan Abramov',
        dependencies: ['react-fiber-workloop', 'react-fiber-lane'],
        dependents: [],
        content: `export function createContainer(containerInfo, tag) {
  return createFiberRoot(containerInfo, tag);
}
export function updateContainer(element, container) {
  const current = container.current;
  const lane = requestUpdateLane(current);
  const update = createUpdate(lane);
  update.payload = { element };
  scheduleUpdateOnFiber(current, lane);
}`,
        position: [0, 0, 0],
        commitActivityScore: 88
      },
      {
        id: 'react-fiber-workloop',
        name: 'ReactFiberWorkLoop.js',
        path: 'packages/react-reconciler/src/ReactFiberWorkLoop.js',
        extension: 'js',
        category: 'core',
        linesOfCode: 3100,
        sizeBytes: 112000,
        lastModified: 'Yesterday',
        author: 'Dan Abramov',
        dependencies: ['react-fiber-lane'],
        dependents: ['react-reconciler'],
        content: `function performConcurrentWorkOnRoot(root, didTimeout) {
  let exitStatus = renderRootConcurrent(root, lanes);
  if (exitStatus !== RootInProgress) {
    commitRoot(root);
  }
}`,
        position: [16, -10, 12],
        commitActivityScore: 70
      },
      {
        id: 'react-fiber-lane',
        name: 'ReactFiberLane.js',
        path: 'packages/react-reconciler/src/ReactFiberLane.js',
        extension: 'js',
        category: 'core',
        linesOfCode: 620,
        sizeBytes: 24000,
        lastModified: '3 days ago',
        author: 'Sophie Alpert',
        dependencies: [],
        dependents: ['react-reconciler', 'react-fiber-workloop'],
        content: `export const NoLanes = /*                        */ 0b0000000000000000000000000000000;
export const SyncLane = /*                       */ 0b0000000000000000000000000000002;
export const InputContinuousLane = /*           */ 0b0000000000000000000000000000008;`,
        position: [-18, 14, -8],
        commitActivityScore: 15
      }
    ]
  },
  {
    id: 'cyberpunk-game-engine',
    name: 'NeoCyber Engine 2099',
    description: 'High-performance WebGL/Vulkan AAA game engine with real-time raytraced reflections and ECS entity physics.',
    icon: 'Gamepad2',
    starCount: 38900,
    totalFiles: 12,
    totalLines: 15400,
    commits: [
      {
        id: 'cyber1',
        hash: 'f9e8d7c',
        author: 'Graphics Lead',
        message: 'render: integrate spatial audio reverberation and bloom shader',
        date: '2026-08-07 19:20',
        affectedFiles: ['raytrace-pipeline', 'spatial-audio'],
        additions: 430,
        deletions: 50
      }
    ],
    nodes: [
      {
        id: 'raytrace-pipeline',
        name: 'RaytracePipeline.cpp',
        path: 'engine/shaders/RaytracePipeline.cpp',
        extension: 'cpp',
        category: 'core',
        linesOfCode: 1950,
        sizeBytes: 74000,
        lastModified: '4 hours ago',
        author: 'Graphics Lead',
        dependencies: ['ecs-world', 'spatial-audio'],
        dependents: [],
        content: `#include "RaytracePipeline.h"

void RaytracePipeline::RenderFrame(Scene& scene) {
  VkCommandBuffer cmdBuffer = GetActiveCommandBuffer();
  vkCmdTraceRaysNV(cmdBuffer, raygenShaderTable, missShaderTable, hitShaderTable);
}`,
        position: [0, 0, 0],
        commitActivityScore: 92
      },
      {
        id: 'ecs-world',
        name: 'ECSWorldManager.cpp',
        path: 'engine/ecs/ECSWorldManager.cpp',
        extension: 'cpp',
        category: 'core',
        linesOfCode: 1350,
        sizeBytes: 48000,
        lastModified: '1 day ago',
        author: 'Engine Architect',
        dependencies: [],
        dependents: ['raytrace-pipeline'],
        content: `class ECSWorldManager {
  std::vector<Entity> entities;
public:
  Entity CreateEntity() {
    return entities.emplace_back(GenerateUUID());
  }
};`,
        position: [-14, 12, 16],
        commitActivityScore: 40
      },
      {
        id: 'spatial-audio',
        name: 'SpatialAudioSynth.cpp',
        path: 'engine/audio/SpatialAudioSynth.cpp',
        extension: 'cpp',
        category: 'api',
        linesOfCode: 820,
        sizeBytes: 29000,
        lastModified: '2 days ago',
        author: 'Audio Lead',
        dependencies: [],
        dependents: ['raytrace-pipeline'],
        content: `void SpatialAudioSynth::SynthesizeHRTF(AudioEmitter& emitter, Vec3 listenerPos) {
  float distance = glm::distance(emitter.position, listenerPos);
  emitter.attenuate(distance);
}`,
        position: [20, -10, -12],
        commitActivityScore: 65
      }
    ]
  }
];
