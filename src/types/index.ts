export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  grade: string;
  avatar: string;
  xp: number;
  streak: number;
  createdAt: string;
}

export type SubjectCategory = 'exact' | 'natural' | 'it' | 'humanitarian';

export interface Subject {
  id: string;
  nameUz: string;
  nameEn: string;
  nameRu: string;
  category: SubjectCategory;
  icon: string;
  descriptionUz: string;
  descriptionEn: string;
  color: string;
  gradient: string;
  topicsCount: number;
  lessonsCount: number;
  progress: number;
}

export interface Topic {
  id: string;
  subjectId: string;
  titleUz: string;
  titleEn: string;
  descriptionUz: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  grade: number;
  estimatedMinutes: number;
  completed: boolean;
  prerequisites: string[];
  objectivesUz: string[];
  keyFormulas?: string[];
  contentUz: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  subjectId?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  codeBlocks?: { language: string; code: string }[];
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  subjectId?: string;
  createdAt: string;
  updatedAt: string;
  messagesCount: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hint?: string;
}

export interface Quiz {
  id: string;
  title: string;
  subjectId: string;
  topicId?: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionsCount: number;
  timeLimitMinutes: number;
  isAiGenerated: boolean;
  questions: QuizQuestion[];
  completedCount?: number;
  bestScore?: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeTakenSeconds: number;
  completedAt: string;
  answers: {
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
  }[];
}

export interface PracticeQuestion {
  id: string;
  subjectId: string;
  topicId: string;
  type: 'mcq' | 'text' | 'math' | 'code';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  hint: string;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface ExplanationResult {
  title: string;
  summary: string;
  stepByStep: { step: number; title: string; explanation: string }[];
  realWorldAnalogy: string;
  keyFormulasOrPoints: string[];
  revisionCard: { front: string; back: string };
  diagramConcept?: {
    type: 'flowchart' | 'hierarchy' | 'formula_breakdown';
    nodes: { label: string; desc: string }[];
  };
}

export interface Flashcard {
  id: string;
  subjectId: string;
  topic: string;
  front: string;
  back: string;
  masteryLevel: number; // 0 to 5
  reviewCount: number;
  lastReviewed?: string;
}

export interface Bookmark {
  id: string;
  type: 'topic' | 'explanation' | 'quiz' | 'formula';
  title: string;
  subjectName: string;
  refId: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  titleUz: string;
  titleEn: string;
  descriptionUz: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
}

export interface StreakMilestone {
  id: string;
  days: number;
  titleUz: string;
  badgeName: string;
  color: string;
  unlocked: boolean;
  descriptionUz: string;
  iconName: string;
}

export interface UserAnalytics {
  totalStudyMinutes: number;
  completedLessons: number;
  quizzesTaken: number;
  quizAccuracy: number;
  streakDays: number;
  weeklyActivity: { dayUz: string; minutes: number }[];
  subjectMastery: { subjectUz: string; percentage: number; color: string }[];
  weakTopics: { id: string; titleUz: string; subjectUz: string; accuracy: number }[];
}
