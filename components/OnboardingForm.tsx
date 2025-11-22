import React from 'react';
import { UserProfileData } from '../types';

interface Props {
  onComplete: (data: UserProfileData) => void;
}

const OnboardingForm: React.FC<Props> = ({ onComplete }) => {
  const [formData, setFormData] = React.useState<UserProfileData>({
    fullName: '',
    businessName: '',
    industry: '',
    targetAudience: '',
    uniqueValueProposition: '',
    personalStory: '',
    tone: 'Professional',
    keyAchievements: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-900">Let's Build Your Authority</h2>
        <p className="text-slate-500 mt-2">Answer these strategic questions to calibrate your AI Architect.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input required name="fullName" value={formData.fullName} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Jane Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
            <input required name="businessName" value={formData.businessName} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Acme Corp" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Industry & Niche</label>
          <input required name="industry" value={formData.industry} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="e.g., SaaS for Real Estate Agents" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Target Audience (Who buys from you?)</label>
          <textarea required name="targetAudience" value={formData.targetAudience} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="e.g., CTOs of mid-sized fintech companies struggling with compliance." />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Unique Value Proposition (The "Secret Sauce")</label>
          <textarea required name="uniqueValueProposition" value={formData.uniqueValueProposition} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="e.g., We cut deployment time by 50% using our proprietary AI engine." />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Key Achievements / Authority Markers</label>
          <textarea name="keyAchievements" value={formData.keyAchievements} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg h-20 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="e.g., Helped 50+ clients, featured in Forbes, 10 years experience." />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">A Brief Personal Story (The "Human" Hook)</label>
          <textarea required name="personalStory" value={formData.personalStory} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="e.g., I started as a developer but realized I loved talking to customers more..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Desired Brand Tone</label>
          <select name="tone" value={formData.tone} onChange={handleChange} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
            <option value="Professional">Professional & Corporate</option>
            <option value="Thought Leader">Visionary Thought Leader</option>
            <option value="Casual & Relatable">Casual, Relatable & Authentic</option>
            <option value="Bold & Contrarian">Bold, Contrarian & Disruptive</option>
          </select>
        </div>

        <div className="pt-4">
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
            Generate My Profile Strategy &rarr;
          </button>
        </div>
      </form>
    </div>
  );
};

export default OnboardingForm;
