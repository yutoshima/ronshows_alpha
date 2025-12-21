import React from 'react';
import useStore from '../../lib/store';

export const FeedbackSettingsPanel = () => {
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
