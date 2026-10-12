import { pgTable, text, serial, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash'),
  role: text('role').notNull().default('student'), // 'student' | 'admin'
  grade: text('grade').default('10-sinf'),
  avatar: text('avatar').default('https://api.dicebear.com/7.x/bottts/svg?seed=nexora'),
  xp: integer('xp').default(0),
  streak: integer('streak').default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Subjects table
export const subjects = pgTable('subjects', {
  id: text('id').primaryKey(),
  nameUz: text('name_uz').notNull(),
  nameEn: text('name_en').notNull(),
  nameRu: text('name_ru').notNull(),
  category: text('category').notNull(),
  icon: text('icon').notNull(),
  descriptionUz: text('description_uz').notNull(),
  color: text('color').notNull(),
  gradient: text('gradient').notNull(),
  topicsCount: integer('topics_count').default(0),
  lessonsCount: integer('lessons_count').default(0),
});

// Topics table
export const topics = pgTable('topics', {
  id: text('id').primaryKey(),
  subjectId: text('subject_id').references(() => subjects.id).notNull(),
  titleUz: text('title_uz').notNull(),
  titleEn: text('title_en').notNull(),
  descriptionUz: text('description_uz').notNull(),
  level: text('level').notNull().default('intermediate'),
  grade: integer('grade').default(10),
  estimatedMinutes: integer('estimated_minutes').default(25),
  prerequisites: jsonb('prerequisites').default([]),
  objectivesUz: jsonb('objectives_uz').default([]),
  keyFormulas: jsonb('key_formulas').default([]),
  contentUz: text('content_uz').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Conversations table
export const conversations = pgTable('conversations', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  title: text('title').notNull(),
  subjectId: text('subject_id').references(() => subjects.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Messages table
export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  conversationId: text('conversation_id').references(() => conversations.id).notNull(),
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(),
  subjectId: text('subject_id'),
  difficulty: text('difficulty'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Quizzes table
export const quizzes = pgTable('quizzes', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  subjectId: text('subject_id').references(() => subjects.id).notNull(),
  topicId: text('topic_id').references(() => topics.id),
  description: text('description').notNull(),
  difficulty: text('difficulty').notNull().default('intermediate'),
  questionsCount: integer('questions_count').notNull(),
  timeLimitMinutes: integer('time_limit_minutes').notNull().default(15),
  isAiGenerated: boolean('is_ai_generated').default(false),
  isReviewed: boolean('is_reviewed').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Questions table
export const questions = pgTable('questions', {
  id: text('id').primaryKey(),
  quizId: text('quiz_id').references(() => quizzes.id).notNull(),
  questionText: text('question_text').notNull(),
  options: jsonb('options').notNull(),
  correctIndex: integer('correct_index').notNull(),
  explanation: text('explanation').notNull(),
  hint: text('hint'),
});

// Quiz attempts table
export const quizAttempts = pgTable('quiz_attempts', {
  id: text('id').primaryKey(),
  quizId: text('quiz_id').references(() => quizzes.id).notNull(),
  userId: text('user_id').references(() => users.uid).notNull(),
  score: integer('score').notNull(),
  maxScore: integer('max_score').notNull(),
  percentage: integer('percentage').notNull(),
  timeTakenSeconds: integer('time_taken_seconds').notNull(),
  answers: jsonb('answers').notNull(),
  completedAt: timestamp('completed_at').defaultNow(),
});

// Notes table
export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  subjectId: text('subject_id').references(() => subjects.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Bookmarks table
export const bookmarks = pgTable('bookmarks', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  subjectName: text('subject_name').notNull(),
  refId: text('ref_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Flashcards table
export const flashcards = pgTable('flashcards', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  subjectId: text('subject_id').references(() => subjects.id).notNull(),
  topic: text('topic').notNull(),
  front: text('front').notNull(),
  back: text('back').notNull(),
  masteryLevel: integer('mastery_level').default(0),
  reviewCount: integer('review_count').default(0),
  lastReviewed: timestamp('last_reviewed'),
});

// Progress table
export const userProgress = pgTable('user_progress', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  topicId: text('topic_id').references(() => topics.id).notNull(),
  completed: boolean('completed').default(false),
  studyMinutes: integer('study_minutes').default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }: { many: any }) => ({
  conversations: many(conversations),
  quizAttempts: many(quizAttempts),
  notes: many(notes),
  bookmarks: many(bookmarks),
  flashcards: many(flashcards),
  progress: many(userProgress),
}));

export const subjectsRelations = relations(subjects, ({ many }: { many: any }) => ({
  topics: many(topics),
  quizzes: many(quizzes),
}));

export const topicsRelations = relations(topics, ({ one, many }: { one: any; many: any }) => ({
  subject: one(subjects, { fields: [topics.subjectId], references: [subjects.id] }),
  quizzes: many(quizzes),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }: { one: any; many: any }) => ({
  subject: one(subjects, { fields: [quizzes.subjectId], references: [subjects.id] }),
  topic: one(topics, { fields: [quizzes.topicId], references: [topics.id] }),
  questions: many(questions),
  attempts: many(quizAttempts),
}));
