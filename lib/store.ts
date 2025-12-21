import { create } from 'zustand';
import {
  Connection,
  EdgeChange,
  NodeChange,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from 'reactflow';
import { CustomNode, CustomEdge, LINK_STYLES, DEFAULT_EDGE_STYLE, PROBLEMS, DEFAULT_PROBLEM } from './constants';
import { v4 as uuidv4 } from 'uuid';

export type Settings = {
  linkColors: {
    basic: string;
    hypothetical: string;
    conflict: string;
    limiter: string;
  };
  defaultArrowDirection: 'forward' | 'backward' | 'bidirectional';
  nodeColors: {
    premise: {
      background: string;
      border: string;
      text: string;
    };
    claim: {
      background: string;
      border: string;
      text: string;
    };
  };
  linkWidth: number;
  groupBox: {
    enabled: boolean;
    color: string;
    padding: number;
    borderWidth: number;
  };
};

export type LogEntry = {
  id: string;
  timestamp: number;
  type: 'node_add' | 'node_delete' | 'edge_add' | 'edge_delete' | 'edge_update' | 'undo' | 'redo' | 'submit' | 'problem_change';
  data: any;
  description: string;
};

export type FeedbackResult = {
  correct: boolean;
  score: number;
  details: {
    nodesCorrect: boolean;
    edgesCorrect: boolean;
    edgeTypesCorrect: boolean;
    arrowDirectionsCorrect: boolean;
  };
  messages: string[];
};

type HistoryState = {
  nodes: CustomNode[];
  edges: CustomEdge[];
};

type RFState = {
  nodes: CustomNode[];
  edges: CustomEdge[];
  past: HistoryState[];
  future: HistoryState[];
  settings: Settings;
  currentProblemId: string;
  logs: LogEntry[];
  showProblemModal: boolean;
  feedbackResult: FeedbackResult | null;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: CustomNode) => void;
  updateEdgeType: (edgeId: string, styleKey: keyof typeof LINK_STYLES) => void;
  updateEdgeDirection: (edgeId: string, direction: 'forward' | 'backward' | 'bidirectional') => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  setCurrentProblem: (problemId: string) => void;
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
  exportLogs: () => string;
  toggleProblemModal: () => void;
  submitAnswer: () => FeedbackResult | null;
  goToNextProblem: () => void;
  goToPreviousProblem: () => void;
  resetProblem: () => void;
};

export const DEFAULT_SETTINGS: Settings = {
  linkColors: {
    basic: '#333',
    hypothetical: '#333',
    conflict: '#ef4444',
    limiter: '#2563eb',
  },
  defaultArrowDirection: 'forward',
  nodeColors: {
    premise: {
      background: '#ffffff',
      border: '#cbd5e1',
      text: '#475569',
    },
    claim: {
      background: '#fefce8',
      border: '#facc15',
      text: '#713f12',
    },
  },
  linkWidth: 2,
  groupBox: {
    enabled: true,
    color: '#93c5fd',
    padding: 20,
    borderWidth: 2,
  },
};

const loadSettings = (): Settings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const saved = localStorage.getItem('ronshows_settings');
  return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
};

const saveSettings = (settings: Settings) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ronshows_settings', JSON.stringify(settings));
  }
};

// 比較用ヘルパー関数
const setsEqual = <T>(a: Set<T>, b: Set<T>): boolean => {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
};

const compareArrays = <T>(a: T[], b: T[], keyFn: (item: T) => string): boolean => {
  if (a.length !== b.length) return false;
  const aKeys = new Set(a.map(keyFn));
  const bKeys = new Set(b.map(keyFn));
  return setsEqual(aKeys, bKeys);
};

// ノード比較
const compareNodes = (userNodes: CustomNode[], modelNodes: CustomNode[]): boolean => {
  if (userNodes.length !== modelNodes.length) return false;
  const userNodeIds = new Set(userNodes.map(n => n.id));
  const modelNodeIds = new Set(modelNodes.map(n => n.id));
  return setsEqual(userNodeIds, modelNodeIds);
};

// エッジ接続比較
const compareEdgeConnections = (userEdges: CustomEdge[], modelEdges: CustomEdge[]): boolean => {
  const userConnections = new Set(userEdges.map(e => `${e.source}->${e.target}`));
  const modelConnections = new Set(modelEdges.map(e => `${e.source}->${e.target}`));
  return setsEqual(userConnections, modelConnections);
};

// エッジ種類比較
const compareEdgeTypes = (userEdges: CustomEdge[], modelEdges: CustomEdge[]): boolean => {
  return compareArrays(
    userEdges,
    modelEdges,
    e => `${e.source}->${e.target}:${e.label}`
  );
};

// 矢印向き比較
const compareArrowDirections = (userEdges: CustomEdge[], modelEdges: CustomEdge[]): boolean => {
  const getDirection = (edge: CustomEdge) => {
    if (edge.markerEnd && edge.markerStart) return 'bidirectional';
    if (edge.markerEnd) return 'forward';
    if (edge.markerStart) return 'backward';
    return 'none';
  };

  return compareArrays(
    userEdges,
    modelEdges,
    e => `${e.source}->${e.target}:${getDirection(e)}`
  );
};

// スコア計算
const calculateScore = (details: {
  nodesCorrect: boolean;
  edgesCorrect: boolean;
  edgeTypesCorrect: boolean;
  arrowDirectionsCorrect: boolean;
}): number => {
  let score = 0;
  if (details.nodesCorrect) score += 25;
  if (details.edgesCorrect) score += 25;
  if (details.edgeTypesCorrect) score += 25;
  if (details.arrowDirectionsCorrect) score += 25;
  return score;
};

// フィードバックメッセージ生成
const generateFeedbackMessages = (params: {
  nodesCorrect: boolean;
  edgesCorrect: boolean;
  edgeTypesCorrect: boolean;
  arrowDirectionsCorrect: boolean;
  nodes: CustomNode[];
  edges: CustomEdge[];
  modelAnswer: { nodes: CustomNode[]; edges: CustomEdge[] };
}): string[] => {
  const messages: string[] = [];

  if (!params.nodesCorrect) {
    messages.push(`ノードの数または種類が正解と異なります。正解: ${params.modelAnswer.nodes.length}個、解答: ${params.nodes.length}個`);
  }
  if (!params.edgesCorrect) {
    messages.push(`リンクの接続関係が正解と異なります。`);
  }
  if (!params.edgeTypesCorrect) {
    messages.push(`リンクの種類（演繹、仮定、対立、限定）が正解と異なります。`);
  }
  if (!params.arrowDirectionsCorrect) {
    messages.push(`矢印の向きが正解と異なります。`);
  }

  if (params.nodesCorrect && params.edgesCorrect && params.edgeTypesCorrect && params.arrowDirectionsCorrect) {
    messages.push(`完璧です！全ての要素が正解です。`);
  }

  return messages;
};

const useStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  past: [],
  future: [],
  settings: loadSettings(),
  currentProblemId: DEFAULT_PROBLEM.id,
  logs: [],
  showProblemModal: false,
  feedbackResult: null,

  pushHistory: () => {
    const { nodes, edges, past } = get();
    set({
      past: [...past, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }],
      future: [],
    });
  },

  undo: () => {
    const { past, future, nodes, edges } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    set({
      nodes: previous.nodes,
      edges: previous.edges,
      past: newPast,
      future: [{ nodes, edges }, ...future],
    });
    get().addLog({
      type: 'undo',
      data: {},
      description: '操作を元に戻しました',
    });
  },

  redo: () => {
    const { past, future, nodes, edges } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    set({
      nodes: next.nodes,
      edges: next.edges,
      past: [...past, { nodes, edges }],
      future: newFuture,
    });
    get().addLog({
      type: 'redo',
      data: {},
      description: '操作をやり直しました',
    });
  },

  onNodesChange: (changes) => {
    const deletedNodes = changes.filter(c => c.type === 'remove');
    if (deletedNodes.length > 0) {
      deletedNodes.forEach(change => {
        if ('id' in change) {
          const node = get().nodes.find(n => n.id === change.id);
          if (node) {
            get().addLog({
              type: 'node_delete',
              data: { nodeId: node.id, label: node.data?.label },
              description: `ノード削除: ${node.data?.label || node.id}`,
            });
          }
        }
      });
    }
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes) => {
    const deletedEdges = changes.filter(c => c.type === 'remove');
    if (deletedEdges.length > 0) {
      deletedEdges.forEach(change => {
        if ('id' in change) {
          const edge = get().edges.find(e => e.id === change.id);
          if (edge) {
            get().addLog({
              type: 'edge_delete',
              data: { edgeId: edge.id, source: edge.source, target: edge.target },
              description: `リンク削除: ${edge.source} → ${edge.target}`,
            });
          }
        }
      });
    }
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    get().pushHistory();
    const { settings } = get();
    const direction = settings.defaultArrowDirection;
    const color = settings.linkColors.basic;

    let markerEnd, markerStart;
    if (direction === 'forward') {
      markerEnd = { type: MarkerType.ArrowClosed, color };
      markerStart = undefined;
    } else if (direction === 'backward') {
      markerEnd = undefined;
      markerStart = { type: MarkerType.ArrowClosed, color };
    } else if (direction === 'bidirectional') {
      markerEnd = { type: MarkerType.ArrowClosed, color };
      markerStart = { type: MarkerType.ArrowClosed, color };
    }

    const edge: CustomEdge = {
      ...connection,
      id: uuidv4(),
      ...DEFAULT_EDGE_STYLE,
      markerEnd,
      markerStart,
      interactionWidth: 20,
      className: 'cursor-pointer hover:stroke-blue-500 transition-colors',
    };
    set({ edges: addEdge(edge, get().edges) });

    get().addLog({
      type: 'edge_add',
      data: { source: connection.source, target: connection.target, type: 'basic' },
      description: `リンク作成: ${connection.source} → ${connection.target}`,
    });
  },

  addNode: (node) => {
    get().pushHistory();
    set({ nodes: [...get().nodes, node] });
    get().addLog({
      type: 'node_add',
      data: { nodeId: node.id, label: node.data?.label, type: node.data?.type },
      description: `ノード追加: ${node.data?.label || node.id}`,
    });
  },

  updateEdgeType: (edgeId, styleKey) => {
    get().pushHistory();
    const { edges } = get();
    set({
      edges: edges.map((e) => {
        if (e.id === edgeId) {
          return {
            ...e,
            ...LINK_STYLES[styleKey],
            label: LINK_STYLES[styleKey].label
          };
        }
        return e;
      }),
    });
    get().addLog({
      type: 'edge_update',
      data: { edgeId, newType: styleKey },
      description: `リンク種類変更: ${LINK_STYLES[styleKey].label}`,
    });
  },

  updateEdgeDirection: (edgeId, direction) => {
    get().pushHistory();
    const { edges } = get();
    set({
      edges: edges.map((e) => {
        if (e.id === edgeId) {
          const baseStyle = e.style || {};
          const color = baseStyle.stroke || '#333';

          let markerEnd, markerStart;

          if (direction === 'forward') {
            markerEnd = { type: MarkerType.ArrowClosed, color };
            markerStart = undefined;
          } else if (direction === 'backward') {
            markerEnd = undefined;
            markerStart = { type: MarkerType.ArrowClosed, color };
          } else if (direction === 'bidirectional') {
            markerEnd = { type: MarkerType.ArrowClosed, color };
            markerStart = { type: MarkerType.ArrowClosed, color };
          }

          return {
            ...e,
            markerEnd,
            markerStart,
          };
        }
        return e;
      }),
    });
    get().addLog({
      type: 'edge_update',
      data: { edgeId, newDirection: direction },
      description: `矢印向き変更: ${direction === 'forward' ? '→' : direction === 'backward' ? '←' : '↔'}`,
    });
  },

  updateSettings: (newSettings) => {
    const updatedSettings = { ...get().settings, ...newSettings };
    set({ settings: updatedSettings });
    saveSettings(updatedSettings);
  },

  setCurrentProblem: (problemId) => {
    const problem = PROBLEMS.find(p => p.id === problemId);
    if (!problem) return;

    set({
      currentProblemId: problemId,
      nodes: [],
      edges: [],
      past: [],
      future: [],
      feedbackResult: null,
    });

    get().addLog({
      type: 'problem_change',
      data: { problemId, title: problem.title },
      description: `問題を変更: ${problem.title}`,
    });
  },

  addLog: (entry) => {
    const newLog: LogEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      ...entry,
    };
    set({ logs: [...get().logs, newLog] });
  },

  clearLogs: () => {
    set({ logs: [] });
  },

  exportLogs: () => {
    const logs = get().logs;
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `logs-${Date.now()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    return dataStr;
  },

  toggleProblemModal: () => {
    set({ showProblemModal: !get().showProblemModal });
  },

  submitAnswer: () => {
    const { nodes, edges, currentProblemId } = get();
    const problem = PROBLEMS.find(p => p.id === currentProblemId);
    if (!problem) return null;

    const { modelAnswer } = problem;

    const nodesCorrect = compareNodes(nodes, modelAnswer.nodes);
    const edgesCorrect = compareEdgeConnections(edges, modelAnswer.edges);
    const edgeTypesCorrect = compareEdgeTypes(edges, modelAnswer.edges);
    const arrowDirectionsCorrect = compareArrowDirections(edges, modelAnswer.edges);

    const correct = nodesCorrect && edgesCorrect && edgeTypesCorrect && arrowDirectionsCorrect;
    const score = calculateScore({ nodesCorrect, edgesCorrect, edgeTypesCorrect, arrowDirectionsCorrect });

    const messages = generateFeedbackMessages({
      nodesCorrect,
      edgesCorrect,
      edgeTypesCorrect,
      arrowDirectionsCorrect,
      nodes,
      edges,
      modelAnswer,
    });

    const result: FeedbackResult = {
      correct,
      score,
      details: { nodesCorrect, edgesCorrect, edgeTypesCorrect, arrowDirectionsCorrect },
      messages,
    };

    set({ feedbackResult: result });

    get().addLog({
      type: 'submit',
      data: { correct, score, details: result.details },
      description: `解答を提出: ${correct ? '正解' : '不正解'} (${score}点)`,
    });

    return result;
  },

  goToNextProblem: () => {
    const { currentProblemId } = get();
    const currentIndex = PROBLEMS.findIndex(p => p.id === currentProblemId);
    if (currentIndex < PROBLEMS.length - 1) {
      get().setCurrentProblem(PROBLEMS[currentIndex + 1].id);
    }
  },

  goToPreviousProblem: () => {
    const { currentProblemId } = get();
    const currentIndex = PROBLEMS.findIndex(p => p.id === currentProblemId);
    if (currentIndex > 0) {
      get().setCurrentProblem(PROBLEMS[currentIndex - 1].id);
    }
  },

  resetProblem: () => {
    set({
      nodes: [],
      edges: [],
      past: [],
      future: [],
      feedbackResult: null,
    });
    get().addLog({
      type: 'problem_change',
      data: {},
      description: '問題をリセットしました',
    });
  },
}));

// Helper function to find groups of nodes connected by limiter edges
export const findLimiterGroups = (nodes: CustomNode[], edges: CustomEdge[]): CustomNode[][] => {
  const limiterEdges = edges.filter(e => e.label === '限定');

  if (limiterEdges.length === 0) return [];

  const adjacency = new Map<string, Set<string>>();
  nodes.forEach(node => adjacency.set(node.id, new Set()));

  limiterEdges.forEach(edge => {
    if (edge.source && edge.target) {
      adjacency.get(edge.source)?.add(edge.target);
      adjacency.get(edge.target)?.add(edge.source);
    }
  });

  const visited = new Set<string>();
  const groups: CustomNode[][] = [];

  const dfs = (nodeId: string, currentGroup: Set<string>) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    currentGroup.add(nodeId);

    adjacency.get(nodeId)?.forEach(neighbor => {
      dfs(neighbor, currentGroup);
    });
  };

  nodes.forEach(node => {
    if (!visited.has(node.id) && adjacency.get(node.id)!.size > 0) {
      const currentGroup = new Set<string>();
      dfs(node.id, currentGroup);

      if (currentGroup.size >= 2) {
        const groupNodes = nodes.filter(n => currentGroup.has(n.id));
        groups.push(groupNodes);
      }
    }
  });

  return groups;
};

export default useStore;
