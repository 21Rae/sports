import React from 'react';
import { ExtractedDataset } from '../types';

interface DataJsonProps {
  data: ExtractedDataset | null;
}

export const DataJson: React.FC<DataJsonProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="h-full w-full rounded-lg border border-slate-200 bg-slate-900 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-auto custom-scrollbar p-4">
        <pre className="font-mono text-xs sm:text-sm text-green-400 leading-relaxed">
          {JSON.stringify(data.data, null, 2)}
        </pre>
      </div>
    </div>
  );
};
