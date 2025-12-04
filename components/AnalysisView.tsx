import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { ExtractedDataset, AnalysisMessage } from '../types';
import { analyzeDataset } from '../services/geminiService';
import { ChartRenderer } from './ChartRenderer';

interface AnalysisViewProps {
  datasets: ExtractedDataset[];
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ datasets }) => {
  const [messages, setMessages] = useState<AnalysisMessage[]>([
    {
      role: 'assistant',
      content: datasets.length > 1 
        ? 'Hi! I see two datasets. Ask me to compare them, find differences, or analyze specific trends.'
        : 'Hi! I can analyze your dataset. Ask me questions like "What is the average value?" or "Show me a bar chart of sales by region".',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Column Selection State
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Extract unique columns from all datasets
  const allColumns = React.useMemo(() => {
    return Array.from(new Set(datasets.flatMap(d => d.columns))).sort();
  }, [datasets]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleColumn = (col: string) => {
    const next = new Set(selectedColumns);
    if (next.has(col)) {
      next.delete(col);
    } else {
      next.add(col);
    }
    setSelectedColumns(next);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Construct the query with context
    let enrichedQuery = input;
    if (selectedColumns.size > 0) {
      const cols = Array.from(selectedColumns).join(', ');
      enrichedQuery += `\n\n[System Note]: The user has explicitly selected the following columns to focus this analysis and chart on: ${cols}. Prioritize these columns for the X-axis, Y-axis, or grouping dimensions in the chart.`;
    }

    const userMessage: AnalysisMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await analyzeDataset(datasets, enrichedQuery);
      
      const aiMessage: AnalysisMessage = {
        role: 'assistant',
        content: result.answer,
        chart: result.chart,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: AnalysisMessage = {
        role: 'assistant',
        content: "Sorry, I couldn't analyze that right now. Please try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-indigo-600'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`flex flex-col max-w-[85%] sm:max-w-[75%]`}>
              <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
              
              {msg.chart && (
                <div className="mt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <ChartRenderer config={msg.chart} />
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shrink-0">
               <Bot size={16} />
             </div>
             <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={14} className="animate-spin" />
                Analyzing data...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200 space-y-3">
        {/* Column Selector Toggle & Display */}
        <div className="flex flex-col gap-2">
           <div className="flex items-center justify-between">
              <button 
                type="button"
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-all border ${
                   showColumnSelector || selectedColumns.size > 0
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-700'
                }`}
              >
                <SlidersHorizontal size={14} />
                {selectedColumns.size > 0 ? `${selectedColumns.size} Columns Selected` : 'Select Columns to Chart'}
              </button>
              
              {selectedColumns.size > 0 && (
                <button 
                  onClick={() => setSelectedColumns(new Set())}
                  className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1"
                >
                  <X size={12} /> Clear
                </button>
              )}
           </div>

           {/* Collapsible Column List */}
           {(showColumnSelector || selectedColumns.size > 0) && (
             <div className="flex flex-wrap gap-2 animate-in slide-in-from-top-1 fade-in duration-200 max-h-[120px] overflow-y-auto custom-scrollbar p-1">
               {allColumns.map(col => (
                 <button
                   key={col}
                   onClick={() => toggleColumn(col)}
                   className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                     selectedColumns.has(col)
                       ? 'bg-primary text-white border-primary shadow-sm'
                       : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                   }`}
                 >
                   {col.replace(/_/g, ' ')}
                 </button>
               ))}
             </div>
           )}
        </div>

        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedColumns.size > 0 ? "Ask a question about the selected columns..." : "Ask a question about your data..."}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary block p-3 pr-12 outline-none transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-1.5 text-slate-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-slate-100"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};
