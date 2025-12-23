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
import { CustomNode, CustomEdge, Problem } from './types';
import { LINK_STYLES, DEFAULT_EDGE_STYLE } from './constants/linkStyles';
import { PROBLEMS, DEFAULT_PROBLEM, validateProblem } from './constants/problems';
import { v4 as uuidv4 } from 'uuid';
import { loadSettings, saveSettings, loadCustomProblems, saveCustomProblems } from './utils/storage';
import { compareNodes, compareEdgeConnections, compareEdgeTypes, compareArrowDirections } from './utils/validation';
import { calculateScore, generateFeedbackMessages, ValidationDetails } from './utils/feedback';
import { Settings, LogEntry, FeedbackResult, DEFAULT_SETTINGS, FeedbackConfig } from './types';
import { createMarkers } from './utils/edgeHelpers';

// Re-export types for backward compatibility
export type { Settings, LogEntry, FeedbackResult, FeedbackRuleConfig, FeedbackConfig } from './types';
export { DEFAULT_SETTINGS } from './types';

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
  customProblems: Problem[];

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
  importProblems: (file: File) => Promise<{ success: boolean; message: string; count?: number }>;
  getAllProblems: () => Problem[];
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
  customProblems: loadCustomProblems(),

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
    if (!connection.source || !connection.target) return;

    get().pushHistory();
    const { settings } = get();
    const direction = settings.defaultArrowDirection;
    const color = settings.linkColors.basic;

    const { markerEnd, markerStart } = createMarkers(direction, color);

    const edge: CustomEdge = {
      id: uuidv4(),
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle,
      targetHandle: connection.targetHandle,
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

          const { markerEnd, markerStart } = createMarkers(direction, color);

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
    const allProblems = get().getAllProblems();
    const problem = allProblems.find(p => p.id === problemId);
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
    const { nodes, edges, currentProblemId, settings } = get();
    const allProblems = get().getAllProblems();
    const problem = allProblems.find(p => p.id === currentProblemId);
    if (!problem) return null;

    const { modelAnswer } = problem;
    const { feedbackConfig } = settings;

    // 各ルールの判定結果を計算
    const nodesCorrect = compareNodes(nodes, modelAnswer.nodes);
    const edgesCorrect = compareEdgeConnections(edges, modelAnswer.edges);
    const edgeTypesCorrect = compareEdgeTypes(edges, modelAnswer.edges);
    const arrowDirectionsCorrect = compareArrowDirections(edges, modelAnswer.edges);

    const details = { nodesCorrect, edgesCorrect, edgeTypesCorrect, arrowDirectionsCorrect };

    // 設定に基づいてスコアとメッセージを生成
    const score = calculateScore(details, feedbackConfig);
    const messages = generateFeedbackMessages(
      {
        nodesCorrect,
        edgesCorrect,
        edgeTypesCorrect,
        arrowDirectionsCorrect,
        nodes,
        edges,
        modelAnswer,
      },
      feedbackConfig
    );

    // 合格判定（設定された合格点を使用）
    const correct = score >= feedbackConfig.passingScore;

    const result: FeedbackResult = {
      correct,
      score,
      details,
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
    const allProblems = get().getAllProblems();
    const currentIndex = allProblems.findIndex(p => p.id === currentProblemId);
    if (currentIndex < allProblems.length - 1) {
      get().setCurrentProblem(allProblems[currentIndex + 1].id);
    }
  },

  goToPreviousProblem: () => {
    const { currentProblemId } = get();
    const allProblems = get().getAllProblems();
    const currentIndex = allProblems.findIndex(p => p.id === currentProblemId);
    if (currentIndex > 0) {
      get().setCurrentProblem(allProblems[currentIndex - 1].id);
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

  importProblems: async (file: File) => {
    try {
      const text = await file.text();
      let data: any;

      // JSON or CSV detection
      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Simple CSV parsing - expecting JSON in second column
        const lines = text.trim().split('\n');
        const problems: Problem[] = [];

        for (let i = 1; i < lines.length; i++) { // Skip header
          const line = lines[i];
          // Find the second column (JSON data)
          const firstComma = line.indexOf(',');
          if (firstComma === -1) continue;
          const jsonStr = line.substring(firstComma + 1).trim();

          try {
            const problem = JSON.parse(jsonStr);
            if (validateProblem(problem)) {
              problems.push(problem);
            }
          } catch (e) {
            console.error('Failed to parse CSV row:', e);
          }
        }

        data = problems;
      } else {
        return { success: false, message: 'サポートされていないファイル形式です。JSON or CSVファイルを使用してください。' };
      }

      // Validate and import
      const problems: Problem[] = Array.isArray(data) ? data : [data];
      const validProblems = problems.filter(validateProblem);

      if (validProblems.length === 0) {
        return { success: false, message: '有効な問題定義が見つかりませんでした。' };
      }

      const newCustomProblems = [...get().customProblems, ...validProblems];
      set({ customProblems: newCustomProblems });
      saveCustomProblems(newCustomProblems);

      get().addLog({
        type: 'problem_change',
        data: { count: validProblems.length },
        description: `問題をインポート: ${validProblems.length}件`,
      });

      return {
        success: true,
        message: `${validProblems.length}件の問題をインポートしました。`,
        count: validProblems.length
      };
    } catch (error) {
      return {
        success: false,
        message: `インポートに失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`
      };
    }
  },

  getAllProblems: () => {
    return [...PROBLEMS, ...get().customProblems];
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
