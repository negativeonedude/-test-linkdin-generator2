import React, { useState, useRef } from 'react';
import { analyzeScreenshot } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

const VisionHelp: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64Data = base64String.split(',')[1];
        setImage(base64Data);
        setResponse(null); // Clear previous response
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    setLoading(true);
    const result = await analyzeScreenshot(image, query);
    setResponse(result);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
       <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Visual Troubleshooter</h2>
        <p className="text-slate-600">Stuck on a LinkedIn setting or error message? Upload a screenshot and let AI guide you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
              {image ? (
                <div className="relative">
                   <p className="text-green-600 font-medium mb-2">Image Selected</p>
                   <img src={`data:image/png;base64,${image}`} alt="Preview" className="max-h-48 mx-auto rounded shadow-md" />
                   <button type="button" onClick={(e) => {e.stopPropagation(); setImage(null);}} className="mt-2 text-xs text-red-500 underline">Remove</button>
                </div>
              ) : (
                <>
                  <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-1 text-sm text-slate-600">Click to upload screenshot</p>
                </>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">What's the issue?</label>
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., I can't find the Creator Mode button..."
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <button 
              type="submit" 
              disabled={!image || loading}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Analyzing Image...' : 'Analyze Screenshot'}
            </button>
          </form>
        </div>

        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 overflow-y-auto max-h-[600px]">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Analysis Result</h3>
          {response ? (
             <div className="prose prose-indigo prose-sm max-w-none text-slate-700">
               <ReactMarkdown>{response}</ReactMarkdown>
             </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm text-center">
              Upload an image to receive technical guidance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisionHelp;
