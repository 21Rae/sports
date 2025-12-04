import React, { useState } from 'react';
import { Table, Code, Download, Copy, Check, BarChart2, Loader2 } from 'lucide-react';
import { ExtractedDataset, AppMode } from '../types';
import { DataTable } from './DataTable';
import { DataJson } from './DataJson';
import { AnalysisView } from './AnalysisView';

interface OutputSectionProps {
  datasets: { A: ExtractedDataset | null; B: ExtractedDataset | null };
  mode: AppMode;
  isProcessing?: boolean;
}

type TabMode = 'data-a' | 'data-b' | 'analysis';
type DataViewMode = 'table' | 'json';

export const OutputSection: React.FC<OutputSectionProps> = ({ datasets, mode, isProcessing = false }) => {
  const [tabMode, setTabMode] = useState<TabMode>('data-a');
  const [dataViewMode, setDataViewMode] = useState<DataViewMode>('table');
  const [copied, setCopied] = useState(false);

  // Determine active dataset based on tab
  const activeDataset = tabMode === 'data-b' ? datasets.B : datasets.A;
  const hasAnyData = !!datasets.A || !!datasets.B;

  // Auto-switch tabs if data comes in
  React.useEffect(() => {
    if (mode === 'single' && tabMode === 'data-b') {
      setTabMode('data-a');
    }
  }, [mode]);

  const handleDownloadCSV = () => {
    if (!activeDataset) return;
    
    const headers = activeDataset.columns.join(',');
    const rows = activeDataset.data.map(row => 
      activeDataset.columns.map(col => {
        const cell = row[col] === null ? '' : String(row[col]);
        return /[,\n"]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
      }).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeDataset.name || 'dataset'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    if (!activeDataset) return;
    const jsonContent = JSON.stringify(activeDataset.data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeDataset.name || 'dataset'}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = () => {
    if (!activeDataset) return;
    const content = dataViewMode === 'table' 
      ? activeDataset.data.map(row => Object.values(row).join('\t')).join('\n') 
      : JSON.stringify(activeDataset.data, null, 2);
      
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top Header with Tabs */}
      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 overflow-x-auto">
        <div className="flex gap-2">
          <div className="flex bg-slate-200/50 p-1 rounded-lg">
            <button
              onClick={() => setTabMode('data-a')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                tabMode === 'data-a'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Table size={16} /> {mode === 'versus' ? 'Data A' : 'Data'}
            </button>
            
            {mode === 'versus' && (
              <button
                onClick={() => setTabMode('data-b')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  tabMode === 'data-b'
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Table size={16} /> Data B
              </button>
            )}

            <button
              onClick={() => setTabMode('analysis')}
              disabled={!hasAnyData && !isProcessing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                tabMode === 'analysis'
                  ? 'bg-white text-primary shadow-sm'
                  : (!hasAnyData && !isProcessing) ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BarChart2 size={16} /> Analyze
            </button>
          </div>
        </div>

        {tabMode !== 'analysis' && (
          <div className="flex gap-2 items-center">
            <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>
            
            <div className="hidden sm:flex bg-slate-200/50 p-1 rounded-lg mr-2">
               <button
                  onClick={() => setDataViewMode('table')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${dataViewMode === 'table' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                >
                  Table
               </button>
               <button
                  onClick={() => setDataViewMode('json')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${dataViewMode === 'json' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'}`}
                >
                  JSON
               </button>
            </div>

            <button
              onClick={handleCopy}
              disabled={!activeDataset || isProcessing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Copy to Clipboard"
            >
              {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            </button>
            <button
              onClick={handleDownloadCSV}
              disabled={!activeDataset || isProcessing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download size={16} />
            </button>
            <button
               onClick={handleDownloadJSON}
               disabled={!activeDataset || isProcessing}
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
             >
               <Code size={16} />
             </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden relative">
        {isProcessing ? (
           <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-in fade-in duration-300 gap-4">
             <div className="relative">
               <div className="w-12 h-12 border-4 border-slate-100 rounded-full"></div>
               <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
             </div>
             <div className="text-center">
               <p className="font-semibold text-slate-700">Transforming your data</p>
               <p className="text-sm text-slate-400 mt-1">Extracting entities and normalizing structure...</p>
             </div>
           </div>
        ) : !hasAnyData ? (
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
        ) : (
          <>
            {tabMode === 'analysis' ? (
              <AnalysisView datasets={[datasets.A, datasets.B].filter((d): d is ExtractedDataset => !!d)} />
            ) : (
              <div className="flex flex-col h-full p-4">
                 {activeDataset ? (
                   <>
                     <div className="mb-4 bg-indigo-50 border border-indigo-100 rounded-lg p-3 shrink-0">
                        <h3 className="text-xs font-semibold text-indigo-900 uppercase tracking-wide mb-1">
                          {activeDataset.name} Summary
                        </h3>
                        <p className="text-sm text-indigo-700">{activeDataset.summary}</p>
                     </div>
                     <div className="flex-1 overflow-hidden">
                        {dataViewMode === 'table' ? <DataTable data={activeDataset} /> : <DataJson data={activeDataset} />}
                     </div>
                   </>
                 ) : (
                   <div className="flex items-center justify-center h-full text-slate-400">
                      No data in this slot
                   </div>
                 )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
