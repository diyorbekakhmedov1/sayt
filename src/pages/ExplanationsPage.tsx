import React, { useState } from 'react';
import { 
  Sparkles, ArrowRight, Lightbulb, BookOpen, Layers, 
  Bookmark, CheckCircle2, Copy, Check, MessageSquare, RotateCcw 
} from 'lucide-react';
import { ExplanationResult } from '../types/index.ts';

interface ExplanationsPageProps {
  initialQuery?: string;
  onNavigate: (page: string, param?: string) => void;
}

export const ExplanationsPage: React.FC<ExplanationsPageProps> = ({
  initialQuery = '',
  onNavigate,
}) => {
  const [topicInput, setTopicInput] = useState(initialQuery || 'Kvant fizikasida superpozitsiya va Shredinger mushugi');
  const [gradeLevel, setGradeLevel] = useState('10-sinf');
  const [explanationStyle, setExplanationStyle] = useState<'step_by_step' | 'short' | 'analogy' | 'revision_card'>('step_by_step');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const curatedTopics = [
    "Kvant fizikasida superpozitsiya va Shredinger mushugi",
    "Ikkilik qidiruv (Binary search) va O(log n) murakkablik",
    "Pifagor teoremasi va uning geometrik isboti",
    "DNK replikatsiyasi va polimeraza fermenti",
    "Termodinamikaning 2-qonuni va Entropiya mohiyati",
    "Mendeleyev davriy qonuni va atom orbitalari"
  ];

  const handleGenerate = async (queryText?: string) => {
    const text = queryText || topicInput;
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setIsSaved(false);

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicOrQuestion: text,
          level: gradeLevel,
          style: explanationStyle,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Failed to generate explanation', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToLibrary = async () => {
    if (!result) return;
    setIsSaved(true);
    fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'explanation',
        title: result.title,
        subjectName: 'Tushuntirish',
        refId: 'explanation-' + Date.now(),
      }),
    }).catch(err => console.error(err));
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(
      `${result.title}\n\n${result.summary}\n\nAnalogiya:\n${result.realWorldAnalogy}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Interaktiv Tushuntirish Ustaxonasi</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
          Har qanday murakkab tushunchani soddalashtiring
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Savolingizni kiriting yoki mavzuni tanlang. AI darajangizga moslab bosqichma-bosqich, hayotiy misol va vizual sxema bilan tushuntirib beradi.
        </p>
      </div>

      {/* Configuration Card */}
      <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-violet-500/30 space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
            O‘rganmoqchi bo‘lgan mavzuingiz yoki savolingiz:
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              placeholder="Masalan: Fotosintezning yorug'lik bosqichi nima?..."
              className="flex-1 bg-slate-900/90 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading || !topicInput.trim()}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-40 transition-all shadow-lg shadow-violet-600/20"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Tahlil qilinmoqda...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tushuntirish</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Curated quick topics */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] text-slate-500 shrink-0">Ommabop:</span>
          {curatedTopics.map((topic, i) => (
            <button
              key={i}
              onClick={() => {
                setTopicInput(topic);
                handleGenerate(topic);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/5 hover:border-violet-500/40 text-[11px] text-slate-400 hover:text-white whitespace-nowrap transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Level and Style Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Ta‘lim darajasi:
            </label>
            <div className="flex gap-2">
              {['8-sinf', '9-sinf', '10-sinf', '11-sinf', 'Talaba'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setGradeLevel(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    gradeLevel === lvl
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Tushuntirish uslubi:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'step_by_step', label: 'Bosqichma-bosqich' },
                { id: 'short', label: 'Qisqa xulosa' },
                { id: 'analogy', label: 'Hayotiy analogiya' },
                { id: 'revision_card', label: 'Takrorlash kartasi' },
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setExplanationStyle(st.id as any)}
                  className={`px-2 py-1.5 rounded-xl text-[11px] font-medium text-center transition-all ${
                    explanationStyle === st.id
                      ? 'bg-cyan-600 text-white font-semibold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Generated Result Workspace */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-white">
              {result.title}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={copyResult}
                className="p-2 rounded-xl glass-panel text-slate-400 hover:text-white text-xs flex items-center gap-1.5"
                title="Nusxa olish"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Nusxalandi' : 'Nusxa'}</span>
              </button>

              <button
                onClick={saveToLibrary}
                className={`p-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors ${
                  isSaved
                    ? 'bg-amber-950/60 text-amber-400 border border-amber-500/40'
                    : 'glass-panel text-slate-400 hover:text-white'
                }`}
                title="Kutubxonaga saqlash"
              >
                <Bookmark className="w-4 h-4" />
                <span className="hidden sm:inline">{isSaved ? 'Saqlandi' : 'Kutubxonaga saqlash'}</span>
              </button>
            </div>
          </div>

          {/* Summary Box */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Asosiy mohiyat (Summary)
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed">{result.summary}</p>
          </div>

          {/* Real-World Analogy */}
          {result.realWorldAnalogy && (
            <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 bg-cyan-950/20 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Hayotiy Analogiya & Misol
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed italic">
                "{result.realWorldAnalogy}"
              </p>
            </div>
          )}

          {/* Step-by-Step Breakdown */}
          {result.stepByStep && result.stepByStep.length > 0 && (
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                Bosqichma-bosqich Mantiqiy Zanjir
              </h3>
              <div className="space-y-4">
                {result.stepByStep.map((step, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl bg-slate-900/60 border border-white/5">
                    <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-400 font-mono font-bold flex items-center justify-center shrink-0">
                      {step.step || idx + 1}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-heading text-sm font-semibold text-white">
                        {step.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {step.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Flowchart / Conceptual Diagram */}
          {result.diagramConcept && (
            <div className="glass-panel p-6 rounded-2xl border border-violet-500/30 space-y-4">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-violet-400" />
                <span>Mavzuning Mantiqiy Sxemasi (Konseptual Diagramma)</span>
              </h3>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-4">
                {result.diagramConcept.nodes?.map((node, i) => (
                  <React.Fragment key={i}>
                    <div className="glass-panel-glow p-4 rounded-2xl border border-cyan-500/30 text-center max-w-[200px] w-full">
                      <div className="text-xs font-bold text-cyan-300 mb-1">{node.label}</div>
                      <div className="text-[11px] text-slate-400 leading-tight">{node.desc}</div>
                    </div>
                    {i < (result.diagramConcept?.nodes?.length || 0) - 1 && (
                      <ArrowRight className="w-5 h-5 text-violet-400 rotate-90 md:rotate-0 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Revision Card */}
          {result.revisionCard && (
            <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-amber-950/10 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Qayta Takrorlash Kartasi (Spaced Repetition Card)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Savol (Front):</span>
                  <p className="text-slate-200 font-medium">{result.revisionCard.front}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Javob (Back):</span>
                  <p className="text-cyan-300 font-medium">{result.revisionCard.back}</p>
                </div>
              </div>
            </div>
          )}

          {/* Follow-up button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => onNavigate('chat')}
              className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg"
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI dan qo‘shimcha savol so‘rash</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
