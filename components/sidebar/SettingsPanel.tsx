import React from 'react';
import useStore, { DEFAULT_SETTINGS } from '../../lib/store';
import { FeedbackSettingsPanel } from '../feedback/FeedbackSettingsPanel';

export const SettingsPanel = () => {
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
