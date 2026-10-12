import React, { useState, useEffect } from 'react';
import { 
  Layers, Plus, RotateCw, CheckCircle2, AlertCircle, 
  Sparkles, BookOpen, ChevronRight, ChevronLeft, X 
} from 'lucide-react';
import { Flashcard, Subject } from '../types/index.ts';

interface FlashcardsPageProps {
  subjects: Subject[];
}

export const FlashcardsPage: React.FC<FlashcardsPageProps> = ({ subjects }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newSubjectId, setNewSubjectId] = useState('physics');

  useEffect(() => {
    fetch('/api/flashcards')
      .then(res => res.json())
      .then(data => setFlashcards(data))
      .catch(err => console.error(err));
  }, []);

  const currentCard = flashcards[currentIndex];

  const handleReview = async (result: 'easy' | 'good' | 'hard') => {
    if (!currentCard) return;

    try {
      const res = await fetch(`/api/flashcards/${currentCard.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
      });
      const updated = await res.json();
      setFlashcards(prev => prev.map(f => f.id === updated.id ? updated : f));

      // Move to next card
      setIsFlipped(false);
      setCurrentIndex(prev => (prev + 1) % flashcards.length);
    } catch (err) {
      console.error('Failed to review card', err);
    }
  };

  const handleCreate = async () => {
    if (!newFront.trim() || !newBack.trim()) return;

    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          front: newFront,
          back: newBack,
          topic: newTopic || 'Umumiy',
          subjectId: newSubjectId,
        }),
      });
      const created = await res.json();
      setFlashcards([created, ...flashcards]);
      setShowCreateModal(false);
      setNewFront('');
      setNewBack('');
      setNewTopic('');
    } catch (err) {
      console.error('Failed to create card', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Spaced Repetition (Interval Takrorlash)</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Interaktiv Xotira Kartochkalari
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Formulalar va qoidalarni doimiy yodda saqlash uchun ilmiy tasdiqlangan usul.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Kartochka Yaratish</span>
        </button>
      </div>

      {currentCard && flashcards.length > 0 ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 px-2">
            <span>
              Kartochka {currentIndex + 1} / {flashcards.length}
            </span>
            <span className="font-semibold text-cyan-400">
              Mavzu: {currentCard.topic}
            </span>
          </div>

          {/* 3D Flip Flashcard */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 sm:h-96 rounded-3xl glass-panel-glow border border-violet-500/40 p-8 flex flex-col justify-between cursor-pointer group hover:border-cyan-400/50 transition-all select-none relative overflow-hidden"
          >
            {/* Ambient inner glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-violet-400">
                {isFlipped ? 'Javob (Orqa tomon)' : 'Savol (Old tomon)'}
              </span>
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-400 group-hover:text-white group-hover:bg-white/10 transition-colors"
                title="Aylantirish"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Content in center */}
            <div className="flex-1 flex items-center justify-center text-center px-4">
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-white leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </h2>
            </div>

            <div className="text-center text-xs text-slate-500">
              {isFlipped
                ? "Javobni ko'rdingiz. Quyidagi bahoni tanlang:"
                : "Javobni ochish uchun kartani bosing"}
            </div>
          </div>

          {/* Review Buttons */}
          {isFlipped ? (
            <div className="grid grid-cols-3 gap-3 animate-fade-in">
              <button
                onClick={() => handleReview('hard')}
                className="py-3 px-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 font-semibold text-xs sm:text-sm hover:bg-rose-900/60 transition-colors"
              >
                🔴 Qiyin bo‘ldi
              </button>
              <button
                onClick={() => handleReview('good')}
                className="py-3 px-4 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-semibold text-xs sm:text-sm hover:bg-cyan-900/60 transition-colors"
              >
                🟡 Yaxshi esladim
              </button>
              <button
                onClick={() => handleReview('easy')}
                className="py-3 px-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-semibold text-xs sm:text-sm hover:bg-emerald-900/60 transition-colors"
              >
                🟢 Juda oson
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center px-2">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length);
                }}
                className="px-4 py-2 rounded-xl glass-panel text-slate-400 hover:text-white text-xs flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Oldingi</span>
              </button>

              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentIndex(prev => (prev + 1) % flashcards.length);
                }}
                className="px-4 py-2 rounded-xl glass-panel text-slate-400 hover:text-white text-xs flex items-center gap-1.5"
              >
                <span>Keyingi</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-4 text-slate-400">
          <p>Hozircha saqlangan kartochkalar yo‘q.</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl glass-panel-glow border border-violet-500/40 p-6 sm:p-8 space-y-5">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading text-xl font-bold text-white">
              Yangi Xotira Kartochkasi
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Fan:</label>
                <select
                  value={newSubjectId}
                  onChange={e => setNewSubjectId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nameUz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mavzu nomi:</label>
                <input
                  type="text"
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  placeholder="Masalan: Nyuton qonunlari..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Old tomon (Savol / Formula):</label>
                <textarea
                  value={newFront}
                  onChange={e => setNewFront(e.target.value)}
                  rows={2}
                  placeholder="Savol yoki eslab qolish kerak bo'lgan tushuncha..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Orqa tomon (Javob / Mohiyat):</label>
                <textarea
                  value={newBack}
                  onChange={e => setNewBack(e.target.value)}
                  rows={3}
                  placeholder="To'liq javob, izoh yoki formula yechimi..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl glass-panel text-xs text-slate-400"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleCreate}
                disabled={!newFront.trim() || !newBack.trim()}
                className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold disabled:opacity-40"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
