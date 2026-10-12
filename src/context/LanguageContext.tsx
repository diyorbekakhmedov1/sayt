import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'uz' | 'en' | 'ru';

interface Translations {
  [key: string]: {
    uz: string;
    en: string;
    ru: string;
  };
}

export const dictionary: Translations = {
  appName: {
    uz: 'NEXORA AI',
    en: 'NEXORA AI',
    ru: 'NEXORA AI',
  },
  heroTitle: {
    uz: 'Kelajagingni bilim bilan yarat.',
    en: 'Shape your future with deep intelligence.',
    ru: 'Создай свое будущее силой знаний.',
  },
  heroSubtitle: {
    uz: 'O‘zbekiston yoshlari uchun sun‘iy intellekt asosida ishlovchi, shaxsiylashtirilgan interaktiv ta‘lim ekotizimi. Fanlarni oson, chuqur va qiziqarli o‘rganing.',
    en: 'Personalized AI-powered educational ecosystem designed for deep, interactive mastery of STEM, humanities, and technology.',
    ru: 'Персонализированная интерактивная образовательная экосистема на базе ИИ для глубокого изучения точных и гуманитарных наук.',
  },
  startLearning: {
    uz: 'O‘rganishni boshlash',
    en: 'Start Learning',
    ru: 'Начать обучение',
  },
  exploreFeatures: {
    uz: 'Imkoniyatlarni ko‘rish',
    en: 'Explore Features',
    ru: 'Обзор возможностей',
  },
  navHome: {
    uz: 'Asosiy',
    en: 'Home',
    ru: 'Главная',
  },
  navSubjects: {
    uz: 'Fanlar',
    en: 'Subjects',
    ru: 'Предметы',
  },
  navChat: {
    uz: 'AI Yordamchi',
    en: 'AI Assistant',
    ru: 'AI Ассистент',
  },
  navExplain: {
    uz: 'Tushuntirish',
    en: 'Explanations',
    ru: 'Объяснения',
  },
  navPractice: {
    uz: 'Mashqlar',
    en: 'Practice',
    ru: 'Практика',
  },
  navQuizzes: {
    uz: 'Viktorinalar',
    en: 'Quizzes',
    ru: 'Викторины',
  },
  navAnalytics: {
    uz: 'Tahlil',
    en: 'Analytics',
    ru: 'Аналитика',
  },
  navFlashcards: {
    uz: 'Kartochkalar',
    en: 'Flashcards',
    ru: 'Карточки',
  },
  navSettings: {
    uz: 'Sozlamalar',
    en: 'Settings',
    ru: 'Настройки',
  },
  navAdmin: {
    uz: 'Admin Panel',
    en: 'Admin Panel',
    ru: 'Админ Панель',
  },
  searchPlaceholder: {
    uz: 'Fanlar, mavzular, formulalarni qidirish... (⌘K)',
    en: 'Search subjects, topics, formulas... (⌘K)',
    ru: 'Поиск по предметам, темам, формулам... (⌘K)',
  },
  focusTimer: {
    uz: 'Diqqat Taymeri',
    en: 'Focus Timer',
    ru: 'Таймер фокуса',
  },
  streakDays: {
    uz: 'kunlik seriya',
    en: 'day streak',
    ru: 'дней подряд',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('nexora_lang') as Language) || 'uz';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('nexora_lang', lang);
  };

  const t = (key: string): string => {
    if (dictionary[key] && dictionary[key][language]) {
      return dictionary[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
