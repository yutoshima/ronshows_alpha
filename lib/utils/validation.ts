import { CustomNode, CustomEdge } from '../constants';

// 比較用ヘルパー関数
export const setsEqual = <T>(a: Set<T>, b: Set<T>): boolean => {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
};

export const compareArrays = <T>(
  a: T[],
  b: T[],
  keyFn: (item: T) => string
): boolean => {
  if (a.length !== b.length) return false;
  const aKeys = new Set(a.map(keyFn));
  const bKeys = new Set(b.map(keyFn));
  return setsEqual(aKeys, bKeys);
};

// ノード比較
export const compareNodes = (
  userNodes: CustomNode[],
  modelNodes: CustomNode[]
): boolean => {
  if (userNodes.length !== modelNodes.length) return false;
  const userNodeIds = new Set(userNodes.map((n) => n.id));
  const modelNodeIds = new Set(modelNodes.map((n) => n.id));
  return setsEqual(userNodeIds, modelNodeIds);
};

// エッジ接続比較
export const compareEdgeConnections = (
  userEdges: CustomEdge[],
  modelEdges: CustomEdge[]
): boolean => {
  const userConnections = new Set(
    userEdges.map((e) => `${e.source}->${e.target}`)
  );
  const modelConnections = new Set(
    modelEdges.map((e) => `${e.source}->${e.target}`)
  );
  return setsEqual(userConnections, modelConnections);
};

// エッジ種類比較
export const compareEdgeTypes = (
  userEdges: CustomEdge[],
  modelEdges: CustomEdge[]
): boolean => {
  return compareArrays(
    userEdges,
    modelEdges,
    (e) => `${e.source}->${e.target}:${e.label}`
  );
};

// 矢印向き比較
export const compareArrowDirections = (
  userEdges: CustomEdge[],
  modelEdges: CustomEdge[]
): boolean => {
  const getDirection = (edge: CustomEdge): string => {
    if (edge.markerEnd && edge.markerStart) return 'bidirectional';
    if (edge.markerEnd) return 'forward';
    if (edge.markerStart) return 'backward';
    return 'none';
  };

  return compareArrays(
    userEdges,
    modelEdges,
    (e) => `${e.source}->${e.target}:${getDirection(e)}`
  );
};
