// ============================================================
// Sarthi — Chat Module Type Definitions
// ============================================================

export type MessageRole = 'user' | 'ai';

export type MessageStatus = 'sending' | 'streaming' | 'done' | 'error';

export interface MessageSource {
  title: string;
  url: string;
  type: 'scheme' | 'career' | 'learning' | 'general';
}

export interface Message {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
  status: MessageStatus;
  liked?: boolean;
  disliked?: boolean;
  bookmarked?: boolean;
  sources?: MessageSource[];
  fileContext?: string; // text extracted from uploaded file
  model?: string;       // which AI expert handled this
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  pinned: boolean;
  folderId?: string;
  language: string;
}

export interface ChatFolder {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface UploadedFile {
  name: string;
  type: string;
  size: number;
  textContent: string;   // extracted text
  previewUrl?: string;   // for images
}

export interface SuggestedPrompt {
  text: string;
  query: string;
  category: 'schemes' | 'career' | 'coding' | 'study' | 'health';
  icon: string;
}

export interface ChatMemory {
  userName?: string;
  education?: string;
  skills?: string[];
  careerGoals?: string[];
  preferredLanguage?: string;
  favoriteSchemes?: string[];
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { text: 'Find scholarships for me', query: 'What scholarships are available for students on the National Scholarship Portal?', category: 'schemes', icon: '🎓' },
  { text: 'Suggest a career path', query: 'Based on engineering background, suggest the best career paths and roadmap for 2024', category: 'career', icon: '🚀' },
  { text: 'Explain React Hooks', query: 'Explain React Hooks with practical examples — useState, useEffect, useCallback, useMemo', category: 'coding', icon: '⚛️' },
  { text: 'Check PM-KISAN eligibility', query: 'What are the eligibility criteria for PM-KISAN scheme and how to apply?', category: 'schemes', icon: '🌾' },
  { text: 'Build my resume', query: 'Help me build a strong resume for a software engineering role. What sections should I include?', category: 'career', icon: '📄' },
  { text: 'Prepare interview questions', query: 'Give me the top 20 interview questions for a full-stack developer role with answers', category: 'career', icon: '💼' },
  { text: 'Compare government schemes', query: 'Compare PM-KISAN, Ayushman Bharat, and PMAY — eligibility, benefits and differences', category: 'schemes', icon: '⚖️' },
  { text: 'Study roadmap for exams', query: 'Create a 30-day smart study plan and roadmap for competitive exam preparation', category: 'study', icon: '📚' },
];
