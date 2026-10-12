import React from 'react';
import { Sparkles, Heart, Shield, Cpu, Github, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full border-t border-white/5 bg-slate-950/80 backdrop-blur-xl py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Col 1: Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            </div>
            <span className="font-heading font-extrabold text-base tracking-wider text-white">
              NEXORA <span className="text-violet-400">AI</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            O‘zbekiston yoshlari uchun kelajak avlod sun‘iy intellekt ta‘lim platformasi. Shaxsiylashtirilgan o‘rganish yo‘li, tushunarli tushuntirishlar va adaptiv testlar.
          </p>
          <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-950/40 border border-cyan-800/30 rounded-lg px-2.5 py-1.5 w-fit">
            <Cpu className="w-3.5 h-3.5 text-cyan-300" />
            <span>Gemini 3.8 Flash bilan ishlaydi</span>
          </div>
        </div>

        {/* Col 2: Fanlar */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
            Ommabop Fanlar
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <button onClick={() => onNavigate('subjects')} className="hover:text-cyan-400 transition-colors">
                Matematika va Geometriya
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('subjects')} className="hover:text-cyan-400 transition-colors">
                Kvant va Klassik Fizika
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('subjects')} className="hover:text-cyan-400 transition-colors">
                Dasturlash va Algoritmlar (IT)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('subjects')} className="hover:text-cyan-400 transition-colors">
                Kimyo va Biologiya
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('subjects')} className="hover:text-cyan-400 transition-colors">
                Ingliz tili (IELTS / CEFR)
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Asosiy bo'limlar */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
            Platforma Imkoniyatlari
          </h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li>
              <button onClick={() => onNavigate('chat')} className="hover:text-violet-400 transition-colors">
                AI Interaktiv Yordamchi
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('explain')} className="hover:text-violet-400 transition-colors">
                Bosqichma-bosqich Tushuntirish
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('practice')} className="hover:text-violet-400 transition-colors">
                Moslashuvchan Mashqlar
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('quizzes')} className="hover:text-violet-400 transition-colors">
                AI Viktorinalar Generatori
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('flashcards')} className="hover:text-violet-400 transition-colors">
                Interval Takrorlash (Flashcards)
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Standartlar */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">
            Xavfsizlik va Ma‘lumotlar
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Barcha ma‘lumotlar xavfsiz shifrlangan. API kalitlari hech qachon brauzerda saqlanmaydi va faqat xavfsiz server orqali uzatiladi.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5 text-violet-400" />
            <span>Rolga asoslangan RBAC xavfsizligi</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 NEXORA AI. Barcha huquqlar himoyalangan.</p>
        <p className="flex items-center gap-1">
          Bilimga intiluvchi yoshlar uchun yaratildi <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
        </p>
      </div>
    </footer>
  );
};
