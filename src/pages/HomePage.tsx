import React, { useState } from 'react';
import { 
  Sparkles, ArrowRight, BookOpen, BrainCircuit, CheckCircle2, 
  BarChart3, Zap, Shield, Star, Volume2, VolumeX, Lightbulb, Play 
} from 'lucide-react';
import { AiOrb3D } from '../components/AiOrb3D.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Subject } from '../types/index.ts';

interface HomePageProps {
  subjects: Subject[];
  onNavigate: (page: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ subjects, onNavigate }) => {
  const { t } = useLanguage();
  const [activeDemoTab, setActiveDemoTab] = useState<'quantum' | 'binary' | 'pythagoras'>('quantum');
  const [isPlayingGreeting, setIsPlayingGreeting] = useState(false);

  const speakGreeting = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPlayingGreeting) {
      window.speechSynthesis.cancel();
      setIsPlayingGreeting(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(
      "Assalomu alaykum! Nexora sun'iy intellekt ta'lim platformasiga xush kelibsiz. Kelajagingizni bilim bilan yarating!"
    );
    utterance.lang = 'uz-UZ';
    utterance.rate = 1.0;
    utterance.onend = () => setIsPlayingGreeting(false);
    utterance.onerror = () => setIsPlayingGreeting(false);

    setIsPlayingGreeting(true);
    window.speechSynthesis.speak(utterance);
  };

  const demoExplanations = {
    quantum: {
      title: "Kvant Fizikasi: Superpozitsiya va Shredinger Mushugi",
      simple: "Tasavvur qiling, havoga otilgan tanga aylanmoqda. U to yerga tushmaguncha, raqam ham, gerb ham emas — ikkala holatning bir vaqtdagi yig'indisi. Kvant zarralari ham siz ularni kuzatmaguningizcha barcha mumkin bo'lgan holatlarda bir vaqtning o'zida mavjud bo'ladi!",
      analogy: "Xuddi siz kutubxonaga kirmaguningizcha kitobning qaysi sahifada ochiq turgani noma'lum bo'lgani kabi.",
      tag: "Fizika & Kvant Mexanikasi",
    },
    binary: {
      title: "Algoritmlar: Ikkilik Qidiruv (Binary Search)",
      simple: "Agar siz 1 dan 100 gacha o'ylangan sonni topsangiz, 1, 2, 3... deb ketma-ket so'ramaysiz. '50 dan kattami?' deb so'raysiz va har safar variantlarning yarmini tashlab yuborasiz. 1 millionta element ichidan qidiruv atigi 20 ta savolda topiladi!",
      analogy: "Qalin lug'atdan so'z qidirayotganda kitobni o'rtasidan ochib varoqlash usuli.",
      tag: "Dasturlash & IT",
    },
    pythagoras: {
      title: "Geometriya: Pifagor Teoremasi (a² + b² = c²)",
      simple: "To'g'ri burchakli uchburchakning katetlari ustiga qurilgan kvadratlarning maydonlari yig'indisi, gipotenuza ustiga qurilgan kvadratning maydoniga tengdir. 3 sm va 4 sm li devorlar burchagini bog'lovchi to'g'ri to'sin doim 5 sm bo'ladi.",
      analogy: "Qadimiy Misr me'morlari 3-4-5 tugunli arqon yordamida piramidalarning 90 gradus burchagini aniq o'lchashgan.",
      tag: "Algebra & Geometriya",
    },
  };

  const testimonials = [
    {
      name: "Jasur Rahmatov",
      role: "11-sinf o‘quvchisi, Toshkent (Namunaviy fikr)",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
      content: "Nexora AI tufayli fizikadagi Nyuton qonunlari va termodinamikani darslikdagi quruq formulalar emas, hayotiy analogiyalar orqali birinchi marta chindan tushundim!",
    },
    {
      name: "Madina Alimova",
      role: "Prezident maktabi bitiruvchisi (Namunaviy fikr)",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
      content: "AI viktorinalar generatsiyasi ajoyib. Xatolarimni shunchaki belgilab qo'ymasdan, nega aynan shu variant to'g'ri ekanligini bosqichma-bosqich tahlil qilib beradi.",
    },
    {
      name: "Bobur Mirzayev",
      role: "IT yo‘nalishi talabasi (Namunaviy fikr)",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80",
      content: "Dasturlash bo'limidagi Binary Search va algoritmlar tushuntirishlari juda sifatli. O'zbek tilida bunday darajadagi interaktiv platforma ilgari bo'lmagan.",
    },
  ];

  return (
    <div className="relative overflow-hidden space-y-24">
      {/* Background radial atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-radial-glow pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-950/60 border border-violet-500/30 text-violet-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Kelajak avlod sun‘iy intellekt ta‘lim platformasi</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              {t('heroTitle').split(' ').map((word, i) => (
                <span
                  key={i}
                  className={
                    word.toLowerCase().includes('bilim') || word.toLowerCase().includes('future')
                      ? 'bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-400 bg-clip-text text-transparent'
                      : ''
                  }
                >
                  {word}{' '}
                </span>
              ))}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed mx-auto lg:mx-0">
              {t('heroSubtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => onNavigate('subjects')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-violet-500 to-cyan-500 text-white font-semibold flex items-center justify-center gap-2.5 shadow-xl shadow-violet-600/30 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>{t('startLearning')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('chat')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl glass-panel text-slate-200 hover:text-white hover:border-violet-500/40 font-medium flex items-center justify-center gap-2 transition-all"
              >
                <BrainCircuit className="w-4 h-4 text-cyan-400" />
                <span>AI bilan muloqot qilish</span>
              </button>
            </div>

            {/* Micro voice greeting trigger */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-2 text-xs text-slate-400">
              <button
                onClick={speakGreeting}
                className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {isPlayingGreeting ? (
                  <VolumeX className="w-4 h-4 animate-pulse text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                <span>
                  {isPlayingGreeting
                    ? "Ovozli salomlashish to'xtatildi"
                    : "Nexora AI ovozli salomlashishini tinglash"}
                </span>
              </button>
            </div>
          </div>

          {/* Hero Right: 3D AI Orb */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative">
              <AiOrb3D size={380} isSpeaking={isPlayingGreeting} />
              
              {/* Floating feature pills around orb */}
              <div className="absolute -bottom-4 -left-6 sm:left-0 glass-panel-glow px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs text-slate-200 border border-violet-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>100% O‘zbek tilida muloqot</span>
              </div>

              <div className="absolute -top-2 -right-4 glass-panel px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs text-slate-200 border border-cyan-500/30">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Gemini 3.8 Flash kuchi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM STATISTICS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Boshlang‘ich Fanlar", val: "10 ta", sub: "Matematika, Fizika, IT, Kimyo...", icon: BookOpen },
            { label: "Interaktiv Mavzular", val: "160+", sub: "Bosqichma-bosqich o‘rganish", icon: Sparkles },
            { label: "AI Viktorina Aniqligi", val: "98.4%", sub: "Tekshirilgan ilmiy metodika", icon: CheckCircle2 },
            { label: "O‘rganish Tezligi", val: "3.2x", sub: "Analogiyalar orqali tez o‘zlashtirish", icon: Zap },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
                  <Icon className="w-4 h-4 text-violet-400" />
                </div>
                <div className="font-heading text-2xl sm:text-3xl font-extrabold text-white mb-1">
                  {stat.val}
                </div>
                <div className="text-[11px] text-slate-400">{stat.sub}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW THE AI EXPLAINS A DIFFICULT CONCEPT (LIVE DEMO) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Interaktiv metodika</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
            AI murakkab tushunchani qanday tushuntiradi?
          </h2>
          <p className="text-sm text-slate-400">
            Quruq qoidalarni yodlash o‘rniga, Nexora AI tushunchalarni vizual mantiq va hayotiy analogiyalar orqali ongda mustahkamlaydi.
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setActiveDemoTab('quantum')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeDemoTab === 'quantum'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'glass-panel text-slate-400 hover:text-white'
            }`}
          >
            ⚛️ Kvant Fizikasi
          </button>
          <button
            onClick={() => setActiveDemoTab('binary')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeDemoTab === 'binary'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'glass-panel text-slate-400 hover:text-white'
            }`}
          >
            💻 Binary Search (IT)
          </button>
          <button
            onClick={() => setActiveDemoTab('pythagoras')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeDemoTab === 'pythagoras'
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                : 'glass-panel text-slate-400 hover:text-white'
            }`}
          >
            📐 Pifagor Teoremasi
          </button>
        </div>

        {/* Interactive Explanation Box */}
        <div className="max-w-4xl mx-auto glass-panel-glow rounded-3xl p-6 sm:p-8 border border-violet-500/30 relative overflow-hidden">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                  {demoExplanations[activeDemoTab].tag}
                </span>
                <h3 className="font-heading text-lg sm:text-xl font-bold text-white mt-1">
                  {demoExplanations[activeDemoTab].title}
                </h3>
              </div>
              <button
                onClick={() => onNavigate('explain')}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs hover:bg-violet-600/50 transition-colors"
              >
                <span>Ustaxonada ochish</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4 text-sm leading-relaxed text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/5">
                <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Sodda va Aniq Tushuntirish
                </h4>
                <p>{demoExplanations[activeDemoTab].simple}</p>
              </div>

              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/30">
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Hayotiy Analogiya
                </h4>
                <p className="text-slate-300 italic">"{demoExplanations[activeDemoTab].analogy}"</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onNavigate('chat')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
              >
                <span>AI dan yana savollar so‘rash</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED SUBJECTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-violet-400 mb-1">
              Fanlar katalogi
            </div>
            <h2 className="font-heading text-3xl font-bold text-white">
              Barcha fundamental fanlar bitta platformada
            </h2>
          </div>
          <button
            onClick={() => onNavigate('subjects')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Barcha fanlarni ko‘rish (10 ta)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.slice(0, 6).map(subject => (
            <div
              key={subject.id}
              onClick={() => onNavigate('subjects', subject.id)}
              className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-violet-500/40 cursor-pointer group transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${subject.color}20`, border: `1px solid ${subject.color}50` }}
                >
                  <BookOpen className="w-6 h-6" style={{ color: subject.color }} />
                </div>
                <span className="text-[11px] font-semibold px-2 py-1 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                  {subject.topicsCount} ta mavzu
                </span>
              </div>

              <h3 className="font-heading text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
                {subject.nameUz}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                {subject.descriptionUz}
              </p>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">O‘zlashtirish</span>
                  <span className="font-semibold text-slate-200">{subject.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${subject.progress}%`, backgroundColor: subject.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SAMPLE STUDENT TESTIMONIALS (Clearly identified) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
            Namunaviy fikr-mulohazalar
          </span>
          <h2 className="font-heading text-3xl font-bold text-white">
            O‘quvchilar Nexora AI haqida nima deydi?
          </h2>
          <p className="text-xs text-slate-400">
            Platforma ta‘lim samaradorligini sinovdan o‘tkazgan dastlabki namunaviy baholar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testi, i) => (
            <div key={i} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{testi.content}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                <img
                  src={testi.avatar}
                  alt={testi.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">{testi.name}</h4>
                  <p className="text-[10px] text-slate-400">{testi.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-12">
        <div className="glass-panel-glow p-8 sm:p-12 rounded-3xl border border-violet-500/40 relative overflow-hidden">
          <div className="space-y-5 max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              Bugunoq o‘rganishni yangi bosqichga olib chiqing
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Nexora AI bilan har qanday murakkab fan tushunarli va qiziqarli sarguzashtga aylanadi. O‘zbekistondagi eng ilg‘or ta‘lim sun‘iy intellektiga savol bering.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => onNavigate('chat')}
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-semibold flex items-center justify-center gap-2 shadow-xl shadow-violet-600/30 hover:opacity-95 transition-all"
              >
                <span>AI Yordamchini Boshlash</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('quizzes')}
                className="px-8 py-3.5 rounded-xl glass-panel text-slate-200 hover:text-white font-semibold transition-all"
              >
                <span>Bilimingizni Sinab Ko‘rish</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
