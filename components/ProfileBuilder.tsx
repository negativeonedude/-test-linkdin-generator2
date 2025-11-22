
import React, { useState } from 'react';
import { UserProfileData, SectionState } from '../types';
import { generateProfileSection, generateMasterSystemInstruction } from '../services/geminiService';

interface Props {
  userData: UserProfileData;
  initialSections: SectionState[];
  onUpdateSections: (sections: SectionState[]) => void;
  onFinalize: (instruction: string) => void;
}

const ProfileBuilder: React.FC<Props> = ({ userData, initialSections, onUpdateSections, onFinalize }) => {
  // Local state management for UI interactions, synced back to parent via onUpdateSections
  const [isGeneratingMaster, setIsGeneratingMaster] = useState(false);

  const handleGenerate = async (id: string, type: 'headline' | 'about' | 'experience' | 'strategy') => {
    // Update loading state
    const updatedLoading = initialSections.map(s => s.id === id ? { ...s, loading: true } : s);
    onUpdateSections(updatedLoading);
    
    const options = await generateProfileSection(userData, type);
    
    // Update with results
    const updatedResults = initialSections.map(s => 
      s.id === id ? { 
        ...s, 
        loading: false, 
        options: options, 
        selectedIndex: null, // Reset selection on new generation
        isApproved: false 
      } : s
    );
    onUpdateSections(updatedResults);
  };

  const handleSelect = (sectionId: string, index: number) => {
    const updated = initialSections.map(s => 
      s.id === sectionId ? { ...s, selectedIndex: index } : s
    );
    onUpdateSections(updated);
  };

  const handleToggleApprove = (sectionId: string) => {
    const updated = initialSections.map(s => 
      s.id === sectionId ? { ...s, isApproved: !s.isApproved } : s
    );
    onUpdateSections(updated);
  };

  const handleOptionEdit = (sectionId: string, optionIndex: number, newValue: string) => {
    const updated = initialSections.map(s => {
      if (s.id !== sectionId) return s;
      const newOptions = [...s.options];
      newOptions[optionIndex] = newValue;
      return { ...s, options: newOptions };
    });
    onUpdateSections(updated);
  };

  const handleFinalize = () => {
    // Validate all required sections are approved
    const required = ['headline', 'about', 'experience'];
    const missing = required.filter(id => {
      const section = initialSections.find(s => s.id === id);
      return !section || !section.isApproved || section.selectedIndex === null;
    });

    if (missing.length > 0) {
      alert(`Please select and approve content for: ${missing.join(', ')}`);
      return;
    }

    setIsGeneratingMaster(true);
    
    // Extract the selected text for the master instruction
    const getSelectedText = (id: string) => {
      const s = initialSections.find(x => x.id === id);
      if (s && s.selectedIndex !== null) return s.options[s.selectedIndex];
      return "";
    };

    const instruction = generateMasterSystemInstruction(
      userData,
      getSelectedText('headline'),
      getSelectedText('about'),
      getSelectedText('experience')
    );

    onFinalize(instruction);
    setIsGeneratingMaster(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Profile Architect</h2>
        <p className="text-slate-600">Build your profile block by block. <span className="font-bold text-indigo-600">Approve</span> each section to train your personal AI.</p>
      </div>

      <div className="space-y-8 mb-12">
        {initialSections.map((section) => (
          <div key={section.id} className={`bg-white border rounded-xl p-6 shadow-sm transition-all ${section.isApproved ? 'border-green-400 ring-1 ring-green-100' : 'border-slate-200'}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-slate-800">{section.title}</h3>
                {section.isApproved && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Approved
                  </span>
                )}
              </div>
              <button
                onClick={() => handleGenerate(section.id, section.id as any)}
                disabled={section.loading || section.isApproved}
                className="text-sm px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 disabled:opacity-50 font-medium flex items-center gap-2"
              >
                {section.loading ? 'Generating...' : (section.options.length > 0 ? 'Regenerate' : 'Generate Ideas')}
              </button>
            </div>

            {/* Content Area */}
            <div className="space-y-4">
              {section.options.length === 0 && !section.loading && (
                 <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-center text-slate-500 italic">
                   Click generate to start building this section.
                 </div>
              )}
              
              {section.loading && (
                 <div className="p-6 bg-slate-50 border border-slate-100 rounded-lg text-center animate-pulse text-slate-500">
                   Analyzing business data and writing drafts...
                 </div>
              )}

              {/* Options List */}
              {section.options.map((option, idx) => (
                <div key={idx} className={`relative p-4 rounded-lg border ${section.selectedIndex === idx ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200'} hover:border-indigo-300 transition-colors`}>
                  <div className="flex items-start gap-4">
                    <div className="pt-1 flex-shrink-0">
                      <input
                        type="radio"
                        name={`section-${section.id}`}
                        checked={section.selectedIndex === idx}
                        onChange={() => !section.isApproved && handleSelect(section.id, idx)}
                        disabled={section.isApproved}
                        className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                    </div>
                    <div className="flex-1">
                      <textarea 
                        value={option}
                        onChange={(e) => handleOptionEdit(section.id, idx, e.target.value)}
                        disabled={section.isApproved}
                        className={`w-full bg-transparent border-none p-0 focus:ring-0 text-slate-800 leading-relaxed resize-none overflow-hidden ${section.id === 'headline' ? 'font-bold' : ''}`}
                        rows={section.id === 'headline' ? 2 : 6}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Approval Checkbox */}
              {section.selectedIndex !== null && (
                <div className="flex items-center justify-end pt-2 border-t border-slate-100 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-sm text-slate-600 font-medium">I agree to use this output for my AI Strategy</span>
                    <input 
                      type="checkbox" 
                      checked={section.isApproved}
                      onChange={() => handleToggleApprove(section.id)}
                      className="h-5 w-5 text-green-600 rounded focus:ring-green-500 border-slate-300"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-6 bg-white/90 backdrop-blur p-4 border border-slate-200 shadow-xl rounded-2xl flex justify-between items-center">
        <div>
          <p className="text-slate-800 font-bold">Ready to launch?</p>
          <p className="text-sm text-slate-500">Approving content trains your dedicated Post Writer.</p>
        </div>
        <button
          onClick={handleFinalize}
          disabled={isGeneratingMaster}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50"
        >
          {isGeneratingMaster ? 'Compiling System...' : 'Finalize & Start Chat'}
        </button>
      </div>
    </div>
  );
};

export default ProfileBuilder;
