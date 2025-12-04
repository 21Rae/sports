import React from 'react';
import { ArrowRight, Trash2, FileText } from 'lucide-react';

interface DataInputProps {
  value: string;
  onChange: (value: string) => void;
  onProcess?: () => void; // Optional now
  isProcessing: boolean;
  title?: string;
  hideAction?: boolean;
}

export const DataInput: React.FC<DataInputProps> = ({ 
  value, 
  onChange, 
  onProcess, 
  isProcessing,
  title = "Input Text",
  hideAction = false
}) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="font-semibold text-slate-700 flex items-center gap-2">
          <FileText size={18} className="text-slate-400" />
          {title}
        </h2>
        <button
          onClick={() => onChange('')}
          className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
          title="Clear text"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className="flex-1 p-4">
        <textarea
          className="w-full h-full resize-none outline-none text-slate-600 font-mono text-sm placeholder:text-slate-300 bg-transparent"
          placeholder="Paste any unstructured text here...
Example:
'John Doe (john@example.com) - Engineer - 5 years exp'
..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {!hideAction && onProcess && (
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onProcess}
            disabled={!value.trim() || isProcessing}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200
              ${!value.trim() || isProcessing
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-primary hover:bg-secondary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 active:transform active:scale-[0.98]'
              }`}
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Convert to Dataset <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
