import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: AnalysisMessage = {
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await analyzeDataset(datasets, userMessage.content);
      
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

      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your data..."
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
