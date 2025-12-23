import React from 'react';
import useStore from '../../lib/store';
import { FeedbackHeader } from './FeedbackHeader';
import { FeedbackDetails } from './FeedbackDetails';
import { FeedbackMessages } from './FeedbackMessages';

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
      <FeedbackHeader correct={result.correct} score={result.score} />
      <FeedbackDetails details={result.details} />
      <FeedbackMessages messages={result.messages} />

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
