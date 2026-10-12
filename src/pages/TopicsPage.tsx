import React, { useState } from 'react';
import { 
  BookOpen, Clock, CheckCircle2, Bookmark, BookmarkCheck, 
  ArrowRight, Sparkles, FileText, ChevronLeft, Lightbulb, Share2 
} from 'lucide-react';
import { Subject, Topic } from '../types/index.ts';

interface TopicsPageProps {
  topics: Topic[];
  subjects: Subject[];
  initialTopicId?: string;
  onNavigate: (page: string, param?: string) => void;
}

export const TopicsPage: React.FC<TopicsPageProps> = ({
  topics,
  subjects,
  initialTopicId,
  onNavigate,
}) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(() => {
    return initialTopicId || (topics.length > 0 ? topics[0].id : '');
  });
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['math-pythagoras']);
  const [personalNotes, setPersonalNotes] = useState<{ [key: string]: string }>({
    'math-pythagoras': 'To‘g‘ri burchakli uchburchakda katetlar kvadratlari yig‘indisi gipotenuza kvadratiga teng!',
  });
  const [activeNoteText, setActiveNoteText] = useState('');
  const [showNoteSaved, setShowNoteSaved] = useState(false);

  const currentTopic = topics.find(t => t.id === selectedTopicId) || topics[0];
  const currentSubject = subjects.find(s => s.id === currentTopic?.subjectId);

  const toggleBookmark = (id: string) => {
    if (bookmarkedIds.includes(id)) {
      setBookmarkedIds(bookmarkedIds.filter(b => b !== id));
    } else {
      setBookmarkedIds([...bookmarkedIds, id]);
      // Save bookmark on server
      fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentTopic.titleUz,
          subjectName: currentSubject?.nameUz || 'Umumiy',
          refId: currentTopic.id,
        }),
      }).catch(err => console.error(err));
    }
  };

  const savePersonalNote = () => {
    if (!activeNoteText.trim() || !currentTopic) return;
    setPersonalNotes({ ...personalNotes, [currentTopic.id]: activeNoteText });
    setShowNoteSaved(true);
    setTimeout(() => setShowNoteSaved(false), 2000);

    fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `${currentTopic.titleUz} konspekti`,
        content: activeNoteText,
        subjectId: currentTopic.subjectId,
      }),
    }).catch(err => console.error(err));
  };

  if (!currentTopic) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Mavzular topilmadi.
      </div>
    );
  }

  const isBookmarked = bookmarkedIds.includes(currentTopic.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top back & switcher */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('subjects')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Barcha fanlarga qaytish</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleBookmark(currentTopic.id)}
            className={`p-2 rounded-xl border transition-colors ${
              isBookmarked
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-400'
                : 'glass-panel text-slate-400 hover:text-white'
            }`}
            title="Saqlab qo‘yish"
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onNavigate('chat')}
            className="px-3.5 py-2 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-300 hover:bg-violet-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mavzu bo‘yicha AI dan so‘rash</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Topics list */}
        <div className="lg:col-span-4 glass-panel rounded-2xl border border-white/5 p-4 space-y-2 h-[calc(100vh-14rem)] overflow-y-auto">
          <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
            Ta‘lim Yo‘nalishi & Mavzular
          </h3>
          {topics.map(topic => {
            const isSelected = topic.id === currentTopic.id;
            return (
              <div
                key={topic.id}
                onClick={() => {
                  setSelectedTopicId(topic.id);
                  setActiveNoteText(personalNotes[topic.id] || '');
                }}
                className={`p-3 rounded-xl text-xs cursor-pointer transition-all border ${
                  isSelected
                    ? 'bg-violet-600/25 border-violet-500/40 text-white shadow-sm'
                    : 'glass-panel border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold truncate">{topic.titleUz}</span>
                  {topic.completed && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{topic.level === 'beginner' ? 'Boshlang‘ich' : topic.level === 'intermediate' ? 'O‘rta' : 'Chuqur'}</span>
                  <span>{topic.estimatedMinutes} daq</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Topic Content & Study Workspace */}
        <div className="lg:col-span-8 space-y-6">
          {/* Topic Header Card */}
          <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-violet-500/30 space-y-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 font-semibold">
                {currentSubject?.nameUz}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {currentTopic.estimatedMinutes} daqiqa
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-400">{currentTopic.grade}-sinf</span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              {currentTopic.titleUz}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {currentTopic.descriptionUz}
            </p>

            {/* Prerequisites */}
            {currentTopic.prerequisites && currentTopic.prerequisites.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400">Oldindan talab etiladi:</span>
                {currentTopic.prerequisites.map((p, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-white/5"
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Learning Objectives */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>O‘rganish maqsadlari</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              {currentTopic.objectivesUz?.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Formulas or Rules */}
          {currentTopic.keyFormulas && currentTopic.keyFormulas.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-3">
              <h3 className="font-heading text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Asosiy Formulalar va Qonuniyatlar</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentTopic.keyFormulas.map((formula, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-900/90 border border-white/5 font-mono text-xs sm:text-sm text-violet-300 flex items-center justify-center font-bold"
                  >
                    {formula}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lesson Main Content */}
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 space-y-4">
            <h3 className="font-heading text-base font-bold text-white">Dars Mazmuni</h3>
            <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {currentTopic.contentUz}
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('practice', currentTopic.subjectId)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-xs font-semibold flex items-center gap-2 hover:opacity-95 transition-all shadow-md"
              >
                <span>Mashqlarni Boshlash</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('explain', currentTopic.titleUz)}
                className="px-5 py-2.5 rounded-xl glass-panel text-slate-200 hover:text-white text-xs font-semibold transition-all"
              >
                <span>Interaktiv Tushuntirish</span>
              </button>
            </div>
          </div>

          {/* Personal Interactive Notes Area */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-400" />
                <span>Shaxsiy Konspekt va Qaydlar</span>
              </h3>
              {showNoteSaved && (
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saqlandi
                </span>
              )}
            </div>
            <textarea
              value={activeNoteText}
              onChange={e => setActiveNoteText(e.target.value)}
              placeholder="Ushbu mavzu bo'yicha shaxsiy fikrlaringiz va qisqa xulosalarni yozib qoldiring..."
              className="w-full h-24 p-3 bg-slate-900/90 rounded-xl border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={savePersonalNote}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
              >
                Qaydnomani Saqlash
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
