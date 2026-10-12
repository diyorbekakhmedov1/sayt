import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, CheckCircle2, XCircle, Lightbulb, RotateCcw, 
  ArrowRight, Sparkles, Filter, Code2, Calculator 
} from 'lucide-react';
import { PracticeQuestion, Subject } from '../types/index.ts';

interface PracticePageProps {
  subjects: Subject[];
  initialSubjectId?: string;
  onNavigate: (page: string, param?: string) => void;
}

export const PracticePage: React.FC<PracticePageProps> = ({
  subjects,
  initialSubjectId,
  onNavigate,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubjectId || 'all');
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showHint, setShowHint] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    isCorrect: boolean;
    explanation: string;
    correctAnswer: string | number;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    const url = selectedSubject === 'all' ? '/api/practice' : `/api/practice?subjectId=${selectedSubject}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setCurrentIndex(0);
        setSelectedOption('');
        setShowHint(false);
        setSubmissionResult(null);
      })
      .catch(err => console.error(err));
  }, [selectedSubject]);

  const currentQ = questions[currentIndex];

  const handleSubmit = async () => {
    if (!selectedOption || !currentQ) return;

    try {
      const res = await fetch('/api/practice/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQ.id,
          answer: selectedOption,
        }),
      });
      const data = await res.json();
      setSubmissionResult(data);
      if (data.isCorrect) {
        setScore(prev => prev + 1);
      }
      setCompletedCount(prev => prev + 1);
    } catch (err) {
      console.error('Failed to check answer', err);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption('');
      setShowHint(false);
      setSubmissionResult(null);
    } else {
      // Completed all
      setCurrentIndex(questions.length);
    }
  };

  const handleRetry = () => {
    setSelectedOption('');
    setShowHint(false);
    setSubmissionResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
            <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
            <span>Moslashuvchan Amaliy Mashg‘ulotlar</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            Interaktiv Mashqlar Maydoni
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Nazariyani amaliyotda mustahkamlang, darajangizga mos savollarni yeching.
          </p>
        </div>

        {/* Subject filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Fan:</span>
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
          >
            <option value="all">Barcha Fanlar</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.nameUz}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Practice Card */}
      {currentQ && currentIndex < questions.length ? (
        <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-violet-500/30 space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">
                Mashq {currentIndex + 1} / {questions.length}
              </span>
              <span className="px-2 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-500/30 text-[10px] uppercase">
                {currentQ.type === 'math' ? 'Matematik' : currentQ.type === 'code' ? 'Dasturlash' : 'Test'}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-cyan-400 font-bold">
              To‘g‘ri javoblar: {score}
            </div>
          </div>

          {/* Question Title */}
          <div className="space-y-3">
            <h2 className="font-heading text-lg sm:text-xl font-bold text-white leading-relaxed">
              {currentQ.question}
            </h2>
          </div>

          {/* Options / Answer Input */}
          <div className="space-y-2.5">
            {currentQ.options?.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              let optionStyle = 'glass-panel border-white/5 text-slate-300 hover:border-violet-500/40';

              if (submissionResult) {
                const isThisCorrect = String(opt) === String(submissionResult.correctAnswer);
                if (isThisCorrect) {
                  optionStyle = 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-semibold';
                } else if (isSelected && !submissionResult.isCorrect) {
                  optionStyle = 'bg-rose-950/60 border-rose-500/60 text-rose-300';
                }
              } else if (isSelected) {
                optionStyle = 'bg-violet-600/30 border-violet-500 text-white font-semibold shadow-sm';
              }

              return (
                <button
                  key={idx}
                  disabled={submissionResult !== null}
                  onClick={() => setSelectedOption(opt)}
                  className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm transition-all flex items-center justify-between ${optionStyle}`}
                >
                  <span>{opt}</span>
                  {isSelected && !submissionResult && (
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Progressive Hint */}
          <div className="pt-2">
            {!showHint ? (
              <button
                onClick={() => setShowHint(true)}
                className="text-xs text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 font-medium transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Maslahat (Hint) kerakmi?</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Maslahat: </span>
                  <span>{currentQ.hint}</span>
                </div>
              </div>
            )}
          </div>

          {/* Submission Feedback */}
          {submissionResult && (
            <div
              className={`p-4 rounded-2xl border space-y-2 animate-fade-in ${
                submissionResult.isCorrect
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {submissionResult.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Barakalla! Javob to‘g‘ri.</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>Noto‘g‘ri javob. To‘g‘ri javob: {submissionResult.correctAnswer}</span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {submissionResult.explanation}
              </p>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div>
              {submissionResult && !submissionResult.isCorrect && (
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 rounded-xl glass-panel text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Qayta urinish</span>
                </button>
              )}
            </div>

            <div className="flex gap-2">
              {!submissionResult ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedOption}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold text-xs sm:text-sm hover:opacity-95 disabled:opacity-40 transition-all shadow-md"
                >
                  Tekshirish
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md"
                >
                  <span>Keyingi mashq</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Completed Summary */
        <div className="glass-panel-glow p-8 sm:p-12 rounded-3xl border border-violet-500/30 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-violet-600/20 border border-violet-500/40 text-violet-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-cyan-400" />
          </div>
          <div className="space-y-2">
            <h2 className="font-heading text-2xl font-bold text-white">
              Barcha mashqlar bajarildi!
            </h2>
            <p className="text-xs text-slate-400">
              Siz ushbu bosqichda {questions.length} ta savoldan {score} tasiga to‘g‘ri javob berdingiz.
            </p>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => {
                setCurrentIndex(0);
                setScore(0);
                setSelectedOption('');
                setSubmissionResult(null);
              }}
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
            >
              Qayta topshirish
            </button>
            <button
              onClick={() => onNavigate('quizzes')}
              className="px-6 py-3 rounded-xl glass-panel text-slate-300 hover:text-white text-xs font-semibold"
            >
              Viktorinalarga o‘tish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
