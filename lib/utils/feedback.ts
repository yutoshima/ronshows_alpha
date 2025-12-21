import { CustomNode, CustomEdge } from '../constants';
import { FeedbackConfig } from '../types';

export type ValidationDetails = {
  nodesCorrect: boolean;
  edgesCorrect: boolean;
  edgeTypesCorrect: boolean;
  arrowDirectionsCorrect: boolean;
};

// スコア計算（設定可能なルールを使用）
export const calculateScore = (
  details: ValidationDetails,
  config: FeedbackConfig
): number => {
  let score = 0;
  const detailsMap: Record<string, boolean> = {
    nodes: details.nodesCorrect,
    edges: details.edgesCorrect,
    edgeTypes: details.edgeTypesCorrect,
    arrowDirections: details.arrowDirectionsCorrect,
  };

  config.rules.forEach((rule) => {
    if (rule.enabled && detailsMap[rule.id]) {
      score += rule.weight;
    }
  });

  return score;
};

// フィードバックメッセージ生成（設定可能なルールを使用）
export const generateFeedbackMessages = (
  params: ValidationDetails & {
    nodes: CustomNode[];
    edges: CustomEdge[];
    modelAnswer: { nodes: CustomNode[]; edges: CustomEdge[] };
  },
  config: FeedbackConfig
): string[] => {
  const messages: string[] = [];

  const detailsMap: Record<string, boolean> = {
    nodes: params.nodesCorrect,
    edges: params.edgesCorrect,
    edgeTypes: params.edgeTypesCorrect,
    arrowDirections: params.arrowDirectionsCorrect,
  };

  config.rules.forEach((rule) => {
    if (rule.enabled) {
      const isCorrect = detailsMap[rule.id];
      let message = isCorrect
        ? rule.messages.correct
        : rule.messages.incorrect;

      // ノードの場合は詳細情報を追加
      if (rule.id === 'nodes' && !isCorrect) {
        message += `（正解: ${params.modelAnswer.nodes.length}個、解答: ${params.nodes.length}個）`;
      }

      messages.push(message);
    }
  });

  const allCorrect =
    params.nodesCorrect &&
    params.edgesCorrect &&
    params.edgeTypesCorrect &&
    params.arrowDirectionsCorrect;

  if (allCorrect) {
    messages.push('完璧です！全ての要素が正解です。');
  }

  return messages;
};
