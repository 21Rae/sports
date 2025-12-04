import React from 'react';
import { ExtractedDataset } from '../types';

interface DataTableProps {
  data: ExtractedDataset | null;
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  if (!data || data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <div className="w-8 h-8 border-2 border-slate-300 rounded-md grid grid-cols-2 gap-0.5 p-0.5">
            <div className="bg-slate-300 rounded-[1px]"></div>
            <div className="bg-slate-300 rounded-[1px]"></div>
            <div className="bg-slate-300 rounded-[1px]"></div>
            <div className="bg-slate-300 rounded-[1px]"></div>
          </div>
        </div>
        <p className="font-medium text-slate-500">No data generated yet</p>
        <p className="text-sm mt-1">Paste your text on the left and click Convert</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="overflow-auto custom-scrollbar flex-1 rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="py-3 px-4 border-b border-slate-200 w-12 text-center text-slate-400 font-normal">#</th>
              {data.columns.map((col) => (
                <th key={col} className="py-3 px-4 font-semibold text-slate-700 border-b border-slate-200 capitalize whitespace-nowrap">
                  {col.replace(/_/g, ' ')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                <td className="py-2.5 px-4 text-slate-400 text-xs text-center border-r border-transparent group-hover:border-slate-100">{idx + 1}</td>
                {data.columns.map((col) => (
                  <td key={`${idx}-${col}`} className="py-2.5 px-4 text-slate-600 whitespace-nowrap max-w-xs truncate" title={String(row[col])}>
                    {row[col] === null ? <span className="text-slate-300 italic">null</span> : String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 px-1 text-xs text-slate-400 flex justify-between">
        <span>{data.data.length} rows</span>
        <span>{data.columns.length} columns</span>
      </div>
    </div>
  );
};
