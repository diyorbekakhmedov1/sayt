import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Flame, Sparkles, CheckCircle2, Shield, Calendar, 
  Trophy, ArrowRight, Zap, Star, Award, Lock, Info 
} from 'lucide-react';
import { StreakMilestone } from '../types/index.ts';

interface DailyLearningStreakProps {
  currentStreak: number;
  onStreakUpdate?: (newStreak: number) => void;
  onNavigateToStudy?: () => void;
}

export const DailyLearningStreak: React.FC<DailyLearningStreakProps> = ({
  currentStreak = 5,
  onStreakUpdate,
  onNavigateToStudy,
}) => {
  const [streak, setStreak] = useState(currentStreak);
  const [isTodayCompleted, setIsTodayCompleted] = useState(true);
  const [streakFreezeCount, setStreakFreezeCount] = useState(1);
  const [selectedMilestone, setSelectedMilestone] = useState<StreakMilestone | null>(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // 7-day rolling schedule (Mon to Sun)
  const daysOfWeek = [
    { shortUz: 'Du', fullUz: 'Dushanba', completed: true, isToday: false },
    { shortUz: 'Se', fullUz: 'Seshanba', completed: true, isToday: false },
    { shortUz: 'Chor', fullUz: 'Chorshanba', completed: true, isToday: false },
    { shortUz: 'Pay', fullUz: 'Payshanba', completed: true, isToday: false },
    { shortUz: 'Jum', fullUz: 'Juma', completed: true, isToday: true },
    { shortUz: 'Shan', fullUz: 'Shanba', completed: false, isToday: false },
    { shortUz: 'Yak', fullUz: 'Yakshanba', completed: false, isToday: false },
  ];

  // Visual milestone badges
  const milestones: StreakMilestone[] = [
    {
      id: 'streak-3',
      days: 3,
      titleUz: 'Ilk Uchqun',
      badgeName: 'Bronza Alanga',
      color: '#f97316', // orange
      unlocked: streak >= 3,
      descriptionUz: 'Ketma-ket 3 kun davomida bilim olish seriyasini boshlagan tirishqoq o‘quvchi.',
      iconName: '🥉',
    },
    {
      id: 'streak-7',
      days: 7,
      titleUz: 'Haftalik Intizom',
      badgeName: 'Kumush Qalqon',
      color: '#38bdf8', // cyan/silver
      unlocked: streak >= 7,
      descriptionUz: 'To‘liq 1 hafta davomida har kuni yangi mavzu va mashqlar o‘zlashtirildi.',
      iconName: '🥈',
    },
    {
      id: 'streak-14',
      days: 14,
      titleUz: 'Barqaror Zukko',
      badgeName: 'Oltin Quvvat',
      color: '#eab308', // gold
      unlocked: streak >= 14,
      descriptionUz: '2 hafta uzluksiz o‘rganish natijasida mustahkam o‘rganish odati shakllandi.',
      iconName: '🥇',
    },
    {
      id: 'streak-30',
      days: 30,
      titleUz: 'Oylik Titaniyat',
      badgeName: 'Safir Yulduz',
      color: '#a855f7', // purple
      unlocked: streak >= 30,
      descriptionUz: '30 kunlik intizomli mehnat! Qomusiy iroda va doimiy o‘sish namunasi.',
      iconName: '💎',
    },
    {
      id: 'streak-100',
      days: 100,
      titleUz: 'Afsonaviy Yuzlik',
      badgeName: 'Kvant Toji',
      color: '#06b6d4', // electric cyan
      unlocked: streak >= 100,
      descriptionUz: '100 kunlik cheksiz bilim olovi! Nexora AI faxriy talabalari safidasiz.',
      iconName: '👑',
    },
  ];

  // Next milestone calculation
  const nextMilestone = milestones.find(m => !m.unlocked) || milestones[milestones.length - 1];
  const daysUntilNext = nextMilestone ? Math.max(0, nextMilestone.days - streak) : 0;
  const progressToNext = nextMilestone
    ? Math.min(100, Math.round((streak / nextMilestone.days) * 100))
    : 100;

  const handleManualCheckIn = async () => {
    if (isCheckingIn) return;
    setIsCheckingIn(true);

    try {
      const res = await fetch('/api/analytics/streak/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      const updatedStreak = data.streak || streak + 1;
      setStreak(updatedStreak);
      setIsTodayCompleted(true);
      if (onStreakUpdate) onStreakUpdate(updatedStreak);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#f97316', '#fbbf24', '#06b6d4', '#8b5cf6'],
      });
    } catch (err) {
      console.error('Failed to check in streak', err);
      // fallback
      const updatedStreak = streak + 1;
      setStreak(updatedStreak);
      setIsTodayCompleted(true);
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Flame & Counter Card */}
      <div className="glass-panel-glow p-6 sm:p-8 rounded-3xl border border-amber-500/30 relative overflow-hidden">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-violet-600/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Column: Large Animated Flame Counter */}
          <div className="lg:col-span-5 flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-semibold backdrop-blur-md">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
              <span>Kunlik Ta‘lim Seriyasi (Daily Streak)</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-heading text-6xl sm:text-7xl font-black tracking-tight text-white drop-shadow-[0_0_35px_rgba(249,115,22,0.4)]">
                {streak}
              </span>
              <div className="space-y-0.5">
                <span className="font-heading text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-300 to-rose-400 bg-clip-text text-transparent block">
                  KUN
                </span>
                <span className="text-xs text-slate-400 block font-medium">
                  uzluksiz o‘rganish
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
              {streak >= 7
                ? "Ajoyib intizom! Olov hech qachon so'nmasin — siz o'zlashtirish tezligingizni 2.5 barobar oshirdingiz."
                : "Har kuni kamida 1 ta mavzu yoki test topshirib, olovni alangalatib turing!"}
            </p>

            {/* Check-in CTA button */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {isTodayCompleted ? (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Bugungi kunlik seriya mustahkamlandi!</span>
                </div>
              ) : (
                <button
                  onClick={handleManualCheckIn}
                  disabled={isCheckingIn}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/30 hover:opacity-95 active:scale-95 transition-all"
                >
                  <Flame className="w-4 h-4 fill-white" />
                  <span>Bugungi faollikni qayd etish (+50 XP)</span>
                </button>
              )}

              {/* Streak Freeze Indicator */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-cyan-300 text-xs cursor-pointer hover:border-cyan-400 transition-colors"
                title="Agar 1 kun dars qilmasangiz, muzlatgich seriyangizni saqlab qoladi"
              >
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Muzlatgich: {streakFreezeCount}/1 faol</span>
              </div>
            </div>
          </div>

          {/* Right Column: 7-Day Rolling Calendar & Next Milestone Tracker */}
          <div className="lg:col-span-7 space-y-6">
            {/* 7-Day Calendar Row */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-violet-400" />
                  Haftalik faollik taqvimi
                </span>
                <span className="text-[11px] text-cyan-400">5 kun faol / 2 kun rejalashtirilgan</span>
              </div>

              <div className="grid grid-cols-7 gap-2 pt-1">
                {daysOfWeek.map((day, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                      day.completed
                        ? 'bg-amber-950/40 border-amber-500/40 text-amber-300 shadow-sm'
                        : day.isToday
                        ? 'bg-violet-950/60 border-violet-400 text-white ring-2 ring-violet-500/30 animate-pulse'
                        : 'bg-slate-900/60 border-white/5 text-slate-500'
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase">{day.shortUz}</span>
                    <div className="my-1.5">
                      {day.completed ? (
                        <Flame className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow" />
                      ) : day.isToday ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-dashed border-slate-600" />
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400">
                      {day.completed ? 'Bajarildi' : day.isToday ? 'Bugun' : 'Kutilmoqda'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Milestone Progress Bar */}
            {nextMilestone && (
              <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{nextMilestone.iconName}</span>
                    <div>
                      <span className="font-bold text-white block">
                        Navbatdagi nishon: {nextMilestone.titleUz} ({nextMilestone.days} kun)
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {daysUntilNext > 0
                          ? `Ushbu nishonga yetishish uchun yana ${daysUntilNext} kun qoldi!`
                          : "Tabriklaymiz, nishon qo‘lga kiritildi!"}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold text-sm">
                    {progressToNext}%
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-400 transition-all duration-700 shadow-[0_0_12px_rgba(249,115,22,0.5)]"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Milestone Badges Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-heading text-lg sm:text-xl font-bold text-white">
              Seriya Nishonlari & Yutuq To‘plamlari
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {milestones.filter(m => m.unlocked).length} / {milestones.length} ta ochilgan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {milestones.map(m => (
            <div
              key={m.id}
              onClick={() => setSelectedMilestone(m)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between ${
                m.unlocked
                  ? 'glass-panel-glow border-amber-500/40 bg-gradient-to-b from-amber-950/20 to-slate-900/60 shadow-lg'
                  : 'glass-panel border-white/5 opacity-60 hover:opacity-80'
              }`}
            >
              {/* Badge Icon & Status */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-md ${
                      m.unlocked
                        ? 'bg-amber-500/20 border border-amber-500/50 shadow-amber-500/20'
                        : 'bg-slate-800 border border-white/5'
                    }`}
                  >
                    {m.iconName}
                  </div>

                  {m.unlocked ? (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      Ochilgan
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" />
                      {m.days} kun
                    </span>
                  )}
                </div>

                <h4 className="font-heading text-sm font-bold text-white mb-0.5">
                  {m.titleUz}
                </h4>
                <div className="text-[11px] font-semibold text-cyan-400 mb-2">
                  {m.badgeName}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {m.descriptionUz}
                </p>
              </div>

              {/* Progress mini-bar */}
              <div className="pt-3 border-t border-white/5 mt-3 space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Talab:</span>
                  <span className="font-mono text-slate-300 font-semibold">{m.days} kun</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (streak / m.days) * 100)}%`,
                      backgroundColor: m.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Milestone Detail Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl glass-panel-glow border border-amber-500/40 p-6 sm:p-8 space-y-5 text-center">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-4xl mx-auto shadow-xl shadow-amber-500/20">
              {selectedMilestone.iconName}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                {selectedMilestone.badgeName}
              </span>
              <h3 className="font-heading text-2xl font-extrabold text-white">
                {selectedMilestone.titleUz} ({selectedMilestone.days} kun)
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {selectedMilestone.descriptionUz}
            </p>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/5 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Holati:</span>
                <span className={selectedMilestone.unlocked ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  {selectedMilestone.unlocked ? "Qo'lga kiritilgan (Faol)" : `Qolgan: ${Math.max(0, selectedMilestone.days - streak)} kun`}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>XP Mukofoti:</span>
                <span className="text-cyan-300 font-bold font-mono">+{selectedMilestone.days * 20} XP</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setSelectedMilestone(null)}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold"
              >
                Tushunarli
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
