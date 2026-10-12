import React, { useState } from 'react';
import { 
  BookOpen, Search, ArrowRight, Layers, Clock, 
  CheckCircle2, Sparkles, Filter, ChevronRight, X 
} from 'lucide-react';
import { Subject, Topic } from '../types/index.ts';

interface SubjectsPageProps {
  subjects: Subject[];
  topics: Topic[];
  selectedSubjectId?: string;
  onNavigate: (page: string, param?: string) => void;
}

export const SubjectsPage: React.FC<SubjectsPageProps> = ({
  subjects,
  topics,
  selectedSubjectId,
  onNavigate,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubject, setActiveSubject] = useState<Subject | null>(() => {
    if (selectedSubjectId) {
      return subjects.find(s => s.id === selectedSubjectId) || null;
    }
    return null;
  });

  const categories = [
    { id: 'all', label: 'Barcha Fanlar' },
    { id: 'exact', label: 'Aniq Fanlar' },
    { id: 'natural', label: 'Tabiiy Fanlar' },
    { id: 'it', label: 'IT & Dasturlash' },
    { id: 'humanitarian', label: 'Gumanitar Fanlar' },
  ];

  const filteredSubjects = subjects.filter(subject => {
    const matchCat = activeCategory === 'all' || subject.category === activeCategory;
    const matchQuery =
      subject.nameUz.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.descriptionUz.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const subjectTopics = activeSubject
    ? topics.filter(t => t.subjectId === activeSubject.id)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>10 ta Fundamental Fan</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
            Fanlar va Ta‘lim Yo‘nalishlari
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Har bir fan uchun maxsus ishlab chiqilgan o‘quv dasturi, interaktiv konspektlar, formulalar va adaptiv testlar.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Fan yoki mavzu nomini qidiring..."
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-900/90 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat.id
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25'
                : 'glass-panel text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map(subject => (
          <div
            key={subject.id}
            onClick={() => setActiveSubject(subject)}
            className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-violet-500/40 cursor-pointer group transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
          >
            {/* Top accent glow */}
            <div
              className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: subject.color }}
            />

            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${subject.color}20`, border: `1px solid ${subject.color}50` }}
              >
                <BookOpen className="w-6 h-6" style={{ color: subject.color }} />
              </div>

              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
                {subject.topicsCount} ta mavzu
              </span>
            </div>

            <h3 className="font-heading text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
              {subject.nameUz}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-6">
              {subject.descriptionUz}
            </p>

            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">O‘zlashtirish ko‘rsatkichi</span>
                <span className="font-bold text-slate-200">{subject.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${subject.progress}%`, backgroundColor: subject.color }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 group-hover:text-cyan-400 pt-2 transition-colors">
              <span>Mavzular ro‘yxatini ko‘rish</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Subject Detail Drawer / Modal */}
      {activeSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl glass-panel-glow border border-violet-500/40 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveSubject(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ backgroundColor: `${activeSubject.color}20`, border: `1px solid ${activeSubject.color}50` }}
              >
                <BookOpen className="w-7 h-7" style={{ color: activeSubject.color }} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                  Fan dasturi
                </span>
                <h2 className="font-heading text-2xl font-bold text-white">
                  {activeSubject.nameUz}
                </h2>
                <p className="text-xs text-slate-400">{activeSubject.descriptionUz}</p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => {
                  onNavigate('quizzes', activeSubject.id);
                  setActiveSubject(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-300 hover:bg-violet-600 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Viktorina topshirish</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('chat');
                  setActiveSubject(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>AI dan so‘rash</span>
              </button>
            </div>

            {/* Topic List */}
            <div className="space-y-3">
              <h3 className="font-heading text-sm font-semibold text-white uppercase tracking-wider">
                Mavzular katalogi ({subjectTopics.length > 0 ? subjectTopics.length : activeSubject.topicsCount} ta)
              </h3>

              {subjectTopics.length > 0 ? (
                subjectTopics.map(topic => (
                  <div
                    key={topic.id}
                    onClick={() => {
                      onNavigate('topics', topic.id);
                      setActiveSubject(null);
                    }}
                    className="p-4 rounded-xl glass-panel border border-white/5 hover:border-violet-500/40 flex items-center justify-between cursor-pointer group transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                          {topic.titleUz}
                        </span>
                        {topic.completed && (
                          <span className="text-[10px] bg-emerald-950/80 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-800/40">
                            Bajarildi
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {topic.descriptionUz}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {topic.estimatedMinutes} daq
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center glass-panel rounded-2xl text-xs text-slate-400">
                  Ushbu fan bo‘yicha mavzular tizimda yangilanmoqda.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
