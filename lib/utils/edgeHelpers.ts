import { MarkerType } from 'reactflow';

export type ArrowDirection = 'forward' | 'backward' | 'bidirectional';

export type EdgeMarkers = {
  markerEnd?: { type: typeof MarkerType.ArrowClosed; color: string };
  markerStart?: { type: typeof MarkerType.ArrowClosed; color: string };
};

export const createMarkers = (
  direction: ArrowDirection,
  color: string
): EdgeMarkers => {
  switch (direction) {
    case 'forward':
      return {
        markerEnd: { type: MarkerType.ArrowClosed, color },
        markerStart: undefined
      };
    case 'backward':
      return {
        markerEnd: undefined,
        markerStart: { type: MarkerType.ArrowClosed, color }
      };
    case 'bidirectional':
      return {
        markerEnd: { type: MarkerType.ArrowClosed, color },
        markerStart: { type: MarkerType.ArrowClosed, color },
      };
  }
};
