import { MarkerType } from 'reactflow';

export const LINK_STYLES = {
  basic: {
    label: '演繹',
    style: { stroke: '#333', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#333' },
    type: 'straight' as const,
  },
  hypothetical: {
    label: '仮定',
    style: { stroke: '#333', strokeWidth: 2, strokeDasharray: '5, 5' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#333' },
    type: 'straight' as const,
  },
  conflict: {
    label: '対立',
    style: { stroke: '#ef4444', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
    type: 'straight' as const,
  },
  limiter: {
    label: '限定',
    style: { stroke: '#2563eb', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#2563eb' },
    type: 'straight' as const,
  },
} as const;

export const DEFAULT_EDGE_STYLE = LINK_STYLES.basic;
