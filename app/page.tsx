'use client';

import React, { useCallback, useRef, useState, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  Handle,
  Position,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PROBLEM_DEF, CustomNode, LINK_STYLES } from '../lib/constants';
import useStore, { DEFAULT_SETTINGS } from '../lib/store';
import { v4 as uuidv4 } from 'uuid';

const UniversalNode = ({ data, selected }: any) => {
  const isClaim = data.type === 'claim';
  const baseStyle = "px-4 py-3 rounded-lg shadow-md border-2 text-sm font-medium w-full h-full flex items-center justify-center text-center transition-all";
  const colorStyle = isClaim
    ? 'bg-yellow-50 border-yellow-400 text-yellow-900'
    : 'bg-white border-slate-300 text-slate-700';
  const selectedStyle = selected ? 'ring-2 ring-blue-500 border-blue-500' : '';
  const handleStyle = "!w-3 !h-3 !bg-slate-400 hover:!bg-blue-600 transition-colors border-2 border-white";

  return (
    <div className={`${baseStyle} ${colorStyle} ${selectedStyle}`} style={{ minWidth: '180px' }}>
      <Handle type="target" position={Position.Top} className={handleStyle} id="top" />
      <Handle type="source" position={Position.Right} className={handleStyle} id="right" />
      <Handle type="source" position={Position.Bottom} className={handleStyle} id="bottom" />
      <Handle type="target" position={Position.Left} className={handleStyle} id="left" />
      {data.label}
    </div>
  );
};

const EdgeContextMenu = ({ x, y, onClose, onSelect, onDirectionSelect }: any) => {
  const menuWidth = 192;
  const menuHeight = 400;

  const adjustedX = Math.min(x, window.innerWidth - menuWidth - 10);
  const adjustedY = Math.min(y, window.innerHeight - menuHeight - 10);

  return (
    <div
      className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-50 flex flex-col gap-1 w-48 animate-in fade-in zoom-in duration-200"
      style={{ top: Math.max(10, adjustedY), left: Math.max(10, adjustedX) }}
    >
      <div className="text-xs font-bold text-gray-500 px-2 py-1">リンクの種類</div>
      <button onClick={() => onSelect('basic')} className="text-left px-2 py-1.5 text-sm hover:bg-slate-100 rounded flex items-center gap-2">
        <span className="w-4 h-0.5 bg-gray-800"></span> 演繹
      </button>
      <button onClick={() => onSelect('hypothetical')} className="text-left px-2 py-1.5 text-sm hover:bg-slate-100 rounded flex items-center gap-2">
        <span className="w-4 h-0.5 border-t-2 border-dashed border-gray-800"></span> 仮定
      </button>
      <button onClick={() => onSelect('conflict')} className="text-left px-2 py-1.5 text-sm hover:bg-slate-100 rounded flex items-center gap-2 text-red-600">
        <span className="w-4 h-0.5 bg-red-500"></span> 対立
      </button>
      <button onClick={() => onSelect('limiter')} className="text-left px-2 py-1.5 text-sm hover:bg-slate-100 rounded flex items-center gap-2 text-blue-600">
        <span className="w-4 h-0.5 bg-blue-600"></span> 限定
      </button>

      <div className="h-px bg-gray-200 my-1" />

      <div className="text-xs font-bold text-gray-500 px-2 py-1">矢印の向き</div>
      <button onClick={() => onDirectionSelect('forward')} className="text-left px-2 py-1.5 text-sm hover:bg-slate-100 rounded">
        → 順方向
      </button>
      <button onClick={() => onDirectionSelect('backward')} className="text-left px-2 py-1.5 text-sm hover:bg-slate-100 rounded">
        ← 逆方向
      </button>
      <button onClick={() => onDirectionSelect('bidirectional')} className="text-left px-2 py-1.5 text-sm hover:bg-slate-100 rounded">
        ↔ 双方向
      </button>

      <button onClick={onClose} className="text-left px-2 py-1 text-xs text-gray-400 hover:text-gray-600 mt-1">閉じる</button>
    </div>
  );
};

const SettingsPanel = () => {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold mb-4 text-slate-800">設定</h2>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          デフォルト矢印の向き
        </label>
        <select
          className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
          value={settings.defaultArrowDirection}
          onChange={(e) => updateSettings({
            defaultArrowDirection: e.target.value as any
          })}
        >
          <option value="forward">→ 順方向</option>
          <option value="backward">← 逆方向</option>
          <option value="bidirectional">↔ 双方向</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          リンクの太さ: {settings.linkWidth}px
        </label>
        <input
          type="range"
          min="1"
          max="5"
          step="0.5"
          value={settings.linkWidth}
          onChange={(e) => updateSettings({ linkWidth: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-2">リンクの色</h3>
        <div className="space-y-2">
          {(['basic', 'hypothetical', 'conflict', 'limiter'] as const).map((type) => (
            <div key={type} className="flex items-center gap-2">
              <label className="text-xs flex-1">
                {type === 'basic' ? '演繹' :
                 type === 'hypothetical' ? '仮定' :
                 type === 'conflict' ? '対立' : '限定'}
              </label>
              <input
                type="color"
                value={settings.linkColors[type]}
                onChange={(e) => updateSettings({
                  linkColors: { ...settings.linkColors, [type]: e.target.value }
                })}
                className="w-12 h-8 border border-slate-300 rounded cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-2">ノードの色</h3>
        {(['premise', 'claim'] as const).map((nodeType) => (
          <div key={nodeType} className="mb-3">
            <div className="text-xs font-medium mb-2">
              {nodeType === 'premise' ? '前提' : '結論'}
            </div>
            <div className="space-y-2 ml-2">
              <div className="flex items-center gap-2">
                <label className="text-xs flex-1">背景色</label>
                <input
                  type="color"
                  value={settings.nodeColors[nodeType].background}
                  onChange={(e) => updateSettings({
                    nodeColors: {
                      ...settings.nodeColors,
                      [nodeType]: {
                        ...settings.nodeColors[nodeType],
                        background: e.target.value
                      }
                    }
                  })}
                  className="w-12 h-7 border border-slate-300 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs flex-1">枠線色</label>
                <input
                  type="color"
                  value={settings.nodeColors[nodeType].border}
                  onChange={(e) => updateSettings({
                    nodeColors: {
                      ...settings.nodeColors,
                      [nodeType]: {
                        ...settings.nodeColors[nodeType],
                        border: e.target.value
                      }
                    }
                  })}
                  className="w-12 h-7 border border-slate-300 rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs flex-1">文字色</label>
                <input
                  type="color"
                  value={settings.nodeColors[nodeType].text}
                  onChange={(e) => updateSettings({
                    nodeColors: {
                      ...settings.nodeColors,
                      [nodeType]: {
                        ...settings.nodeColors[nodeType],
                        text: e.target.value
                      }
                    }
                  })}
                  className="w-12 h-7 border border-slate-300 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => updateSettings(DEFAULT_SETTINGS)}
        className="w-full px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-sm font-bold transition-colors"
      >
        デフォルトに戻す
      </button>
    </div>
  );
};

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState<'nodes' | 'settings'>('nodes');
  const store = useStore();
  const onDragStart = (event: React.DragEvent, nodeDef: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeDef));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onNodeClick = (nodeDef: any) => {
    const nodes = store.nodes;
    let x = 100;
    let y = 100;
    const spacing = 150;

    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      x = lastNode.position.x + spacing;
      y = lastNode.position.y;

      if (x > 800) {
        x = 100;
        y = lastNode.position.y + 100;
      }
    }

    const newNode: CustomNode = {
      id: `${nodeDef.id}-${uuidv4().slice(0, 4)}`,
      type: 'universal',
      position: { x, y },
      data: { label: nodeDef.label, type: nodeDef.type },
    };

    store.addNode(newNode);
  };

  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-full">
      <div className="flex border-b border-slate-200 bg-white">
        <button
          className={`flex-1 px-4 py-3 text-sm font-bold transition-colors ${
            activeTab === 'nodes' ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => setActiveTab('nodes')}
        >
          ノード
        </button>
        <button
          className={`flex-1 px-4 py-3 text-sm font-bold transition-colors ${
            activeTab === 'settings' ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          設定
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        {activeTab === 'nodes' ? (
          <>
            <h2 className="text-lg font-bold mb-4 text-slate-800">ノードパレット</h2>
            <div className="space-y-3">
              {PROBLEM_DEF.nodes.map((nodeDef) => (
                <div
                  key={nodeDef.id}
                  className={`p-3 rounded-lg shadow-sm cursor-pointer border-2 text-sm font-medium transition-transform hover:scale-105 ${
                    nodeDef.type === 'claim'
                      ? 'bg-yellow-100 border-yellow-400 text-yellow-900'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                  draggable
                  onDragStart={(e) => onDragStart(e, nodeDef)}
                  onClick={() => onNodeClick(nodeDef)}
                >
                  {nodeDef.label}
                </div>
              ))}
            </div>
            <div className="mt-8 p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-200">
              <strong>操作ガイド:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>ノードをクリックで自動配置</li>
                <li>ノードをドラッグで好きな位置に配置</li>
                <li>ノードの●をドラッグして接続</li>
                <li>線をクリックして種類を変更</li>
              </ul>
            </div>
          </>
        ) : (
          <SettingsPanel />
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-white flex gap-2">
        <button
          onClick={store.undo}
          disabled={store.past.length === 0}
          className="flex-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ↶ 戻る
        </button>
        <button
          onClick={store.redo}
          disabled={store.future.length === 0}
          className="flex-1 px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          進む ↷
        </button>
      </div>
    </aside>
  );
};

const CanvasArea = () => {
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
    (event: React.MouseEvent, edge: any) => {
      event.preventDefault();
      event.stopPropagation();
      setMenu({ id: edge.id, x: event.clientX, y: event.clientY });
    },
    []
  );

  const handleTypeSelect = (typeKey: any) => {
    if (menu) {
      store.updateEdgeType(menu.id, typeKey);
      setMenu(null);
    }
  };

  const handleDirectionSelect = (direction: string) => {
    if (menu) {
      store.updateEdgeDirection(menu.id, direction as 'forward' | 'backward' | 'bidirectional');
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

export default function Home() {
  return (
    <main className="flex h-screen flex-col font-sans">
      <header className="bg-slate-800 text-white p-4 shadow-md z-10">
        <h1 className="text-xl font-bold">{PROBLEM_DEF.title}</h1>
      </header>
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        <ReactFlowProvider>
          <Sidebar />
          <CanvasArea />
        </ReactFlowProvider>
      </div>
    </main>
  );
}
