
export interface UserProfileData {
  fullName: string;
  businessName: string;
  industry: string;
  targetAudience: string;
  uniqueValueProposition: string;
  personalStory: string;
  tone: 'Professional' | 'Thought Leader' | 'Casual & Relatable' | 'Bold & Contrarian';
  keyAchievements: string;
}

export interface GeneratedOption {
  text: string;
  selected: boolean;
}

export interface SectionState {
  id: string;
  title: string;
  options: string[]; // Array of text options (multiple for headlines, 1 for others)
  selectedIndex: number | null; // Which index is selected/agreed upon
  isApproved: boolean; // Has the user checked the box?
  loading: boolean;
}

export interface SessionData {
  id: string; // e.g., Business Name slug
  userData: UserProfileData | null;
  sections: SectionState[];
  masterSystemInstruction: string | null;
  chatHistory: ChatMessage[];
  lastActiveView: AppView;
}

export type AppView = 'login' | 'onboarding' | 'profile-builder' | 'troubleshooter' | 'post-writer';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
