export type FeedbackRuleConfig = {
  id: 'nodes' | 'edges' | 'edgeTypes' | 'arrowDirections';
  enabled: boolean;
  weight: number;
  messages: {
    correct: string;
    incorrect: string;
  };
};

export type FeedbackConfig = {
  rules: FeedbackRuleConfig[];
  passingScore: number;
};

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
  feedbackConfig: FeedbackConfig;
};

export type LogEntry = {
  id: string;
  timestamp: number;
  type:
    | 'node_add'
    | 'node_delete'
    | 'edge_add'
    | 'edge_delete'
    | 'edge_update'
    | 'undo'
    | 'redo'
    | 'submit'
    | 'problem_change';
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
  feedbackConfig: {
    passingScore: 100,
    rules: [
      {
        id: 'nodes',
        enabled: true,
        weight: 25,
        messages: {
          correct: 'ノードは正解です',
          incorrect: 'ノードの数または種類が正解と異なります',
        },
      },
      {
        id: 'edges',
        enabled: true,
        weight: 25,
        messages: {
          correct: '接続は正解です',
          incorrect: 'リンクの接続関係が正解と異なります',
        },
      },
      {
        id: 'edgeTypes',
        enabled: true,
        weight: 25,
        messages: {
          correct: 'リンク種類は正解です',
          incorrect: 'リンクの種類（演繹、仮定、対立、限定）が正解と異なります',
        },
      },
      {
        id: 'arrowDirections',
        enabled: true,
        weight: 25,
        messages: {
          correct: '矢印向きは正解です',
          incorrect: '矢印の向きが正解と異なります',
        },
      },
    ],
  },
};
