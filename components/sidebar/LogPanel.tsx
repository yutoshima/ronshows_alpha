import React from 'react';
import useStore from '../../lib/store';

export const LogPanel = () => {
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
