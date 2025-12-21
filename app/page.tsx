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
  useViewport,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { PROBLEMS, CustomNode, LINK_STYLES } from '../lib/constants';
import useStore, { DEFAULT_SETTINGS, findLimiterGroups } from '../lib/store';
import { v4 as uuidv4 } from 'uuid';

// ノードの実際のサイズ定数
// minWidth(180) + px-4(32) + border-2(4) = 216px
const NODE_WIDTH = 216;
// py-3(24) + text(14) + border-2(4) + line-height(10) = 52px
const NODE_HEIGHT = 52;

const GroupBoxes = () => {
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

const LogPanel = () => {
  const logs = useStore((state) => state.logs);
  const exportLogs = useStore((state) => state.exportLogs);
  const clearLogs = useStore((state) => state.clearLogs);

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">操作ログ</h2>
        <div className="flex gap-2">
          <button
            onClick={exportLogs}
            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
          >
            エクスポート
          </button>
          <button
            onClick={clearLogs}
            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-medium transition-colors"
          >
            クリア
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 border border-slate-200 rounded p-2 bg-white">
        {logs.length === 0 ? (
          <div className="text-center text-slate-400 text-sm py-4">ログはまだありません</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="text-xs p-2 bg-slate-50 rounded border border-slate-100">
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 font-mono whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className="flex-1 text-slate-700">{log.description}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ProblemSelector = () => {
  const currentProblemId = useStore((state) => state.currentProblemId);
  const setCurrentProblem = useStore((state) => state.setCurrentProblem);
  const goToNext = useStore((state) => state.goToNextProblem);
  const goToPrevious = useStore((state) => state.goToPreviousProblem);

  const currentIndex = PROBLEMS.findIndex((p) => p.id === currentProblemId);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={goToPrevious}
        disabled={currentIndex === 0}
        className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ← 前へ
      </button>
      <select
        value={currentProblemId}
        onChange={(e) => setCurrentProblem(e.target.value)}
        className="px-3 py-1.5 bg-white text-slate-800 rounded text-sm font-medium border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {PROBLEMS.map((p, idx) => (
          <option key={p.id} value={p.id}>
            問題 {idx + 1}: {p.title}
          </option>
        ))}
      </select>
      <button
        onClick={goToNext}
        disabled={currentIndex === PROBLEMS.length - 1}
        className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        次へ →
      </button>
    </div>
  );
};

const ProblemModal = () => {
  const show = useStore((state) => state.showProblemModal);
  const toggle = useStore((state) => state.toggleProblemModal);
  const problemId = useStore((state) => state.currentProblemId);

  const problem = PROBLEMS.find((p) => p.id === problemId);
  if (!show || !problem) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={toggle}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">{problem.title}</h2>
          <button
            onClick={toggle}
            className="text-slate-400 hover:text-slate-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans leading-relaxed">
            {problem.description}
          </pre>
        </div>
      </div>
    </div>
  );
};

const FeedbackPanel = () => {
  const result = useStore((state) => state.feedbackResult);
  const goToNext = useStore((state) => state.goToNextProblem);
  const reset = useStore((state) => state.resetProblem);

  if (!result) return null;

  return (
    <div
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 bg-white rounded-lg shadow-2xl p-6 max-w-lg w-full border-4 ${
        result.correct ? 'border-green-500' : 'border-red-500'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`text-4xl ${
            result.correct ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {result.correct ? '✓' : '×'}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800">
            {result.correct ? '正解です！' : '不正解です'}
          </h3>
          <div className="text-lg text-slate-600">スコア: {result.score}/100</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div
          className={`flex items-center gap-2 p-2 rounded ${
            result.details.nodesCorrect ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <span
            className={`font-bold ${
              result.details.nodesCorrect ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {result.details.nodesCorrect ? '✓' : '×'}
          </span>
          <span className="text-sm text-slate-700">
            ノード: {result.details.nodesCorrect ? '正解' : '不正解'}
          </span>
        </div>
        <div
          className={`flex items-center gap-2 p-2 rounded ${
            result.details.edgesCorrect ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <span
            className={`font-bold ${
              result.details.edgesCorrect ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {result.details.edgesCorrect ? '✓' : '×'}
          </span>
          <span className="text-sm text-slate-700">
            接続: {result.details.edgesCorrect ? '正解' : '不正解'}
          </span>
        </div>
        <div
          className={`flex items-center gap-2 p-2 rounded ${
            result.details.edgeTypesCorrect ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <span
            className={`font-bold ${
              result.details.edgeTypesCorrect ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {result.details.edgeTypesCorrect ? '✓' : '×'}
          </span>
          <span className="text-sm text-slate-700">
            リンク種類: {result.details.edgeTypesCorrect ? '正解' : '不正解'}
          </span>
        </div>
        <div
          className={`flex items-center gap-2 p-2 rounded ${
            result.details.arrowDirectionsCorrect ? 'bg-green-50' : 'bg-red-50'
          }`}
        >
          <span
            className={`font-bold ${
              result.details.arrowDirectionsCorrect
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {result.details.arrowDirectionsCorrect ? '✓' : '×'}
          </span>
          <span className="text-sm text-slate-700">
            矢印向き: {result.details.arrowDirectionsCorrect ? '正解' : '不正解'}
          </span>
        </div>
      </div>

      {result.messages.length > 0 && (
        <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
          <div className="text-xs font-bold text-slate-600 mb-2">フィードバック:</div>
          <div className="space-y-1">
            {result.messages.map((msg, i) => (
              <p key={i} className="text-sm text-slate-700">
                • {msg}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {result.correct && (
          <button
            onClick={goToNext}
            className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-bold transition-colors"
          >
            次の問題へ →
          </button>
        )}
        <button
          onClick={reset}
          className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded font-bold transition-colors"
        >
          やり直す
        </button>
      </div>
    </div>
  );
};

const FeedbackSettingsPanel = () => {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);
  const { feedbackConfig } = settings;

  const getRuleLabel = (id: string) => {
    switch (id) {
      case 'nodes': return 'ノード';
      case 'edges': return '接続';
      case 'edgeTypes': return 'リンク種類';
      case 'arrowDirections': return '矢印向き';
      default: return id;
    }
  };

  const updateRule = (ruleId: string, updates: any) => {
    const newRules = feedbackConfig.rules.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    updateSettings({
      feedbackConfig: { ...feedbackConfig, rules: newRules }
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-700 mb-2">フィードバック設定</h3>

      <div>
        <label className="block text-xs text-slate-700 mb-1">
          合格点: {feedbackConfig.passingScore}点
        </label>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={feedbackConfig.passingScore}
          onChange={(e) => updateSettings({
            feedbackConfig: { ...feedbackConfig, passingScore: parseInt(e.target.value) }
          })}
          className="w-full"
        />
      </div>

      <div className="space-y-3">
        {feedbackConfig.rules.map((rule) => (
          <div key={rule.id} className="p-3 bg-slate-50 rounded border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">
                {getRuleLabel(rule.id)}
              </label>
              <input
                type="checkbox"
                checked={rule.enabled}
                onChange={(e) => updateRule(rule.id, { enabled: e.target.checked })}
                className="w-4 h-4 cursor-pointer"
              />
            </div>

            {rule.enabled && (
              <>
                <div className="mb-2">
                  <label className="block text-xs text-slate-600 mb-1">
                    配点: {rule.weight}点
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={rule.weight}
                    onChange={(e) => updateRule(rule.id, { weight: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      正解メッセージ:
                    </label>
                    <input
                      type="text"
                      value={rule.messages.correct}
                      onChange={(e) => updateRule(rule.id, {
                        messages: { ...rule.messages, correct: e.target.value }
                      })}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">
                      不正解メッセージ:
                    </label>
                    <input
                      type="text"
                      value={rule.messages.incorrect}
                      onChange={(e) => updateRule(rule.id, {
                        messages: { ...rule.messages, incorrect: e.target.value }
                      })}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
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

      <FeedbackSettingsPanel />

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

      <div>
        <h3 className="text-sm font-bold text-slate-700 mb-2">グループボックス</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="groupBoxEnabled"
              checked={settings.groupBox.enabled}
              onChange={(e) => updateSettings({
                groupBox: { ...settings.groupBox, enabled: e.target.checked }
              })}
              className="w-4 h-4 cursor-pointer"
            />
            <label htmlFor="groupBoxEnabled" className="text-xs cursor-pointer">
              限定リンクで繋がったノードを囲む
            </label>
          </div>

          {settings.groupBox.enabled && (
            <>
              <div className="flex items-center gap-2">
                <label className="text-xs flex-1">ボックスの色</label>
                <input
                  type="color"
                  value={settings.groupBox.color}
                  onChange={(e) => updateSettings({
                    groupBox: { ...settings.groupBox, color: e.target.value }
                  })}
                  className="w-12 h-7 border border-slate-300 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 mb-1">
                  パディング: {settings.groupBox.padding}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={settings.groupBox.padding}
                  onChange={(e) => updateSettings({
                    groupBox: { ...settings.groupBox, padding: parseInt(e.target.value) }
                  })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-700 mb-1">
                  枠線の太さ: {settings.groupBox.borderWidth}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={settings.groupBox.borderWidth}
                  onChange={(e) => updateSettings({
                    groupBox: { ...settings.groupBox, borderWidth: parseInt(e.target.value) }
                  })}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>
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
  const [activeTab, setActiveTab] = useState<'nodes' | 'settings' | 'logs'>('nodes');
  const store = useStore();
  const currentProblemId = useStore((state) => state.currentProblemId);

  const currentProblem = PROBLEMS.find((p) => p.id === currentProblemId);

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

export default function Home() {
  const store = useStore();
  const currentProblemId = useStore((state) => state.currentProblemId);
  const currentProblem = PROBLEMS.find((p) => p.id === currentProblemId);

  return (
    <main className="flex h-screen flex-col font-sans">
      <header className="bg-slate-800 text-white p-4 shadow-md z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">論証グラフ作成ツール</h1>
          <ProblemSelector />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={store.toggleProblemModal}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm font-medium transition-colors"
          >
            📖 問題文
          </button>
          <button
            onClick={store.submitAnswer}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-bold transition-colors"
          >
            ✓ 完成
          </button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        <ReactFlowProvider>
          <Sidebar />
          <CanvasArea />
        </ReactFlowProvider>
      </div>
      <ProblemModal />
      <FeedbackPanel />
    </main>
  );
}
