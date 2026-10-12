import React, { useState, useEffect } from 'react';
import { 
  Shield, Plus, Trash2, Edit3, CheckCircle2, 
  AlertCircle, Users, BookOpen, Layers, BarChart3, Sparkles, X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Subject, Topic, User } from '../types/index.ts';

interface AdminPageProps {
  subjects: Subject[];
  topics: Topic[];
  onRefreshData?: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ subjects, topics, onRefreshData }) => {
  const { user, isAdmin, toggleRole } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [userList, setUserList] = useState<User[]>([]);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicSubjectId, setNewTopicSubjectId] = useState('physics');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    if (!isAdmin) return;

    fetch('/api/admin/stats', {
      headers: { Authorization: 'Bearer user:user-admin-1' }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));

    fetch('/api/admin/users', {
      headers: { Authorization: 'Bearer user:user-admin-1' }
    })
      .then(res => res.json())
      .then(data => setUserList(data))
      .catch(err => console.error(err));
  }, [isAdmin]);

  const handleCreateTopic = async () => {
    if (!newTopicTitle.trim() || !newTopicDesc.trim()) return;

    try {
      const res = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer user:user-admin-1',
        },
        body: JSON.stringify({
          titleUz: newTopicTitle,
          subjectId: newTopicSubjectId,
          descriptionUz: newTopicDesc,
          contentUz: newTopicContent,
        }),
      });
      if (res.ok) {
        setShowAddTopicModal(false);
        setNewTopicTitle('');
        setNewTopicDesc('');
        setNewTopicContent('');
        setActionSuccess("Yangi mavzu o'quv dasturiga muvaffaqiyatli qo'shildi!");
        setTimeout(() => setActionSuccess(''), 3000);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed to create topic', err);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    if (!confirm("Haqiqatan ham ushbu mavzuni o'chirmoqchimisiz?")) return;

    try {
      const res = await fetch(`/api/admin/topics/${id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer user:user-admin-1' },
      });
      if (res.ok) {
        setActionSuccess("Mavzu o'chirildi.");
        setTimeout(() => setActionSuccess(''), 3000);
        if (onRefreshData) onRefreshData();
      }
    } catch (err) {
      console.error('Failed to delete topic', err);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-bold text-white">
            Himoyalangan Administrator Hududi
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Ushbu bo‘lim faqat tizim ma‘murlari uchun mo‘ljallangan. Server-side RBAC xavfsizlik nazorati faollashtirilgan.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={toggleRole}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 text-white font-semibold text-xs transition-all shadow-lg shadow-amber-600/20"
          >
            Administrator Roliga O‘tish (Demo ko‘rish uchun)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-semibold mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Administrator Boshqaruv Markazi</span>
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-white">
            O‘quv Dasturi va Moderatsiya
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Fanlar tarkibini boshqarish, yangi mavzular qo‘shish va AI viktorinalarini moderatsiya qilish.
          </p>
        </div>

        <button
          onClick={() => setShowAddTopicModal(true)}
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-2 transition-colors shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi Mavzu Kiritish</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Admin Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
            <span className="text-xs text-slate-400">Jami Foydalanuvchilar</span>
            <div className="text-2xl font-bold font-heading text-white">{stats.totalUsers} nafar</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
            <span className="text-xs text-slate-400">Fanlar Soni</span>
            <div className="text-2xl font-bold font-heading text-white">{stats.totalSubjects} ta</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
            <span className="text-xs text-slate-400">Mavzular Soni</span>
            <div className="text-2xl font-bold font-heading text-white">{stats.totalTopics} ta</div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-1">
            <span className="text-xs text-slate-400">AI Viktorinalari</span>
            <div className="text-2xl font-bold font-heading text-cyan-400">{stats.aiGeneratedQuizzes} ta</div>
          </div>
        </div>
      )}

      {/* Topics Management List */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-6">
        <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-violet-400" />
          <span>Mavjud Mavzular Ro‘yxati va Moderatsiya ({topics.length} ta)</span>
        </h3>

        <div className="divide-y divide-white/5">
          {topics.map(topic => {
            const subject = subjects.find(s => s.id === topic.subjectId);
            return (
              <div
                key={topic.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">
                      {topic.titleUz}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {subject?.nameUz || topic.subjectId}
                    </span>
                  </div>
                  <p className="text-slate-400 line-clamp-1">{topic.descriptionUz}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleDeleteTopic(topic.id)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Mavzuni o'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Users Directory */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 space-y-4">
        <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>Foydalanuvchilar Ro‘yxati</span>
        </h3>

        <div className="divide-y divide-white/5">
          {userList.map(u => (
            <div key={u.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-white">{u.name}</h4>
                  <p className="text-slate-400 text-[11px]">{u.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  u.role === 'admin' ? 'bg-amber-950 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-300'
                }`}>
                  {u.role}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{u.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Topic Modal */}
      {showAddTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl glass-panel-glow border border-violet-500/40 p-6 sm:p-8 space-y-5">
            <button
              onClick={() => setShowAddTopicModal(false)}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading text-xl font-bold text-white">
              Yangi O‘quv Mavzusi Qo‘shish
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Fan:</label>
                <select
                  value={newTopicSubjectId}
                  onChange={e => setNewTopicSubjectId(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nameUz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mavzu Sarlavhasi:</label>
                <input
                  type="text"
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  placeholder="Masalan: Elektromagnit To'lqinlar Spektri..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Qisqa Tavsif:</label>
                <input
                  type="text"
                  value={newTopicDesc}
                  onChange={e => setNewTopicDesc(e.target.value)}
                  placeholder="Mavzuning 1 jumlalik mohiyati..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Asosiy Dars Mazmuni:</label>
                <textarea
                  value={newTopicContent}
                  onChange={e => setNewTopicContent(e.target.value)}
                  rows={4}
                  placeholder="Nazariy bilimlar, formulalar va izohlar..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowAddTopicModal(false)}
                className="px-4 py-2 rounded-xl glass-panel text-slate-400 text-xs"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleCreateTopic}
                disabled={!newTopicTitle.trim() || !newTopicDesc.trim()}
                className="px-6 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold disabled:opacity-40"
              >
                Mavzuni Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
