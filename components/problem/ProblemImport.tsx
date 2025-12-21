import React, { useRef, useState } from 'react';
import useStore from '../../lib/store';

export const ProblemImport = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importProblems = useStore((state) => state.importProblems);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);

    const result = await importProblems(file);

    setImporting(false);
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Clear message after 5 seconds
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv"
        onChange={handleImport}
        className="hidden"
        id="problem-import"
      />
      <label
        htmlFor="problem-import"
        className={`px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium cursor-pointer transition-colors inline-block ${
          importing ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {importing ? 'インポート中...' : '📁 問題をインポート'}
      </label>
      {message && (
        <div
          className={`absolute top-full mt-2 right-0 px-3 py-2 rounded text-xs whitespace-nowrap z-50 ${
            message.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};
