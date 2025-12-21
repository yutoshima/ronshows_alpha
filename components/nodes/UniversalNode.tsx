import React from 'react';
import { Handle, Position } from 'reactflow';

export const UniversalNode = ({ data, selected }: any) => {
  const isClaim = data.type === 'claim';
  const baseStyle = "px-4 py-3 rounded-lg shadow-md border-2 text-sm font-medium w-full h-full flex items-center justify-center text-center transition-all";
  const colorStyle = isClaim
    ? 'bg-yellow-50 border-yellow-400 text-yellow-900'
    : 'bg-white border-slate-300 text-slate-700';
  const selectedStyle = selected ? 'ring-2 ring-blue-500 border-blue-500' : '';
  const handleStyle = "!w-3 !h-3 !bg-slate-400 hover:!bg-blue-600 transition-colors border-2 border-white";

  return (
    <div className={`${baseStyle} ${colorStyle} ${selectedStyle}`} style={{ minWidth: '180px' }}>
      <Handle type="target" position={Position.Top} className={handleStyle} id="top" />
      <Handle type="source" position={Position.Right} className={handleStyle} id="right" />
      <Handle type="source" position={Position.Bottom} className={handleStyle} id="bottom" />
      <Handle type="target" position={Position.Left} className={handleStyle} id="left" />
      {data.label}
    </div>
  );
};
