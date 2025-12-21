import { Node, Edge, MarkerType } from 'reactflow';

export type NodeData = {
  label: string;
  type?: 'premise' | 'claim' | 'joint';
};

export type CustomNode = Node<NodeData>;
export type CustomEdge = Edge;

export const LINK_STYLES = {
  basic: {
    label: '演繹',
    style: { stroke: '#333', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#333' },
    type: 'straight',
  },
  hypothetical: {
    label: '仮定',
    style: { stroke: '#333', strokeWidth: 2, strokeDasharray: '5, 5' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#333' },
    type: 'straight',
  },
  conflict: {
    label: '対立',
    style: { stroke: '#ef4444', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
    type: 'straight',
  },
  limiter: {
    label: '限定',
    style: { stroke: '#2563eb', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#2563eb' },
    type: 'straight',
  },
};

export const DEFAULT_EDGE_STYLE = LINK_STYLES.basic;

// 問題定義の型
export type Problem = {
  id: string;
  title: string;
  description: string;
  nodes: Array<{ id: string; label: string; type: 'premise' | 'claim' }>;
  modelAnswer: {
    nodes: CustomNode[];
    edges: CustomEdge[];
  };
};

// 問題リスト
export const PROBLEMS: Problem[] = [
  {
    id: 'holmes-001',
    title: '課題4：シャーロック・ホームズの推理',
    description: `シャーロック・ホームズがワトソン博士に初めて会った時の推理を論証グラフで表現してください。

【状況】
ホームズはワトソンを一目見て、以下のように推理しました：
「あなたはアフガニスタンから帰ってきたのですね」

【観察された事実】
1. 顔は日焼けしているが、手首は白い
2. 熱帯地方から帰ってきたばかりのようだ
3. 軍医が左腕を負傷している
4. 激しい戦いがあった場所といえば、当時はアフガニスタン

これらの前提から「アフガニスタン帰り」という結論を導く論証グラフを作成してください。`,
    nodes: [
      { id: 'P1', label: 'P1: 顔は黒いけど、手首は白い', type: 'premise' },
      { id: 'P2', label: 'P2: 熱帯地方（帰りである）', type: 'premise' },
      { id: 'P3', label: 'P3: 軍医が左腕を負傷している', type: 'premise' },
      { id: 'P4', label: 'P4: 激しい戦い＝アフガニスタン', type: 'premise' },
      { id: 'C',  label: 'C: アフガニスタン帰り', type: 'claim' },
    ],
    modelAnswer: {
      nodes: [
        {
          id: 'P1',
          type: 'universal',
          position: { x: 100, y: 100 },
          data: { label: 'P1: 顔は黒いけど、手首は白い', type: 'premise' }
        },
        {
          id: 'P2',
          type: 'universal',
          position: { x: 350, y: 100 },
          data: { label: 'P2: 熱帯地方（帰りである）', type: 'premise' }
        },
        {
          id: 'P3',
          type: 'universal',
          position: { x: 600, y: 100 },
          data: { label: 'P3: 軍医が左腕を負傷している', type: 'premise' }
        },
        {
          id: 'P4',
          type: 'universal',
          position: { x: 850, y: 100 },
          data: { label: 'P4: 激しい戦い＝アフガニスタン', type: 'premise' }
        },
        {
          id: 'C',
          type: 'universal',
          position: { x: 475, y: 300 },
          data: { label: 'C: アフガニスタン帰り', type: 'claim' }
        },
      ],
      edges: [
        {
          id: 'e-P1-P2',
          source: 'P1',
          target: 'P2',
          label: '演繹',
          type: 'straight',
          style: { stroke: '#333', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#333' },
        },
        {
          id: 'e-P2-C',
          source: 'P2',
          target: 'C',
          label: '演繹',
          type: 'straight',
          style: { stroke: '#333', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#333' },
        },
        {
          id: 'e-P3-C',
          source: 'P3',
          target: 'C',
          label: '演繹',
          type: 'straight',
          style: { stroke: '#333', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#333' },
        },
        {
          id: 'e-P4-C',
          source: 'P4',
          target: 'C',
          label: '演繹',
          type: 'straight',
          style: { stroke: '#333', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#333' },
        },
      ],
    },
  },
];

export const DEFAULT_PROBLEM = PROBLEMS[0];

// 後方互換性のため
export const PROBLEM_DEF = {
  id: DEFAULT_PROBLEM.id,
  title: DEFAULT_PROBLEM.title,
  nodes: DEFAULT_PROBLEM.nodes,
};
