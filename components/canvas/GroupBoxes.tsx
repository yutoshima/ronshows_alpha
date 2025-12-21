import React, { useMemo } from 'react';
import { useViewport } from 'reactflow';
import useStore, { findLimiterGroups } from '../../lib/store';

// ノードの実際のサイズ定数
const NODE_WIDTH = 216;
const NODE_HEIGHT = 52;

export const GroupBoxes = () => {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const settings = useStore((state) => state.settings);
  const { x, y, zoom } = useViewport();

  const groups = useMemo(() => findLimiterGroups(nodes, edges), [nodes, edges]);

  if (!settings.groupBox.enabled || groups.length === 0) return null;

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {groups.map((group, index) => {
        const padding = settings.groupBox.padding;
        const minX = Math.min(...group.map(n => n.position.x)) - padding;
        const minY = Math.min(...group.map(n => n.position.y)) - padding;
        const maxX = Math.max(...group.map(n => n.position.x + NODE_WIDTH)) + padding;
        const maxY = Math.max(...group.map(n => n.position.y + NODE_HEIGHT)) + padding;

        const width = maxX - minX;
        const height = maxY - minY;

        const transformedX = minX * zoom + x;
        const transformedY = minY * zoom + y;

        return (
          <rect
            key={index}
            x={transformedX}
            y={transformedY}
            width={width * zoom}
            height={height * zoom}
            fill={settings.groupBox.color}
            fillOpacity={0.2}
            stroke={settings.groupBox.color}
            strokeWidth={settings.groupBox.borderWidth}
            strokeOpacity={0.5}
            rx={8 * zoom}
            ry={8 * zoom}
          />
        );
      })}
    </svg>
  );
};
