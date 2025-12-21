import React from 'react';

type EdgeContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  onSelect: (styleKey: string) => void;
  onDirectionSelect: (direction: string) => void;
};

export const EdgeContextMenu = ({ x, y, onClose, onSelect, onDirectionSelect }: EdgeContextMenuProps) => {
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
