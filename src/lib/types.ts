// ========== 数据类型定义 ==========

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'free' | 'pro';
  dailyUsage: number;
  createdAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  name: string;
  content: string;
  fileName: string;
  uploadedAt: string;
}

export interface Analysis {
  id: string;
  resumeId: string;
  jobDescription: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  atsScore: number;
  suggestions: SectionSuggestion[];
  createdAt: string;
}

export interface SectionSuggestion {
  section: string;
  original: string;
  improved: string;
  reason: string;
}

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  hint: string;
}

export interface InterviewResult {
  id: string;
  resumeId: string;
  jobDescription: string;
  questions: InterviewQuestion[];
  createdAt: string;
}

export interface Prediction {
  matchScore: number;
  skillGaps: string[];
  recommendations: string[];
  competitiveness: '低' | '中' | '高';
}

export interface OptimizedResume {
  id: string;
  resumeId: string;
  originalContent: string;
  optimizedContent: string;
  changes: string[];
  createdAt: string;
}
