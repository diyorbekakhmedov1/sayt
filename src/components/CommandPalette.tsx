import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, MessageSquare, HelpCircle, Dumbbell, 
  CheckCircle2, BarChart3, Layers, Settings, Shield, ArrowRight, X 
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, param?: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // handled by parent or opened
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    { id: 'home', label: 'Bosh sahifa (Home)', category: 'Sahifalar', icon: BookOpen, action: () => onNavigate('home') },
    { id: 'chat', label: 'AI Yordamchi bilan suhbatlashish', category: 'Sun‘iy Intellekt', icon: MessageSquare, action: () => onNavigate('chat') },
    { id: 'explain', label: 'Interaktiv tushuntirish ustaxonasi', category: 'Sun‘iy Intellekt', icon: HelpCircle, action: () => onNavigate('explain') },
    { id: 'subjects', label: 'Fanlar katalogi (10 ta fan)', category: 'Ta‘lim', icon: Layers, action: () => onNavigate('subjects') },
    { id: 'practice', label: 'Moslashuvchan mashqlar (Practice)', category: 'Ta‘lim', icon: Dumbbell, action: () => onNavigate('practice') },
    { id: 'quizzes', label: 'Testlar va Viktorinalar', category: 'Ta‘lim', icon: CheckCircle2, action: () => onNavigate('quizzes') },
    { id: 'analytics', label: 'O‘zlashtirish tahlili va yutuqlar', category: 'Profil', icon: BarChart3, action: () => onNavigate('analytics') },
    { id: 'flashcards', label: 'Interaktiv kartochkalar (Spaced repetition)', category: 'Ta‘lim', icon: Layers, action: () => onNavigate('flashcards') },
    { id: 'settings', label: 'Sozlamalar va shaxsiy ma‘lumotlar', category: 'Profil', icon: Settings, action: () => onNavigate('settings') },
    { id: 'admin', label: 'Administrator boshqaruv paneli', category: 'Boshqaruv', icon: Shield, action: () => onNavigate('admin') },
  ];

  const filtered = items.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel-glow border border-violet-500/30 overflow-hidden shadow-2xl">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search className="w-5 h-5 text-violet-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Fan, mavzu, sahifa yoki amallarni qidiring..."
            className="flex-1 bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-slate-800/80 rounded border border-slate-700">
            ESC
          </kbd>
          <button onClick={onClose} className="text-slate-400 hover:text-white sm:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Hech qanday natija topilmadi.
            </div>
          ) : (
            filtered.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-violet-600/20 text-left transition-colors group border border-transparent hover:border-violet-500/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-800/60 border border-white/5 text-violet-400 group-hover:text-cyan-400 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                        {item.label}
                      </p>
                      <span className="text-[11px] text-slate-400">{item.category}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
