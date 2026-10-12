import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, Clock, Sparkles, Trophy, RotateCcw, 
  ArrowRight, ArrowLeft, AlertCircle, Plus, BookOpen, Layers, X 
} from 'lucide-react';
import { Quiz, QuizQuestion, Subject } from '../types/index.ts';

interface QuizzesPageProps {
  subjects: Subject[];
  initialSubjectId?: string;
  onNavigate: (page: string, param?: string) => void;
}

export const QuizzesPage: React.FC<QuizzesPageProps> = ({
  subjects,
  initialSubjectId,
  onNavigate,
}) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimed, setIsTimed] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiTopicInput, setAiTopicInput] = useState('');
  const [aiSubjectInput, setAiSubjectInput] = useState('physics');
  const [isGeneratingAiQuiz, setIsGeneratingAiQuiz] = useState(false);

  // Load quizzes
  useEffect(() => {
    fetch('/api/quizzes')
      .then(res => res.json())
      .then(data => setQuizzes(data))
      .catch(err => console.error(err));
  }, []);

  // Timer countdown
  useEffect(() => {
    let timer: any = null;
    if (activeQuiz && isTimed && !isSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeQuiz, isTimed, isSubmitted, timeLeft]);

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQIndex(0);
    setUserAnswers({});
    setTimeLeft(quiz.timeLimitMinutes * 60);
    setIsSubmitted(false);
    setQuizResult(null);
  };

  const selectOption = (qId: string, optIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const submitQuiz = async () => {
    if (!activeQuiz) return;
    setIsSubmitted(true);

    const formattedAnswers = activeQuiz.questions.map(q => ({
      questionId: q.id,
      selectedIndex: userAnswers[q.id] !== undefined ? userAnswers[q.id] : -1,
    }));

    try {
      const res = await fetch(`/api/quizzes/${activeQuiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: formattedAnswers,
          timeTakenSeconds: activeQuiz.timeLimitMinutes * 60 - timeLeft,
        }),
      });
      const data = await res.json();
      setQuizResult(data);

      if (data.percentage >= 70) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Failed to submit quiz', err);
    }
  };

  const handleGenerateAiQuiz = async () => {
    if (!aiTopicInput.trim() || isGeneratingAiQuiz) return;
    setIsGeneratingAiQuiz(true);

    try {
      const res = await fetch('/api/quizzes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: aiSubjectInput,
          topic: aiTopicInput,
          count: 5,
        }),
      });
      const newQuiz = await res.json();
      setQuizzes([newQuiz, ...quizzes]);
      setShowAiModal(false);
      startQuiz(newQuiz);
    } catch (err) {
      console.error('Failed to generate AI quiz', err);
    } finally {
      setIsGeneratingAiQuiz(false);
    }
  };

  const currentQ = activeQuiz?.questions[currentQIndex];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* If No Active Quiz: List Quizzes */}
      {!activeQuiz ? (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
                <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Testlar & Viktorinalar</span>
              </div>
              <h1 className="font-heading text-3xl font-extrabold text-white">
                Bilimlarni Baholash Markazi
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Tayyor standart viktorinalar yoki sun‘iy intellekt tomonidan har qanday mavzuda yaratiladigan testlar.
              </p>
            </div>

            <button
              onClick={() => setShowAiModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-violet-600/25 shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Yangi AI Viktorina Yaratish</span>
            </button>
          </div>

          {/* Quizzes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map(quiz => (
              <div
                key={quiz.id}
                className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-violet-500/40 flex flex-col justify-between transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-500/30">
                      {quiz.isAiGenerated ? 'AI Generatsiya' : 'Standart Test'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {quiz.timeLimitMinutes} daq
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {quiz.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 mt-6 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {quiz.questionsCount || quiz.questions.length} ta savol
                  </span>
                  <button
                    onClick={() => startQuiz(quiz)}
                    className="px-4 py-2 rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-300 hover:bg-violet-600 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Boshlash</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ACTIVE QUIZ ENGINE */
        <div className="space-y-6">
          {/* Quiz Top Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">
                Viktorina
              </span>
              <h2 className="font-heading text-lg font-bold text-white">
                {activeQuiz.title}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              {isTimed && !isSubmitted && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-cyan-300 font-mono text-sm">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </span>
                </div>
              )}

              <button
                onClick={() => setActiveQuiz(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Chiqish
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Question Card */}
            <div className="lg:col-span-8 glass-panel-glow p-6 sm:p-8 rounded-3xl border border-violet-500/30 space-y-6">
              {currentQ && (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-3">
                    <span className="font-semibold text-white">
                      Savol {currentQIndex + 1} / {activeQuiz.questions.length}
                    </span>
                    <span>
                      Javob berildi: {Object.keys(userAnswers).length} / {activeQuiz.questions.length}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg sm:text-xl font-bold text-white leading-relaxed">
                    {currentQ.question}
                  </h3>

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQ.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[currentQ.id] === optIdx;
                      let btnStyle = 'glass-panel border-white/5 text-slate-300 hover:border-violet-500/40';

                      if (isSubmitted) {
                        if (optIdx === currentQ.correctIndex) {
                          btnStyle = 'bg-emerald-950/70 border-emerald-500 text-emerald-300 font-semibold';
                        } else if (isSelected && optIdx !== currentQ.correctIndex) {
                          btnStyle = 'bg-rose-950/70 border-rose-500 text-rose-300';
                        }
                      } else if (isSelected) {
                        btnStyle = 'bg-violet-600/30 border-violet-500 text-white font-semibold';
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={isSubmitted}
                          onClick={() => selectOption(currentQ.id, optIdx)}
                          className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-slate-800/80 flex items-center justify-center font-mono text-xs text-slate-400">
                              {['A', 'B', 'C', 'D'][optIdx]}
                            </span>
                            <span>{opt}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {isSubmitted && (
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-1.5 animate-fade-in text-xs">
                      <span className="font-bold text-cyan-400 uppercase tracking-wider text-[10px]">
                        Izoh:
                      </span>
                      <p className="text-slate-300 leading-relaxed">{currentQ.explanation}</p>
                    </div>
                  )}

                  {/* Nav buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <button
                      onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentQIndex === 0}
                      className="px-4 py-2 rounded-xl glass-panel text-slate-400 hover:text-white disabled:opacity-30 text-xs flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Oldingi</span>
                    </button>

                    {currentQIndex < activeQuiz.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQIndex(prev => prev + 1)}
                        className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <span>Keyingi</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : !isSubmitted ? (
                      <button
                        onClick={submitQuiz}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-xs transition-all shadow-md"
                      >
                        Yakunlash va Baholash
                      </button>
                    ) : null}
                  </div>
                </>
              )}
            </div>

            {/* Right Question Map & Results */}
            <div className="lg:col-span-4 space-y-6">
              {/* Question Navigation Map */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white">
                  Savollar xaritasi
                </h4>
                <div className="grid grid-cols-5 gap-2">
                  {activeQuiz.questions.map((q, idx) => {
                    const isAnswered = userAnswers[q.id] !== undefined;
                    const isCurrent = currentQIndex === idx;

                    let mapStyle = 'bg-slate-900 border-white/5 text-slate-400';
                    if (isSubmitted) {
                      const isCorrect = userAnswers[q.id] === q.correctIndex;
                      mapStyle = isCorrect
                        ? 'bg-emerald-950 border-emerald-500/60 text-emerald-300'
                        : 'bg-rose-950 border-rose-500/60 text-rose-300';
                    } else if (isCurrent) {
                      mapStyle = 'bg-violet-600 border-violet-400 text-white font-bold';
                    } else if (isAnswered) {
                      mapStyle = 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => setCurrentQIndex(idx)}
                        className={`h-9 rounded-xl border text-xs font-mono transition-all flex items-center justify-center ${mapStyle}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quiz Result Card */}
              {isSubmitted && quizResult && (
                <div className="glass-panel-glow p-6 rounded-2xl border border-violet-500/40 text-center space-y-4 animate-fade-in">
                  <div className="w-14 h-14 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center mx-auto text-cyan-400">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-3xl font-extrabold font-heading text-white">
                      {quizResult.percentage}%
                    </span>
                    <p className="text-xs text-slate-400 mt-1">
                      {quizResult.correctCount} ta to‘g‘ri javob / {quizResult.totalQuestions} tadan
                    </p>
                  </div>
                  <div className="text-xs text-cyan-300 font-semibold bg-cyan-950/40 py-1.5 rounded-lg border border-cyan-800/30">
                    +{quizResult.xpEarned} XP qo‘shildi!
                  </div>
                  <div className="pt-2 flex justify-center gap-2">
                    <button
                      onClick={() => startQuiz(activeQuiz)}
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Qayta topshirish</span>
                    </button>
                    <button
                      onClick={() => setActiveQuiz(null)}
                      className="px-4 py-2 rounded-xl glass-panel text-slate-300 hover:text-white text-xs"
                    >
                      Ro‘yxatga qaytish
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Quiz Generator Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl glass-panel-glow border border-violet-500/40 p-6 sm:p-8 space-y-6">
            <button
              onClick={() => setShowAiModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Gemini AI Viktorina Generatori</span>
              </div>
              <h3 className="font-heading text-xl font-bold text-white">
                Istalgan mavzuda test yarating
              </h3>
              <p className="text-xs text-slate-400">
                AI fanni chuqur tahlil qilib, 5 ta yangi va original savol tuzadi.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Fan:
                </label>
                <select
                  value={aiSubjectInput}
                  onChange={e => setAiSubjectInput(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nameUz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mavzu:
                </label>
                <input
                  type="text"
                  value={aiTopicInput}
                  onChange={e => setAiTopicInput(e.target.value)}
                  placeholder="Masalan: Elektromagnit induksiya qonuni..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2.5 rounded-xl glass-panel text-slate-400 hover:text-white text-xs"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleGenerateAiQuiz}
                disabled={!aiTopicInput.trim() || isGeneratingAiQuiz}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold text-xs flex items-center gap-2 hover:opacity-95 disabled:opacity-40"
              >
                {isGeneratingAiQuiz ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Savollar tuzilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Viktorinani Boshlash</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
