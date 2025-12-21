import React from 'react';
import useStore from '../../lib/store';
import { ProblemImport } from './ProblemImport';

export const ProblemSelector = () => {
  const currentProblemId = useStore((state) => state.currentProblemId);
  const setCurrentProblem = useStore((state) => state.setCurrentProblem);
  const goToNext = useStore((state) => state.goToNextProblem);
  const goToPrevious = useStore((state) => state.goToPreviousProblem);
  const getAllProblems = useStore((state) => state.getAllProblems);

  const allProblems = getAllProblems();
  const currentIndex = allProblems.findIndex((p) => p.id === currentProblemId);

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
        {allProblems.map((p, idx) => (
          <option key={p.id} value={p.id}>
            問題 {idx + 1}: {p.title}
          </option>
        ))}
      </select>
      <button
        onClick={goToNext}
        disabled={currentIndex === allProblems.length - 1}
        className="px-3 py-1.5 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        次へ →
      </button>
      <ProblemImport />
    </div>
  );
};
