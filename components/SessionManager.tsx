
import React, { useState } from 'react';

interface Props {
  onLogin: (businessName: string) => void;
}

const SessionManager: React.FC<Props> = ({ onLogin }) => {
  const [handle, setHandle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (handle.trim()) {
      onLogin(handle.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-md w-full text-center">
        <div className="mb-6 flex justify-center">
           <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
             <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
           </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h1>
        <p className="text-slate-500 mb-8">Enter your Business Name or ID to load your progress or start a new strategy.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            value={handle} 
            onChange={(e) => setHandle(e.target.value)}
            placeholder="e.g. AcmeCorp"
            className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-lg"
            required
          />
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
            Continue &rarr;
          </button>
        </form>
        <p className="text-xs text-slate-400 mt-6">
          Data is saved locally on this device.
        </p>
      </div>
    </div>
  );
};

export default SessionManager;
