import React from 'react';
import { Database, Sparkles, Swords, User } from 'lucide-react';
import { AppMode } from '../types';

interface HeaderProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, setMode }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <Database size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            DataRefine <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-primary/20 bg-primary/5">AI Powered</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">Unstructured Text to Clean Dataset</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Mode Toggle */}
        <div className="bg-slate-100 p-1 rounded-lg flex items-center">
          <button
            onClick={() => setMode('single')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === 'single'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <User size={16} /> Single
          </button>
          <button
            onClick={() => setMode('versus')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              mode === 'versus'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Swords size={16} /> Versus
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Sparkles size={16} className="text-yellow-500" />
            Gemini 2.5 Flash
          </span>
        </div>
      </div>
    </header>
  );
};
