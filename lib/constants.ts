import { Node, Edge, MarkerType } from 'reactflow';

export const PROBLEM_DEF = {
  id: 'holmes-001',
  title: '課題4：シャーロック・ホームズの推理',
  nodes: [
    { id: 'P1', label: 'P1: 顔は黒いけど、手首は白い', type: 'premise' },
    { id: 'P2', label: 'P2: 熱帯地方（帰りである）', type: 'premise' },
    { id: 'P3', label: 'P3: 軍医が左腕を負傷している', type: 'premise' },
    { id: 'P4', label: 'P4: 激しい戦い＝アフガニスタン', type: 'premise' },
    { id: 'C',  label: 'C: アフガニスタン帰り', type: 'claim' },
  ],
};

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
