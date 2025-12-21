'use client';

import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import useStore from '../lib/store';
import { Sidebar } from '../components/sidebar/Sidebar';
import { CanvasArea } from '../components/canvas/CanvasArea';
import { ProblemSelector } from '../components/problem/ProblemSelector';
import { ProblemModal } from '../components/problem/ProblemModal';
import { FeedbackPanel } from '../components/feedback/FeedbackPanel';

export default function Home() {
  const store = useStore();

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
