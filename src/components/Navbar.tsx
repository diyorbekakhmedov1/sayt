import React, { useState } from 'react';
import { 
  Sparkles, MessageSquare, BookOpen, Layers, Dumbbell, 
  CheckCircle2, BarChart3, Settings, Shield, Menu, X, 
  Search, Flame, Clock, Globe, User as UserIcon 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onOpenCommandPalette: () => void;
  onOpenFocusTimer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenCommandPalette,
  onOpenFocusTimer,
}) => {
  const { user, isAdmin, toggleRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: t('navHome'), icon: BookOpen },
    { id: 'subjects', label: t('navSubjects'), icon: Layers },
    { id: 'chat', label: t('navChat'), icon: MessageSquare, badge: 'AI' },
    { id: 'explain', label: t('navExplain'), icon: Sparkles },
    { id: 'practice', label: t('navPractice'), icon: Dumbbell },
    { id: 'quizzes', label: t('navQuizzes'), icon: CheckCircle2 },
    { id: 'analytics', label: t('navAnalytics'), icon: BarChart3 },
    { id: 'flashcards', label: t('navFlashcards'), icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-0.5 shadow-lg shadow-violet-500/20 group-hover:shadow-cyan-500/30 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-slate-100 to-violet-300 bg-clip-text text-transparent">
                NEXORA
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-950/80 border border-violet-500/40 text-violet-300 tracking-wider">
                AI
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(link => {
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white bg-violet-600/20 border border-violet-500/30 shadow-sm shadow-violet-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-500/30">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                currentPage === 'admin'
                  ? 'text-amber-300 bg-amber-500/20 border border-amber-500/40'
                  : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-950/30'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </nav>

        {/* Actions & Profile */}
        <div className="flex items-center gap-2">
          {/* Global Search / Command Palette */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/70 border border-white/5 text-slate-400 hover:text-slate-200 hover:border-violet-500/30 transition-all text-xs"
            title="Qidiruv (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-violet-400" />
            <span>Qidiruv</span>
            <kbd className="text-[10px] px-1 py-0.2 bg-slate-800 rounded text-slate-400 border border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* Focus Timer Button */}
          <button
            onClick={onOpenFocusTimer}
            className="p-2 rounded-lg bg-slate-900/70 border border-white/5 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
            title="Diqqat Taymeri"
          >
            <Clock className="w-4 h-4" />
          </button>

          {/* User Streak Pill */}
          {user && (
            <div 
              onClick={() => onNavigate('analytics')}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 border border-amber-500/20 text-amber-400 text-xs font-semibold cursor-pointer hover:border-amber-500/40 transition-colors"
              title="Kunlik o'rganish seriyasi"
            >
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{user.streak} kun</span>
            </div>
          )}

          {/* Quick Role Switcher Button */}
          <button
            onClick={toggleRole}
            className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
              isAdmin
                ? 'bg-amber-950/40 border-amber-500/30 text-amber-400 hover:bg-amber-900/40'
                : 'bg-violet-950/40 border-violet-500/30 text-violet-300 hover:bg-violet-900/40'
            }`}
            title="Rolni o'zgartirish (Talaba / Administrator)"
          >
            <Shield className="w-3 h-3" />
            <span>{isAdmin ? 'Admin' : 'Talaba'}</span>
          </button>

          {/* Language Switcher */}
          <div className="relative group">
            <button className="flex items-center gap-1 p-2 rounded-lg bg-slate-900/70 border border-white/5 text-slate-400 hover:text-white text-xs">
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase font-mono text-[10px]">{language}</span>
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col py-1 w-24 rounded-lg bg-slate-900 border border-white/10 shadow-xl z-50 text-xs">
              <button 
                onClick={() => setLanguage('uz')} 
                className={`px-3 py-1.5 text-left hover:bg-violet-600/20 ${language === 'uz' ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}
              >
                O‘zbek
              </button>
              <button 
                onClick={() => setLanguage('en')} 
                className={`px-3 py-1.5 text-left hover:bg-violet-600/20 ${language === 'en' ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('ru')} 
                className={`px-3 py-1.5 text-left hover:bg-violet-600/20 ${language === 'ru' ? 'text-cyan-400 font-bold' : 'text-slate-300'}`}
              >
                Русский
              </button>
            </div>
          </div>

          {/* User Avatar / Settings */}
          <button
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-2 p-1 rounded-full border border-violet-500/30 hover:border-cyan-400/50 transition-colors"
            title="Sozlamalar va Profil"
          >
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"}
              alt="Avatar"
              className="w-7 h-7 rounded-full object-cover"
            />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-4 pt-2 pb-6 border-t border-white/5 bg-slate-950/95 backdrop-blur-xl animate-fade-in space-y-1">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = currentPage === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-white bg-violet-600/20 border border-violet-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-violet-400" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-900/60 text-cyan-300">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
          {isAdmin && (
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-amber-400 bg-amber-950/30 border border-amber-500/20"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          )}

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <button 
              onClick={toggleRole}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Rol: {isAdmin ? 'Admin' : 'Talaba'}</span>
            </button>
            <button
              onClick={() => {
                onNavigate('settings');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Sozlamalar</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
