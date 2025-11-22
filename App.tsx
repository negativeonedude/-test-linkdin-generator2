
import React, { useState, useEffect } from 'react';
import { AppView, UserProfileData, SessionData, SectionState, ChatMessage } from './types';
import OnboardingForm from './components/OnboardingForm';
import ProfileBuilder from './components/ProfileBuilder';
import VisionHelp from './components/VisionHelp';
import PostWriter from './components/PostWriter';
import SessionManager from './components/SessionManager';

const DEFAULT_SECTIONS: SectionState[] = [
  { id: 'headline', title: 'LinkedIn Headline', options: [], selectedIndex: null, isApproved: false, loading: false },
  { id: 'about', title: 'About Section', options: [], selectedIndex: null, isApproved: false, loading: false },
  { id: 'experience', title: 'Experience Description', options: [], selectedIndex: null, isApproved: false, loading: false },
  { id: 'strategy', title: 'Optimization Strategy', options: [], selectedIndex: null, isApproved: false, loading: false },
];

const App: React.FC = () => {
  const [session, setSession] = useState<SessionData | null>(null);
  
  // Save session to local storage whenever it changes
  useEffect(() => {
    if (session) {
      localStorage.setItem(`linkedin_ai_${session.id}`, JSON.stringify(session));
    }
  }, [session]);

  const handleLogin = (id: string) => {
    const saved = localStorage.getItem(`linkedin_ai_${id}`);
    if (saved) {
      setSession(JSON.parse(saved));
    } else {
      // New session
      setSession({
        id,
        userData: null,
        sections: DEFAULT_SECTIONS,
        masterSystemInstruction: null,
        chatHistory: [],
        lastActiveView: 'onboarding'
      });
    }
  };

  const handleOnboardingComplete = (data: UserProfileData) => {
    if (!session) return;
    setSession({
      ...session,
      userData: data,
      lastActiveView: 'profile-builder'
    });
  };

  const handleUpdateSections = (sections: SectionState[]) => {
    if (!session) return;
    setSession({ ...session, sections });
  };

  const handleFinalizeStrategy = (instruction: string) => {
    if (!session) return;
    setSession({
      ...session,
      masterSystemInstruction: instruction,
      lastActiveView: 'post-writer'
    });
  };

  const handleUpdateChatHistory = (history: ChatMessage[]) => {
    if (!session) return;
    setSession({ ...session, chatHistory: history });
  };

  const handleLogout = () => {
    setSession(null);
  };

  const renderView = () => {
    if (!session) return <SessionManager onLogin={handleLogin} />;

    // Force flow logic if data is missing
    if (session.lastActiveView === 'onboarding' || !session.userData) {
      return <OnboardingForm onComplete={handleOnboardingComplete} />;
    }

    // If they are in builder, or want to go back to builder
    if (session.lastActiveView === 'profile-builder') {
      return (
        <ProfileBuilder 
          userData={session.userData} 
          initialSections={session.sections}
          onUpdateSections={handleUpdateSections}
          onFinalize={handleFinalizeStrategy}
        />
      );
    }

    if (session.lastActiveView === 'post-writer') {
      if (!session.masterSystemInstruction) {
         // Fallback if instruction missing (shouldn't happen)
         return <div>Error: Strategy not finalized. <button onClick={() => setSession({...session, lastActiveView: 'profile-builder'})} className="text-indigo-600 underline">Go back</button></div>;
      }
      return (
        <PostWriter 
          userData={session.userData} 
          systemInstruction={session.masterSystemInstruction}
          initialHistory={session.chatHistory}
          onHistoryUpdate={handleUpdateChatHistory}
        />
      );
    }

    if (session.lastActiveView === 'troubleshooter') {
      return <VisionHelp />;
    }

    return <div>Unknown State</div>;
  };

  // Navigation helpers
  const setView = (view: AppView) => {
    if (session) setSession({ ...session, lastActiveView: view });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => session && setView(session.masterSystemInstruction ? 'post-writer' : 'profile-builder')}>
               <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
               </div>
               <span className="font-bold text-xl tracking-tight text-slate-900">LinkedIn<span className="text-indigo-600">Architect</span></span>
            </div>

            {session && session.userData && (
              <div className="flex items-center gap-4">
                <nav className="flex space-x-2 hidden md:flex">
                  <button
                    onClick={() => setView('profile-builder')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      session.lastActiveView === 'profile-builder' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Strategy & Profile
                  </button>
                  <button
                    onClick={() => setView('troubleshooter')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      session.lastActiveView === 'troubleshooter' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Fix Issues
                  </button>
                  {session.masterSystemInstruction && (
                    <button
                      onClick={() => setView('post-writer')}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                        session.lastActiveView === 'post-writer' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span>Content Studio</span>
                    </button>
                  )}
                </nav>
                <button onClick={handleLogout} className="text-sm text-slate-400 hover:text-slate-600">
                   Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
