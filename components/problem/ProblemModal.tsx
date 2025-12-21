import React from 'react';
import useStore from '../../lib/store';

export const ProblemModal = () => {
  const show = useStore((state) => state.showProblemModal);
  const toggle = useStore((state) => state.toggleProblemModal);
  const problemId = useStore((state) => state.currentProblemId);
  const getAllProblems = useStore((state) => state.getAllProblems);

  const problem = getAllProblems().find((p) => p.id === problemId);
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
