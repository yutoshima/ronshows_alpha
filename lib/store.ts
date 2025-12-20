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
import { CustomNode, CustomEdge, LINK_STYLES, DEFAULT_EDGE_STYLE } from './constants';
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

const useStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  past: [],
  future: [],
  settings: loadSettings(),

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
  },

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection) => {
    get().pushHistory();
    const edge: CustomEdge = {
      ...connection,
      id: uuidv4(),
      ...DEFAULT_EDGE_STYLE,
      interactionWidth: 20,
      className: 'cursor-pointer hover:stroke-blue-500 transition-colors',
    };
    set({ edges: addEdge(edge, get().edges) });
  },

  addNode: (node) => {
    get().pushHistory();
    set({ nodes: [...get().nodes, node] });
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
  },

  updateSettings: (newSettings) => {
    const updatedSettings = { ...get().settings, ...newSettings };
    set({ settings: updatedSettings });
    saveSettings(updatedSettings);
  },
}));

export default useStore;
