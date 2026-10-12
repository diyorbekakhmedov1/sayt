import React, { useState } from 'react';
import { 
  User as UserIcon, Shield, Globe, Moon, Sun, 
  Download, Trash2, CheckCircle2, Sparkles, Bell, Eye 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';

export const SettingsPage: React.FC = () => {
  const { user, isAdmin, toggleRole, updateProfile } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [name, setName] = useState(user?.name || 'Doniyor Ahmedov');
  const [grade, setGrade] = useState(user?.grade || '10-sinf');
  const [theme, setTheme] = useState<'dark' | 'midnight' | 'system'>('midnight');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  ];

  const handleSave = async () => {
    await updateProfile({ name, grade });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportData = () => {
    const backupData = {
      user,
      exportedAt: new Date().toISOString(),
      platform: "Nexora AI Learning System",
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexora_backup_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-white">
          Foydalanuvchi Sozlamalari & Profil
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Shaxsiy ma‘lumotlar, ta‘lim darajasi, til va xavfsizlik konfiguratsiyasi.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Sozlamalar muvaffaqiyatli saqlandi!</span>
        </div>
      )}

      {/* Profile Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
        <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-violet-400" />
          <span>Shaxsiy Profil</span>
        </h3>

        {/* Avatar selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">
            Avatar tanlang:
          </label>
          <div className="flex items-center gap-3">
            {avatars.map((av, idx) => (
              <img
                key={idx}
                src={av}
                alt="Avatar"
                onClick={() => updateProfile({ avatar: av })}
                className={`w-12 h-12 rounded-full object-cover cursor-pointer border-2 transition-all ${
                  user?.avatar === av ? 'border-cyan-400 scale-105 shadow-lg shadow-cyan-400/25' : 'border-transparent hover:border-violet-500/50'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              To‘liq Ism:
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ta‘lim Darajasi / Sinf:
            </label>
            <select
              value={grade}
              onChange={e => setGrade(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              <option value="8-sinf">8-sinf</option>
              <option value="9-sinf">9-sinf</option>
              <option value="10-sinf">10-sinf</option>
              <option value="11-sinf">11-sinf</option>
              <option value="Talaba">Universitet Talabasi</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
          >
            Profilni Yangilash
          </button>
        </div>
      </div>

      {/* Language & Accessibility */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
        <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Til va Maxsus Imkoniyatlar (Accessibility)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Language selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Asosiy interfeys tili:
            </label>
            <div className="flex gap-2">
              {[
                { id: 'uz', label: 'O‘zbekcha' },
                { id: 'en', label: 'English' },
                { id: 'ru', label: 'Русский' },
              ].map(lang => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    language === lang.id
                      ? 'bg-cyan-600 text-white font-semibold'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion Toggle */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Animatsiyalar (Reduced Motion):
            </label>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${
                reducedMotion
                  ? 'bg-violet-950/60 border-violet-500/50 text-violet-300'
                  : 'bg-slate-900 border-white/10 text-slate-400'
              }`}
            >
              {reducedMotion ? 'Kamaytirilgan animatsiyalar (Faol)' : 'Standart to‘liq animatsiyalar'}
            </button>
          </div>
        </div>
      </div>

      {/* Role Management (Student / Admin Demonstration) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Foydalanuvchi Roli (RBAC)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Hozirgi rol: <strong className="text-white uppercase">{user?.role}</strong> ({isAdmin ? 'Administrator huquqlari faol' : 'Talaba rejimi'})
            </p>
          </div>

          <button
            onClick={toggleRole}
            className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-semibold transition-colors"
          >
            Rolni almashtirish ({isAdmin ? 'Talaba qilish' : 'Admin qilish'})
          </button>
        </div>
      </div>

      {/* Data Export & Account */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-heading text-sm font-bold text-white">
            Shaxsiy ma‘lumotlarni eksport qilish
          </h4>
          <p className="text-xs text-slate-400">
            Barcha o‘zlashtirilgan mavzular, test natijalari va qaydlarni JSON formatida yuklab oling.
          </p>
        </div>
        <button
          onClick={handleExportData}
          className="px-4 py-2.5 rounded-xl glass-panel text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span>Eksport Qilish</span>
        </button>
      </div>
    </div>
  );
};
