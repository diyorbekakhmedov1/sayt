import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db } from './src/server/db.ts';
import { askGemini, explainConceptWithAI, generateQuizQuestionsWithAI } from './src/server/ai.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple auth middleware
function getAuthUser(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Simple demo token format: "user:<id>"
    if (token.startsWith('user:')) {
      const uid = token.split(':')[1];
      return db.getUserById(uid) || db.getUsers()[0];
    }
  }
  return db.getUsers()[0]; // Default to student
}

// Security & API headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// --- API ROUTES ---

// Health & status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    geminiModel: 'gemini-3.8-flash',
  });
});

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email kiritilishi shart." });
  }

  let user = db.getUserByEmail(email);
  if (!user) {
    // If not found, create new student account automatically
    const isNewAdmin = email.toLowerCase().includes('admin');
    user = db.addUser({
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      role: isNewAdmin ? 'admin' : 'student',
      grade: '10-sinf',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      xp: 100,
      streak: 1,
      createdAt: new Date().toISOString(),
    });
  }

  res.json({
    token: `user:${user.id}`,
    user: user,
  });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, grade, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Ism va email kiritilishi shart." });
  }

  const existing = db.getUserByEmail(email);
  if (existing) {
    return res.json({ token: `user:${existing.id}`, user: existing });
  }

  const newUser = db.addUser({
    id: `user-${Date.now()}`,
    name,
    email,
    role: role === 'admin' ? 'admin' : 'student',
    grade: grade || '10-sinf',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    xp: 50,
    streak: 1,
    createdAt: new Date().toISOString(),
  });

  res.json({
    token: `user:${newUser.id}`,
    user: newUser,
  });
});

app.get('/api/auth/me', (req, res) => {
  const user = getAuthUser(req);
  res.json({ user });
});

app.put('/api/auth/profile', (req, res) => {
  const user = getAuthUser(req);
  const updates = req.body;
  const updated = db.updateUser(user.id, updates);
  res.json({ user: updated || user });
});

// Subjects
app.get('/api/subjects', (req, res) => {
  res.json(db.getSubjects());
});

app.get('/api/subjects/:id', (req, res) => {
  const subject = db.getSubjectById(req.params.id);
  if (!subject) return res.status(404).json({ error: 'Fan topilmadi.' });
  res.json(subject);
});

// Topics
app.get('/api/topics', (req, res) => {
  const subjectId = req.query.subjectId as string;
  res.json(db.getTopics(subjectId));
});

app.get('/api/topics/:id', (req, res) => {
  const topic = db.getTopicById(req.params.id);
  if (!topic) return res.status(404).json({ error: 'Mavzu topilmadi.' });
  res.json(topic);
});

// AI Chat Assistant
app.get('/api/chat/conversations', (req, res) => {
  const user = getAuthUser(req);
  res.json(db.getConversations(user.id));
});

app.post('/api/chat/conversations', (req, res) => {
  const user = getAuthUser(req);
  const { title, subjectId } = req.body;
  const conv = db.createConversation({
    id: `conv-${Date.now()}`,
    userId: user.id,
    title: title || "Yangi ilmiy muloqot",
    subjectId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messagesCount: 0,
  });
  res.json(conv);
});

app.delete('/api/chat/conversations/:id', (req, res) => {
  db.deleteConversation(req.params.id);
  res.json({ success: true });
});

app.get('/api/chat/conversations/:id/messages', (req, res) => {
  res.json(db.getMessages(req.params.id));
});

app.post('/api/chat', async (req, res) => {
  const user = getAuthUser(req);
  const { conversationId, prompt, subjectId, difficulty } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Savol matni kiritilmadi." });
  }

  let activeConvId = conversationId;
  if (!activeConvId) {
    const newConv = db.createConversation({
      id: `conv-${Date.now()}`,
      userId: user.id,
      title: prompt.slice(0, 30) + '...',
      subjectId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messagesCount: 0,
    });
    activeConvId = newConv.id;
  }

  // Save user message
  const userMsg = db.addMessage({
    id: `msg-${Date.now()}`,
    conversationId: activeConvId,
    role: 'user',
    content: prompt,
    timestamp: new Date().toISOString(),
    subjectId,
    difficulty,
  });

  const history = db.getMessages(activeConvId);

  // Generate AI answer via Gemini
  const aiAnswer = await askGemini(prompt, history, subjectId, difficulty);

  // Save assistant message
  const assistantMsg = db.addMessage({
    id: `msg-${Date.now() + 1}`,
    conversationId: activeConvId,
    role: 'assistant',
    content: aiAnswer,
    timestamp: new Date().toISOString(),
    subjectId,
    difficulty,
  });

  res.json({
    conversationId: activeConvId,
    userMessage: userMsg,
    assistantMessage: assistantMsg,
  });
});

// Interactive Explanations
app.post('/api/explain', async (req, res) => {
  const { topicOrQuestion, level, style } = req.body;
  if (!topicOrQuestion) {
    return res.status(400).json({ error: "Mavzu yoki savol kiritilmadi." });
  }

  const result = await explainConceptWithAI(topicOrQuestion, level || '10-sinf', style || 'step_by_step');
  res.json(result);
});

// Practice
app.get('/api/practice', (req, res) => {
  const subjectId = req.query.subjectId as string;
  res.json(db.getPractice(subjectId));
});

app.post('/api/practice/check', (req, res) => {
  const { questionId, answer } = req.body;
  const questions = db.getPractice();
  const q = questions.find(item => item.id === questionId);

  if (!q) {
    return res.status(404).json({ error: 'Mashq topilmadi.' });
  }

  const isCorrect = String(q.correctAnswer).trim().toLowerCase() === String(answer).trim().toLowerCase();
  res.json({
    isCorrect,
    explanation: q.explanation,
    correctAnswer: q.correctAnswer,
  });
});

// Quizzes
app.get('/api/quizzes', (req, res) => {
  const subjectId = req.query.subjectId as string;
  res.json(db.getQuizzes(subjectId));
});

app.get('/api/quizzes/:id', (req, res) => {
  const quiz = db.getQuizById(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Viktorina topilmadi.' });
  res.json(quiz);
});

app.post('/api/quizzes/generate', async (req, res) => {
  const { subject, topic, count, difficulty } = req.body;
  const questionCount = parseInt(count || '5', 10);
  
  const generatedQuestions = await generateQuizQuestionsWithAI(subject || 'Umumiy fan', topic || 'Mavzu', questionCount);

  const newQuiz = db.addQuiz({
    id: `quiz-ai-${Date.now()}`,
    title: `${topic || subject}: AI Viktorinasi`,
    subjectId: subject?.toLowerCase().replace(/\s+/g, '-') || 'general',
    description: `Sun'iy intellekt tomonidan maxsus generatsiya qilingan ${questionCount} ta savoldan iborat test.`,
    difficulty: difficulty || 'intermediate',
    questionsCount: generatedQuestions.length,
    timeLimitMinutes: Math.max(5, Math.round(generatedQuestions.length * 1.5)),
    isAiGenerated: true,
    questions: generatedQuestions,
  });

  res.json(newQuiz);
});

app.post('/api/quizzes/:id/submit', (req, res) => {
  const user = getAuthUser(req);
  const quiz = db.getQuizById(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Viktorina topilmadi.' });

  const { answers, timeTakenSeconds } = req.body; // array of { questionId, selectedIndex }
  let correctCount = 0;

  const evaluatedAnswers = (answers || []).map((ans: any) => {
    const q = quiz.questions.find(question => question.id === ans.questionId);
    const isCorrect = q ? q.correctIndex === ans.selectedIndex : false;
    if (isCorrect) correctCount += 1;
    return {
      questionId: ans.questionId,
      selectedIndex: ans.selectedIndex,
      isCorrect,
    };
  });

  const percentage = Math.round((correctCount / quiz.questions.length) * 100);

  const attempt = db.recordQuizAttempt({
    id: `attempt-${Date.now()}`,
    quizId: quiz.id,
    userId: user.id,
    score: correctCount,
    maxScore: quiz.questions.length,
    percentage,
    timeTakenSeconds: timeTakenSeconds || 120,
    completedAt: new Date().toISOString(),
    answers: evaluatedAnswers,
  });

  res.json({
    attempt,
    percentage,
    correctCount,
    totalQuestions: quiz.questions.length,
    xpEarned: correctCount * 20,
  });
});

// Flashcards
app.get('/api/flashcards', (req, res) => {
  res.json(db.getFlashcards());
});

app.post('/api/flashcards', (req, res) => {
  const { subjectId, topic, front, back } = req.body;
  if (!front || !back) {
    return res.status(400).json({ error: "Old va orqa tomon matnlari kerak." });
  }
  const fc = db.addFlashcard({
    id: `fc-${Date.now()}`,
    subjectId: subjectId || 'general',
    topic: topic || 'Umumiy',
    front,
    back,
    masteryLevel: 0,
    reviewCount: 0,
  });
  res.json(fc);
});

app.post('/api/flashcards/:id/review', (req, res) => {
  const { result } = req.body;
  const updated = db.reviewFlashcard(req.params.id, result);
  res.json(updated);
});

// Bookmarks & Notes
app.get('/api/bookmarks', (req, res) => {
  res.json(db.getBookmarks());
});

app.post('/api/bookmarks', (req, res) => {
  const { type, title, subjectName, refId } = req.body;
  const bm = db.addBookmark({
    id: `bm-${Date.now()}`,
    type: type || 'topic',
    title,
    subjectName: subjectName || 'Umumiy',
    refId,
    createdAt: new Date().toISOString(),
  });
  res.json(bm);
});

app.delete('/api/bookmarks/:id', (req, res) => {
  db.removeBookmark(req.params.id);
  res.json({ success: true });
});

app.get('/api/notes', (req, res) => {
  res.json(db.getNotes());
});

app.post('/api/notes', (req, res) => {
  const { title, content, subjectId } = req.body;
  const note = db.addNote({
    id: `note-${Date.now()}`,
    title: title || 'Yangi qaydnoma',
    content: content || '',
    subjectId: subjectId || 'general',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  res.json(note);
});

app.delete('/api/notes/:id', (req, res) => {
  db.deleteNote(req.params.id);
  res.json({ success: true });
});

// Analytics & Achievements
app.get('/api/analytics', (req, res) => {
  const user = getAuthUser(req);
  res.json(db.getAnalytics(user.id));
});

app.post('/api/analytics/streak/check-in', (req, res) => {
  const user = getAuthUser(req);
  const result = db.checkInStreak(user.id);
  res.json({
    success: true,
    user: db.getUserById(user.id),
    streak: result?.streak || user.streak,
    xpEarned: 50,
  });
});

app.get('/api/achievements', (req, res) => {
  res.json(db.getAchievements());
});

// Admin panel routes
app.get('/api/admin/stats', (req, res) => {
  const user = getAuthUser(req);
  if (user.role !== 'admin') {
    return res.status(403).json({ error: "Ruxsat etilmagan: Faqat administratorlar uchun." });
  }

  res.json({
    totalUsers: db.getUsers().length,
    totalSubjects: db.getSubjects().length,
    totalTopics: db.getTopics().length,
    totalQuizzes: db.getQuizzes().length,
    aiGeneratedQuizzes: db.getQuizzes().filter(q => q.isAiGenerated).length,
  });
});

app.get('/api/admin/users', (req, res) => {
  const user = getAuthUser(req);
  if (user.role !== 'admin') {
    return res.status(403).json({ error: "Ruxsat etilmagan." });
  }
  res.json(db.getUsers());
});

app.post('/api/admin/topics', (req, res) => {
  const user = getAuthUser(req);
  if (user.role !== 'admin') {
    return res.status(403).json({ error: "Ruxsat etilmagan." });
  }

  const { titleUz, subjectId, descriptionUz, level, contentUz } = req.body;
  const newTopic = db.addTopic({
    id: `topic-${Date.now()}`,
    subjectId: subjectId || 'math',
    titleUz,
    titleEn: titleUz,
    descriptionUz,
    level: level || 'intermediate',
    grade: 10,
    estimatedMinutes: 25,
    completed: false,
    prerequisites: [],
    objectivesUz: ['Mavzuni to\'liq o\'zlashtirish'],
    contentUz: contentUz || 'Mavzu kontenti tayyorlanmoqda.',
  });

  res.json(newTopic);
});

app.delete('/api/admin/topics/:id', (req, res) => {
  const user = getAuthUser(req);
  if (user.role !== 'admin') {
    return res.status(403).json({ error: "Ruxsat etilmagan." });
  }
  db.deleteTopic(req.params.id);
  res.json({ success: true });
});

// --- CLIENT SERVING ---

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Nexora AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start Nexora server:", err);
});
