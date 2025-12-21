import React from 'react';
import useStore from '../../lib/store';

export const FeedbackPanel = () => {
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
