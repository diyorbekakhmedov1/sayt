import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { CommandPalette } from './components/CommandPalette.tsx';
import { FocusTimerModal } from './components/FocusTimerModal.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { ChatPage } from './pages/ChatPage.tsx';
import { SubjectsPage } from './pages/SubjectsPage.tsx';
import { TopicsPage } from './pages/TopicsPage.tsx';
import { ExplanationsPage } from './pages/ExplanationsPage.tsx';
import { PracticePage } from './pages/PracticePage.tsx';
import { QuizzesPage } from './pages/QuizzesPage.tsx';
import { AnalyticsPage } from './pages/AnalyticsPage.tsx';
import { FlashcardsPage } from './pages/FlashcardsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { Subject, Topic } from './types/index.ts';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParam, setPageParam] = useState<string | undefined>(undefined);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const loadData = () => {
    fetch('/api/subjects')
      .then(res => res.json())
      .then(data => setSubjects(data))
      .catch(err => console.error('Failed to load subjects', err));

    fetch('/api/topics')
      .then(res => res.json())
      .then(data => setTopics(data))
      .catch(err => console.error('Failed to load topics', err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNavigate = (page: string, param?: string) => {
    setCurrentPage(page);
    setPageParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#06080e] text-slate-100 selection:bg-violet-600 selection:text-white">
      {/* Background ambient pattern */}
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none opacity-40 z-0" />

      {/* Main App Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenFocusTimer={() => setIsFocusTimerOpen(true)}
      />

      {/* Page Routing */}
      <main className="flex-1 relative z-10">
        {currentPage === 'home' && (
          <HomePage subjects={subjects} onNavigate={handleNavigate} />
        )}
        {currentPage === 'chat' && (
          <ChatPage subjects={subjects} />
        )}
        {currentPage === 'subjects' && (
          <SubjectsPage
            subjects={subjects}
            topics={topics}
            selectedSubjectId={pageParam}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'topics' && (
          <TopicsPage
            topics={topics}
            subjects={subjects}
            initialTopicId={pageParam}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'explain' && (
          <ExplanationsPage initialQuery={pageParam} onNavigate={handleNavigate} />
        )}
        {currentPage === 'practice' && (
          <PracticePage
            subjects={subjects}
            initialSubjectId={pageParam}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'quizzes' && (
          <QuizzesPage
            subjects={subjects}
            initialSubjectId={pageParam}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'analytics' && (
          <AnalyticsPage onNavigate={handleNavigate} />
        )}
        {currentPage === 'flashcards' && (
          <FlashcardsPage subjects={subjects} />
        )}
        {currentPage === 'settings' && (
          <SettingsPage />
        )}
        {currentPage === 'admin' && (
          <AdminPage
            subjects={subjects}
            topics={topics}
            onRefreshData={loadData}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Global Interactive Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={handleNavigate}
      />

      <FocusTimerModal
        isOpen={isFocusTimerOpen}
        onClose={() => setIsFocusTimerOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
