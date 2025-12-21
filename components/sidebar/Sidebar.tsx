import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CustomNode } from '../../lib/constants';
import useStore from '../../lib/store';
import { SettingsPanel } from './SettingsPanel';
import { LogPanel } from './LogPanel';

export const Sidebar = () => {
  const [activeTab, setActiveTab] = useState<'nodes' | 'settings' | 'logs'>('nodes');
  const store = useStore();
  const currentProblemId = useStore((state) => state.currentProblemId);
  const getAllProblems = useStore((state) => state.getAllProblems);

  const currentProblem = getAllProblems().find((p) => p.id === currentProblemId);

  const onDragStart = (event: React.DragEvent, nodeDef: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeDef));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onNodeClick = (nodeDef: any) => {
    const nodes = store.nodes;
    const HORIZONTAL_SPACING = 250;  // NODE_WIDTH (180) + マージン (70)
    const VERTICAL_SPACING = 120;     // 行間
    const COLUMNS = 4;                 // 1行あたりのノード数
    const START_X = 100;
    const START_Y = 100;

    let x = START_X;
    let y = START_Y;

    if (nodes.length > 0) {
      const index = nodes.length;
      const col = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);

      x = START_X + col * HORIZONTAL_SPACING;
      y = START_Y + row * VERTICAL_SPACING;
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
          className={`flex-1 px-3 py-3 text-xs font-bold transition-colors ${
            activeTab === 'nodes' ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => setActiveTab('nodes')}
        >
          ノード
        </button>
        <button
          className={`flex-1 px-3 py-3 text-xs font-bold transition-colors ${
            activeTab === 'settings' ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          設定
        </button>
        <button
          className={`flex-1 px-3 py-3 text-xs font-bold transition-colors ${
            activeTab === 'logs' ? 'bg-white border-b-2 border-blue-500 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => setActiveTab('logs')}
        >
          ログ
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        {activeTab === 'nodes' ? (
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4 text-slate-800">ノードパレット</h2>
            <div className="space-y-3">
              {currentProblem && currentProblem.nodes.map((nodeDef) => (
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
          </div>
        ) : activeTab === 'settings' ? (
          <SettingsPanel />
        ) : (
          <LogPanel />
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
