import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Clock, Trophy, Flame, CheckCircle2, 
  ArrowUpRight, AlertTriangle, Sparkles, BookOpen, Layers, Target 
} from 'lucide-react';
import { Achievement, UserAnalytics } from '../types/index.ts';
import { DailyLearningStreak } from '../components/DailyLearningStreak.tsx';

interface AnalyticsPageProps {
  onNavigate: (page: string, param?: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigate }) => {
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error(err));

    fetch('/api/achievements')
      .then(res => res.json())
      .then(data => setAchievements(data))
      .catch(err => console.error(err));
  }, []);

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Tahlil ma‘lumotlari yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Shaxsiy Ta‘lim Tahlili</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
          Natijalar va O‘zlashtirish Dinamikasi
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          O‘qish vaqti, testlar aniqligi, kunlik seriyalar, zaif mavzular va yutuqlar monitoringi.
        </p>
      </div>

      {/* Daily Learning Streak Centerpiece */}
      <DailyLearningStreak
        currentStreak={analytics.streakDays}
        onStreakUpdate={newStreak => {
          setAnalytics(prev => prev ? { ...prev, streakDays: newStreak } : null);
        }}
        onNavigateToStudy={() => onNavigate('practice')}
      />

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Umumiy O‘qish Vaqti</span>
            <Clock className="w-4 h-4 text-violet-400" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            {Math.floor(analytics.totalStudyMinutes / 60)}s {analytics.totalStudyMinutes % 60}daq
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> +18% o‘tgan haftaga nisbatan
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tugallangan Darslar</span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.completedLessons} ta
          </div>
          <div className="text-[11px] text-slate-400">10 xil fan bo‘yicha</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Viktorina Aniqligi</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.quizAccuracy}%
          </div>
          <div className="text-[11px] text-emerald-400">Yuqori o‘zlashtirish</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Uzluksiz Seriya</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
            {analytics.streakDays} kun
          </div>
          <div className="text-[11px] text-amber-400">Olovni so‘ndirmang!</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly Activity Heatmap/Bars */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base font-bold text-white">
              Haftalik Faollik (O‘rganish daqiqalari)
            </h3>
            <span className="text-xs text-slate-400 font-mono">Oxirgi 7 kun</span>
          </div>

          <div className="flex items-end justify-between gap-3 h-48 pt-6">
            {analytics.weeklyActivity.map((item, idx) => {
              const maxMinutes = 60;
              const heightPercent = Math.min(100, Math.round((item.minutes / maxMinutes) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="text-[10px] font-mono text-slate-400">{item.minutes}m</div>
                  <div className="w-full bg-slate-900 rounded-xl overflow-hidden h-36 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-violet-600 to-cyan-500 rounded-xl transition-all duration-700"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">{item.dayUz}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Mastery Percentages */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
          <h3 className="font-heading text-base font-bold text-white">
            Fanlar Kesimida O‘zlashtirish
          </h3>
          <div className="space-y-4">
            {analytics.subjectMastery.map((sub, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">{sub.subjectUz}</span>
                  <span className="text-white font-bold">{sub.percentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${sub.percentage}%`, backgroundColor: sub.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weak Topics & Recommended Revisions */}
      <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-violet-500/30 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="font-heading text-base font-bold text-white">
            Takrorlash Tavsiya Etiladigan Zaif Mavzular
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Ushbu mavzularda viktorina ko‘rsatkichingiz 65% dan pastroq bo‘lgan. AI bilan ularni qayta ko‘rib chiqishni maslahat beramiz:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {analytics.weakTopics.map(topic => (
            <div
              key={topic.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-white/5 space-y-3"
            >
              <div>
                <span className="text-[10px] text-cyan-400 uppercase font-bold">
                  {topic.subjectUz}
                </span>
                <h4 className="font-heading text-sm font-bold text-white mt-0.5">
                  {topic.titleUz}
                </h4>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                <span className="text-rose-400 font-semibold">{topic.accuracy}% aniqlik</span>
                <button
                  onClick={() => onNavigate('explain', topic.titleUz)}
                  className="px-3 py-1 rounded-lg bg-violet-600/30 hover:bg-violet-600 text-violet-300 hover:text-white text-[11px] font-semibold transition-colors"
                >
                  Takrorlash
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Badges Showcase */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="font-heading text-xl font-bold text-white">
            Yutuqlar va Naysonlar (Achievements)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map(ach => (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition-all ${
                ach.unlocked
                  ? 'glass-panel-glow border-amber-500/30 bg-amber-950/10'
                  : 'glass-panel border-white/5 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    ach.unlocked
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-heading text-sm font-bold text-white">
                      {ach.titleUz}
                    </h4>
                    {ach.unlocked && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-500/40 uppercase">
                        Ochilgan
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {ach.descriptionUz}
                  </p>
                  {!ach.unlocked && (
                    <div className="pt-2 text-[10px] text-slate-400">
                      Jarayon: {ach.progress} / {ach.maxProgress}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
