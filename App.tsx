import React, { useState } from 'react';
import { Header } from './components/Header';
import { DataInput } from './components/DataInput';
import { OutputSection } from './components/OutputSection';
import { extractDatasetFromText } from './services/geminiService';
import { ExtractedDataset, ProcessingState, AppMode } from './types';
import { AlertCircle, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('single');
  
  // State for inputs
  const [inputs, setInputs] = useState<{A: string, B: string}>({ A: '', B: '' });
  const [inputTab, setInputTab] = useState<'A' | 'B'>('A');

  // State for datasets
  const [datasets, setDatasets] = useState<{A: ExtractedDataset | null, B: ExtractedDataset | null}>({ A: null, B: null });
  
  const [processingState, setProcessingState] = useState<ProcessingState>({ status: 'idle' });

  const handleProcess = async () => {
    // Determine what to process
    const processA = mode === 'single' || (mode === 'versus' && !!inputs.A.trim());
    const processB = mode === 'versus' && !!inputs.B.trim();

    if (!processA && !processB) return;

    setProcessingState({ status: 'processing' });
    
    // Clear previous errors
    // Don't necessarily clear datasets, maybe user wants to update just one. 
    // For simplicity, let's clear what we are about to re-process.
    setDatasets(prev => ({
      A: processA ? null : prev.A,
      B: mode === 'single' ? null : (processB ? null : prev.B)
    }));

    try {
      const promises = [];
      if (processA) promises.push(extractDatasetFromText(inputs.A, "Dataset A").then(res => ({ key: 'A', res })));
      if (processB) promises.push(extractDatasetFromText(inputs.B, "Dataset B").then(res => ({ key: 'B', res })));

      const results = await Promise.all(promises);
      
      const newDatasets = { ...datasets };
      // reset B if switching to single
      if (mode === 'single') newDatasets.B = null;

      results.forEach(({ key, res }) => {
        if (key === 'A') newDatasets.A = res;
        if (key === 'B') newDatasets.B = res;
      });

      setDatasets(newDatasets);
      setProcessingState({ status: 'success' });
    } catch (error) {
      console.error(error);
      setProcessingState({ 
        status: 'error', 
        message: 'Failed to process text. Please try again or check your input.' 
      });
    }
  };

  const activeInputVal = inputTab === 'A' ? inputs.A : inputs.B;
  const handleInputChange = (val: string) => {
    setInputs(prev => ({ ...prev, [inputTab]: val }));
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50">
      <Header mode={mode} setMode={setMode} />
      
      <main className="flex-1 overflow-hidden p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1600px] mx-auto h-full flex flex-col lg:flex-row gap-6">
          
          {/* Input Section */}
          <div className="w-full lg:w-[40%] h-[45%] lg:h-full min-h-[300px] flex flex-col rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
             
             {/* Input Tabs (Only visible in Versus Mode) */}
             {mode === 'versus' && (
                <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
                   <button 
                      onClick={() => setInputTab('A')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${inputTab === 'A' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     Source A {inputs.A.trim() && '✓'}
                   </button>
                   <button 
                      onClick={() => setInputTab('B')}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${inputTab === 'B' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     Source B {inputs.B.trim() && '✓'}
                   </button>
                </div>
             )}

             <div className="flex-1 overflow-hidden">
                <DataInput 
                   title={mode === 'versus' ? `Input Text (${inputTab === 'A' ? 'Source A' : 'Source B'})` : 'Input Text'}
                   value={activeInputVal} 
                   onChange={handleInputChange} 
                   onProcess={handleProcess}
                   isProcessing={processingState.status === 'processing'}
                   hideAction={true} // We use the main footer button
                />
             </div>

             {/* Main Action Footer */}
             <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={handleProcess}
                  disabled={
                    processingState.status === 'processing' || 
                    (mode === 'single' && !inputs.A.trim()) ||
                    (mode === 'versus' && (!inputs.A.trim() && !inputs.B.trim()))
                  }
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200
                    ${processingState.status === 'processing' || (mode === 'single' && !inputs.A.trim()) || (mode === 'versus' && (!inputs.A.trim() && !inputs.B.trim()))
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-secondary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 active:transform active:scale-[0.98]'
                    }`}
                >
                  {processingState.status === 'processing' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {mode === 'versus' ? 'Convert All Datasets' : 'Convert to Dataset'} <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
          </div>

          {/* Output Section */}
          <div className="w-full lg:w-[60%] h-[55%] lg:h-full min-h-[400px] flex flex-col gap-4">
             {processingState.status === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-2">
                   <AlertCircle size={18} />
                   {processingState.message}
                </div>
             )}
             <OutputSection datasets={datasets} mode={mode} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
