import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, Plus, Trash2, Copy, Check, RotateCcw, 
  Mic, MicOff, Volume2, VolumeX, BookOpen, Layers, 
  Search, Terminal, HelpCircle, ArrowRight, MessageSquare 
} from 'lucide-react';
import { ChatMessage, Conversation, Subject } from '../types/index.ts';

interface ChatPageProps {
  subjects: Subject[];
}

export const ChatPage: React.FC<ChatPageProps> = ({ subjects }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('physics');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [searchConvQuery, setSearchConvQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load conversations on mount
  useEffect(() => {
    fetch('/api/chat/conversations')
      .then(res => res.json())
      .then(data => {
        setConversations(data);
        if (data.length > 0 && !activeConvId) {
          setActiveConvId(data[0].id);
        }
      })
      .catch(err => console.error('Failed to load conversations', err));
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }
    fetch(`/api/chat/conversations/${activeConvId}/messages`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error('Failed to load messages', err));
  }, [activeConvId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Browser Speech-to-Text setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'uz-UZ';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Brauzeringizda ovozli kiritish (Speech Recognition) qo'llab-quvvatlanmaydi.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSpeak = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown before speaking
    const cleanText = text.replace(/[#*`_\[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'uz-UZ';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const createNewChat = async () => {
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: "Yangi ta'lim muloqoti",
          subjectId: selectedSubject,
        }),
      });
      const newConv = await res.json();
      setConversations([newConv, ...conversations]);
      setActiveConvId(newConv.id);
      setMessages([]);
    } catch (err) {
      console.error('Failed to create new conversation', err);
    }
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/chat/conversations/${id}`, { method: 'DELETE' });
      const filtered = conversations.filter(c => c.id !== id);
      setConversations(filtered);
      if (activeConvId === id) {
        setActiveConvId(filtered.length > 0 ? filtered[0].id : null);
      }
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  const sendMessage = async (promptToSend?: string) => {
    const text = (promptToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    setInputPrompt('');
    setIsLoading(true);

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: activeConvId || 'temp',
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      subjectId: selectedSubject,
      difficulty: selectedDifficulty,
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConvId,
          prompt: text,
          subjectId: selectedSubject,
          difficulty: selectedDifficulty,
        }),
      });
      const data = await res.json();

      if (data.assistantMessage) {
        if (!activeConvId) {
          setActiveConvId(data.conversationId);
          // Refresh conversations
          fetch('/api/chat/conversations')
            .then(r => r.json())
            .then(convs => setConversations(convs));
        }
        setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), data.userMessage, data.assistantMessage]);
      }
    } catch (err) {
      console.error('Failed to send chat message', err);
      // Fallback assistant response
      const fallbackMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        conversationId: activeConvId || 'temp',
        role: 'assistant',
        content: "Tarmoq ulanishida uzilish ro'y berdi. Iltimos, qayta urinib ko'ring yoki birozdan so'ng savol yuboring.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchConvQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-5rem)] flex flex-col">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Left Sidebar: Conversations */}
        <div className="hidden lg:flex lg:col-span-3 flex-col glass-panel rounded-2xl border border-white/5 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-semibold text-sm text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-violet-400" />
              <span>Suhbatlar tarixi</span>
            </h3>
            <button
              onClick={createNewChat}
              className="p-1.5 rounded-lg bg-violet-600/30 border border-violet-500/30 text-violet-300 hover:bg-violet-600 hover:text-white transition-colors"
              title="Yangi suhbat ochish"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search conversations */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchConvQuery}
              onChange={e => setSearchConvQuery(e.target.value)}
              placeholder="Suhbatlarni qidirish..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900/80 rounded-xl border border-white/5 text-slate-300 placeholder-slate-500 focus:outline-none focus:border-violet-500/40"
            />
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Hozircha suhbatlar mavjud emas.
              </div>
            ) : (
              filteredConversations.map(conv => {
                const isActive = activeConvId === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-colors border ${
                      isActive
                        ? 'bg-violet-600/20 text-white border-violet-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
                    }`}
                  >
                    <span className="truncate pr-2">{conv.title}</span>
                    <button
                      onClick={e => deleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 transition-opacity"
                      title="O‘chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* New Chat Bottom button */}
          <button
            onClick={createNewChat}
            className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-violet-500/40 text-violet-300 hover:bg-violet-950/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Yangi Muloqot Boshlash</span>
          </button>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-9 flex flex-col glass-panel rounded-2xl border border-white/5 overflow-hidden">
          {/* Top Control Bar */}
          <div className="p-3.5 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40">
            {/* Subject Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">Fan:</span>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-violet-500"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.nameUz}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-lg border border-white/5 text-xs">
              {(['beginner', 'intermediate', 'advanced'] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2 py-0.5 rounded-md transition-colors ${
                    selectedDifficulty === diff
                      ? 'bg-violet-600 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {diff === 'beginner' ? "Boshlang'ich" : diff === 'intermediate' ? "O'rta" : "Chuqur"}
                </button>
              ))}
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setInputPrompt("Ushbu mavzuni qisqa xulosa va qayta takrorlash kartasi bilan jamlab ber.")}
                className="hidden md:inline-flex px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              >
                📝 Xulosa & Kartalar
              </button>
              <button
                onClick={() => setInputPrompt("Mavzu bo'yicha 3 ta sinov mashqi tuzib ber.")}
                className="hidden md:inline-flex px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              >
                ❓ Mashqlar
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 py-12">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-0.5 shadow-xl shadow-violet-600/20">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-white mb-1">
                    Nexora AI Assistenti bilan bilim oling
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Istalgan qiyin tushuncha, matematika formulasi, fizika qonuni yoki dasturlash kodini so‘rang. AI sodda tilda, misollar bilan javob beradi.
                  </p>
                </div>

                {/* Suggested Starters */}
                <div className="w-full space-y-2 pt-2">
                  {[
                    "Kvant fizikasida Shredinger mushugi tajribasini tushuntir.",
                    "Python da ikkilik qidiruv (Binary Search) qanday ishlaydi?",
                    "Pifagor teoremasining geometrik isboti nimaga asoslangan?",
                    "DNK replikatsiyasida fermentlar qanday vazifani bajaradi?"
                  ].map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(sug)}
                      className="w-full p-2.5 rounded-xl glass-panel text-left text-xs text-slate-300 hover:text-white hover:border-violet-500/40 flex items-center justify-between group transition-colors"
                    >
                      <span>{sug}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-violet-400 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map(msg => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAssistant && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 p-0.5 shrink-0 mt-1">
                        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-cyan-400" />
                        </div>
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-3 ${
                        isAssistant
                          ? 'glass-panel-glow border border-white/10 text-slate-200'
                          : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20'
                      }`}
                    >
                      {/* Render formatted message content */}
                      <div className="whitespace-pre-wrap font-sans">
                        {msg.content}
                      </div>

                      {/* Assistant actions: Copy, TTS */}
                      {isAssistant && (
                        <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-xs text-slate-400">
                          <button
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            className="inline-flex items-center gap-1 hover:text-white transition-colors"
                            title="Nusxa olish"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-emerald-400 text-[11px]">Nusxalandi</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Nusxa olish</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleSpeak(msg.content, msg.id)}
                            className="inline-flex items-center gap-1 hover:text-cyan-400 transition-colors ml-2"
                            title="Ovozli tinglash"
                          >
                            {speakingMsgId === msg.id ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                                <span className="text-rose-400 text-[11px]">To'xtatish</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Ovozda tinglash</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Thinking / Streaming Indicator */}
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-950/80 border border-violet-500/40 flex items-center justify-center text-cyan-400">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Nexora AI o‘ylamoqda va javob tayyorlamoqda...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3.5 border-t border-white/5 bg-slate-950/60">
            <form
              onSubmit={e => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2 bg-slate-900/90 border border-white/10 rounded-2xl p-1.5 focus-within:border-violet-500/50 transition-colors"
            >
              {/* Voice recognition button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2.5 rounded-xl transition-colors ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'text-slate-400 hover:text-cyan-400 hover:bg-white/5'
                }`}
                title="Ovozli savol berish (Mikrofon)"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                value={inputPrompt}
                onChange={e => setInputPrompt(e.target.value)}
                placeholder="Savolingizni o'zbek tilida yozing (masalan: Fotosintez qanday sodir bo'ladi?)..."
                className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
              />

              <button
                type="submit"
                disabled={!inputPrompt.trim() || isLoading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-medium hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Yuborish"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
