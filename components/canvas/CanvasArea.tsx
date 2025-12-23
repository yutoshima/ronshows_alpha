import React, { useRef, useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  ConnectionMode,
  useReactFlow,
  Edge,
} from 'reactflow';
import { v4 as uuidv4 } from 'uuid';
import { CustomNode } from '../../lib/types';
import { LINK_STYLES } from '../../lib/constants/linkStyles';
import useStore from '../../lib/store';
import { UniversalNode } from '../nodes/UniversalNode';
import { GroupBoxes } from './GroupBoxes';
import { EdgeContextMenu } from './EdgeContextMenu';

export const CanvasArea = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();
  const store = useStore();
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);

  const nodeTypes = useMemo(() => ({
    universal: UniversalNode,
  }), []);

  const onPaneClick = useCallback(() => setMenu(null), []);

  const onNodeDragStart = useCallback(() => {
    store.pushHistory();
  }, [store]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodeDefStr = event.dataTransfer.getData('application/reactflow');
      if (!nodeDefStr) return;
      const nodeDef = JSON.parse(nodeDefStr);

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: CustomNode = {
        id: `${nodeDef.id}-${uuidv4().slice(0, 4)}`,
        type: 'universal',
        position,
        data: { label: nodeDef.label, type: nodeDef.type },
      };

      store.addNode(newNode);
    },
    [project, store]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      event.stopPropagation();
      setMenu({ id: edge.id, x: event.clientX, y: event.clientY });
    },
    []
  );

  const handleTypeSelect = (typeKey: keyof typeof LINK_STYLES) => {
    if (menu) {
      store.updateEdgeType(menu.id, typeKey);
      setMenu(null);
    }
  };

  const handleDirectionSelect = (direction: 'forward' | 'backward' | 'bidirectional') => {
    if (menu) {
      store.updateEdgeDirection(menu.id, direction);
      setMenu(null);
    }
  };

  return (
    <div className="flex-1 h-full bg-slate-100 relative" ref={reactFlowWrapper} style={{ height: '100vh' }}>
      <ReactFlow
        nodes={store.nodes}
        edges={store.edges}
        nodeTypes={nodeTypes}
        onNodesChange={store.onNodesChange}
        onEdgesChange={store.onEdgesChange}
        onConnect={store.onConnect}
        onNodeDragStart={onNodeDragStart}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <GroupBoxes />
        <Controls />
        <Background gap={16} size={1} />
      </ReactFlow>

      {menu && (
        <EdgeContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          onSelect={handleTypeSelect}
          onDirectionSelect={handleDirectionSelect}
        />
      )}
    </div>
  );
};
