/**
 * Seed data for BusQuiz.
 * Extracted into a separate module so unit tests can import and validate
 * the data shapes without running a database.
 *
 * Trivia content is authored inline in the style of Open Trivia DB (opentdb.com)
 * — no live API calls are made.
 */

// ---------------------------------------------------------------------------
// Type aliases mirroring Prisma enums (stored as String in SQLite)
// ---------------------------------------------------------------------------
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD'
export type QuestionType = 'SINGLE' | 'MULTIPLE' | 'TRUEFALSE' | 'FILL_BLANK'
export type Role = 'USER' | 'ADMIN'

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export interface CategoryData {
  slug: string
  name: string
  description: string
  icon: string // lucide icon name
  color: string // hex color
  parentSlug?: string
}

// ---------------------------------------------------------------------------
// Parent categories (no parentSlug)
// ---------------------------------------------------------------------------
export const categories: CategoryData[] = [
  {
    slug: 'science',
    name: 'Science',
    description: 'Physics, chemistry, biology and beyond',
    icon: 'FlaskConical',
    color: '#3b82f6',
  },
  {
    slug: 'history',
    name: 'History',
    description: 'Civilizations, wars, and turning points',
    icon: 'Landmark',
    color: '#d97706',
  },
  {
    slug: 'arts-culture',
    name: 'Arts & Culture',
    description: 'Film, music, literature, and more',
    icon: 'Palette',
    color: '#ec4899',
  },
  {
    slug: 'geography',
    name: 'Geography',
    description: 'Countries, capitals, and landscapes',
    icon: 'Globe',
    color: '#10b981',
  },
  {
    slug: 'sports',
    name: 'Sports',
    description: 'Athletes, records, and iconic moments',
    icon: 'Trophy',
    color: '#f97316',
  },
  {
    slug: 'technology',
    name: 'Technology',
    description: 'Software, hardware, and the digital world',
    icon: 'Cpu',
    color: '#8b5cf6',
  },
  {
    slug: 'entertainment',
    name: 'Entertainment',
    description: 'Games, anime, TV shows, and pop culture',
    icon: 'Tv',
    color: '#06b6d4',
  },
  {
    slug: 'lifestyle',
    name: 'Lifestyle',
    description: 'Food, travel, fashion, and wellness',
    icon: 'Heart',
    color: '#f43f5e',
  },
  {
    slug: 'general',
    name: 'General Knowledge',
    description: 'A little bit of everything',
    icon: 'Brain',
    color: '#64748b',
  },

  // ---------------------------------------------------------------------------
  // Science subcategories
  // ---------------------------------------------------------------------------
  {
    slug: 'physics',
    name: 'Physics',
    description: 'Forces, energy, and the universe',
    icon: 'Atom',
    color: '#60a5fa',
    parentSlug: 'science',
  },
  {
    slug: 'biology',
    name: 'Biology',
    description: 'Life, cells, and evolution',
    icon: 'Leaf',
    color: '#34d399',
    parentSlug: 'science',
  },
  {
    slug: 'chemistry',
    name: 'Chemistry',
    description: 'Elements, reactions, and compounds',
    icon: 'TestTube',
    color: '#a78bfa',
    parentSlug: 'science',
  },
  {
    slug: 'space',
    name: 'Space & Astronomy',
    description: 'Stars, planets, and galaxies',
    icon: 'Star',
    color: '#818cf8',
    parentSlug: 'science',
  },
  {
    slug: 'nature',
    name: 'Nature & Environment',
    description: 'Ecosystems and wildlife',
    icon: 'TreePine',
    color: '#4ade80',
    parentSlug: 'science',
  },

  // ---------------------------------------------------------------------------
  // History subcategories
  // ---------------------------------------------------------------------------
  {
    slug: 'ancient-history',
    name: 'Ancient History',
    description: 'Egypt, Greece, Rome',
    icon: 'Scroll',
    color: '#fbbf24',
    parentSlug: 'history',
  },
  {
    slug: 'world-wars',
    name: 'World Wars',
    description: 'WWI & WWII',
    icon: 'Shield',
    color: '#ef4444',
    parentSlug: 'history',
  },
  {
    slug: 'us-history',
    name: 'US History',
    description: 'Revolution to modern day',
    icon: 'Flag',
    color: '#f59e0b',
    parentSlug: 'history',
  },
  {
    slug: 'world-history',
    name: 'World History',
    description: 'Global civilizations',
    icon: 'Landmark',
    color: '#d97706',
    parentSlug: 'history',
  },
  {
    slug: 'mythology',
    name: 'Mythology',
    description: 'Gods, heroes, and legends',
    icon: 'Sparkles',
    color: '#fb923c',
    parentSlug: 'history',
  },

  // ---------------------------------------------------------------------------
  // Arts & Culture subcategories
  // ---------------------------------------------------------------------------
  {
    slug: 'movies',
    name: 'Movies',
    description: 'Cinema, directors, and classics',
    icon: 'Clapperboard',
    color: '#f472b6',
    parentSlug: 'arts-culture',
  },
  {
    slug: 'music',
    name: 'Music',
    description: 'Genres, artists, and lyrics',
    icon: 'Music',
    color: '#4ade80',
    parentSlug: 'arts-culture',
  },
  {
    slug: 'literature',
    name: 'Literature',
    description: 'Books, authors, and poetry',
    icon: 'BookOpen',
    color: '#fb923c',
    parentSlug: 'arts-culture',
  },
  {
    slug: 'art',
    name: 'Visual Art',
    description: 'Paintings, sculpture, and artists',
    icon: 'Brush',
    color: '#e879f9',
    parentSlug: 'arts-culture',
  },
  {
    slug: 'theatre',
    name: 'Theatre & Broadway',
    description: 'Stage, musicals, and drama',
    icon: 'Drama',
    color: '#a78bfa',
    parentSlug: 'arts-culture',
  },

  // ---------------------------------------------------------------------------
  // Geography subcategories
  // ---------------------------------------------------------------------------
  {
    slug: 'capitals',
    name: 'World Capitals',
    description: 'Capitals of every nation',
    icon: 'MapPin',
    color: '#34d399',
    parentSlug: 'geography',
  },
  {
    slug: 'flags',
    name: 'Flags of the World',
    description: 'Identify flags and emblems',
    icon: 'Flag',
    color: '#22d3ee',
    parentSlug: 'geography',
  },
  {
    slug: 'europe',
    name: 'Europe',
    description: 'Countries, cities, culture',
    icon: 'Globe',
    color: '#60a5fa',
    parentSlug: 'geography',
  },
  {
    slug: 'asia',
    name: 'Asia',
    description: 'Vast continent, diverse cultures',
    icon: 'Globe',
    color: '#f97316',
    parentSlug: 'geography',
  },
  {
    slug: 'americas',
    name: 'Americas',
    description: 'North, Central & South',
    icon: 'Globe',
    color: '#84cc16',
    parentSlug: 'geography',
  },

  // ---------------------------------------------------------------------------
  // Sports subcategories
  // ---------------------------------------------------------------------------
  {
    slug: 'football',
    name: 'Football / Soccer',
    description: "World's most popular sport",
    icon: 'CircleDot',
    color: '#4ade80',
    parentSlug: 'sports',
  },
  {
    slug: 'basketball',
    name: 'Basketball',
    description: 'NBA, FIBA, legends',
    icon: 'CircleDot',
    color: '#fb923c',
    parentSlug: 'sports',
  },
  {
    slug: 'american-football',
    name: 'American Football',
    description: 'NFL and college',
    icon: 'CircleDot',
    color: '#f87171',
    parentSlug: 'sports',
  },
  {
    slug: 'tennis',
    name: 'Tennis',
    description: 'Grand slams and champions',
    icon: 'CircleDot',
    color: '#a3e635',
    parentSlug: 'sports',
  },
  {
    slug: 'olympics',
    name: 'Olympics',
    description: 'Summer, winter, history',
    icon: 'Trophy',
    color: '#fbbf24',
    parentSlug: 'sports',
  },

  // ---------------------------------------------------------------------------
  // Technology subcategories
  // ---------------------------------------------------------------------------
  {
    slug: 'programming',
    name: 'Programming',
    description: 'Languages, algorithms, code',
    icon: 'Code',
    color: '#818cf8',
    parentSlug: 'technology',
  },
  {
    slug: 'internet',
    name: 'Internet & Web',
    description: 'Protocols, browsers, web history',
    icon: 'Wifi',
    color: '#67e8f9',
    parentSlug: 'technology',
  },
  {
    slug: 'ai',
    name: 'AI & Machine Learning',
    description: 'Models, concepts, history',
    icon: 'Bot',
    color: '#c084fc',
    parentSlug: 'technology',
  },
  {
    slug: 'gadgets',
    name: 'Gadgets & Hardware',
    description: 'Devices and innovation',
    icon: 'Cpu',
    color: '#a78bfa',
    parentSlug: 'technology',
  },
  {
    slug: 'video-games-tech',
    name: 'Gaming Tech',
    description: 'Engines, hardware, history',
    icon: 'Gamepad2',
    color: '#f0abfc',
    parentSlug: 'technology',
  },

  // ---------------------------------------------------------------------------
  // Entertainment subcategories
  // ---------------------------------------------------------------------------
  {
    slug: 'video-games',
    name: 'Video Games',
    description: 'Consoles, titles, characters',
    icon: 'Gamepad2',
    color: '#22d3ee',
    parentSlug: 'entertainment',
  },
  {
    slug: 'anime',
    name: 'Anime & Manga',
    description: 'Japanese animation and comics',
    icon: 'Sparkles',
    color: '#f472b6',
    parentSlug: 'entertainment',
  },
  {
    slug: 'tv-shows',
    name: 'TV Shows',
    description: 'Series, characters, plots',
    icon: 'Tv',
    color: '#a3e635',
    parentSlug: 'entertainment',
  },
  {
    slug: 'celebrities',
    name: 'Celebrities',
    description: 'Famous faces and pop culture',
    icon: 'Star',
    color: '#fbbf24',
    parentSlug: 'entertainment',
  },
  {
    slug: 'memes',
    name: 'Internet & Memes',
    description: 'Online culture and humor',
    icon: 'Laugh',
    color: '#f97316',
    parentSlug: 'entertainment',
  },

  // ---------------------------------------------------------------------------
  // Lifestyle subcategories
  // ---------------------------------------------------------------------------
  {
    slug: 'food-drink',
    name: 'Food & Drink',
    description: 'Cuisine, recipes, beverages',
    icon: 'UtensilsCrossed',
    color: '#f97316',
    parentSlug: 'lifestyle',
  },
  {
    slug: 'travel',
    name: 'Travel',
    description: 'Destinations, landmarks, tips',
    icon: 'Plane',
    color: '#22d3ee',
    parentSlug: 'lifestyle',
  },
  {
    slug: 'fashion',
    name: 'Fashion & Style',
    description: 'Trends, designers, history',
    icon: 'Shirt',
    color: '#f472b6',
    parentSlug: 'lifestyle',
  },
  {
    slug: 'health',
    name: 'Health & Wellness',
    description: 'Body, fitness, nutrition',
    icon: 'Heart',
    color: '#4ade80',
    parentSlug: 'lifestyle',
  },
  {
    slug: 'animals',
    name: 'Animals & Pets',
    description: 'Species, behavior, facts',
    icon: 'PawPrint',
    color: '#fb923c',
    parentSlug: 'lifestyle',
  },

  // ---------------------------------------------------------------------------
  // General Knowledge subcategories
  // ---------------------------------------------------------------------------
  {
    slug: 'trivia',
    name: 'Mixed Trivia',
    description: 'Random knowledge test',
    icon: 'HelpCircle',
    color: '#94a3b8',
    parentSlug: 'general',
  },
  {
    slug: 'language',
    name: 'Language & Words',
    description: 'Grammar, vocab, etymology',
    icon: 'Languages',
    color: '#60a5fa',
    parentSlug: 'general',
  },
  {
    slug: 'math',
    name: 'Math & Logic',
    description: 'Numbers, puzzles, reasoning',
    icon: 'Calculator',
    color: '#4ade80',
    parentSlug: 'general',
  },
  {
    slug: 'religion',
    name: 'Religion & Philosophy',
    description: 'Beliefs and thinkers',
    icon: 'BookOpen',
    color: '#d97706',
    parentSlug: 'general',
  },
]

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------
export interface BadgeData {
  slug: string
  name: string
  description: string
  icon: string
  criteria: object
}

export const badges: BadgeData[] = [
  {
    slug: 'first-win',
    name: 'First Win',
    description: 'Complete your first quiz',
    icon: 'Star',
    criteria: { type: 'wins', count: 1 },
  },
  {
    slug: 'perfect-score',
    name: 'Perfect Score',
    description: 'Answer every question correctly in a quiz',
    icon: 'Award',
    criteria: { type: 'perfectScore' },
  },
  {
    slug: 'streak-7',
    name: '7-Day Streak',
    description: 'Play every day for 7 days in a row',
    icon: 'Flame',
    criteria: { type: 'streak', days: 7 },
  },
  {
    slug: 'streak-30',
    name: '30-Day Streak',
    description: 'Maintain a 30-day play streak',
    icon: 'Zap',
    criteria: { type: 'streak', days: 30 },
  },
  {
    slug: 'quiz-author',
    name: 'Quiz Author',
    description: 'Create your first quiz',
    icon: 'PenLine',
    criteria: { type: 'quizzesAuthored', count: 1 },
  },
  {
    slug: 'category-master-science',
    name: 'Science Master',
    description: 'Complete 10 science quizzes',
    icon: 'FlaskConical',
    criteria: { type: 'categoryMaster', categorySlug: 'science', minQuizzes: 10 },
  },
  {
    slug: 'speed-demon',
    name: 'Speed Demon',
    description: 'Average answer time under 5 seconds',
    icon: 'Timer',
    criteria: { type: 'avgAnswerMs', lt: 5000 },
  },
  {
    slug: 'night-owl',
    name: 'Night Owl',
    description: 'Play between midnight and 5 AM',
    icon: 'Moon',
    criteria: { type: 'playedBetween', fromHour: 0, toHour: 5 },
  },
  {
    slug: 'centurion',
    name: 'Centurion',
    description: 'Complete 100 quizzes',
    icon: 'Shield',
    criteria: { type: 'playsCount', count: 100 },
  },
]

// ---------------------------------------------------------------------------
// Demo users
// ---------------------------------------------------------------------------
export interface UserData {
  id: string
  name: string
  username: string
  email: string
  role: Role
  xp: number
  level: number
  streakDays: number
  bestStreak: number
}

export const users: UserData[] = [
  {
    id: 'user_admin_busquiz',
    name: 'Admin Demo',
    username: 'admin-demo',
    email: 'admin@busquiz.com',
    role: 'ADMIN',
    xp: 99999,
    level: 44,
    streakDays: 365,
    bestStreak: 365,
  },
  {
    id: 'user_demo_alice',
    name: 'Alice Chen',
    username: 'alice-chen',
    email: 'alice@busquiz.com',
    role: 'USER',
    xp: 12450,
    level: 16,
    streakDays: 14,
    bestStreak: 21,
  },
  {
    id: 'user_demo_bob',
    name: 'Bob Martinez',
    username: 'bob-martinez',
    email: 'bob@busquiz.com',
    role: 'USER',
    xp: 8200,
    level: 13,
    streakDays: 7,
    bestStreak: 12,
  },
  {
    id: 'user_demo_carol',
    name: 'Carol Zhang',
    username: 'carol-zhang',
    email: 'carol@busquiz.com',
    role: 'USER',
    xp: 5100,
    level: 10,
    streakDays: 3,
    bestStreak: 9,
  },
  {
    id: 'user_demo_dave',
    name: 'Dave Okonkwo',
    username: 'dave-okonkwo',
    email: 'demo@busquiz.com',
    role: 'USER',
    xp: 2300,
    level: 7,
    streakDays: 1,
    bestStreak: 4,
  },
]

// ---------------------------------------------------------------------------
// Quiz definitions (title, description, difficulty per category)
// ---------------------------------------------------------------------------
export interface QuizDef {
  title: string
  description: string
  difficulty: Difficulty
  categorySlug: string
  authorId: string
  playCount: number
  avgScore: number
}

export const quizDefs: QuizDef[] = [
  // Physics
  {
    title: 'Elementary Physics',
    description: 'Newton, forces, and basic mechanics',
    difficulty: 'EASY',
    categorySlug: 'physics',
    authorId: 'user_admin_busquiz',
    playCount: 1203,
    avgScore: 72.4,
  },
  {
    title: 'Periodic Table Challenge',
    description: 'Elements, symbols, and atomic numbers',
    difficulty: 'MEDIUM',
    categorySlug: 'physics',
    authorId: 'user_demo_alice',
    playCount: 876,
    avgScore: 61.8,
  },
  {
    title: 'Quantum Mechanics & Relativity',
    description: 'Advanced physics for the curious mind',
    difficulty: 'HARD',
    categorySlug: 'physics',
    authorId: 'user_admin_busquiz',
    playCount: 412,
    avgScore: 48.2,
  },

  // World History
  {
    title: 'Ancient Civilizations',
    description: 'Egypt, Rome, Greece, and Mesopotamia',
    difficulty: 'EASY',
    categorySlug: 'world-history',
    authorId: 'user_admin_busquiz',
    playCount: 934,
    avgScore: 68.5,
  },
  {
    title: 'World War II',
    description: 'Key battles, leaders, and turning points',
    difficulty: 'MEDIUM',
    categorySlug: 'world-history',
    authorId: 'user_demo_bob',
    playCount: 1547,
    avgScore: 65.0,
  },
  {
    title: 'Cold War & Modern History',
    description: 'Post-WWII geopolitics and the space race',
    difficulty: 'HARD',
    categorySlug: 'world-history',
    authorId: 'user_admin_busquiz',
    playCount: 389,
    avgScore: 53.1,
  },

  // Movies
  {
    title: 'Classic Hollywood',
    description: 'Golden age films and legendary directors',
    difficulty: 'EASY',
    categorySlug: 'movies',
    authorId: 'user_demo_alice',
    playCount: 1102,
    avgScore: 74.2,
  },
  {
    title: 'Marvel Cinematic Universe',
    description: 'Heroes, villains, and Easter eggs',
    difficulty: 'MEDIUM',
    categorySlug: 'movies',
    authorId: 'user_admin_busquiz',
    playCount: 2341,
    avgScore: 69.8,
  },
  {
    title: 'Oscar Best Pictures',
    description: 'Academy Award winners through the decades',
    difficulty: 'HARD',
    categorySlug: 'movies',
    authorId: 'user_demo_carol',
    playCount: 567,
    avgScore: 51.3,
  },

  // Music
  {
    title: 'Pop Hits Through the Decades',
    description: 'Chart-toppers from the 60s to today',
    difficulty: 'EASY',
    categorySlug: 'music',
    authorId: 'user_admin_busquiz',
    playCount: 1893,
    avgScore: 76.1,
  },
  {
    title: 'Rock Legends',
    description: 'Bands, albums, and iconic riffs',
    difficulty: 'MEDIUM',
    categorySlug: 'music',
    authorId: 'user_demo_alice',
    playCount: 1234,
    avgScore: 63.5,
  },
  {
    title: 'Classical Composers',
    description: 'Bach, Beethoven, Mozart, and their masterworks',
    difficulty: 'HARD',
    categorySlug: 'music',
    authorId: 'user_admin_busquiz',
    playCount: 298,
    avgScore: 44.7,
  },

  // Capitals
  {
    title: 'World Capitals',
    description: 'Can you name the capital of every country?',
    difficulty: 'EASY',
    categorySlug: 'capitals',
    authorId: 'user_demo_bob',
    playCount: 3201,
    avgScore: 70.9,
  },
  {
    title: 'Mountains & Rivers',
    description: 'Highest peaks and longest rivers worldwide',
    difficulty: 'MEDIUM',
    categorySlug: 'geography',
    authorId: 'user_admin_busquiz',
    playCount: 876,
    avgScore: 59.4,
  },
  {
    title: 'Political Borders & Flags',
    description: 'Nations, territories, and their symbols',
    difficulty: 'HARD',
    categorySlug: 'flags',
    authorId: 'user_demo_alice',
    playCount: 412,
    avgScore: 47.8,
  },

  // Football
  {
    title: 'Olympic Records',
    description: 'Gold medalists and world records',
    difficulty: 'EASY',
    categorySlug: 'olympics',
    authorId: 'user_admin_busquiz',
    playCount: 1567,
    avgScore: 73.2,
  },
  {
    title: 'Football World Cup',
    description: 'Winners, top scorers, and memorable moments',
    difficulty: 'MEDIUM',
    categorySlug: 'football',
    authorId: 'user_demo_dave',
    playCount: 2109,
    avgScore: 64.7,
  },
  {
    title: 'Niche Sports Trivia',
    description: 'Curling, polo, and more obscure athletics',
    difficulty: 'HARD',
    categorySlug: 'sports',
    authorId: 'user_admin_busquiz',
    playCount: 234,
    avgScore: 41.5,
  },

  // Programming
  {
    title: 'Internet Basics',
    description: 'How the web works, protocols, and browsers',
    difficulty: 'EASY',
    categorySlug: 'programming',
    authorId: 'user_demo_carol',
    playCount: 1456,
    avgScore: 77.3,
  },
  {
    title: 'Programming Languages',
    description: 'Syntax, paradigms, and language history',
    difficulty: 'MEDIUM',
    categorySlug: 'programming',
    authorId: 'user_admin_busquiz',
    playCount: 1876,
    avgScore: 62.1,
  },
  {
    title: 'Algorithms & Data Structures',
    description: 'Big-O, trees, graphs, and sorting',
    difficulty: 'HARD',
    categorySlug: 'programming',
    authorId: 'user_demo_alice',
    playCount: 678,
    avgScore: 49.6,
  },

  // Video Games
  {
    title: 'Console History',
    description: 'From Atari to PlayStation 5',
    difficulty: 'EASY',
    categorySlug: 'video-games',
    authorId: 'user_admin_busquiz',
    playCount: 2345,
    avgScore: 75.8,
  },
  {
    title: 'Nintendo Classics',
    description: 'Mario, Zelda, Pokémon, and Samus',
    difficulty: 'MEDIUM',
    categorySlug: 'video-games',
    authorId: 'user_demo_bob',
    playCount: 3102,
    avgScore: 68.4,
  },
  {
    title: 'Speedrunning & eSports',
    description: 'Records, tournaments, and legendary plays',
    difficulty: 'HARD',
    categorySlug: 'video-games',
    authorId: 'user_admin_busquiz',
    playCount: 567,
    avgScore: 52.3,
  },

  // Anime
  {
    title: 'Intro to Anime',
    description: 'Gateway series and beloved characters',
    difficulty: 'EASY',
    categorySlug: 'anime',
    authorId: 'user_demo_alice',
    playCount: 2789,
    avgScore: 80.1,
  },
  {
    title: 'Shonen Jump Classics',
    description: 'Dragon Ball, Naruto, One Piece, and more',
    difficulty: 'MEDIUM',
    categorySlug: 'anime',
    authorId: 'user_admin_busquiz',
    playCount: 3456,
    avgScore: 72.6,
  },
  {
    title: 'Studio Ghibli Deep Dive',
    description: 'Hidden details and obscure trivia',
    difficulty: 'HARD',
    categorySlug: 'anime',
    authorId: 'user_demo_carol',
    playCount: 789,
    avgScore: 55.9,
  },

  // Trivia
  {
    title: 'Everyday Trivia',
    description: 'Fun facts for the whole family',
    difficulty: 'EASY',
    categorySlug: 'trivia',
    authorId: 'user_admin_busquiz',
    playCount: 4567,
    avgScore: 79.5,
  },
  {
    title: 'Mixed Bag',
    description: 'History, science, pop culture — anything goes',
    difficulty: 'MEDIUM',
    categorySlug: 'trivia',
    authorId: 'user_demo_dave',
    playCount: 2890,
    avgScore: 66.3,
  },
  {
    title: 'Expert Knowledge',
    description: 'Only the most well-read will prevail',
    difficulty: 'HARD',
    categorySlug: 'trivia',
    authorId: 'user_admin_busquiz',
    playCount: 1023,
    avgScore: 50.7,
  },

  // ─── Biology ────────────────────────────────────────────────────
  {
    title: 'Cell Biology Basics',
    description: 'Organelles, membranes, and cellular functions',
    difficulty: 'EASY',
    categorySlug: 'biology',
    authorId: 'user_admin_busquiz',
    playCount: 1340,
    avgScore: 73.2,
  },
  {
    title: 'Human Anatomy',
    description: 'Bones, muscles, and organ systems',
    difficulty: 'MEDIUM',
    categorySlug: 'biology',
    authorId: 'user_demo_alice',
    playCount: 987,
    avgScore: 65.1,
  },
  {
    title: 'Genetics & DNA',
    description: 'Inheritance, genes, and molecular biology',
    difficulty: 'HARD',
    categorySlug: 'biology',
    authorId: 'user_admin_busquiz',
    playCount: 543,
    avgScore: 51.8,
  },

  // ─── Chemistry ──────────────────────────────────────────────────
  {
    title: 'Intro to Chemistry',
    description: 'Atoms, molecules, and basic reactions',
    difficulty: 'EASY',
    categorySlug: 'chemistry',
    authorId: 'user_demo_carol',
    playCount: 1120,
    avgScore: 70.4,
  },
  {
    title: 'Organic Chemistry',
    description: 'Carbon compounds and functional groups',
    difficulty: 'MEDIUM',
    categorySlug: 'chemistry',
    authorId: 'user_admin_busquiz',
    playCount: 654,
    avgScore: 58.9,
  },

  // ─── Space & Astronomy ──────────────────────────────────────────
  {
    title: 'Solar System Tour',
    description: 'Planets, moons, and our cosmic neighborhood',
    difficulty: 'EASY',
    categorySlug: 'space',
    authorId: 'user_demo_bob',
    playCount: 2103,
    avgScore: 78.5,
  },
  {
    title: 'Deep Space Phenomena',
    description: 'Black holes, supernovas, and dark matter',
    difficulty: 'HARD',
    categorySlug: 'space',
    authorId: 'user_admin_busquiz',
    playCount: 432,
    avgScore: 44.3,
  },

  // ─── Nature & Environment ───────────────────────────────────────
  {
    title: 'Ecosystems & Biomes',
    description: 'Rainforests, deserts, tundra, and oceans',
    difficulty: 'EASY',
    categorySlug: 'nature',
    authorId: 'user_demo_alice',
    playCount: 876,
    avgScore: 71.8,
  },

  // ─── Ancient History ────────────────────────────────────────────
  {
    title: 'Ancient Egypt',
    description: 'Pharaohs, pyramids, and the Nile',
    difficulty: 'EASY',
    categorySlug: 'ancient-history',
    authorId: 'user_admin_busquiz',
    playCount: 1654,
    avgScore: 74.6,
  },
  {
    title: 'The Roman Empire',
    description: 'Caesars, legions, and the Pax Romana',
    difficulty: 'MEDIUM',
    categorySlug: 'ancient-history',
    authorId: 'user_demo_bob',
    playCount: 1201,
    avgScore: 63.2,
  },

  // ─── World Wars ─────────────────────────────────────────────────
  {
    title: 'World War I',
    description: 'Trenches, alliances, and the Great War',
    difficulty: 'MEDIUM',
    categorySlug: 'world-wars',
    authorId: 'user_admin_busquiz',
    playCount: 987,
    avgScore: 67.3,
  },
  {
    title: 'WWII Major Battles',
    description: 'D-Day, Stalingrad, Midway, and more',
    difficulty: 'HARD',
    categorySlug: 'world-wars',
    authorId: 'user_demo_dave',
    playCount: 1456,
    avgScore: 55.1,
  },

  // ─── US History ─────────────────────────────────────────────────
  {
    title: 'American Revolution',
    description: 'Founding fathers and the birth of a nation',
    difficulty: 'EASY',
    categorySlug: 'us-history',
    authorId: 'user_demo_carol',
    playCount: 1340,
    avgScore: 71.2,
  },
  {
    title: 'Civil Rights Movement',
    description: 'Key figures and landmark events',
    difficulty: 'MEDIUM',
    categorySlug: 'us-history',
    authorId: 'user_admin_busquiz',
    playCount: 765,
    avgScore: 69.8,
  },

  // ─── Mythology ──────────────────────────────────────────────────
  {
    title: 'Greek Mythology',
    description: 'Olympian gods, heroes, and epic tales',
    difficulty: 'EASY',
    categorySlug: 'mythology',
    authorId: 'user_demo_alice',
    playCount: 2340,
    avgScore: 76.5,
  },

  // ─── Literature ─────────────────────────────────────────────────
  {
    title: 'Famous Novels',
    description: 'Classic books and their authors',
    difficulty: 'EASY',
    categorySlug: 'literature',
    authorId: 'user_admin_busquiz',
    playCount: 1123,
    avgScore: 72.4,
  },
  {
    title: 'Shakespeare & Co.',
    description: 'The Bard and his contemporaries',
    difficulty: 'MEDIUM',
    categorySlug: 'literature',
    authorId: 'user_demo_carol',
    playCount: 678,
    avgScore: 59.2,
  },

  // ─── Visual Art ─────────────────────────────────────────────────
  {
    title: 'Famous Paintings',
    description: 'Masterpieces from da Vinci to Van Gogh',
    difficulty: 'EASY',
    categorySlug: 'art',
    authorId: 'user_demo_alice',
    playCount: 901,
    avgScore: 68.7,
  },

  // ─── Theatre & Broadway ─────────────────────────────────────────
  {
    title: 'Broadway Musicals',
    description: 'Show tunes, casts, and Tony winners',
    difficulty: 'MEDIUM',
    categorySlug: 'theatre',
    authorId: 'user_admin_busquiz',
    playCount: 543,
    avgScore: 63.9,
  },

  // ─── Europe ─────────────────────────────────────────────────────
  {
    title: 'European Capitals',
    description: 'From Paris to Prague — know your cities',
    difficulty: 'EASY',
    categorySlug: 'europe',
    authorId: 'user_demo_bob',
    playCount: 1876,
    avgScore: 74.3,
  },
  {
    title: 'Europe History & Culture',
    description: 'Landmarks, languages, and traditions',
    difficulty: 'MEDIUM',
    categorySlug: 'europe',
    authorId: 'user_admin_busquiz',
    playCount: 654,
    avgScore: 61.5,
  },

  // ─── Asia ───────────────────────────────────────────────────────
  {
    title: 'Asian Geography',
    description: 'Countries, cities, and natural wonders',
    difficulty: 'MEDIUM',
    categorySlug: 'asia',
    authorId: 'user_demo_alice',
    playCount: 765,
    avgScore: 63.8,
  },
  {
    title: 'Asian History',
    description: 'Dynasties, empires, and modern nations',
    difficulty: 'HARD',
    categorySlug: 'asia',
    authorId: 'user_admin_busquiz',
    playCount: 321,
    avgScore: 48.7,
  },

  // ─── Landmarks ──────────────────────────────────────────────────
  {
    title: 'World Landmarks',
    description: 'Identify famous sites from every continent',
    difficulty: 'EASY',
    categorySlug: 'geography',
    authorId: 'user_demo_carol',
    playCount: 2109,
    avgScore: 75.1,
  },

  // ─── Basketball ─────────────────────────────────────────────────
  {
    title: 'NBA History',
    description: 'Legends, championships, and iconic moments',
    difficulty: 'EASY',
    categorySlug: 'basketball',
    authorId: 'user_demo_dave',
    playCount: 2456,
    avgScore: 72.5,
  },
  {
    title: 'Basketball Records',
    description: 'Scoring titles, triple-doubles, and MVPs',
    difficulty: 'MEDIUM',
    categorySlug: 'basketball',
    authorId: 'user_admin_busquiz',
    playCount: 1234,
    avgScore: 62.1,
  },

  // ─── Tennis ─────────────────────────────────────────────────────
  {
    title: 'Grand Slam Champions',
    description: 'Wimbledon, US Open, French Open, Australian Open',
    difficulty: 'EASY',
    categorySlug: 'tennis',
    authorId: 'user_demo_alice',
    playCount: 1102,
    avgScore: 71.3,
  },
  {
    title: 'Tennis Legends',
    description: 'Federer, Serena, Nadal, and more',
    difficulty: 'MEDIUM',
    categorySlug: 'tennis',
    authorId: 'user_admin_busquiz',
    playCount: 876,
    avgScore: 65.4,
  },

  // ─── Extreme Sports ─────────────────────────────────────────────
  {
    title: 'Extreme Sports',
    description: 'X Games, Red Bull, and adrenaline',
    difficulty: 'MEDIUM',
    categorySlug: 'sports',
    authorId: 'user_demo_bob',
    playCount: 432,
    avgScore: 58.7,
  },

  // ─── Motorsport ─────────────────────────────────────────────────
  {
    title: 'Formula 1',
    description: 'Teams, drivers, and race circuits',
    difficulty: 'MEDIUM',
    categorySlug: 'sports',
    authorId: 'user_admin_busquiz',
    playCount: 1567,
    avgScore: 63.2,
  },

  // ─── AI & Machine Learning ──────────────────────────────────────
  {
    title: 'AI Fundamentals',
    description: 'Neural networks, training, and applications',
    difficulty: 'MEDIUM',
    categorySlug: 'ai',
    authorId: 'user_demo_carol',
    playCount: 987,
    avgScore: 60.3,
  },
  {
    title: 'The History of Computing',
    description: 'From Turing to modern AI',
    difficulty: 'EASY',
    categorySlug: 'ai',
    authorId: 'user_admin_busquiz',
    playCount: 1456,
    avgScore: 68.9,
  },

  // ─── Internet ───────────────────────────────────────────────────
  {
    title: 'Internet History',
    description: 'ARPANET, dot-com boom, and social media',
    difficulty: 'EASY',
    categorySlug: 'internet',
    authorId: 'user_demo_alice',
    playCount: 1890,
    avgScore: 74.2,
  },
  {
    title: 'Web Technologies',
    description: 'HTTP, HTML, CSS, and how the web works',
    difficulty: 'MEDIUM',
    categorySlug: 'internet',
    authorId: 'user_admin_busquiz',
    playCount: 1234,
    avgScore: 62.5,
  },

  // ─── Cybersecurity ──────────────────────────────────────────────
  {
    title: 'Cybersecurity Basics',
    description: 'Encryption, phishing, and staying safe online',
    difficulty: 'EASY',
    categorySlug: 'internet',
    authorId: 'user_demo_bob',
    playCount: 876,
    avgScore: 69.1,
  },

  // ─── Gadgets ────────────────────────────────────────────────────
  {
    title: 'Tech Gadgets',
    description: 'Smartphones, wearables, and the latest devices',
    difficulty: 'EASY',
    categorySlug: 'gadgets',
    authorId: 'user_demo_carol',
    playCount: 1345,
    avgScore: 72.6,
  },

  // ─── TV Shows ───────────────────────────────────────────────────
  {
    title: 'Classic TV Shows',
    description: 'Sitcoms and dramas that defined television',
    difficulty: 'EASY',
    categorySlug: 'tv-shows',
    authorId: 'user_admin_busquiz',
    playCount: 2109,
    avgScore: 75.3,
  },
  {
    title: 'Binge-Worthy Series',
    description: 'Streaming hits and must-watch shows',
    difficulty: 'MEDIUM',
    categorySlug: 'tv-shows',
    authorId: 'user_demo_alice',
    playCount: 2876,
    avgScore: 69.8,
  },

  // ─── Podcasts ───────────────────────────────────────────────────
  {
    title: 'Popular Podcasts',
    description: 'True crime, comedy, and educational shows',
    difficulty: 'EASY',
    categorySlug: 'celebrities',
    authorId: 'user_demo_bob',
    playCount: 654,
    avgScore: 67.5,
  },

  // ─── Comics ─────────────────────────────────────────────────────
  {
    title: 'Comic Book Heroes',
    description: 'Marvel, DC, and indie superheroes',
    difficulty: 'EASY',
    categorySlug: 'anime',
    authorId: 'user_admin_busquiz',
    playCount: 1987,
    avgScore: 73.1,
  },

  // ─── Food ───────────────────────────────────────────────────────
  {
    title: 'World Cuisine',
    description: 'Dishes, ingredients, and culinary traditions',
    difficulty: 'EASY',
    categorySlug: 'food-drink',
    authorId: 'user_demo_alice',
    playCount: 2340,
    avgScore: 76.8,
  },
  {
    title: 'Cooking Techniques',
    description: 'Methods, tools, and kitchen science',
    difficulty: 'MEDIUM',
    categorySlug: 'food-drink',
    authorId: 'user_admin_busquiz',
    playCount: 876,
    avgScore: 63.4,
  },

  // ─── Travel ─────────────────────────────────────────────────────
  {
    title: 'Travel Destinations',
    description: 'Bucket-list places across the globe',
    difficulty: 'EASY',
    categorySlug: 'travel',
    authorId: 'user_demo_carol',
    playCount: 1876,
    avgScore: 72.1,
  },
  {
    title: 'Air Travel & Airlines',
    description: 'Airports, aircraft, and aviation history',
    difficulty: 'MEDIUM',
    categorySlug: 'travel',
    authorId: 'user_admin_busquiz',
    playCount: 543,
    avgScore: 60.5,
  },

  // ─── Health ─────────────────────────────────────────────────────
  {
    title: 'Nutrition & Wellness',
    description: 'Vitamins, diet, and healthy living',
    difficulty: 'EASY',
    categorySlug: 'health',
    authorId: 'user_demo_alice',
    playCount: 1234,
    avgScore: 71.9,
  },
  {
    title: 'Human Body Facts',
    description: 'Amazing things your body does every day',
    difficulty: 'MEDIUM',
    categorySlug: 'health',
    authorId: 'user_admin_busquiz',
    playCount: 987,
    avgScore: 65.2,
  },

  // ─── Fashion ────────────────────────────────────────────────────
  {
    title: 'Fashion Through the Ages',
    description: 'Trends, designers, and iconic looks',
    difficulty: 'EASY',
    categorySlug: 'fashion',
    authorId: 'user_demo_carol',
    playCount: 654,
    avgScore: 68.7,
  },

  // ─── Pets ───────────────────────────────────────────────────────
  {
    title: 'Dog Breeds',
    description: 'From Chihuahuas to Great Danes',
    difficulty: 'EASY',
    categorySlug: 'animals',
    authorId: 'user_demo_bob',
    playCount: 1876,
    avgScore: 74.5,
  },
  {
    title: 'Cats & Other Pets',
    description: 'Felines, birds, reptiles, and more',
    difficulty: 'EASY',
    categorySlug: 'animals',
    authorId: 'user_admin_busquiz',
    playCount: 1456,
    avgScore: 70.2,
  },

  // ─── Riddles ────────────────────────────────────────────────────
  {
    title: 'Brain Teasers',
    description: 'Logic puzzles and clever wordplay',
    difficulty: 'MEDIUM',
    categorySlug: 'math',
    authorId: 'user_demo_alice',
    playCount: 2109,
    avgScore: 67.3,
  },

  // ─── Fun Facts ──────────────────────────────────────────────────
  {
    title: 'Amazing Facts',
    description: 'Trivia that will surprise your friends',
    difficulty: 'EASY',
    categorySlug: 'trivia',
    authorId: 'user_admin_busquiz',
    playCount: 3456,
    avgScore: 77.1,
  },
]

// ---------------------------------------------------------------------------
// Questions per quiz (keyed by quiz title)
// ---------------------------------------------------------------------------
export interface ChoiceDef {
  text: string
  isCorrect: boolean
}

export interface QuestionDef {
  prompt: string
  type: QuestionType
  explanation: string
  timeLimitSec: number
  order: number
  choices: ChoiceDef[]
}

export const questionsByQuiz: Record<string, QuestionDef[]> = {
  'Elementary Physics': [
    {
      prompt: "What is Newton's First Law of Motion?",
      type: 'SINGLE',
      explanation:
        "Newton's First Law states that an object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.",
      timeLimitSec: 20,
      order: 1,
      choices: [
        {
          text: 'An object remains at rest or in uniform motion unless acted upon by a force',
          isCorrect: true,
        },
        { text: 'Force equals mass times acceleration', isCorrect: false },
        { text: 'Every action has an equal and opposite reaction', isCorrect: false },
        { text: 'Energy cannot be created or destroyed', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the unit of force in the International System of Units (SI)?',
      type: 'SINGLE',
      explanation: 'The SI unit of force is the Newton (N), named after Sir Isaac Newton.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'Newton (N)', isCorrect: true },
        { text: 'Joule (J)', isCorrect: false },
        { text: 'Watt (W)', isCorrect: false },
        { text: 'Pascal (Pa)', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Mass and weight are the same thing.',
      type: 'TRUEFALSE',
      explanation:
        'Mass is the amount of matter in an object (kg), while weight is the gravitational force acting on that mass (N). They differ by location.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
    {
      prompt: 'Which of the following are examples of potential energy?',
      type: 'MULTIPLE',
      explanation:
        'Potential energy is stored energy. A stretched spring and a raised weight both have gravitational or elastic potential energy.',
      timeLimitSec: 25,
      order: 4,
      choices: [
        { text: 'A stretched spring', isCorrect: true },
        { text: 'A raised weight', isCorrect: true },
        { text: 'A moving car', isCorrect: false },
        { text: 'Sound waves', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the acceleration due to gravity on Earth (approximately)?',
      type: 'FILL_BLANK',
      explanation:
        "The standard acceleration due to gravity on Earth's surface is approximately 9.8 m/s².",
      timeLimitSec: 20,
      order: 5,
      choices: [
        { text: '9.8 m/s²', isCorrect: true },
        { text: '9.81 m/s²', isCorrect: true },
        { text: '10 m/s²', isCorrect: false },
      ],
    },
    {
      prompt: 'What happens to kinetic energy when speed doubles?',
      type: 'SINGLE',
      explanation: 'Kinetic energy = ½mv². When speed doubles, KE quadruples because v is squared.',
      timeLimitSec: 20,
      order: 6,
      choices: [
        { text: 'It quadruples', isCorrect: true },
        { text: 'It doubles', isCorrect: false },
        { text: 'It stays the same', isCorrect: false },
        { text: 'It halves', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the speed of light in a vacuum?',
      type: 'SINGLE',
      explanation:
        'The speed of light in a vacuum is approximately 3 × 10⁸ m/s (299,792,458 m/s exactly).',
      timeLimitSec: 20,
      order: 7,
      choices: [
        { text: '3 × 10⁸ m/s', isCorrect: true },
        { text: '3 × 10⁶ m/s', isCorrect: false },
        { text: '3 × 10⁴ m/s', isCorrect: false },
        { text: '3 × 10¹⁰ m/s', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Sound can travel through a vacuum.',
      type: 'TRUEFALSE',
      explanation:
        'Sound is a mechanical wave that requires a medium (solid, liquid, or gas) to travel through. It cannot travel through a vacuum.',
      timeLimitSec: 15,
      order: 8,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
  ],

  'Periodic Table Challenge': [
    {
      prompt: 'What is the chemical symbol for Gold?',
      type: 'SINGLE',
      explanation: 'Gold\'s symbol Au comes from the Latin word "aurum".',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'Au', isCorrect: true },
        { text: 'Go', isCorrect: false },
        { text: 'Gd', isCorrect: false },
        { text: 'Gl', isCorrect: false },
      ],
    },
    {
      prompt: 'How many elements are in the periodic table (as of 2024)?',
      type: 'SINGLE',
      explanation:
        'There are 118 confirmed elements in the periodic table, the most recent being Oganesson (118).',
      timeLimitSec: 20,
      order: 2,
      choices: [
        { text: '118', isCorrect: true },
        { text: '108', isCorrect: false },
        { text: '128', isCorrect: false },
        { text: '92', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the lightest element?',
      type: 'SINGLE',
      explanation:
        'Hydrogen (H) is the lightest and most abundant element in the universe, with atomic number 1.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'Hydrogen', isCorrect: true },
        { text: 'Helium', isCorrect: false },
        { text: 'Lithium', isCorrect: false },
        { text: 'Carbon', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Noble gases are highly reactive.',
      type: 'TRUEFALSE',
      explanation:
        'Noble gases (Group 18) have full valence electron shells, making them extremely unreactive under normal conditions.',
      timeLimitSec: 15,
      order: 4,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
    {
      prompt: 'Which elements are classified as halogens?',
      type: 'MULTIPLE',
      explanation:
        'Halogens are Group 17 elements: Fluorine (F), Chlorine (Cl), Bromine (Br), Iodine (I), and Astatine (At).',
      timeLimitSec: 30,
      order: 5,
      choices: [
        { text: 'Chlorine (Cl)', isCorrect: true },
        { text: 'Fluorine (F)', isCorrect: true },
        { text: 'Oxygen (O)', isCorrect: false },
        { text: 'Nitrogen (N)', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the atomic number of Carbon?',
      type: 'SINGLE',
      explanation:
        'Carbon has atomic number 6, meaning it has 6 protons in its nucleus. It is the basis of all organic chemistry.',
      timeLimitSec: 15,
      order: 6,
      choices: [
        { text: '6', isCorrect: true },
        { text: '12', isCorrect: false },
        { text: '8', isCorrect: false },
        { text: '4', isCorrect: false },
      ],
    },
    {
      prompt: 'Which element has the symbol "Fe"?',
      type: 'SINGLE',
      explanation: 'Fe comes from the Latin "ferrum", meaning iron.',
      timeLimitSec: 15,
      order: 7,
      choices: [
        { text: 'Iron', isCorrect: true },
        { text: 'Fluorine', isCorrect: false },
        { text: 'Francium', isCorrect: false },
        { text: 'Fermium', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the chemical symbol for Water?',
      type: 'FILL_BLANK',
      explanation: 'Water is composed of two hydrogen atoms and one oxygen atom: H₂O.',
      timeLimitSec: 15,
      order: 8,
      choices: [
        { text: 'H2O', isCorrect: true },
        { text: 'HO2', isCorrect: false },
        { text: 'OH2', isCorrect: false },
      ],
    },
    {
      prompt: 'What period (row) is Sodium (Na) in on the periodic table?',
      type: 'SINGLE',
      explanation: 'Sodium (Na) is in Period 3, Group 1 of the periodic table.',
      timeLimitSec: 20,
      order: 9,
      choices: [
        { text: 'Period 3', isCorrect: true },
        { text: 'Period 2', isCorrect: false },
        { text: 'Period 4', isCorrect: false },
        { text: 'Period 1', isCorrect: false },
      ],
    },
  ],

  'Ancient Civilizations': [
    {
      prompt: 'Which river was central to the development of Ancient Egyptian civilization?',
      type: 'SINGLE',
      explanation:
        'The Nile River provided fertile land, water, and a transportation route that was essential for Ancient Egyptian civilization.',
      timeLimitSec: 20,
      order: 1,
      choices: [
        { text: 'The Nile', isCorrect: true },
        { text: 'The Euphrates', isCorrect: false },
        { text: 'The Tigris', isCorrect: false },
        { text: 'The Jordan', isCorrect: false },
      ],
    },
    {
      prompt: 'Who was the first Roman Emperor?',
      type: 'SINGLE',
      explanation:
        'Augustus (also known as Octavian) became the first Roman Emperor in 27 BC after defeating Mark Antony and Cleopatra.',
      timeLimitSec: 20,
      order: 2,
      choices: [
        { text: 'Augustus', isCorrect: true },
        { text: 'Julius Caesar', isCorrect: false },
        { text: 'Nero', isCorrect: false },
        { text: 'Caligula', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The Great Wall of China was built entirely during the Ming Dynasty.',
      type: 'TRUEFALSE',
      explanation:
        'While the Ming Dynasty (1368–1644) built much of the wall we see today, earlier walls were constructed during the Qin, Han, and other dynasties.',
      timeLimitSec: 20,
      order: 3,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
    {
      prompt: 'Which of the following were Seven Wonders of the Ancient World?',
      type: 'MULTIPLE',
      explanation:
        'The Seven Wonders included the Great Pyramid (still standing), the Hanging Gardens of Babylon, the Colossus of Rhodes, the Lighthouse of Alexandria, and others.',
      timeLimitSec: 30,
      order: 4,
      choices: [
        { text: 'Great Pyramid of Giza', isCorrect: true },
        { text: 'Colosseum in Rome', isCorrect: false },
        { text: 'Colossus of Rhodes', isCorrect: true },
        { text: 'Stonehenge', isCorrect: false },
      ],
    },
    {
      prompt: 'What civilization built Machu Picchu?',
      type: 'SINGLE',
      explanation:
        'Machu Picchu was built by the Inca civilization, constructed around 1450 CE at 2,430 meters above sea level in Peru.',
      timeLimitSec: 20,
      order: 5,
      choices: [
        { text: 'The Inca', isCorrect: true },
        { text: 'The Aztec', isCorrect: false },
        { text: 'The Maya', isCorrect: false },
        { text: 'The Olmec', isCorrect: false },
      ],
    },
    {
      prompt: 'In which city was Socrates born?',
      type: 'SINGLE',
      explanation:
        'Socrates was born in Athens, Greece around 470 BC. He is one of the founders of Western philosophy.',
      timeLimitSec: 20,
      order: 6,
      choices: [
        { text: 'Athens', isCorrect: true },
        { text: 'Sparta', isCorrect: false },
        { text: 'Corinth', isCorrect: false },
        { text: 'Thebes', isCorrect: false },
      ],
    },
    {
      prompt: 'What writing system did the ancient Egyptians use?',
      type: 'FILL_BLANK',
      explanation:
        'Ancient Egyptians used hieroglyphics, a complex writing system combining logographic and alphabetic elements.',
      timeLimitSec: 20,
      order: 7,
      choices: [
        { text: 'Hieroglyphics', isCorrect: true },
        { text: 'Hieroglyphs', isCorrect: true },
        { text: 'Cuneiform', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The Roman Empire at its peak extended into Britain.',
      type: 'TRUEFALSE',
      explanation:
        "Yes, at its peak the Roman Empire controlled much of Britain (Britannia). Hadrian's Wall marked the northern frontier.",
      timeLimitSec: 15,
      order: 8,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
  ],

  'World War II': [
    {
      prompt: 'In which year did World War II begin?',
      type: 'SINGLE',
      explanation:
        'World War II is generally considered to have begun on September 1, 1939, when Nazi Germany invaded Poland.',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: '1939', isCorrect: true },
        { text: '1941', isCorrect: false },
        { text: '1937', isCorrect: false },
        { text: '1940', isCorrect: false },
      ],
    },
    {
      prompt: 'What was the code name for the Allied invasion of Normandy?',
      type: 'SINGLE',
      explanation:
        'Operation Overlord was the code name for the Battle of Normandy. June 6, 1944 is known as D-Day — the largest seaborne invasion in history.',
      timeLimitSec: 20,
      order: 2,
      choices: [
        { text: 'Operation Overlord', isCorrect: true },
        { text: 'Operation Barbarossa', isCorrect: false },
        { text: 'Operation Sea Lion', isCorrect: false },
        { text: 'Operation Market Garden', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The United States entered WWII after the attack on Pearl Harbor.',
      type: 'TRUEFALSE',
      explanation:
        'Japan attacked Pearl Harbor on December 7, 1941, prompting the US to declare war on Japan the next day. Germany and Italy then declared war on the US.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'Which countries formed the main Axis powers in WWII?',
      type: 'MULTIPLE',
      explanation:
        'The main Axis powers were Germany, Italy, and Japan. They were formally allied through the Tripartite Pact signed in September 1940.',
      timeLimitSec: 25,
      order: 4,
      choices: [
        { text: 'Germany', isCorrect: true },
        { text: 'Italy', isCorrect: true },
        { text: 'Japan', isCorrect: true },
        { text: 'Soviet Union', isCorrect: false },
      ],
    },
    {
      prompt: 'Who was the Prime Minister of the United Kingdom for most of WWII?',
      type: 'SINGLE',
      explanation:
        'Winston Churchill served as UK Prime Minister from May 1940 to July 1945, leading Britain through most of the war.',
      timeLimitSec: 20,
      order: 5,
      choices: [
        { text: 'Winston Churchill', isCorrect: true },
        { text: 'Neville Chamberlain', isCorrect: false },
        { text: 'Clement Attlee', isCorrect: false },
        { text: 'Anthony Eden', isCorrect: false },
      ],
    },
    {
      prompt: 'What year did WWII end in Europe (V-E Day)?',
      type: 'SINGLE',
      explanation:
        "Victory in Europe Day (V-E Day) was May 8, 1945, marking Germany's unconditional surrender.",
      timeLimitSec: 15,
      order: 6,
      choices: [
        { text: '1945', isCorrect: true },
        { text: '1944', isCorrect: false },
        { text: '1946', isCorrect: false },
        { text: '1943', isCorrect: false },
      ],
    },
    {
      prompt: 'What was the name of the US project to develop atomic bombs during WWII?',
      type: 'FILL_BLANK',
      explanation:
        'The Manhattan Project was the secret US-led research project that produced the first nuclear weapons, culminating in the bombings of Hiroshima and Nagasaki.',
      timeLimitSec: 20,
      order: 7,
      choices: [
        { text: 'Manhattan Project', isCorrect: true },
        { text: 'The Manhattan Project', isCorrect: true },
        { text: 'Operation Trinity', isCorrect: false },
      ],
    },
    {
      prompt:
        'True or False: The Holocaust resulted in the deaths of approximately 6 million Jewish people.',
      type: 'TRUEFALSE',
      explanation:
        'Yes, approximately 6 million Jewish people were systematically murdered by Nazi Germany and its collaborators during the Holocaust.',
      timeLimitSec: 20,
      order: 8,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'Which battle is considered the turning point on the Eastern Front?',
      type: 'SINGLE',
      explanation:
        'The Battle of Stalingrad (1942–43) was the decisive turning point on the Eastern Front, ending in a Soviet victory and massive German losses.',
      timeLimitSec: 25,
      order: 9,
      choices: [
        { text: 'Battle of Stalingrad', isCorrect: true },
        { text: 'Battle of Kursk', isCorrect: false },
        { text: 'Operation Barbarossa', isCorrect: false },
        { text: 'Battle of Moscow', isCorrect: false },
      ],
    },
  ],

  'Marvel Cinematic Universe': [
    {
      prompt: 'Which film launched the Marvel Cinematic Universe in 2008?',
      type: 'SINGLE',
      explanation:
        'Iron Man (2008), directed by Jon Favreau and starring Robert Downey Jr., was the first film in the MCU.',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'Iron Man', isCorrect: true },
        { text: 'Thor', isCorrect: false },
        { text: 'Captain America: The First Avenger', isCorrect: false },
        { text: 'The Incredible Hulk', isCorrect: false },
      ],
    },
    {
      prompt: "What is the name of Thor's hammer?",
      type: 'SINGLE',
      explanation:
        "Thor's enchanted hammer is called Mjolnir, forged by dwarves in the heart of a dying star. Only those deemed worthy can lift it.",
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'Mjolnir', isCorrect: true },
        { text: 'Stormbreaker', isCorrect: false },
        { text: 'Gungnir', isCorrect: false },
        { text: 'Jarnbjorn', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Black Widow has superhuman strength due to a super-soldier serum.',
      type: 'TRUEFALSE',
      explanation:
        'False. Black Widow (Natasha Romanoff) has no superhuman powers — she relies on her elite spy training, combat skills, and technology.',
      timeLimitSec: 20,
      order: 3,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
    {
      prompt: 'Which Infinity Stones are yellow and orange?',
      type: 'MULTIPLE',
      explanation:
        'The Mind Stone is yellow and the Soul Stone is orange. There are six Infinity Stones in total.',
      timeLimitSec: 25,
      order: 4,
      choices: [
        { text: 'Mind Stone', isCorrect: true },
        { text: 'Soul Stone', isCorrect: true },
        { text: 'Reality Stone', isCorrect: false },
        { text: 'Space Stone', isCorrect: false },
      ],
    },
    {
      prompt: "What is Tony Stark's AI assistant called in the original Iron Man films?",
      type: 'SINGLE',
      explanation:
        "JARVIS (Just A Rather Very Intelligent System) was Tony Stark's AI assistant before being uploaded into Vision.",
      timeLimitSec: 20,
      order: 5,
      choices: [
        { text: 'JARVIS', isCorrect: true },
        { text: 'FRIDAY', isCorrect: false },
        { text: 'EDITH', isCorrect: false },
        { text: 'KAREN', isCorrect: false },
      ],
    },
    {
      prompt: 'In which country is Wakanda located in the MCU?',
      type: 'SINGLE',
      explanation:
        'Wakanda is a fictional African nation in the MCU, located in eastern Africa. The films were largely inspired by real African cultures.',
      timeLimitSec: 20,
      order: 6,
      choices: [
        { text: 'Africa (fictional nation)', isCorrect: true },
        { text: 'Asia', isCorrect: false },
        { text: 'South America', isCorrect: false },
        { text: 'Europe', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the name of the country Thanos is from?',
      type: 'FILL_BLANK',
      explanation:
        'Thanos is from the planet Titan — more specifically, he is an Eternal from Titan, a moon of Saturn.',
      timeLimitSec: 20,
      order: 7,
      choices: [
        { text: 'Titan', isCorrect: true },
        { text: 'titan', isCorrect: true },
        { text: 'Xandar', isCorrect: false },
      ],
    },
    {
      prompt: 'Who says "I am Iron Man" as the final words before snapping in Avengers: Endgame?',
      type: 'SINGLE',
      explanation:
        'Tony Stark says "I am Iron Man" before using the Infinity Gauntlet to snap away Thanos and his army, sacrificing his own life.',
      timeLimitSec: 20,
      order: 8,
      choices: [
        { text: 'Tony Stark (Iron Man)', isCorrect: true },
        { text: 'Steve Rogers (Captain America)', isCorrect: false },
        { text: 'Thor', isCorrect: false },
        { text: 'Bruce Banner (Hulk)', isCorrect: false },
      ],
    },
  ],

  'World Capitals': [
    {
      prompt: 'What is the capital of Australia?',
      type: 'SINGLE',
      explanation:
        "Canberra is the capital of Australia. Many people mistakenly think it's Sydney or Melbourne — it was a compromise between the two rival cities.",
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'Canberra', isCorrect: true },
        { text: 'Sydney', isCorrect: false },
        { text: 'Melbourne', isCorrect: false },
        { text: 'Perth', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the capital of Canada?',
      type: 'SINGLE',
      explanation: 'Ottawa is the capital of Canada, located in Ontario near the Quebec border.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'Ottawa', isCorrect: true },
        { text: 'Toronto', isCorrect: false },
        { text: 'Vancouver', isCorrect: false },
        { text: 'Montreal', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Buenos Aires is the capital of Argentina.',
      type: 'TRUEFALSE',
      explanation: 'True. Buenos Aires is the capital and largest city of Argentina.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'Which of these cities are capitals of Scandinavian countries?',
      type: 'MULTIPLE',
      explanation:
        'Oslo is the capital of Norway, Stockholm is the capital of Sweden, and Copenhagen is the capital of Denmark — all Scandinavian countries.',
      timeLimitSec: 25,
      order: 4,
      choices: [
        { text: 'Oslo', isCorrect: true },
        { text: 'Stockholm', isCorrect: true },
        { text: 'Helsinki', isCorrect: false },
        { text: 'Reykjavik', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the capital of Japan?',
      type: 'SINGLE',
      explanation: "Tokyo is the capital of Japan and the world's most populous metropolitan area.",
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Tokyo', isCorrect: true },
        { text: 'Osaka', isCorrect: false },
        { text: 'Kyoto', isCorrect: false },
        { text: 'Hiroshima', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the capital of Brazil?',
      type: 'SINGLE',
      explanation:
        'Brasília is the capital of Brazil, built from scratch in the 1950s to be a planned capital city.',
      timeLimitSec: 20,
      order: 6,
      choices: [
        { text: 'Brasília', isCorrect: true },
        { text: 'Rio de Janeiro', isCorrect: false },
        { text: 'São Paulo', isCorrect: false },
        { text: 'Salvador', isCorrect: false },
      ],
    },
    {
      prompt: 'Name the capital of South Africa (administrative capital).',
      type: 'FILL_BLANK',
      explanation:
        'South Africa has three capitals: Pretoria (administrative), Cape Town (legislative), and Bloemfontein (judicial). Pretoria is usually considered the primary capital.',
      timeLimitSec: 20,
      order: 7,
      choices: [
        { text: 'Pretoria', isCorrect: true },
        { text: 'Cape Town', isCorrect: false },
        { text: 'Johannesburg', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Washington D.C. is the capital of the United States.',
      type: 'TRUEFALSE',
      explanation:
        'True. Washington, D.C. (District of Columbia) has been the capital of the United States since 1800.',
      timeLimitSec: 10,
      order: 8,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
  ],

  'Internet Basics': [
    {
      prompt: 'What does HTTP stand for?',
      type: 'SINGLE',
      explanation:
        'HTTP stands for HyperText Transfer Protocol. It is the foundation of data communication on the World Wide Web.',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'HyperText Transfer Protocol', isCorrect: true },
        { text: 'HyperText Transmission Protocol', isCorrect: false },
        { text: 'High Text Transfer Protocol', isCorrect: false },
        { text: 'HyperText Transaction Protocol', isCorrect: false },
      ],
    },
    {
      prompt: 'What does DNS stand for?',
      type: 'SINGLE',
      explanation:
        'DNS stands for Domain Name System. It translates human-readable domain names (like google.com) into IP addresses.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'Domain Name System', isCorrect: true },
        { text: 'Dynamic Name Server', isCorrect: false },
        { text: 'Data Network Service', isCorrect: false },
        { text: 'Domain Network Security', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: HTTPS is more secure than HTTP.',
      type: 'TRUEFALSE',
      explanation:
        'HTTPS (HTTP Secure) encrypts data using TLS/SSL, making it more secure than plain HTTP which transmits data in cleartext.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'Which HTTP methods are used to send data to a server?',
      type: 'MULTIPLE',
      explanation:
        'POST is the standard method for sending data (e.g., form submissions). PUT is used to update or create resources. Both send data in the request body.',
      timeLimitSec: 25,
      order: 4,
      choices: [
        { text: 'POST', isCorrect: true },
        { text: 'PUT', isCorrect: true },
        { text: 'GET', isCorrect: false },
        { text: 'DELETE', isCorrect: false },
      ],
    },
    {
      prompt: 'What port does HTTPS use by default?',
      type: 'SINGLE',
      explanation: 'HTTPS uses port 443 by default. HTTP uses port 80.',
      timeLimitSec: 15,
      order: 5,
      choices: [
        { text: '443', isCorrect: true },
        { text: '80', isCorrect: false },
        { text: '8080', isCorrect: false },
        { text: '22', isCorrect: false },
      ],
    },
    {
      prompt: 'What does IP stand for?',
      type: 'SINGLE',
      explanation:
        'IP stands for Internet Protocol. An IP address is a numerical label assigned to each device connected to a computer network.',
      timeLimitSec: 10,
      order: 6,
      choices: [
        { text: 'Internet Protocol', isCorrect: true },
        { text: 'Internal Protocol', isCorrect: false },
        { text: 'Internet Port', isCorrect: false },
        { text: 'Intranet Protocol', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the loopback IP address?',
      type: 'FILL_BLANK',
      explanation:
        '127.0.0.1 is the loopback address (also called "localhost"). It always refers to the local machine.',
      timeLimitSec: 20,
      order: 7,
      choices: [
        { text: '127.0.0.1', isCorrect: true },
        { text: 'localhost', isCorrect: true },
        { text: '192.168.0.1', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: A URL and a URI are exactly the same thing.',
      type: 'TRUEFALSE',
      explanation:
        'A URL (Uniform Resource Locator) is a specific type of URI (Uniform Resource Identifier) that specifies the location AND how to retrieve a resource. All URLs are URIs, but not all URIs are URLs.',
      timeLimitSec: 20,
      order: 8,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
  ],

  'Console History': [
    {
      prompt: 'Which company released the first commercially successful home video game console?',
      type: 'SINGLE',
      explanation:
        'Atari released the Atari 2600 (originally called VCS) in 1977, which became the first commercially successful home video game console.',
      timeLimitSec: 20,
      order: 1,
      choices: [
        { text: 'Atari', isCorrect: true },
        { text: 'Nintendo', isCorrect: false },
        { text: 'Sega', isCorrect: false },
        { text: 'Magnavox', isCorrect: false },
      ],
    },
    {
      prompt: 'What year did the original PlayStation launch in Japan?',
      type: 'SINGLE',
      explanation:
        'Sony launched the original PlayStation in Japan on December 3, 1994. It launched in North America on September 9, 1995.',
      timeLimitSec: 20,
      order: 2,
      choices: [
        { text: '1994', isCorrect: true },
        { text: '1995', isCorrect: false },
        { text: '1993', isCorrect: false },
        { text: '1996', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The Nintendo Switch is both a home console and a portable console.',
      type: 'TRUEFALSE',
      explanation:
        'True. The Nintendo Switch is a hybrid gaming console that can be played on a TV (docked mode) or as a portable device.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'Which consoles were part of the 16-bit era (4th generation)?',
      type: 'MULTIPLE',
      explanation:
        'The 16-bit era featured the Super Nintendo Entertainment System (SNES) and the Sega Genesis/Mega Drive as the dominant consoles.',
      timeLimitSec: 25,
      order: 4,
      choices: [
        { text: 'Super Nintendo (SNES)', isCorrect: true },
        { text: 'Sega Genesis', isCorrect: true },
        { text: 'PlayStation', isCorrect: false },
        { text: 'Nintendo 64', isCorrect: false },
      ],
    },
    {
      prompt: 'What was the best-selling console of all time (as of 2024)?',
      type: 'SINGLE',
      explanation:
        'The PlayStation 2 (PS2) is the best-selling video game console of all time with over 155 million units sold.',
      timeLimitSec: 20,
      order: 5,
      choices: [
        { text: 'PlayStation 2', isCorrect: true },
        { text: 'Nintendo DS', isCorrect: false },
        { text: 'PlayStation 4', isCorrect: false },
        { text: 'Nintendo Switch', isCorrect: false },
      ],
    },
    {
      prompt: 'What was the original name of the Xbox?',
      type: 'SINGLE',
      explanation:
        'The first Xbox was simply called "Xbox." It was Microsoft\'s entry into the home console market, released in 2001.',
      timeLimitSec: 15,
      order: 6,
      choices: [
        { text: 'Xbox', isCorrect: true },
        { text: 'Xbox Original', isCorrect: false },
        { text: 'Microsoft GameBox', isCorrect: false },
        { text: 'DirectX Box', isCorrect: false },
      ],
    },
    {
      prompt: 'What CPU architecture does the PlayStation 5 use?',
      type: 'FILL_BLANK',
      explanation:
        'The PlayStation 5 uses a custom AMD Zen 2 CPU (x86-64 architecture) along with an AMD RDNA 2 GPU.',
      timeLimitSec: 25,
      order: 7,
      choices: [
        { text: 'AMD Zen 2', isCorrect: true },
        { text: 'Zen 2', isCorrect: true },
        { text: 'Intel Core', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The Sega Dreamcast was the last console Sega ever produced.',
      type: 'TRUEFALSE',
      explanation:
        'True. The Sega Dreamcast (1998–2001) was the last home console produced by Sega. After its discontinuation, Sega became a third-party software publisher.',
      timeLimitSec: 15,
      order: 8,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
  ],

  'Intro to Anime': [
    {
      prompt: 'What is the name of the main character in "Naruto"?',
      type: 'SINGLE',
      explanation:
        'Naruto Uzumaki is the protagonist of the series "Naruto" by Masashi Kishimoto. He aspires to become the Hokage of his village.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Naruto Uzumaki', isCorrect: true },
        { text: 'Sasuke Uchiha', isCorrect: false },
        { text: 'Kakashi Hatake', isCorrect: false },
        { text: 'Itachi Uchiha', isCorrect: false },
      ],
    },
    {
      prompt: 'Which Studio Ghibli film features a girl named Chihiro?',
      type: 'SINGLE',
      explanation:
        '"Spirited Away" (Sen to Chihiro no Kamikakushi, 2001) directed by Hayao Miyazaki features Chihiro as the protagonist. It won the Academy Award for Best Animated Feature.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'Spirited Away', isCorrect: true },
        { text: 'My Neighbor Totoro', isCorrect: false },
        { text: 'Princess Mononoke', isCorrect: false },
        { text: "Howl's Moving Castle", isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: "Attack on Titan" is based on a manga.',
      type: 'TRUEFALSE',
      explanation:
        'True. "Attack on Titan" (Shingeki no Kyojin) is based on the manga by Hajime Isayama, which ran from 2009 to 2021.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'Which anime features the character "Monkey D. Luffy"?',
      type: 'SINGLE',
      explanation:
        'Monkey D. Luffy is the protagonist of "One Piece" by Eiichiro Oda. He is a pirate who ate a Devil Fruit and can stretch his body like rubber.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'One Piece', isCorrect: true },
        { text: 'Dragon Ball', isCorrect: false },
        { text: 'Bleach', isCorrect: false },
        { text: 'Fairy Tail', isCorrect: false },
      ],
    },
    {
      prompt: 'What are the four main studios known for producing popular anime?',
      type: 'MULTIPLE',
      explanation:
        'MAPPA, Wit Studio, Toei Animation, and Bones are among the most well-known and critically acclaimed anime studios.',
      timeLimitSec: 30,
      order: 5,
      choices: [
        { text: 'MAPPA', isCorrect: true },
        { text: 'Toei Animation', isCorrect: true },
        { text: 'Pixar', isCorrect: false },
        { text: 'DreamWorks', isCorrect: false },
      ],
    },
    {
      prompt: 'In "Death Note," what does the Death Note do?',
      type: 'SINGLE',
      explanation:
        'In "Death Note," writing a person\'s name in the supernatural notebook while picturing their face causes that person to die.',
      timeLimitSec: 15,
      order: 6,
      choices: [
        { text: 'Kills the person whose name is written in it', isCorrect: true },
        { text: 'Grants wishes', isCorrect: false },
        { text: 'Predicts the future', isCorrect: false },
        { text: 'Transports the user to another dimension', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the name of the iconic robot in "Neon Genesis Evangelion"?',
      type: 'FILL_BLANK',
      explanation:
        'The giant biomechanical mecha in "Neon Genesis Evangelion" are called "Evangelion" units (or EVA units). Unit 01 is the one most associated with the protagonist Shinji.',
      timeLimitSec: 20,
      order: 7,
      choices: [
        { text: 'EVA', isCorrect: true },
        { text: 'Evangelion', isCorrect: true },
        { text: 'Gundam', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: "Dragon Ball Z" is a sequel to "Dragon Ball."',
      type: 'TRUEFALSE',
      explanation:
        'True. "Dragon Ball Z" continues the story of Goku from "Dragon Ball," following him as an adult with a son named Gohan.',
      timeLimitSec: 10,
      order: 8,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
  ],

  'Everyday Trivia': [
    {
      prompt: 'How many sides does a hexagon have?',
      type: 'SINGLE',
      explanation: 'A hexagon has 6 sides. The prefix "hexa-" means six in Greek.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: '6', isCorrect: true },
        { text: '5', isCorrect: false },
        { text: '7', isCorrect: false },
        { text: '8', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the largest ocean on Earth?',
      type: 'SINGLE',
      explanation:
        'The Pacific Ocean is the largest ocean, covering more than 165 million square kilometers — larger than all land masses combined.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'Pacific Ocean', isCorrect: true },
        { text: 'Atlantic Ocean', isCorrect: false },
        { text: 'Indian Ocean', isCorrect: false },
        { text: 'Arctic Ocean', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Bats are birds.',
      type: 'TRUEFALSE',
      explanation:
        'False. Bats are mammals (order Chiroptera), not birds. They are the only mammals capable of sustained flight.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
    {
      prompt: 'Which planets in our solar system have rings?',
      type: 'MULTIPLE',
      explanation:
        'All four gas/ice giant planets have ring systems: Saturn (most prominent), Jupiter, Uranus, and Neptune.',
      timeLimitSec: 30,
      order: 4,
      choices: [
        { text: 'Saturn', isCorrect: true },
        { text: 'Uranus', isCorrect: true },
        { text: 'Mars', isCorrect: false },
        { text: 'Venus', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the tallest mountain in the world?',
      type: 'SINGLE',
      explanation:
        "Mount Everest, located in the Himalayas on the Nepal–Tibet border, is the world's highest mountain at 8,848.86 meters above sea level.",
      timeLimitSec: 15,
      order: 5,
      choices: [
        { text: 'Mount Everest', isCorrect: true },
        { text: 'K2', isCorrect: false },
        { text: 'Kangchenjunga', isCorrect: false },
        { text: 'Mont Blanc', isCorrect: false },
      ],
    },
    {
      prompt: 'How many continents are there on Earth?',
      type: 'SINGLE',
      explanation:
        'Earth has 7 continents: Africa, Antarctica, Asia, Australia/Oceania, Europe, North America, and South America.',
      timeLimitSec: 10,
      order: 6,
      choices: [
        { text: '7', isCorrect: true },
        { text: '5', isCorrect: false },
        { text: '6', isCorrect: false },
        { text: '8', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the chemical formula for table salt?',
      type: 'FILL_BLANK',
      explanation: 'Table salt is sodium chloride, with the chemical formula NaCl.',
      timeLimitSec: 15,
      order: 7,
      choices: [
        { text: 'NaCl', isCorrect: true },
        { text: 'KCl', isCorrect: false },
        { text: 'NaOH', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: A group of crows is called a murder.',
      type: 'TRUEFALSE',
      explanation:
        'True! A group of crows is indeed called a "murder of crows." Other fun collective nouns: a parliament of owls, a crash of rhinos.',
      timeLimitSec: 10,
      order: 8,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
  ],

  'Programming Languages': [
    {
      prompt: 'Which programming language was created by Guido van Rossum?',
      type: 'SINGLE',
      explanation:
        'Python was created by Guido van Rossum and first released in 1991. Van Rossum was its "Benevolent Dictator For Life" until 2018.',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'Python', isCorrect: true },
        { text: 'Ruby', isCorrect: false },
        { text: 'Perl', isCorrect: false },
        { text: 'Java', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: JavaScript was designed in 10 days.',
      type: 'TRUEFALSE',
      explanation:
        'True (approximately). Brendan Eich created JavaScript in about 10 days in May 1995 while working at Netscape.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'Which of these languages are statically typed?',
      type: 'MULTIPLE',
      explanation:
        'Java and Rust are statically typed languages where types are checked at compile time. Python and JavaScript are dynamically typed.',
      timeLimitSec: 25,
      order: 3,
      choices: [
        { text: 'Java', isCorrect: true },
        { text: 'Rust', isCorrect: true },
        { text: 'Python', isCorrect: false },
        { text: 'JavaScript', isCorrect: false },
      ],
    },
    {
      prompt: 'What does SQL stand for?',
      type: 'SINGLE',
      explanation:
        'SQL stands for Structured Query Language. It is the standard language for relational database management systems.',
      timeLimitSec: 15,
      order: 4,
      choices: [
        { text: 'Structured Query Language', isCorrect: true },
        { text: 'Standard Query Language', isCorrect: false },
        { text: 'Simple Query Language', isCorrect: false },
        { text: 'Sequential Query Language', isCorrect: false },
      ],
    },
    {
      prompt: 'Which company developed TypeScript?',
      type: 'SINGLE',
      explanation:
        'TypeScript was developed by Microsoft and first released in October 2012. It adds static typing to JavaScript.',
      timeLimitSec: 15,
      order: 5,
      choices: [
        { text: 'Microsoft', isCorrect: true },
        { text: 'Google', isCorrect: false },
        { text: 'Facebook', isCorrect: false },
        { text: 'Apple', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the extension for a Python file?',
      type: 'FILL_BLANK',
      explanation:
        'Python files use the .py extension. Python also supports .pyw for Windows GUI applications.',
      timeLimitSec: 10,
      order: 6,
      choices: [
        { text: '.py', isCorrect: true },
        { text: 'py', isCorrect: true },
        { text: '.python', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: C++ is a superset of C.',
      type: 'TRUEFALSE',
      explanation:
        'Mostly true — C++ was designed to be largely backward-compatible with C, but there are some differences that make this not strictly true in all cases.',
      timeLimitSec: 20,
      order: 7,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What paradigm is Haskell known for?',
      type: 'SINGLE',
      explanation:
        'Haskell is a purely functional programming language. It emphasizes immutability, higher-order functions, and type safety.',
      timeLimitSec: 20,
      order: 8,
      choices: [
        { text: 'Functional programming', isCorrect: true },
        { text: 'Object-oriented programming', isCorrect: false },
        { text: 'Procedural programming', isCorrect: false },
        { text: 'Logic programming', isCorrect: false },
      ],
    },
  ],

  'Pop Hits Through the Decades': [
    {
      prompt: 'Which artist released the album "Thriller" in 1982?',
      type: 'SINGLE',
      explanation:
        '"Thriller" by Michael Jackson is the best-selling album of all time, with an estimated 66–70 million copies sold worldwide.',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'Michael Jackson', isCorrect: true },
        { text: 'Prince', isCorrect: false },
        { text: 'David Bowie', isCorrect: false },
        { text: 'Madonna', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: "Bohemian Rhapsody" was released by the band Queen.',
      type: 'TRUEFALSE',
      explanation:
        'True. "Bohemian Rhapsody" was released by Queen in 1975. It was written by Freddie Mercury and reached number one in multiple countries.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt:
        'Which decade featured artists like Madonna, Prince, and Michael Jackson at their peak?',
      type: 'SINGLE',
      explanation:
        'The 1980s were a golden era for pop music, featuring Madonna, Prince, Michael Jackson, and the rise of MTV music videos.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: '1980s', isCorrect: true },
        { text: '1970s', isCorrect: false },
        { text: '1990s', isCorrect: false },
        { text: '2000s', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the best-selling single of all time?',
      type: 'SINGLE',
      explanation:
        '"White Christmas" by Bing Crosby is estimated to be the best-selling physical single of all time, with 50+ million copies sold.',
      timeLimitSec: 20,
      order: 4,
      choices: [
        { text: 'White Christmas by Bing Crosby', isCorrect: true },
        { text: 'Shape of You by Ed Sheeran', isCorrect: false },
        { text: 'Candle in the Wind by Elton John', isCorrect: false },
        { text: 'Something in the Air Tonight by Phil Collins', isCorrect: false },
      ],
    },
    {
      prompt: 'Which streaming era artists have won multiple Grammy Awards for Album of the Year?',
      type: 'MULTIPLE',
      explanation:
        'Taylor Swift has won the most Album of the Year Grammys (4), and Adele has also won this award multiple times.',
      timeLimitSec: 25,
      order: 5,
      choices: [
        { text: 'Taylor Swift', isCorrect: true },
        { text: 'Adele', isCorrect: true },
        { text: 'Billie Eilish', isCorrect: false },
        { text: 'Olivia Rodrigo', isCorrect: false },
      ],
    },
    {
      prompt: 'What was the first music video played on MTV?',
      type: 'SINGLE',
      explanation:
        '"Video Killed the Radio Star" by The Buggles was the first music video played on MTV when the channel launched on August 1, 1981.',
      timeLimitSec: 25,
      order: 6,
      choices: [
        { text: 'Video Killed the Radio Star', isCorrect: true },
        { text: 'Thriller', isCorrect: false },
        { text: 'Like a Virgin', isCorrect: false },
        { text: 'Girls Just Want to Have Fun', isCorrect: false },
      ],
    },
    {
      prompt: "Complete: 'Is this the real life? Is this just ___?'",
      type: 'FILL_BLANK',
      explanation:
        'The opening line of "Bohemian Rhapsody" by Queen is "Is this the real life? Is this just fantasy?"',
      timeLimitSec: 15,
      order: 7,
      choices: [
        { text: 'fantasy', isCorrect: true },
        { text: 'a dream', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The Beatles were from Liverpool, England.',
      type: 'TRUEFALSE',
      explanation:
        'True. The Beatles (John Lennon, Paul McCartney, George Harrison, and Ringo Starr) were all from Liverpool, England.',
      timeLimitSec: 10,
      order: 8,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
  ],

  'Football World Cup': [
    {
      prompt: 'Which country has won the most FIFA World Cup titles?',
      type: 'SINGLE',
      explanation:
        'Brazil has won the FIFA World Cup 5 times (1958, 1962, 1970, 1994, 2002), more than any other nation.',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'Brazil', isCorrect: true },
        { text: 'Germany', isCorrect: false },
        { text: 'Italy', isCorrect: false },
        { text: 'Argentina', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The first FIFA World Cup was held in Uruguay.',
      type: 'TRUEFALSE',
      explanation:
        'True. The first FIFA World Cup was held in Uruguay in 1930. Uruguay won the inaugural tournament.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'Who is the all-time top scorer in FIFA World Cup history?',
      type: 'SINGLE',
      explanation:
        'Miroslav Klose of Germany holds the record with 16 World Cup goals, scored across the 2002, 2006, 2010, and 2014 tournaments.',
      timeLimitSec: 20,
      order: 3,
      choices: [
        { text: 'Miroslav Klose', isCorrect: true },
        { text: 'Ronaldo (Brazil)', isCorrect: false },
        { text: 'Pelé', isCorrect: false },
        { text: 'Gerd Müller', isCorrect: false },
      ],
    },
    {
      prompt: 'Which countries hosted the 2026 FIFA World Cup?',
      type: 'MULTIPLE',
      explanation:
        'The 2026 FIFA World Cup was co-hosted by the United States, Canada, and Mexico — the first World Cup with three host nations.',
      timeLimitSec: 25,
      order: 4,
      choices: [
        { text: 'United States', isCorrect: true },
        { text: 'Canada', isCorrect: true },
        { text: 'Mexico', isCorrect: true },
        { text: 'Brazil', isCorrect: false },
      ],
    },
    {
      prompt: 'How many teams participate in the FIFA World Cup final tournament (since 2026)?',
      type: 'SINGLE',
      explanation:
        'Starting from the 2026 World Cup, the tournament expanded from 32 to 48 participating teams.',
      timeLimitSec: 20,
      order: 5,
      choices: [
        { text: '48', isCorrect: true },
        { text: '32', isCorrect: false },
        { text: '24', isCorrect: false },
        { text: '64', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the name of the FIFA World Cup trophy?',
      type: 'FILL_BLANK',
      explanation:
        'The current FIFA World Cup trophy is named "FIFA World Cup Trophy" but is colloquially known as the "FIFA World Cup Trophy." The previous trophy was the Jules Rimet Trophy.',
      timeLimitSec: 20,
      order: 6,
      choices: [
        { text: 'FIFA World Cup Trophy', isCorrect: true },
        { text: 'Jules Rimet Trophy', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Argentina won the 2022 FIFA World Cup.',
      type: 'TRUEFALSE',
      explanation:
        'True. Argentina beat France in the 2022 FIFA World Cup final in Qatar, winning on penalties after a 3–3 draw.',
      timeLimitSec: 10,
      order: 7,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'Who scored a famous "Hand of God" goal in the 1986 World Cup?',
      type: 'SINGLE',
      explanation:
        'Diego Maradona scored the "Hand of God" goal against England in the 1986 quarter-finals, punching the ball into the net with his hand.',
      timeLimitSec: 20,
      order: 8,
      choices: [
        { text: 'Diego Maradona', isCorrect: true },
        { text: 'Pelé', isCorrect: false },
        { text: 'Ronaldo', isCorrect: false },
        { text: 'Zinedine Zidane', isCorrect: false },
      ],
    },
  ],

  'Mixed Bag': [
    {
      prompt: 'Which planet is known as the Red Planet?',
      type: 'SINGLE',
      explanation:
        'Mars is called the Red Planet because of its reddish appearance, caused by iron oxide (rust) on its surface.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Mars', isCorrect: true },
        { text: 'Jupiter', isCorrect: false },
        { text: 'Venus', isCorrect: false },
        { text: 'Saturn', isCorrect: false },
      ],
    },
    {
      prompt: 'Who painted the Mona Lisa?',
      type: 'SINGLE',
      explanation:
        'Leonardo da Vinci painted the Mona Lisa between approximately 1503 and 1519. It is housed in the Louvre Museum in Paris.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Leonardo da Vinci', isCorrect: true },
        { text: 'Michelangelo', isCorrect: false },
        { text: 'Raphael', isCorrect: false },
        { text: 'Caravaggio', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The Great Barrier Reef is located off the coast of Australia.',
      type: 'TRUEFALSE',
      explanation:
        "True. The Great Barrier Reef is the world's largest coral reef system, located in the Coral Sea off the coast of Queensland, Australia.",
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'Which of these are programming paradigms?',
      type: 'MULTIPLE',
      explanation:
        'Object-oriented and functional are programming paradigms. HTML is a markup language, and SQL is a query language.',
      timeLimitSec: 25,
      order: 4,
      choices: [
        { text: 'Object-oriented', isCorrect: true },
        { text: 'Functional', isCorrect: true },
        { text: 'HTML', isCorrect: false },
        { text: 'SQL', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the currency of Japan?',
      type: 'SINGLE',
      explanation:
        'The Japanese yen (JPY, ¥) is the official currency of Japan. It is the third most traded currency in the foreign exchange market.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Yen', isCorrect: true },
        { text: 'Won', isCorrect: false },
        { text: 'Yuan', isCorrect: false },
        { text: 'Rupee', isCorrect: false },
      ],
    },
    {
      prompt: 'How many strings does a standard guitar have?',
      type: 'SINGLE',
      explanation:
        'A standard acoustic or electric guitar has 6 strings. Bass guitars typically have 4.',
      timeLimitSec: 10,
      order: 6,
      choices: [
        { text: '6', isCorrect: true },
        { text: '4', isCorrect: false },
        { text: '8', isCorrect: false },
        { text: '12', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the boiling point of water at sea level (in Celsius)?',
      type: 'FILL_BLANK',
      explanation: 'Water boils at 100°C (212°F) at standard atmospheric pressure (sea level).',
      timeLimitSec: 10,
      order: 7,
      choices: [
        { text: '100', isCorrect: true },
        { text: '100°C', isCorrect: true },
        { text: '212', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The sun is a star.',
      type: 'TRUEFALSE',
      explanation:
        'True. The Sun is a G-type main-sequence star (yellow dwarf) at the center of our solar system.',
      timeLimitSec: 5,
      order: 8,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
  ],

  // ─── Cell Biology Basics ────────────────────────────────────────
  'Cell Biology Basics': [
    {
      prompt: 'What is the powerhouse of the cell?',
      type: 'SINGLE',
      explanation: "Mitochondria generate ATP, the cell's main energy currency.",
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'Mitochondria', isCorrect: true },
        { text: 'Nucleus', isCorrect: false },
        { text: 'Ribosome', isCorrect: false },
        { text: 'Golgi apparatus', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: All cells have a nucleus.',
      type: 'TRUEFALSE',
      explanation: 'Prokaryotic cells (like bacteria) lack a nucleus.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
    {
      prompt: 'What organelle is responsible for photosynthesis?',
      type: 'SINGLE',
      explanation: 'Chloroplasts capture light energy for photosynthesis in plant cells.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'Chloroplast', isCorrect: true },
        { text: 'Mitochondria', isCorrect: false },
        { text: 'Lysosome', isCorrect: false },
        { text: 'Vacuole', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the main function of ribosomes?',
      type: 'SINGLE',
      explanation: 'Ribosomes synthesize proteins by translating mRNA.',
      timeLimitSec: 15,
      order: 4,
      choices: [
        { text: 'Protein synthesis', isCorrect: true },
        { text: 'Lipid storage', isCorrect: false },
        { text: 'DNA replication', isCorrect: false },
        { text: 'Waste removal', isCorrect: false },
      ],
    },
    {
      prompt: 'Which molecule carries genetic information?',
      type: 'SINGLE',
      explanation: 'DNA (deoxyribonucleic acid) stores genetic instructions.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'DNA', isCorrect: true },
        { text: 'ATP', isCorrect: false },
        { text: 'RNA polymerase', isCorrect: false },
        { text: 'Hemoglobin', isCorrect: false },
      ],
    },
  ],

  // ─── Human Anatomy ─────────────────────────────────────────────
  'Human Anatomy': [
    {
      prompt: 'How many bones are in the adult human body?',
      type: 'SINGLE',
      explanation: 'The adult human skeleton has 206 bones.',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: '206', isCorrect: true },
        { text: '186', isCorrect: false },
        { text: '226', isCorrect: false },
        { text: '256', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the largest organ in the human body?',
      type: 'SINGLE',
      explanation: "The skin is the body's largest organ.",
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Skin', isCorrect: true },
        { text: 'Liver', isCorrect: false },
        { text: 'Brain', isCorrect: false },
        { text: 'Heart', isCorrect: false },
      ],
    },
    {
      prompt: 'Which blood type is the universal donor?',
      type: 'SINGLE',
      explanation: 'O-negative blood can be donated to anyone.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'O negative', isCorrect: true },
        { text: 'AB positive', isCorrect: false },
        { text: 'A positive', isCorrect: false },
        { text: 'B negative', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The heart has four chambers.',
      type: 'TRUEFALSE',
      explanation: 'The heart has two atria and two ventricles.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What part of the brain controls balance?',
      type: 'SINGLE',
      explanation: 'The cerebellum coordinates balance and fine motor control.',
      timeLimitSec: 15,
      order: 5,
      choices: [
        { text: 'Cerebellum', isCorrect: true },
        { text: 'Cerebrum', isCorrect: false },
        { text: 'Brain stem', isCorrect: false },
        { text: 'Hypothalamus', isCorrect: false },
      ],
    },
  ],

  // ─── Genetics & DNA ────────────────────────────────────────────
  'Genetics & DNA': [
    {
      prompt: 'What are the four nucleotide bases in DNA?',
      type: 'MULTIPLE',
      explanation: 'DNA bases: Adenine, Thymine, Guanine, Cytosine.',
      timeLimitSec: 20,
      order: 1,
      choices: [
        { text: 'Adenine', isCorrect: true },
        { text: 'Thymine', isCorrect: true },
        { text: 'Uracil', isCorrect: false },
        { text: 'Guanine', isCorrect: true },
        { text: 'Cytosine', isCorrect: true },
      ],
    },
    {
      prompt: 'What is a mutation?',
      type: 'SINGLE',
      explanation: 'A mutation is a change in the DNA sequence.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'A change in DNA sequence', isCorrect: true },
        { text: 'A type of protein', isCorrect: false },
        { text: 'Cell division', isCorrect: false },
        { text: 'An enzyme reaction', isCorrect: false },
      ],
    },
    {
      prompt: 'How many chromosomes do humans have?',
      type: 'SINGLE',
      explanation: 'Humans have 23 pairs, 46 total chromosomes.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: '46', isCorrect: true },
        { text: '23', isCorrect: false },
        { text: '48', isCorrect: false },
        { text: '44', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Identical twins have the same DNA.',
      type: 'TRUEFALSE',
      explanation: 'Identical twins come from one fertilized egg and share identical DNA.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'Who is known as the father of genetics?',
      type: 'SINGLE',
      explanation: 'Gregor Mendel discovered the basic principles of heredity.',
      timeLimitSec: 15,
      order: 5,
      choices: [
        { text: 'Gregor Mendel', isCorrect: true },
        { text: 'Charles Darwin', isCorrect: false },
        { text: 'James Watson', isCorrect: false },
        { text: 'Francis Crick', isCorrect: false },
      ],
    },
  ],

  // ─── Intro to Chemistry ────────────────────────────────────────
  'Intro to Chemistry': [
    {
      prompt: 'What is the chemical symbol for water?',
      type: 'SINGLE',
      explanation: 'H₂O represents two hydrogen atoms bonded to one oxygen atom.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'H₂O', isCorrect: true },
        { text: 'CO₂', isCorrect: false },
        { text: 'NaCl', isCorrect: false },
        { text: 'O₂', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the atomic number of carbon?',
      type: 'SINGLE',
      explanation: 'Carbon has 6 protons, giving it atomic number 6.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: '6', isCorrect: true },
        { text: '12', isCorrect: false },
        { text: '8', isCorrect: false },
        { text: '14', isCorrect: false },
      ],
    },
    {
      prompt: 'What is a chemical reaction?',
      type: 'SINGLE',
      explanation: 'A chemical reaction rearranges atoms to form new substances.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'Atoms rearranged to form new substances', isCorrect: true },
        { text: 'A change of state like melting', isCorrect: false },
        { text: 'Mixing two liquids', isCorrect: false },
        { text: 'Heating a substance', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the pH of pure water?',
      type: 'SINGLE',
      explanation: 'Pure water is neutral at pH 7.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: '7', isCorrect: true },
        { text: '0', isCorrect: false },
        { text: '14', isCorrect: false },
        { text: '5', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Salt (NaCl) is a compound.',
      type: 'TRUEFALSE',
      explanation: 'Sodium chloride is a compound made of sodium and chlorine.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
  ],

  // ─── Organic Chemistry ─────────────────────────────────────────
  'Organic Chemistry': [
    {
      prompt: 'What element is the backbone of organic compounds?',
      type: 'SINGLE',
      explanation: 'Carbon forms the structural framework of all organic molecules.',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'Carbon', isCorrect: true },
        { text: 'Oxygen', isCorrect: false },
        { text: 'Hydrogen', isCorrect: false },
        { text: 'Nitrogen', isCorrect: false },
      ],
    },
    {
      prompt: 'What functional group is -OH?',
      type: 'SINGLE',
      explanation: 'The hydroxyl group (-OH) is found in alcohols.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'Hydroxyl', isCorrect: true },
        { text: 'Carboxyl', isCorrect: false },
        { text: 'Amino', isCorrect: false },
        { text: 'Methyl', isCorrect: false },
      ],
    },
    {
      prompt: 'What is an alkane?',
      type: 'SINGLE',
      explanation: 'Alkanes are hydrocarbons with only single bonds (saturated).',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'Hydrocarbon with only single bonds', isCorrect: true },
        { text: 'Hydrocarbon with double bonds', isCorrect: false },
        { text: 'Aromatic ring compound', isCorrect: false },
        { text: 'Hydrocarbon with triple bonds', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: All organic compounds contain oxygen.',
      type: 'TRUEFALSE',
      explanation: 'Many organic compounds (like hydrocarbons) contain only carbon and hydrogen.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
    {
      prompt: 'What is the simplest alkane?',
      type: 'SINGLE',
      explanation: 'Methane (CH₄) is the simplest hydrocarbon.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Methane', isCorrect: true },
        { text: 'Ethane', isCorrect: false },
        { text: 'Propane', isCorrect: false },
        { text: 'Butane', isCorrect: false },
      ],
    },
  ],

  // ─── Solar System Tour ─────────────────────────────────────────
  'Solar System Tour': [
    {
      prompt: 'How many planets are in our solar system?',
      type: 'SINGLE',
      explanation:
        'There are 8 planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: '8', isCorrect: true },
        { text: '9', isCorrect: false },
        { text: '7', isCorrect: false },
        { text: '10', isCorrect: false },
      ],
    },
    {
      prompt: 'Which planet is known as the Red Planet?',
      type: 'SINGLE',
      explanation: 'Mars appears red due to iron oxide on its surface.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Mars', isCorrect: true },
        { text: 'Venus', isCorrect: false },
        { text: 'Jupiter', isCorrect: false },
        { text: 'Saturn', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the largest planet?',
      type: 'SINGLE',
      explanation: 'Jupiter is the largest planet in our solar system.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'Jupiter', isCorrect: true },
        { text: 'Saturn', isCorrect: false },
        { text: 'Neptune', isCorrect: false },
        { text: 'Uranus', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The Sun is the closest star to Earth.',
      type: 'TRUEFALSE',
      explanation: 'The Sun is our nearest star at about 93 million miles away.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What planet has the most visible rings?',
      type: 'SINGLE',
      explanation: "Saturn's ring system is the most prominent in the solar system.",
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Saturn', isCorrect: true },
        { text: 'Jupiter', isCorrect: false },
        { text: 'Uranus', isCorrect: false },
        { text: 'Neptune', isCorrect: false },
      ],
    },
  ],

  // ─── Deep Space Phenomena ──────────────────────────────────────
  'Deep Space Phenomena': [
    {
      prompt: 'What is a black hole?',
      type: 'SINGLE',
      explanation:
        'A black hole is a region where gravity is so strong nothing, not even light, can escape.',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'A region of extreme gravity from which nothing escapes', isCorrect: true },
        { text: 'A dead star that cooled down', isCorrect: false },
        { text: 'A hole in the fabric of space', isCorrect: false },
        { text: 'A type of wormhole', isCorrect: false },
      ],
    },
    {
      prompt: 'What is a supernova?',
      type: 'SINGLE',
      explanation: 'A supernova is the explosive death of a massive star.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'The explosive death of a star', isCorrect: true },
        { text: 'A new star forming', isCorrect: false },
        { text: 'Two stars colliding', isCorrect: false },
        { text: 'A planet exploding', isCorrect: false },
      ],
    },
    {
      prompt: 'What is dark matter?',
      type: 'SINGLE',
      explanation:
        "Dark matter is invisible mass that doesn't emit light but exerts gravitational pull.",
      timeLimitSec: 20,
      order: 3,
      choices: [
        { text: 'Invisible mass detected through gravity', isCorrect: true },
        { text: 'Black paint in space', isCorrect: false },
        { text: 'Anti-matter', isCorrect: false },
        { text: 'Dead stars', isCorrect: false },
      ],
    },
    {
      prompt: 'Approximately how old is the universe?',
      type: 'SINGLE',
      explanation: 'The universe is about 13.8 billion years old.',
      timeLimitSec: 15,
      order: 4,
      choices: [
        { text: '13.8 billion years', isCorrect: true },
        { text: '4.5 billion years', isCorrect: false },
        { text: '100 billion years', isCorrect: false },
        { text: '1 trillion years', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Light can escape a black hole.',
      type: 'TRUEFALSE',
      explanation: "Nothing, including light, can escape a black hole's event horizon.",
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
  ],

  // ─── Ecosystems & Biomes ───────────────────────────────────────
  'Ecosystems & Biomes': [
    {
      prompt: 'What is the largest biome on Earth?',
      type: 'SINGLE',
      explanation: "Oceans cover about 71% of Earth's surface, making them the largest biome.",
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'Marine/Ocean', isCorrect: true },
        { text: 'Desert', isCorrect: false },
        { text: 'Tropical rainforest', isCorrect: false },
        { text: 'Tundra', isCorrect: false },
      ],
    },
    {
      prompt: 'What biome is characterized by permafrost?',
      type: 'SINGLE',
      explanation: 'The tundra has permanently frozen subsoil called permafrost.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'Tundra', isCorrect: true },
        { text: 'Taiga', isCorrect: false },
        { text: 'Savanna', isCorrect: false },
        { text: 'Desert', isCorrect: false },
      ],
    },
    {
      prompt: "True or False: Rainforests produce about 20% of Earth's oxygen.",
      type: 'TRUEFALSE',
      explanation: 'Rainforests are often called the lungs of the Earth.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What is biodiversity?',
      type: 'SINGLE',
      explanation: 'Biodiversity refers to the variety of life in an ecosystem.',
      timeLimitSec: 15,
      order: 4,
      choices: [
        { text: 'The variety of life in an area', isCorrect: true },
        { text: 'The number of trees', isCorrect: false },
        { text: 'The climate of a region', isCorrect: false },
        { text: 'The soil quality', isCorrect: false },
      ],
    },
    {
      prompt: 'Which biome has the highest biodiversity?',
      type: 'SINGLE',
      explanation: 'Tropical rainforests contain more species than any other terrestrial biome.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Tropical rainforest', isCorrect: true },
        { text: 'Desert', isCorrect: false },
        { text: 'Grassland', isCorrect: false },
        { text: 'Tundra', isCorrect: false },
      ],
    },
  ],

  // ─── Ancient Egypt ─────────────────────────────────────────────
  'Ancient Egypt': [
    {
      prompt: 'Which river was the lifeblood of Ancient Egypt?',
      type: 'SINGLE',
      explanation: 'The Nile River enabled agriculture and civilization in Egypt.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Nile', isCorrect: true },
        { text: 'Tigris', isCorrect: false },
        { text: 'Euphrates', isCorrect: false },
        { text: 'Amazon', isCorrect: false },
      ],
    },
    {
      prompt: 'What structures were built as tombs for pharaohs?',
      type: 'SINGLE',
      explanation: 'The pyramids of Giza are among the most famous burial structures.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Pyramids', isCorrect: true },
        { text: 'Ziggurats', isCorrect: false },
        { text: 'Colosseums', isCorrect: false },
        { text: 'Temples', isCorrect: false },
      ],
    },
    {
      prompt: 'Who was the last pharaoh of Ancient Egypt?',
      type: 'SINGLE',
      explanation: 'Cleopatra VII was the last active ruler of Ptolemaic Egypt.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'Cleopatra', isCorrect: true },
        { text: 'Nefertiti', isCorrect: false },
        { text: 'Hatshepsut', isCorrect: false },
        { text: 'Ramesses II', isCorrect: false },
      ],
    },
    {
      prompt:
        'True or False: The Great Pyramid of Giza is the only surviving Wonder of the Ancient World.',
      type: 'TRUEFALSE',
      explanation: 'Of the Seven Wonders, only the Great Pyramid remains.',
      timeLimitSec: 15,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What writing system did Ancient Egyptians use?',
      type: 'SINGLE',
      explanation: 'Hieroglyphics used pictorial symbols to represent words and sounds.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Hieroglyphics', isCorrect: true },
        { text: 'Cuneiform', isCorrect: false },
        { text: 'Alphabet', isCorrect: false },
        { text: 'Linear B', isCorrect: false },
      ],
    },
  ],

  // ─── The Roman Empire ──────────────────────────────────────────
  'The Roman Empire': [
    {
      prompt: 'Who was the first Roman Emperor?',
      type: 'SINGLE',
      explanation: 'Augustus (Octavian) became the first emperor after defeating Mark Antony.',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'Augustus', isCorrect: true },
        { text: 'Julius Caesar', isCorrect: false },
        { text: 'Nero', isCorrect: false },
        { text: 'Caligula', isCorrect: false },
      ],
    },
    {
      prompt: 'What famous arena hosted gladiator fights in Rome?',
      type: 'SINGLE',
      explanation: 'The Colosseum could hold up to 80,000 spectators.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Colosseum', isCorrect: true },
        { text: 'Pantheon', isCorrect: false },
        { text: 'Circus Maximus', isCorrect: false },
        { text: 'Forum', isCorrect: false },
      ],
    },
    {
      prompt: 'In what year did the Western Roman Empire fall?',
      type: 'SINGLE',
      explanation: '476 AD marks the traditional date of the fall of the Western Roman Empire.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: '476 AD', isCorrect: true },
        { text: '410 AD', isCorrect: false },
        { text: '500 AD', isCorrect: false },
        { text: '332 AD', isCorrect: false },
      ],
    },
    {
      prompt: 'What language did the Romans speak?',
      type: 'SINGLE',
      explanation: 'Latin was the official language of the Roman Empire.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'Latin', isCorrect: true },
        { text: 'Greek', isCorrect: false },
        { text: 'Italian', isCorrect: false },
        { text: 'Aramaic', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Rome was built on seven hills.',
      type: 'TRUEFALSE',
      explanation: 'Rome is famously known as the City of Seven Hills.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
  ],

  // ─── World War I ───────────────────────────────────────────────
  'World War I': [
    {
      prompt: 'What event triggered the start of WWI?',
      type: 'SINGLE',
      explanation: 'The assassination of Archduke Franz Ferdinand in 1914 sparked the war.',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'Assassination of Archduke Franz Ferdinand', isCorrect: true },
        { text: 'Sinking of the Lusitania', isCorrect: false },
        { text: 'German invasion of Poland', isCorrect: false },
        { text: 'Treaty of Versailles', isCorrect: false },
      ],
    },
    {
      prompt: 'Which countries made up the Triple Entente?',
      type: 'MULTIPLE',
      explanation: 'The Triple Entente: France, Russia, and the United Kingdom.',
      timeLimitSec: 20,
      order: 2,
      choices: [
        { text: 'France', isCorrect: true },
        { text: 'Russia', isCorrect: true },
        { text: 'United Kingdom', isCorrect: true },
        { text: 'Germany', isCorrect: false },
      ],
    },
    {
      prompt: 'What was trench warfare?',
      type: 'SINGLE',
      explanation: 'Soldiers fought from deep ditches along the Western Front.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'Fighting from fortified ditches', isCorrect: true },
        { text: 'Naval battles in the Atlantic', isCorrect: false },
        { text: 'Aerial dogfights', isCorrect: false },
        { text: 'Guerrilla warfare in cities', isCorrect: false },
      ],
    },
    {
      prompt: 'In what year did WWI end?',
      type: 'SINGLE',
      explanation: 'World War I ended on November 11, 1918.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: '1918', isCorrect: true },
        { text: '1917', isCorrect: false },
        { text: '1919', isCorrect: false },
        { text: '1920', isCorrect: false },
      ],
    },
    {
      prompt: 'What treaty ended WWI?',
      type: 'SINGLE',
      explanation: 'The Treaty of Versailles was signed in 1919.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Treaty of Versailles', isCorrect: true },
        { text: 'Treaty of Paris', isCorrect: false },
        { text: 'Treaty of Ghent', isCorrect: false },
        { text: 'Treaty of Vienna', isCorrect: false },
      ],
    },
  ],

  // ─── WWII Major Battles ────────────────────────────────────────
  'WWII Major Battles': [
    {
      prompt: 'What was the code name for the Allied invasion of Normandy?',
      type: 'SINGLE',
      explanation: 'Operation Overlord launched on D-Day, June 6, 1944.',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'Operation Overlord', isCorrect: true },
        { text: 'Operation Barbarossa', isCorrect: false },
        { text: 'Operation Market Garden', isCorrect: false },
        { text: 'Operation Torch', isCorrect: false },
      ],
    },
    {
      prompt: 'Which battle is considered the turning point in the Pacific?',
      type: 'SINGLE',
      explanation: 'The Battle of Midway in 1942 decisively weakened the Japanese navy.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'Battle of Midway', isCorrect: true },
        { text: 'Battle of Iwo Jima', isCorrect: false },
        { text: 'Pearl Harbor', isCorrect: false },
        { text: 'Battle of Okinawa', isCorrect: false },
      ],
    },
    {
      prompt: 'What was the largest tank battle in history?',
      type: 'SINGLE',
      explanation: 'The Battle of Kursk in 1943 involved thousands of tanks.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'Battle of Kursk', isCorrect: true },
        { text: 'Battle of the Bulge', isCorrect: false },
        { text: 'Battle of El Alamein', isCorrect: false },
        { text: 'Battle of Stalingrad', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The Battle of Stalingrad lasted over 5 months.',
      type: 'TRUEFALSE',
      explanation: 'The battle raged from August 1942 to February 1943.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'Which country suffered the most casualties in WWII?',
      type: 'SINGLE',
      explanation: 'The Soviet Union lost an estimated 27 million people.',
      timeLimitSec: 15,
      order: 5,
      choices: [
        { text: 'Soviet Union', isCorrect: true },
        { text: 'Germany', isCorrect: false },
        { text: 'Japan', isCorrect: false },
        { text: 'China', isCorrect: false },
      ],
    },
  ],

  // ─── American Revolution ───────────────────────────────────────
  'American Revolution': [
    {
      prompt: 'In what year was the Declaration of Independence signed?',
      type: 'SINGLE',
      explanation: 'The Declaration was adopted on July 4, 1776.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: '1776', isCorrect: true },
        { text: '1783', isCorrect: false },
        { text: '1775', isCorrect: false },
        { text: '1787', isCorrect: false },
      ],
    },
    {
      prompt: 'Who was the primary author of the Declaration of Independence?',
      type: 'SINGLE',
      explanation: 'Thomas Jefferson drafted the Declaration.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Thomas Jefferson', isCorrect: true },
        { text: 'George Washington', isCorrect: false },
        { text: 'Benjamin Franklin', isCorrect: false },
        { text: 'John Adams', isCorrect: false },
      ],
    },
    {
      prompt: 'What event is known as the "shot heard round the world"?',
      type: 'SINGLE',
      explanation: 'The Battles of Lexington and Concord started the Revolutionary War.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'Battles of Lexington and Concord', isCorrect: true },
        { text: 'Boston Tea Party', isCorrect: false },
        { text: 'Battle of Bunker Hill', isCorrect: false },
        { text: 'Siege of Yorktown', isCorrect: false },
      ],
    },
    {
      prompt: 'Who was the Commander of the Continental Army?',
      type: 'SINGLE',
      explanation: 'George Washington led the Continental Army.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'George Washington', isCorrect: true },
        { text: 'Thomas Jefferson', isCorrect: false },
        { text: 'Alexander Hamilton', isCorrect: false },
        { text: 'Benjamin Franklin', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: France was an ally of the American colonies.',
      type: 'TRUEFALSE',
      explanation: 'France provided crucial military and financial support.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
  ],

  // ─── Civil Rights Movement ─────────────────────────────────────
  'Civil Rights Movement': [
    {
      prompt: 'Who led the Montgomery Bus Boycott?',
      type: 'SINGLE',
      explanation: 'Dr. Martin Luther King Jr. emerged as a leader during the boycott.',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'Martin Luther King Jr.', isCorrect: true },
        { text: 'Malcolm X', isCorrect: false },
        { text: 'Rosa Parks', isCorrect: false },
        { text: 'Thurgood Marshall', isCorrect: false },
      ],
    },
    {
      prompt: 'What Supreme Court case declared school segregation unconstitutional?',
      type: 'SINGLE',
      explanation: 'Brown v. Board of Education (1954) overturned Plessy v. Ferguson.',
      timeLimitSec: 20,
      order: 2,
      choices: [
        { text: 'Brown v. Board of Education', isCorrect: true },
        { text: 'Plessy v. Ferguson', isCorrect: false },
        { text: 'Roe v. Wade', isCorrect: false },
        { text: 'Miranda v. Arizona', isCorrect: false },
      ],
    },
    {
      prompt: 'Where did MLK deliver his "I Have a Dream" speech?',
      type: 'SINGLE',
      explanation:
        'The speech was delivered at the Lincoln Memorial during the March on Washington.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'Lincoln Memorial, Washington D.C.', isCorrect: true },
        { text: 'Montgomery, Alabama', isCorrect: false },
        { text: 'Selma, Alabama', isCorrect: false },
        { text: 'Birmingham, Alabama', isCorrect: false },
      ],
    },
    {
      prompt: 'What year was the Civil Rights Act signed?',
      type: 'SINGLE',
      explanation: 'The Civil Rights Act was signed by President Lyndon B. Johnson in 1964.',
      timeLimitSec: 15,
      order: 4,
      choices: [
        { text: '1964', isCorrect: true },
        { text: '1963', isCorrect: false },
        { text: '1965', isCorrect: false },
        { text: '1968', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Rosa Parks refused to give up her bus seat in 1955.',
      type: 'TRUEFALSE',
      explanation:
        'Rosa Parks was arrested on December 1, 1955, sparking the Montgomery Bus Boycott.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
  ],

  // ─── Greek Mythology ───────────────────────────────────────────
  'Greek Mythology': [
    {
      prompt: 'Who is the king of the Greek gods?',
      type: 'SINGLE',
      explanation: 'Zeus ruled as king of the Olympian gods.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Zeus', isCorrect: true },
        { text: 'Poseidon', isCorrect: false },
        { text: 'Hades', isCorrect: false },
        { text: 'Apollo', isCorrect: false },
      ],
    },
    {
      prompt: 'What creature is half-man and half-bull?',
      type: 'SINGLE',
      explanation: 'The Minotaur lived in the Labyrinth of Crete.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Minotaur', isCorrect: true },
        { text: 'Centaur', isCorrect: false },
        { text: 'Satyr', isCorrect: false },
        { text: 'Cyclops', isCorrect: false },
      ],
    },
    {
      prompt: 'Who completed 12 labors as penance?',
      type: 'SINGLE',
      explanation: 'Heracles (Hercules) completed the Twelve Labors.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'Heracles', isCorrect: true },
        { text: 'Theseus', isCorrect: false },
        { text: 'Perseus', isCorrect: false },
        { text: 'Odysseus', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Medusa could turn people to stone with her gaze.',
      type: 'TRUEFALSE',
      explanation: 'Medusa was a Gorgon whose gaze petrified anyone who looked directly at her.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: "Which goddess sprang fully formed from Zeus's head?",
      type: 'SINGLE',
      explanation: "Athena, goddess of wisdom and war, was born from Zeus's forehead.",
      timeLimitSec: 15,
      order: 5,
      choices: [
        { text: 'Athena', isCorrect: true },
        { text: 'Aphrodite', isCorrect: false },
        { text: 'Hera', isCorrect: false },
        { text: 'Artemis', isCorrect: false },
      ],
    },
  ],

  // ─── Famous Novels ─────────────────────────────────────────────
  'Famous Novels': [
    {
      prompt: 'Who wrote "1984"?',
      type: 'SINGLE',
      explanation: 'George Orwell wrote the dystopian novel 1984.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'George Orwell', isCorrect: true },
        { text: 'Aldous Huxley', isCorrect: false },
        { text: 'Ray Bradbury', isCorrect: false },
        { text: 'H.G. Wells', isCorrect: false },
      ],
    },
    {
      prompt: 'What novel begins with "Call me Ishmael"?',
      type: 'SINGLE',
      explanation: 'Moby-Dick by Herman Melville opens with this famous line.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Moby-Dick', isCorrect: true },
        { text: 'The Old Man and the Sea', isCorrect: false },
        { text: 'Treasure Island', isCorrect: false },
        { text: 'Robinson Crusoe', isCorrect: false },
      ],
    },
    {
      prompt: 'Who wrote "Pride and Prejudice"?',
      type: 'SINGLE',
      explanation: 'Jane Austen published Pride and Prejudice in 1813.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'Jane Austen', isCorrect: true },
        { text: 'Charlotte Brontë', isCorrect: false },
        { text: 'Emily Brontë', isCorrect: false },
        { text: 'Mary Shelley', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: "To Kill a Mockingbird" was written by Harper Lee.',
      type: 'TRUEFALSE',
      explanation: "Harper Lee's novel was published in 1960 and won the Pulitzer Prize.",
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'Which novel features the character Jay Gatsby?',
      type: 'SINGLE',
      explanation: 'The Great Gatsby by F. Scott Fitzgerald is set in the Roaring Twenties.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'The Great Gatsby', isCorrect: true },
        { text: 'The Sun Also Rises', isCorrect: false },
        { text: 'Of Mice and Men', isCorrect: false },
        { text: 'Catcher in the Rye', isCorrect: false },
      ],
    },
  ],

  // ─── Shakespeare & Co. ─────────────────────────────────────────
  'Shakespeare & Co.': [
    {
      prompt: 'In which play does the character Hamlet appear?',
      type: 'SINGLE',
      explanation: "Hamlet is the Prince of Denmark in Shakespeare's tragedy.",
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Hamlet', isCorrect: true },
        { text: 'Macbeth', isCorrect: false },
        { text: 'Othello', isCorrect: false },
        { text: 'King Lear', isCorrect: false },
      ],
    },
    {
      prompt: '"To be, or not to be" is from which play?',
      type: 'SINGLE',
      explanation: 'This soliloquy is from Act III of Hamlet.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Hamlet', isCorrect: true },
        { text: 'Romeo and Juliet', isCorrect: false },
        { text: 'Julius Caesar', isCorrect: false },
        { text: 'The Tempest', isCorrect: false },
      ],
    },
    {
      prompt: 'What type of play is "Romeo and Juliet"?',
      type: 'SINGLE',
      explanation: 'Romeo and Juliet is a tragedy about star-crossed lovers.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'Tragedy', isCorrect: true },
        { text: 'Comedy', isCorrect: false },
        { text: 'History', isCorrect: false },
        { text: 'Romance', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Shakespeare wrote 154 sonnets.',
      type: 'TRUEFALSE',
      explanation: 'Shakespeare published 154 sonnets in 1609.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'Which play features the witches\' prophecy "Double, double toil and trouble"?',
      type: 'SINGLE',
      explanation: 'The three witches appear in Macbeth.',
      timeLimitSec: 15,
      order: 5,
      choices: [
        { text: 'Macbeth', isCorrect: true },
        { text: 'The Tempest', isCorrect: false },
        { text: "A Midsummer Night's Dream", isCorrect: false },
        { text: 'King Lear', isCorrect: false },
      ],
    },
  ],

  // ─── Famous Paintings ──────────────────────────────────────────
  'Famous Paintings': [
    {
      prompt: 'Who painted the Mona Lisa?',
      type: 'SINGLE',
      explanation: 'Leonardo da Vinci painted the Mona Lisa in the early 16th century.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Leonardo da Vinci', isCorrect: true },
        { text: 'Michelangelo', isCorrect: false },
        { text: 'Raphael', isCorrect: false },
        { text: 'Donatello', isCorrect: false },
      ],
    },
    {
      prompt: 'What painting by Edvard Munch depicts a figure screaming?',
      type: 'SINGLE',
      explanation: 'The Scream is one of the most iconic expressionist paintings.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'The Scream', isCorrect: true },
        { text: 'Starry Night', isCorrect: false },
        { text: 'Guernica', isCorrect: false },
        { text: 'The Persistence of Memory', isCorrect: false },
      ],
    },
    {
      prompt: 'Who painted "Starry Night"?',
      type: 'SINGLE',
      explanation: 'Vincent van Gogh painted Starry Night in 1889.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'Vincent van Gogh', isCorrect: true },
        { text: 'Claude Monet', isCorrect: false },
        { text: 'Pablo Picasso', isCorrect: false },
        { text: 'Salvador Dalí', isCorrect: false },
      ],
    },
    {
      prompt: 'What art movement is Salvador Dalí associated with?',
      type: 'SINGLE',
      explanation: 'Dalí was a leading figure in the Surrealist movement.',
      timeLimitSec: 15,
      order: 4,
      choices: [
        { text: 'Surrealism', isCorrect: true },
        { text: 'Impressionism', isCorrect: false },
        { text: 'Cubism', isCorrect: false },
        { text: 'Baroque', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The Sistine Chapel ceiling was painted by Raphael.',
      type: 'TRUEFALSE',
      explanation: 'Michelangelo painted the Sistine Chapel ceiling between 1508 and 1512.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
  ],

  // ─── Broadway Musicals ─────────────────────────────────────────
  'Broadway Musicals': [
    {
      prompt: 'Which musical features the song "Memory"?',
      type: 'SINGLE',
      explanation: 'Cats by Andrew Lloyd Webber features this iconic ballad.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Cats', isCorrect: true },
        { text: 'The Phantom of the Opera', isCorrect: false },
        { text: 'Les Misérables', isCorrect: false },
        { text: 'Wicked', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the longest-running Broadway show?',
      type: 'SINGLE',
      explanation: 'The Phantom of the Opera ran for over 35 years on Broadway.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'The Phantom of the Opera', isCorrect: true },
        { text: 'Chicago', isCorrect: false },
        { text: 'The Lion King', isCorrect: false },
        { text: 'Cats', isCorrect: false },
      ],
    },
    {
      prompt: 'Which musical is based on the life of Alexander Hamilton?',
      type: 'SINGLE',
      explanation: 'Hamilton by Lin-Manuel Miranda revolutionized modern musical theatre.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'Hamilton', isCorrect: true },
        { text: '1776', isCorrect: false },
        { text: 'Rent', isCorrect: false },
        { text: 'Dear Evan Hansen', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: "Les Misérables" is set during the French Revolution.',
      type: 'TRUEFALSE',
      explanation:
        'Les Misérables is set during the June Rebellion of 1832, not the 1789 Revolution.',
      timeLimitSec: 15,
      order: 4,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
    {
      prompt: 'Which musical features Elphaba and Glinda?',
      type: 'SINGLE',
      explanation: 'Wicked tells the untold story of the witches of Oz.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Wicked', isCorrect: true },
        { text: 'The Wizard of Oz', isCorrect: false },
        { text: 'Into the Woods', isCorrect: false },
        { text: 'Mary Poppins', isCorrect: false },
      ],
    },
  ],

  // ─── European Capitals ─────────────────────────────────────────
  'European Capitals': [
    {
      prompt: 'What is the capital of France?',
      type: 'SINGLE',
      explanation: 'Paris has been the capital of France since the 10th century.',
      timeLimitSec: 5,
      order: 1,
      choices: [
        { text: 'Paris', isCorrect: true },
        { text: 'London', isCorrect: false },
        { text: 'Berlin', isCorrect: false },
        { text: 'Madrid', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the capital of Germany?',
      type: 'SINGLE',
      explanation: 'Berlin became the capital of reunified Germany in 1990.',
      timeLimitSec: 5,
      order: 2,
      choices: [
        { text: 'Berlin', isCorrect: true },
        { text: 'Munich', isCorrect: false },
        { text: 'Frankfurt', isCorrect: false },
        { text: 'Hamburg', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the capital of Italy?',
      type: 'SINGLE',
      explanation: 'Rome is known as the Eternal City.',
      timeLimitSec: 5,
      order: 3,
      choices: [
        { text: 'Rome', isCorrect: true },
        { text: 'Milan', isCorrect: false },
        { text: 'Naples', isCorrect: false },
        { text: 'Florence', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Vienna is the capital of Austria.',
      type: 'TRUEFALSE',
      explanation: "Vienna (Wien) is Austria's capital and largest city.",
      timeLimitSec: 5,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the capital of the Netherlands?',
      type: 'SINGLE',
      explanation:
        'Amsterdam is the constitutional capital, though the government sits in The Hague.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Amsterdam', isCorrect: true },
        { text: 'Rotterdam', isCorrect: false },
        { text: 'The Hague', isCorrect: false },
        { text: 'Utrecht', isCorrect: false },
      ],
    },
  ],

  // ─── Europe History & Culture ──────────────────────────────────
  'Europe History & Culture': [
    {
      prompt: 'What ancient civilization built the Parthenon?',
      type: 'SINGLE',
      explanation: 'The Parthenon in Athens was built by the Ancient Greeks.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Ancient Greeks', isCorrect: true },
        { text: 'Romans', isCorrect: false },
        { text: 'Ottomans', isCorrect: false },
        { text: 'Byzantines', isCorrect: false },
      ],
    },
    {
      prompt: "What famous tower was built for the 1889 World's Fair?",
      type: 'SINGLE',
      explanation: 'The Eiffel Tower was constructed for the 1889 Exposition Universelle.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Eiffel Tower', isCorrect: true },
        { text: 'Leaning Tower of Pisa', isCorrect: false },
        { text: 'Big Ben', isCorrect: false },
        { text: 'Sagrada Familia', isCorrect: false },
      ],
    },
    {
      prompt: 'Which country is known for inventing pizza?',
      type: 'SINGLE',
      explanation: 'Pizza as we know it originated in Naples, Italy.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'Italy', isCorrect: true },
        { text: 'France', isCorrect: false },
        { text: 'Greece', isCorrect: false },
        { text: 'Spain', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The European Union has 27 member states.',
      type: 'TRUEFALSE',
      explanation: 'As of 2020, the EU has 27 members after Brexit.',
      timeLimitSec: 15,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What currency is used by most EU countries?',
      type: 'SINGLE',
      explanation: 'The Euro is the official currency of 20 EU member states.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Euro', isCorrect: true },
        { text: 'Pound', isCorrect: false },
        { text: 'Franc', isCorrect: false },
        { text: 'Dollar', isCorrect: false },
      ],
    },
  ],

  // ─── Asian Geography ───────────────────────────────────────────
  'Asian Geography': [
    {
      prompt: 'What is the largest country in Asia by area?',
      type: 'SINGLE',
      explanation: 'Russia spans both Europe and Asia, making it the largest by area.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Russia', isCorrect: true },
        { text: 'China', isCorrect: false },
        { text: 'India', isCorrect: false },
        { text: 'Kazakhstan', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the tallest mountain in Asia?',
      type: 'SINGLE',
      explanation: 'Mount Everest stands at 8,848 meters on the Nepal-China border.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Mount Everest', isCorrect: true },
        { text: 'K2', isCorrect: false },
        { text: 'Kangchenjunga', isCorrect: false },
        { text: 'Mount Fuji', isCorrect: false },
      ],
    },
    {
      prompt: 'What river is the longest in Asia?',
      type: 'SINGLE',
      explanation: 'The Yangtze River flows for 6,300 km through China.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'Yangtze', isCorrect: true },
        { text: 'Ganges', isCorrect: false },
        { text: 'Mekong', isCorrect: false },
        { text: 'Yellow River', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Japan is an archipelago of over 6,800 islands.',
      type: 'TRUEFALSE',
      explanation: 'Japan consists of 6,852 islands, with Honshu being the largest.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the most populous country in Asia?',
      type: 'SINGLE',
      explanation: 'India surpassed China as the most populous country in 2023.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'India', isCorrect: true },
        { text: 'China', isCorrect: false },
        { text: 'Indonesia', isCorrect: false },
        { text: 'Pakistan', isCorrect: false },
      ],
    },
  ],

  // ─── Asian History ─────────────────────────────────────────────
  'Asian History': [
    {
      prompt: 'Which dynasty built the Great Wall of China?',
      type: 'SINGLE',
      explanation: 'The Qin Dynasty first unified and began connecting existing walls.',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'Qin Dynasty', isCorrect: true },
        { text: 'Han Dynasty', isCorrect: false },
        { text: 'Ming Dynasty', isCorrect: false },
        { text: 'Tang Dynasty', isCorrect: false },
      ],
    },
    {
      prompt: 'Who was the first Emperor of unified China?',
      type: 'SINGLE',
      explanation: 'Qin Shi Huang unified China in 221 BCE.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'Qin Shi Huang', isCorrect: true },
        { text: 'Kublai Khan', isCorrect: false },
        { text: 'Sun Tzu', isCorrect: false },
        { text: 'Confucius', isCorrect: false },
      ],
    },
    {
      prompt: 'What ancient trade route connected Asia to Europe?',
      type: 'SINGLE',
      explanation: 'The Silk Road was a network of trade routes spanning thousands of miles.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'The Silk Road', isCorrect: true },
        { text: 'The Spice Route', isCorrect: false },
        { text: 'The Amber Road', isCorrect: false },
        { text: 'The Royal Road', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The Taj Mahal was built as a palace.',
      type: 'TRUEFALSE',
      explanation: 'The Taj Mahal was built as a mausoleum by Emperor Shah Jahan for his wife.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
    {
      prompt: 'Which empire ruled most of India before British colonization?',
      type: 'SINGLE',
      explanation: 'The Mughal Empire ruled much of India from the 16th to 19th centuries.',
      timeLimitSec: 15,
      order: 5,
      choices: [
        { text: 'Mughal Empire', isCorrect: true },
        { text: 'Ottoman Empire', isCorrect: false },
        { text: 'Maurya Empire', isCorrect: false },
        { text: 'Gupta Empire', isCorrect: false },
      ],
    },
  ],

  // ─── World Landmarks ───────────────────────────────────────────
  'World Landmarks': [
    {
      prompt: 'In which country is the Taj Mahal located?',
      type: 'SINGLE',
      explanation: 'The Taj Mahal is in Agra, India.',
      timeLimitSec: 5,
      order: 1,
      choices: [
        { text: 'India', isCorrect: true },
        { text: 'Pakistan', isCorrect: false },
        { text: 'Bangladesh', isCorrect: false },
        { text: 'Nepal', isCorrect: false },
      ],
    },
    {
      prompt: 'What statue stands in New York Harbor?',
      type: 'SINGLE',
      explanation: 'The Statue of Liberty was a gift from France in 1886.',
      timeLimitSec: 5,
      order: 2,
      choices: [
        { text: 'Statue of Liberty', isCorrect: true },
        { text: 'Christ the Redeemer', isCorrect: false },
        { text: 'The Thinker', isCorrect: false },
        { text: 'David', isCorrect: false },
      ],
    },
    {
      prompt: 'Where is Machu Picchu located?',
      type: 'SINGLE',
      explanation: 'Machu Picchu is an Incan citadel in the Andes Mountains of Peru.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'Peru', isCorrect: true },
        { text: 'Mexico', isCorrect: false },
        { text: 'Bolivia', isCorrect: false },
        { text: 'Chile', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The Colosseum is in Rome, Italy.',
      type: 'TRUEFALSE',
      explanation: 'The Colosseum is an ancient amphitheater in the center of Rome.',
      timeLimitSec: 5,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'In which country would you find the Great Barrier Reef?',
      type: 'SINGLE',
      explanation: 'The Great Barrier Reef is off the coast of Queensland, Australia.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Australia', isCorrect: true },
        { text: 'New Zealand', isCorrect: false },
        { text: 'Indonesia', isCorrect: false },
        { text: 'Philippines', isCorrect: false },
      ],
    },
  ],

  // ─── NBA History ───────────────────────────────────────────────
  'NBA History': [
    {
      prompt: 'Which team has won the most NBA championships?',
      type: 'SINGLE',
      explanation: 'The Boston Celtics have 18 championships as of 2025.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Boston Celtics', isCorrect: true },
        { text: 'Los Angeles Lakers', isCorrect: false },
        { text: 'Chicago Bulls', isCorrect: false },
        { text: 'Golden State Warriors', isCorrect: false },
      ],
    },
    {
      prompt: "Who is the NBA's all-time leading scorer?",
      type: 'SINGLE',
      explanation: "LeBron James surpassed Kareem Abdul-Jabbar's record in 2023.",
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'LeBron James', isCorrect: true },
        { text: 'Kareem Abdul-Jabbar', isCorrect: false },
        { text: 'Michael Jordan', isCorrect: false },
        { text: 'Kobe Bryant', isCorrect: false },
      ],
    },
    {
      prompt: 'What player is known as "His Airness"?',
      type: 'SINGLE',
      explanation: 'Michael Jordan earned this nickname for his incredible leaping ability.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'Michael Jordan', isCorrect: true },
        { text: 'Vince Carter', isCorrect: false },
        { text: 'Julius Erving', isCorrect: false },
        { text: 'Dominique Wilkins', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: A basketball game is divided into 4 quarters.',
      type: 'TRUEFALSE',
      explanation: 'NBA games consist of four 12-minute quarters.',
      timeLimitSec: 5,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'How many players are on the court per team in basketball?',
      type: 'SINGLE',
      explanation: 'Each team has 5 players on court at a time.',
      timeLimitSec: 5,
      order: 5,
      choices: [
        { text: '5', isCorrect: true },
        { text: '6', isCorrect: false },
        { text: '4', isCorrect: false },
        { text: '7', isCorrect: false },
      ],
    },
  ],

  // ─── Basketball Records ────────────────────────────────────────
  'Basketball Records': [
    {
      prompt: 'Who holds the record for most points in a single NBA game?',
      type: 'SINGLE',
      explanation: 'Wilt Chamberlain scored 100 points on March 2, 1962.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Wilt Chamberlain', isCorrect: true },
        { text: 'Kobe Bryant', isCorrect: false },
        { text: 'Michael Jordan', isCorrect: false },
        { text: 'David Thompson', isCorrect: false },
      ],
    },
    {
      prompt: 'What is a triple-double?',
      type: 'SINGLE',
      explanation: 'A player records double digits in three of five statistical categories.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'Double digits in 3 stat categories', isCorrect: true },
        { text: 'Three double-digit scoring quarters', isCorrect: false },
        { text: 'Three players with 10+ points', isCorrect: false },
        { text: 'Double digits in points and assists', isCorrect: false },
      ],
    },
    {
      prompt: 'Who holds the record for most career triple-doubles?',
      type: 'SINGLE',
      explanation: 'Russell Westbrook holds the NBA record for most career triple-doubles.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'Russell Westbrook', isCorrect: true },
        { text: 'Oscar Robertson', isCorrect: false },
        { text: 'Magic Johnson', isCorrect: false },
        { text: 'LeBron James', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the highest team score in a regulation NBA game?',
      type: 'SINGLE',
      explanation: 'The Detroit Pistons scored 186 points against Denver in 1983.',
      timeLimitSec: 15,
      order: 4,
      choices: [
        { text: '186', isCorrect: true },
        { text: '173', isCorrect: false },
        { text: '200', isCorrect: false },
        { text: '162', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: A player has scored over 100 points in an NBA game more than once.',
      type: 'TRUEFALSE',
      explanation: "Only Wilt Chamberlain has scored 100 points; Kobe Bryant's 81 is second.",
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
  ],

  // ─── Grand Slam Champions ──────────────────────────────────────
  'Grand Slam Champions': [
    {
      prompt: 'How many Grand Slam tournaments are there in tennis?',
      type: 'SINGLE',
      explanation: 'There are 4: Australian Open, French Open, Wimbledon, US Open.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: '4', isCorrect: true },
        { text: '3', isCorrect: false },
        { text: '5', isCorrect: false },
        { text: '6', isCorrect: false },
      ],
    },
    {
      prompt: 'Which Grand Slam is played on grass courts?',
      type: 'SINGLE',
      explanation: 'Wimbledon is the only Grand Slam played on grass.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Wimbledon', isCorrect: true },
        { text: 'US Open', isCorrect: false },
        { text: 'French Open', isCorrect: false },
        { text: 'Australian Open', isCorrect: false },
      ],
    },
    {
      prompt: "Who has won the most men's Grand Slam singles titles?",
      type: 'SINGLE',
      explanation: 'Novak Djokovic holds the record with the most Grand Slam titles.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'Novak Djokovic', isCorrect: true },
        { text: 'Rafael Nadal', isCorrect: false },
        { text: 'Roger Federer', isCorrect: false },
        { text: 'Pete Sampras', isCorrect: false },
      ],
    },
    {
      prompt: 'Which Grand Slam is played on clay?',
      type: 'SINGLE',
      explanation: 'The French Open (Roland Garros) is played on red clay.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'French Open', isCorrect: true },
        { text: 'Wimbledon', isCorrect: false },
        { text: 'US Open', isCorrect: false },
        { text: 'Australian Open', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: A tennis match can end in a tie.',
      type: 'TRUEFALSE',
      explanation: 'Tennis matches always have a winner; there is no tie.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
  ],

  // ─── Tennis Legends ────────────────────────────────────────────
  'Tennis Legends': [
    {
      prompt: 'Which female player has won the most Grand Slam singles titles?',
      type: 'SINGLE',
      explanation: 'Margaret Court holds the record with 24 Grand Slam singles titles.',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'Margaret Court', isCorrect: true },
        { text: 'Serena Williams', isCorrect: false },
        { text: 'Steffi Graf', isCorrect: false },
        { text: 'Martina Navratilova', isCorrect: false },
      ],
    },
    {
      prompt: 'What is a "Grand Slam" in tennis?',
      type: 'SINGLE',
      explanation: 'Winning all four major tournaments in a single calendar year.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'Winning all 4 majors in one year', isCorrect: true },
        { text: 'Winning any major tournament', isCorrect: false },
        { text: 'Winning two majors', isCorrect: false },
        { text: 'Achieving world #1 ranking', isCorrect: false },
      ],
    },
    {
      prompt: 'What surface is the Australian Open played on?',
      type: 'SINGLE',
      explanation: 'The Australian Open uses hard courts (acrylic surface).',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'Hard court', isCorrect: true },
        { text: 'Clay', isCorrect: false },
        { text: 'Grass', isCorrect: false },
        { text: 'Carpet', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Roger Federer won 20 Grand Slam singles titles.',
      type: 'TRUEFALSE',
      explanation: 'Federer retired with 20 Grand Slam singles titles.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What does "love" mean in tennis scoring?',
      type: 'SINGLE',
      explanation: 'Love means zero (0) in tennis scoring.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Zero', isCorrect: true },
        { text: 'One', isCorrect: false },
        { text: 'Deuce', isCorrect: false },
        { text: 'Advantage', isCorrect: false },
      ],
    },
  ],

  // ─── Extreme Sports ────────────────────────────────────────────
  'Extreme Sports': [
    {
      prompt: 'What extreme sport involves jumping from fixed objects with a parachute?',
      type: 'SINGLE',
      explanation: 'BASE jumping: Building, Antenna, Span, Earth.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'BASE jumping', isCorrect: true },
        { text: 'Skydiving', isCorrect: false },
        { text: 'Bungee jumping', isCorrect: false },
        { text: 'Paragliding', isCorrect: false },
      ],
    },
    {
      prompt: 'What board sport is performed on snowy slopes?',
      type: 'SINGLE',
      explanation: 'Snowboarding involves riding a single board down snow-covered slopes.',
      timeLimitSec: 5,
      order: 2,
      choices: [
        { text: 'Snowboarding', isCorrect: true },
        { text: 'Surfing', isCorrect: false },
        { text: 'Skateboarding', isCorrect: false },
        { text: 'Wakeboarding', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The X Games feature both summer and winter events.',
      type: 'TRUEFALSE',
      explanation:
        'The X Games has summer (skateboarding, BMX) and winter (snowboarding, skiing) editions.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What sport involves riding waves on a board?',
      type: 'SINGLE',
      explanation: 'Surfing originated in Polynesia and is now a global sport.',
      timeLimitSec: 5,
      order: 4,
      choices: [
        { text: 'Surfing', isCorrect: true },
        { text: 'Skimboarding', isCorrect: false },
        { text: 'Bodyboarding', isCorrect: false },
        { text: 'Paddleboarding', isCorrect: false },
      ],
    },
    {
      prompt: 'What is free solo climbing?',
      type: 'SINGLE',
      explanation: 'Climbing without ropes or safety equipment, relying only on skill.',
      timeLimitSec: 15,
      order: 5,
      choices: [
        { text: 'Climbing without ropes or gear', isCorrect: true },
        { text: 'Climbing alone with ropes', isCorrect: false },
        { text: 'Speed climbing', isCorrect: false },
        { text: 'Indoor climbing', isCorrect: false },
      ],
    },
  ],

  // ─── Formula 1 ─────────────────────────────────────────────────
  'Formula 1': [
    {
      prompt: 'Which country hosts the Monaco Grand Prix?',
      type: 'SINGLE',
      explanation: 'The Monaco Grand Prix runs through the streets of Monte Carlo.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Monaco', isCorrect: true },
        { text: 'France', isCorrect: false },
        { text: 'Italy', isCorrect: false },
        { text: 'Spain', isCorrect: false },
      ],
    },
    {
      prompt: 'Who holds the record for most F1 World Championships?',
      type: 'SINGLE',
      explanation: 'Lewis Hamilton and Michael Schumacher are tied at 7 championships each.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'Lewis Hamilton', isCorrect: true },
        { text: 'Michael Schumacher', isCorrect: true },
        { text: 'Max Verstappen', isCorrect: false },
        { text: 'Sebastian Vettel', isCorrect: false },
      ],
    },
    {
      prompt: 'What color flag signals the race winner?',
      type: 'SINGLE',
      explanation: 'The checkered flag waves when the race winner crosses the finish line.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'Checkered flag', isCorrect: true },
        { text: 'Red flag', isCorrect: false },
        { text: 'Green flag', isCorrect: false },
        { text: 'Yellow flag', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: F1 cars can exceed 300 km/h.',
      type: 'TRUEFALSE',
      explanation: 'Modern F1 cars can reach speeds over 370 km/h (230 mph).',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What does DRS stand for in F1?',
      type: 'SINGLE',
      explanation: 'Drag Reduction System opens a flap on the rear wing to reduce drag.',
      timeLimitSec: 15,
      order: 5,
      choices: [
        { text: 'Drag Reduction System', isCorrect: true },
        { text: 'Dynamic Race Speed', isCorrect: false },
        { text: 'Drive Recovery System', isCorrect: false },
        { text: 'Downforce Reduction Setup', isCorrect: false },
      ],
    },
  ],

  // ─── AI Fundamentals ───────────────────────────────────────────
  'AI Fundamentals': [
    {
      prompt: 'What does AI stand for?',
      type: 'SINGLE',
      explanation: 'AI stands for Artificial Intelligence.',
      timeLimitSec: 5,
      order: 1,
      choices: [
        { text: 'Artificial Intelligence', isCorrect: true },
        { text: 'Automated Integration', isCorrect: false },
        { text: 'Advanced Interface', isCorrect: false },
        { text: 'Analog Input', isCorrect: false },
      ],
    },
    {
      prompt: 'What is a neural network inspired by?',
      type: 'SINGLE',
      explanation: "Neural networks are modeled after the human brain's neurons.",
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'The human brain', isCorrect: true },
        { text: 'Computer circuits', isCorrect: false },
        { text: 'Tree branches', isCorrect: false },
        { text: 'The internet', isCorrect: false },
      ],
    },
    {
      prompt: 'What is machine learning?',
      type: 'SINGLE',
      explanation:
        'Machine learning allows computers to learn patterns from data without explicit programming.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'Computers learning from data', isCorrect: true },
        { text: 'Programming by hand', isCorrect: false },
        { text: 'Manual rule creation', isCorrect: false },
        { text: 'Internet browsing', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: ChatGPT is an example of a large language model.',
      type: 'TRUEFALSE',
      explanation: 'ChatGPT is built on GPT, a large language model by OpenAI.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the Turing Test?',
      type: 'SINGLE',
      explanation:
        'A test to determine if a machine can exhibit intelligent behavior indistinguishable from a human.',
      timeLimitSec: 20,
      order: 5,
      choices: [
        { text: 'A test of machine intelligence vs human', isCorrect: true },
        { text: 'A programming competition', isCorrect: false },
        { text: 'A hardware benchmark', isCorrect: false },
        { text: 'A chess algorithm', isCorrect: false },
      ],
    },
  ],

  // ─── The History of Computing ──────────────────────────────────
  'The History of Computing': [
    {
      prompt: 'Who is considered the father of computer science?',
      type: 'SINGLE',
      explanation: 'Alan Turing laid the theoretical foundation for modern computing.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Alan Turing', isCorrect: true },
        { text: 'Charles Babbage', isCorrect: false },
        { text: 'Steve Jobs', isCorrect: false },
        { text: 'Bill Gates', isCorrect: false },
      ],
    },
    {
      prompt: 'What was the first electronic general-purpose computer?',
      type: 'SINGLE',
      explanation: 'ENIAC was completed in 1945 and weighed over 27 tons.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'ENIAC', isCorrect: true },
        { text: 'UNIVAC', isCorrect: false },
        { text: 'Apple I', isCorrect: false },
        { text: 'IBM PC', isCorrect: false },
      ],
    },
    {
      prompt: 'In what year was the World Wide Web invented?',
      type: 'SINGLE',
      explanation: 'Tim Berners-Lee invented the WWW in 1989.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: '1989', isCorrect: true },
        { text: '1995', isCorrect: false },
        { text: '1985', isCorrect: false },
        { text: '1991', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The first computer mouse was made of wood.',
      type: 'TRUEFALSE',
      explanation: "Douglas Engelbart's first mouse prototype in 1964 had a wooden shell.",
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What company created the first iPhone?',
      type: 'SINGLE',
      explanation: 'Apple Inc. released the original iPhone in 2007.',
      timeLimitSec: 5,
      order: 5,
      choices: [
        { text: 'Apple', isCorrect: true },
        { text: 'Samsung', isCorrect: false },
        { text: 'Nokia', isCorrect: false },
        { text: 'Google', isCorrect: false },
      ],
    },
  ],

  // ─── Internet History ──────────────────────────────────────────
  'Internet History': [
    {
      prompt: 'What was the precursor to the internet called?',
      type: 'SINGLE',
      explanation: 'ARPANET was developed by the US Department of Defense in 1969.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'ARPANET', isCorrect: true },
        { text: 'Ethernet', isCorrect: false },
        { text: 'Intranet', isCorrect: false },
        { text: 'USENET', isCorrect: false },
      ],
    },
    {
      prompt: 'What does URL stand for?',
      type: 'SINGLE',
      explanation: 'URL: Uniform Resource Locator.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Uniform Resource Locator', isCorrect: true },
        { text: 'Universal Reference Link', isCorrect: false },
        { text: 'Unified Resource Library', isCorrect: false },
        { text: 'User Request Language', isCorrect: false },
      ],
    },
    {
      prompt: 'Which company created the first widely-used web browser?',
      type: 'SINGLE',
      explanation: 'Netscape Navigator dominated the early web in the 1990s.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'Netscape', isCorrect: true },
        { text: 'Microsoft', isCorrect: false },
        { text: 'Google', isCorrect: false },
        { text: 'Apple', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The first email was sent in 1971.',
      type: 'TRUEFALSE',
      explanation: 'Ray Tomlinson sent the first network email in 1971.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the most visited website in the world?',
      type: 'SINGLE',
      explanation: 'Google.com receives the highest traffic globally.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Google', isCorrect: true },
        { text: 'YouTube', isCorrect: false },
        { text: 'Facebook', isCorrect: false },
        { text: 'Amazon', isCorrect: false },
      ],
    },
  ],

  // ─── Web Technologies ──────────────────────────────────────────
  'Web Technologies': [
    {
      prompt: 'What does HTML stand for?',
      type: 'SINGLE',
      explanation: 'HTML: HyperText Markup Language.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'HyperText Markup Language', isCorrect: true },
        { text: 'High Tech Modern Language', isCorrect: false },
        { text: 'HyperTool Management Layer', isCorrect: false },
        { text: 'Home Tool Markup Language', isCorrect: false },
      ],
    },
    {
      prompt: 'What does CSS stand for?',
      type: 'SINGLE',
      explanation: 'CSS: Cascading Style Sheets.',
      timeLimitSec: 5,
      order: 2,
      choices: [
        { text: 'Cascading Style Sheets', isCorrect: true },
        { text: 'Computer Style System', isCorrect: false },
        { text: 'Creative Style Syntax', isCorrect: false },
        { text: 'Color Style Script', isCorrect: false },
      ],
    },
    {
      prompt: 'What is HTTP used for?',
      type: 'SINGLE',
      explanation: 'HTTP transfers web pages and data between servers and browsers.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'Transferring web pages', isCorrect: true },
        { text: 'Sending emails', isCorrect: false },
        { text: 'Database queries', isCorrect: false },
        { text: 'File storage', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: JavaScript and Java are the same language.',
      type: 'TRUEFALSE',
      explanation: 'JavaScript and Java are completely different languages.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
    {
      prompt: 'What is a web cookie?',
      type: 'SINGLE',
      explanation: 'A cookie is a small text file stored in the browser for tracking/session data.',
      timeLimitSec: 15,
      order: 5,
      choices: [
        { text: 'Small text file stored by browser', isCorrect: true },
        { text: 'A type of virus', isCorrect: false },
        { text: 'A download manager', isCorrect: false },
        { text: 'A browser extension', isCorrect: false },
      ],
    },
  ],

  // ─── Cybersecurity Basics ──────────────────────────────────────
  'Cybersecurity Basics': [
    {
      prompt: 'What is a phishing attack?',
      type: 'SINGLE',
      explanation:
        'Phishing tricks users into revealing sensitive information through fake messages.',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'Fake messages to steal info', isCorrect: true },
        { text: 'A virus that deletes files', isCorrect: false },
        { text: 'Brute force password guessing', isCorrect: false },
        { text: 'Network DDoS attack', isCorrect: false },
      ],
    },
    {
      prompt: 'What does 2FA stand for?',
      type: 'SINGLE',
      explanation: 'Two-Factor Authentication adds a second verification step.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Two-Factor Authentication', isCorrect: true },
        { text: 'Two-Factor Authorization', isCorrect: false },
        { text: 'Two-File Access', isCorrect: false },
        { text: 'Triple-Factor Access', isCorrect: false },
      ],
    },
    {
      prompt:
        'True or False: A strong password should include uppercase, lowercase, numbers, and symbols.',
      type: 'TRUEFALSE',
      explanation: 'Mixed character types make passwords harder to crack.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What is encryption?',
      type: 'SINGLE',
      explanation: 'Encryption scrambles data so only authorized parties can read it.',
      timeLimitSec: 15,
      order: 4,
      choices: [
        { text: 'Scrambling data for security', isCorrect: true },
        { text: 'Deleting unused files', isCorrect: false },
        { text: 'Compressing data', isCorrect: false },
        { text: 'Backing up data', isCorrect: false },
      ],
    },
    {
      prompt: 'What is malware?',
      type: 'SINGLE',
      explanation: 'Malware is malicious software designed to harm or exploit systems.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Malicious software', isCorrect: true },
        { text: 'Marketing software', isCorrect: false },
        { text: 'Maintenance software', isCorrect: false },
        { text: 'Monitoring software', isCorrect: false },
      ],
    },
  ],

  // ─── Tech Gadgets ──────────────────────────────────────────────
  'Tech Gadgets': [
    {
      prompt: 'What company makes the Galaxy smartphone series?',
      type: 'SINGLE',
      explanation: 'Samsung is the manufacturer of Galaxy devices.',
      timeLimitSec: 5,
      order: 1,
      choices: [
        { text: 'Samsung', isCorrect: true },
        { text: 'Apple', isCorrect: false },
        { text: 'Google', isCorrect: false },
        { text: 'Sony', isCorrect: false },
      ],
    },
    {
      prompt: 'What is a smartwatch?',
      type: 'SINGLE',
      explanation: 'A wearable device that connects to your phone and tracks health/fitness.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'A wearable computing device', isCorrect: true },
        { text: 'A digital wall clock', isCorrect: false },
        { text: 'A phone accessory', isCorrect: false },
        { text: 'A GPS tracker', isCorrect: false },
      ],
    },
    {
      prompt: 'What does VR stand for?',
      type: 'SINGLE',
      explanation: 'VR: Virtual Reality.',
      timeLimitSec: 5,
      order: 3,
      choices: [
        { text: 'Virtual Reality', isCorrect: true },
        { text: 'Visual Recognition', isCorrect: false },
        { text: 'Voice Response', isCorrect: false },
        { text: 'Video Recording', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Wireless earbuds use Bluetooth technology.',
      type: 'TRUEFALSE',
      explanation: 'Most wireless earbuds connect via Bluetooth.',
      timeLimitSec: 5,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What type of device is a Kindle?',
      type: 'SINGLE',
      explanation: 'Amazon Kindle is an e-reader for digital books.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'E-reader', isCorrect: true },
        { text: 'Tablet', isCorrect: false },
        { text: 'Smartphone', isCorrect: false },
        { text: 'Laptop', isCorrect: false },
      ],
    },
  ],

  // ─── Classic TV Shows ──────────────────────────────────────────
  'Classic TV Shows': [
    {
      prompt: 'What sitcom is set in Central Perk coffee shop?',
      type: 'SINGLE',
      explanation: 'Friends featured six friends living in Manhattan.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Friends', isCorrect: true },
        { text: 'Seinfeld', isCorrect: false },
        { text: 'How I Met Your Mother', isCorrect: false },
        { text: 'The Office', isCorrect: false },
      ],
    },
    {
      prompt: 'What TV series is about a chemistry teacher turned drug lord?',
      type: 'SINGLE',
      explanation: "Breaking Bad follows Walter White's transformation.",
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Breaking Bad', isCorrect: true },
        { text: 'The Wire', isCorrect: false },
        { text: 'Ozark', isCorrect: false },
        { text: 'Narcos', isCorrect: false },
      ],
    },
    {
      prompt:
        'True or False: "The Simpsons" is the longest-running American scripted primetime series.',
      type: 'TRUEFALSE',
      explanation: 'The Simpsons has been on air since 1989.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What fantasy series is based on books by George R.R. Martin?',
      type: 'SINGLE',
      explanation: 'Game of Thrones aired on HBO from 2011 to 2019.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'Game of Thrones', isCorrect: true },
        { text: 'The Witcher', isCorrect: false },
        { text: 'Lord of the Rings', isCorrect: false },
        { text: 'Wheel of Time', isCorrect: false },
      ],
    },
    {
      prompt: 'Which show features the quote "Winter is coming"?',
      type: 'SINGLE',
      explanation: 'The Stark family motto from Game of Thrones.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Game of Thrones', isCorrect: true },
        { text: 'Vikings', isCorrect: false },
        { text: 'The Last Kingdom', isCorrect: false },
        { text: 'Outlander', isCorrect: false },
      ],
    },
  ],

  // ─── Binge-Worthy Series ───────────────────────────────────────
  'Binge-Worthy Series': [
    {
      prompt: 'Which streaming service produces "Stranger Things"?',
      type: 'SINGLE',
      explanation: 'Stranger Things is a Netflix original series.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Netflix', isCorrect: true },
        { text: 'Amazon Prime', isCorrect: false },
        { text: 'Disney+', isCorrect: false },
        { text: 'HBO Max', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the most-watched Netflix series of all time?',
      type: 'SINGLE',
      explanation: 'Squid Game holds the record for most views.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'Squid Game', isCorrect: true },
        { text: 'Wednesday', isCorrect: false },
        { text: 'Stranger Things', isCorrect: false },
        { text: 'Bridgerton', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: "The Crown" is a historical drama about the British monarchy.',
      type: 'TRUEFALSE',
      explanation: 'The Crown chronicles the reign of Queen Elizabeth II.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What series follows the Shelby family in 1920s Birmingham?',
      type: 'SINGLE',
      explanation: 'Peaky Blinders stars Cillian Murphy as Tommy Shelby.',
      timeLimitSec: 15,
      order: 4,
      choices: [
        { text: 'Peaky Blinders', isCorrect: true },
        { text: 'Boardwalk Empire', isCorrect: false },
        { text: 'Downton Abbey', isCorrect: false },
        { text: 'Babylon Berlin', isCorrect: false },
      ],
    },
    {
      prompt: 'Which platform streams "The Mandalorian"?',
      type: 'SINGLE',
      explanation: 'The Mandalorian is exclusive to Disney+.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Disney+', isCorrect: true },
        { text: 'Netflix', isCorrect: false },
        { text: 'HBO Max', isCorrect: false },
        { text: 'Apple TV+', isCorrect: false },
      ],
    },
  ],

  // ─── Popular Podcasts ──────────────────────────────────────────
  'Popular Podcasts': [
    {
      prompt: 'What true crime podcast is credited with popularizing the genre?',
      type: 'SINGLE',
      explanation: "Serial's first season investigated the murder of Hae Min Lee.",
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Serial', isCorrect: true },
        { text: 'My Favorite Murder', isCorrect: false },
        { text: 'Crime Junkie', isCorrect: false },
        { text: 'Criminal', isCorrect: false },
      ],
    },
    {
      prompt: 'What does RSS stand for in podcasting?',
      type: 'SINGLE',
      explanation: 'RSS: Really Simple Syndication, used to distribute podcast episodes.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'Really Simple Syndication', isCorrect: true },
        { text: 'Radio Streaming Service', isCorrect: false },
        { text: 'Recorded Sound System', isCorrect: false },
        { text: 'Remote Speech Server', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Podcasts can be downloaded and listened to offline.',
      type: 'TRUEFALSE',
      explanation: 'Most podcast apps allow downloading episodes for offline listening.',
      timeLimitSec: 5,
      order: 3,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What podcast platform is owned by Spotify?',
      type: 'SINGLE',
      explanation: 'Spotify acquired Anchor and invested heavily in podcasting.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'Spotify', isCorrect: true },
        { text: 'Apple Podcasts', isCorrect: false },
        { text: 'Google Podcasts', isCorrect: false },
        { text: 'Stitcher', isCorrect: false },
      ],
    },
    {
      prompt: 'What genre is "The Joe Rogan Experience"?',
      type: 'SINGLE',
      explanation: 'JRE is a long-form interview/conversation podcast.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Interview/Conversation', isCorrect: true },
        { text: 'True Crime', isCorrect: false },
        { text: 'News', isCorrect: false },
        { text: 'Fiction', isCorrect: false },
      ],
    },
  ],

  // ─── Comic Book Heroes ─────────────────────────────────────────
  'Comic Book Heroes': [
    {
      prompt: 'Which superhero is known as the "Man of Steel"?',
      type: 'SINGLE',
      explanation: "Superman, from the planet Krypton, is DC's flagship hero.",
      timeLimitSec: 5,
      order: 1,
      choices: [
        { text: 'Superman', isCorrect: true },
        { text: 'Iron Man', isCorrect: false },
        { text: 'Thor', isCorrect: false },
        { text: 'Captain America', isCorrect: false },
      ],
    },
    {
      prompt: "What is Spider-Man's real name?",
      type: 'SINGLE',
      explanation: 'Peter Parker was bitten by a radioactive spider.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Peter Parker', isCorrect: true },
        { text: 'Miles Morales', isCorrect: false },
        { text: 'Bruce Wayne', isCorrect: false },
        { text: 'Clark Kent', isCorrect: false },
      ],
    },
    {
      prompt: 'Which comic company publishes Batman?',
      type: 'SINGLE',
      explanation: 'Batman is published by DC Comics.',
      timeLimitSec: 5,
      order: 3,
      choices: [
        { text: 'DC Comics', isCorrect: true },
        { text: 'Marvel', isCorrect: false },
        { text: 'Image', isCorrect: false },
        { text: 'Dark Horse', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Wolverine has adamantium claws.',
      type: 'TRUEFALSE',
      explanation: "Wolverine's skeleton and claws are coated with adamantium.",
      timeLimitSec: 5,
      order: 4,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What team includes Iron Man, Thor, and Captain America?',
      type: 'SINGLE',
      explanation: "The Avengers are Earth's mightiest heroes.",
      timeLimitSec: 5,
      order: 5,
      choices: [
        { text: 'The Avengers', isCorrect: true },
        { text: 'Justice League', isCorrect: false },
        { text: 'X-Men', isCorrect: false },
        { text: 'Fantastic Four', isCorrect: false },
      ],
    },
  ],

  // ─── World Cuisine ─────────────────────────────────────────────
  'World Cuisine': [
    {
      prompt: 'Which country is sushi originally from?',
      type: 'SINGLE',
      explanation: 'Sushi originated in Japan as a method of preserving fish.',
      timeLimitSec: 5,
      order: 1,
      choices: [
        { text: 'Japan', isCorrect: true },
        { text: 'China', isCorrect: false },
        { text: 'Korea', isCorrect: false },
        { text: 'Thailand', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the main ingredient in guacamole?',
      type: 'SINGLE',
      explanation: 'Avocado is the primary ingredient in traditional guacamole.',
      timeLimitSec: 5,
      order: 2,
      choices: [
        { text: 'Avocado', isCorrect: true },
        { text: 'Tomato', isCorrect: false },
        { text: 'Lime', isCorrect: false },
        { text: 'Onion', isCorrect: false },
      ],
    },
    {
      prompt: 'Which country is known for croissants?',
      type: 'SINGLE',
      explanation: 'Croissants are a French pastry, though inspired by Austrian kipferl.',
      timeLimitSec: 5,
      order: 3,
      choices: [
        { text: 'France', isCorrect: true },
        { text: 'Austria', isCorrect: false },
        { text: 'Italy', isCorrect: false },
        { text: 'Belgium', isCorrect: false },
      ],
    },
    {
      prompt: 'What spice gives curry its yellow color?',
      type: 'SINGLE',
      explanation: 'Turmeric provides the characteristic yellow color in many curries.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'Turmeric', isCorrect: true },
        { text: 'Saffron', isCorrect: false },
        { text: 'Paprika', isCorrect: false },
        { text: 'Cumin', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Pizza originated in the United States.',
      type: 'TRUEFALSE',
      explanation: 'Modern pizza originated in Naples, Italy.',
      timeLimitSec: 5,
      order: 5,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
  ],

  // ─── Cooking Techniques ────────────────────────────────────────
  'Cooking Techniques': [
    {
      prompt: 'What does "al dente" mean?',
      type: 'SINGLE',
      explanation: 'Al dente means "to the tooth" — pasta cooked firm to the bite.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Firm to the bite', isCorrect: true },
        { text: 'Fully soft', isCorrect: false },
        { text: 'Overcooked', isCorrect: false },
        { text: 'Undercooked', isCorrect: false },
      ],
    },
    {
      prompt: 'What cooking method involves submerging food in hot oil?',
      type: 'SINGLE',
      explanation: 'Deep frying cooks food by fully submerging it in hot oil.',
      timeLimitSec: 5,
      order: 2,
      choices: [
        { text: 'Deep frying', isCorrect: true },
        { text: 'Sautéing', isCorrect: false },
        { text: 'Baking', isCorrect: false },
        { text: 'Braising', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the Maillard reaction?',
      type: 'SINGLE',
      explanation:
        'A chemical reaction between amino acids and sugars that creates browning and flavor.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'Browning reaction between proteins and sugars', isCorrect: true },
        { text: 'Melting of butter', isCorrect: false },
        { text: 'Fermentation of dough', isCorrect: false },
        { text: 'Emulsification of oil and water', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Searing meat "seals in" the juices.',
      type: 'TRUEFALSE',
      explanation: "Searing creates flavor through browning but doesn't seal in juices.",
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
    {
      prompt: 'What knife cut produces thin strips?',
      type: 'SINGLE',
      explanation: 'Julienne cuts produce thin matchstick-shaped strips.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Julienne', isCorrect: true },
        { text: 'Dice', isCorrect: false },
        { text: 'Mince', isCorrect: false },
        { text: 'Chop', isCorrect: false },
      ],
    },
  ],

  // ─── Travel Destinations ───────────────────────────────────────
  'Travel Destinations': [
    {
      prompt: 'Which city is known as the "City of Love"?',
      type: 'SINGLE',
      explanation: 'Paris is famously called the City of Love.',
      timeLimitSec: 5,
      order: 1,
      choices: [
        { text: 'Paris', isCorrect: true },
        { text: 'Venice', isCorrect: false },
        { text: 'Rome', isCorrect: false },
        { text: 'Prague', isCorrect: false },
      ],
    },
    {
      prompt: 'In which country is the ancient city of Petra?',
      type: 'SINGLE',
      explanation: 'Petra is in Jordan, known for its rock-cut architecture.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Jordan', isCorrect: true },
        { text: 'Egypt', isCorrect: false },
        { text: 'Saudi Arabia', isCorrect: false },
        { text: 'Syria', isCorrect: false },
      ],
    },
    {
      prompt: 'What is the most visited country in the world?',
      type: 'SINGLE',
      explanation: 'France receives the most international tourists annually.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'France', isCorrect: true },
        { text: 'Spain', isCorrect: false },
        { text: 'USA', isCorrect: false },
        { text: 'Italy', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The Great Wall of China is visible from space with the naked eye.',
      type: 'TRUEFALSE',
      explanation: 'This is a myth — the Great Wall is too narrow to see from space unaided.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
    {
      prompt: 'What is the currency of Japan?',
      type: 'SINGLE',
      explanation: 'The Japanese Yen is one of the most traded currencies.',
      timeLimitSec: 5,
      order: 5,
      choices: [
        { text: 'Yen', isCorrect: true },
        { text: 'Won', isCorrect: false },
        { text: 'Yuan', isCorrect: false },
        { text: 'Ringgit', isCorrect: false },
      ],
    },
  ],

  // ─── Air Travel & Airlines ─────────────────────────────────────
  'Air Travel & Airlines': [
    {
      prompt: "What is the world's busiest airport by passenger traffic?",
      type: 'SINGLE',
      explanation: 'Hartsfield-Jackson Atlanta (ATL) has been the busiest for years.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Hartsfield-Jackson Atlanta', isCorrect: true },
        { text: 'Dubai International', isCorrect: false },
        { text: 'Beijing Capital', isCorrect: false },
        { text: 'Heathrow (London)', isCorrect: false },
      ],
    },
    {
      prompt: 'What does a Boeing 747 often get called?',
      type: 'SINGLE',
      explanation: 'The 747 is nicknamed the Jumbo Jet for its massive size.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Jumbo Jet', isCorrect: true },
        { text: 'Super Hornet', isCorrect: false },
        { text: 'Airbus Giant', isCorrect: false },
        { text: 'Concorde', isCorrect: false },
      ],
    },
    {
      prompt: 'What was the first supersonic commercial airliner?',
      type: 'SINGLE',
      explanation: 'Concorde flew at twice the speed of sound from 1976 to 2003.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'Concorde', isCorrect: true },
        { text: 'Boeing 707', isCorrect: false },
        { text: 'Tupolev Tu-144', isCorrect: false },
        { text: 'Airbus A380', isCorrect: false },
      ],
    },
    {
      prompt: "True or False: The Wright brothers' first flight lasted over a minute.",
      type: 'TRUEFALSE',
      explanation: 'Their first flight on Dec 17, 1903 lasted only 12 seconds.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
    {
      prompt: 'What airline is known for its Singapore Girl branding?',
      type: 'SINGLE',
      explanation: 'Singapore Airlines is famous for its premium service.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Singapore Airlines', isCorrect: true },
        { text: 'Emirates', isCorrect: false },
        { text: 'Cathay Pacific', isCorrect: false },
        { text: 'Qatar Airways', isCorrect: false },
      ],
    },
  ],

  // ─── Nutrition & Wellness ──────────────────────────────────────
  'Nutrition & Wellness': [
    {
      prompt: 'Which vitamin is known as the "sunshine vitamin"?',
      type: 'SINGLE',
      explanation: 'Vitamin D is produced by the body when exposed to sunlight.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Vitamin D', isCorrect: true },
        { text: 'Vitamin C', isCorrect: false },
        { text: 'Vitamin A', isCorrect: false },
        { text: 'Vitamin B12', isCorrect: false },
      ],
    },
    {
      prompt: 'How many calories are in one gram of protein?',
      type: 'SINGLE',
      explanation: 'One gram of protein provides 4 calories.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: '4', isCorrect: true },
        { text: '9', isCorrect: false },
        { text: '7', isCorrect: false },
        { text: '2', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Drinking water can help with weight management.',
      type: 'TRUEFALSE',
      explanation: 'Water can increase metabolism and reduce appetite temporarily.',
      timeLimitSec: 5,
      order: 3,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What mineral is important for strong bones?',
      type: 'SINGLE',
      explanation: 'Calcium is essential for bone health and density.',
      timeLimitSec: 5,
      order: 4,
      choices: [
        { text: 'Calcium', isCorrect: true },
        { text: 'Iron', isCorrect: false },
        { text: 'Zinc', isCorrect: false },
        { text: 'Magnesium', isCorrect: false },
      ],
    },
    {
      prompt: 'How many hours of sleep do adults need on average?',
      type: 'SINGLE',
      explanation: 'Most adults need 7-9 hours of sleep per night.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: '7-9 hours', isCorrect: true },
        { text: '5-6 hours', isCorrect: false },
        { text: '10-12 hours', isCorrect: false },
        { text: '4-5 hours', isCorrect: false },
      ],
    },
  ],

  // ─── Human Body Facts ──────────────────────────────────────────
  'Human Body Facts': [
    {
      prompt: 'What is the strongest muscle in the human body?',
      type: 'SINGLE',
      explanation: 'The masseter (jaw muscle) can exert the most force.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Masseter (jaw muscle)', isCorrect: true },
        { text: 'Heart', isCorrect: false },
        { text: 'Gluteus maximus', isCorrect: false },
        { text: 'Tongue', isCorrect: false },
      ],
    },
    {
      prompt: 'How many taste buds does the average human tongue have?',
      type: 'SINGLE',
      explanation: 'The human tongue has about 10,000 taste buds.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'About 10,000', isCorrect: true },
        { text: 'About 1,000', isCorrect: false },
        { text: 'About 100,000', isCorrect: false },
        { text: 'About 50,000', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Humans are the only animals that blush.',
      type: 'TRUEFALSE',
      explanation: 'Blushing from embarrassment is unique to humans.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What percentage of the human body is water?',
      type: 'SINGLE',
      explanation: 'About 60% of the adult human body is water.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'About 60%', isCorrect: true },
        { text: 'About 80%', isCorrect: false },
        { text: 'About 40%', isCorrect: false },
        { text: 'About 90%', isCorrect: false },
      ],
    },
    {
      prompt: 'How many times does the average heart beat per day?',
      type: 'SINGLE',
      explanation: 'The heart beats roughly 100,000 times per day.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'About 100,000', isCorrect: true },
        { text: 'About 10,000', isCorrect: false },
        { text: 'About 1 million', isCorrect: false },
        { text: 'About 50,000', isCorrect: false },
      ],
    },
  ],

  // ─── Fashion Through the Ages ──────────────────────────────────
  'Fashion Through the Ages': [
    {
      prompt: 'What decade is known for flapper dresses?',
      type: 'SINGLE',
      explanation: 'The 1920s featured flapper fashion with shorter hemlines.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: '1920s', isCorrect: true },
        { text: '1950s', isCorrect: false },
        { text: '1960s', isCorrect: false },
        { text: '1980s', isCorrect: false },
      ],
    },
    {
      prompt: 'Which designer is known for the "little black dress"?',
      type: 'SINGLE',
      explanation: 'Coco Chanel popularized the LBD in the 1920s.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Coco Chanel', isCorrect: true },
        { text: 'Christian Dior', isCorrect: false },
        { text: 'Yves Saint Laurent', isCorrect: false },
        { text: 'Giorgio Armani', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Jeans were originally designed for miners.',
      type: 'TRUEFALSE',
      explanation: 'Levi Strauss created denim jeans for gold miners in the 1800s.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What city is considered the fashion capital of the world?',
      type: 'SINGLE',
      explanation: 'Paris has long been considered the global fashion capital.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'Paris', isCorrect: true },
        { text: 'Milan', isCorrect: false },
        { text: 'New York', isCorrect: false },
        { text: 'London', isCorrect: false },
      ],
    },
    {
      prompt: 'What famous shoe designer is known for red soles?',
      type: 'SINGLE',
      explanation: "Christian Louboutin's signature is the red-lacquered sole.",
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Christian Louboutin', isCorrect: true },
        { text: 'Jimmy Choo', isCorrect: false },
        { text: 'Manolo Blahnik', isCorrect: false },
        { text: 'Gucci', isCorrect: false },
      ],
    },
  ],

  // ─── Dog Breeds ────────────────────────────────────────────────
  'Dog Breeds': [
    {
      prompt: 'What is the smallest dog breed?',
      type: 'SINGLE',
      explanation: 'The Chihuahua is the smallest breed, typically under 6 pounds.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Chihuahua', isCorrect: true },
        { text: 'Pomeranian', isCorrect: false },
        { text: 'Yorkshire Terrier', isCorrect: false },
        { text: 'Maltese', isCorrect: false },
      ],
    },
    {
      prompt: 'Which breed is known as the "king of terriers"?',
      type: 'SINGLE',
      explanation: 'The Airedale Terrier is the largest terrier breed.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'Airedale Terrier', isCorrect: true },
        { text: 'Jack Russell', isCorrect: false },
        { text: 'Scottish Terrier', isCorrect: false },
        { text: 'Bull Terrier', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Dalmatians are born with spots.',
      type: 'TRUEFALSE',
      explanation: 'Dalmatian puppies are born pure white and develop spots later.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
    {
      prompt: 'What breed is famous for its blue-black tongue?',
      type: 'SINGLE',
      explanation: 'The Chow Chow has a distinctive blue-black tongue.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'Chow Chow', isCorrect: true },
        { text: 'Shar Pei', isCorrect: false },
        { text: 'Akita', isCorrect: false },
        { text: 'Shiba Inu', isCorrect: false },
      ],
    },
    {
      prompt: 'Which breed is the fastest dog?',
      type: 'SINGLE',
      explanation: 'Greyhounds can reach speeds of 45 mph (72 km/h).',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Greyhound', isCorrect: true },
        { text: 'Whippet', isCorrect: false },
        { text: 'Saluki', isCorrect: false },
        { text: 'Border Collie', isCorrect: false },
      ],
    },
  ],

  // ─── Cats & Other Pets ─────────────────────────────────────────
  'Cats & Other Pets': [
    {
      prompt: 'What is the most popular cat breed in the US?',
      type: 'SINGLE',
      explanation: 'The Persian cat is one of the most popular breeds.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: 'Persian', isCorrect: true },
        { text: 'Siamese', isCorrect: false },
        { text: 'Maine Coon', isCorrect: false },
        { text: 'Bengal', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Cats can taste sweetness.',
      type: 'TRUEFALSE',
      explanation: 'Cats lack the taste receptor for sweetness.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'True', isCorrect: false },
        { text: 'False', isCorrect: true },
      ],
    },
    {
      prompt: 'What is a group of cats called?',
      type: 'SINGLE',
      explanation: 'A clowder is the collective noun for a group of cats.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'Clowder', isCorrect: true },
        { text: 'Pack', isCorrect: false },
        { text: 'Pride', isCorrect: false },
        { text: 'Herd', isCorrect: false },
      ],
    },
    {
      prompt: 'What small pet can live up to 20 years?',
      type: 'SINGLE',
      explanation: 'Some parrot species can live 50+ years; smaller parrots 20-30.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'Parrot', isCorrect: true },
        { text: 'Hamster', isCorrect: false },
        { text: 'Guinea pig', isCorrect: false },
        { text: 'Rabbit', isCorrect: false },
      ],
    },
    {
      prompt: 'Which reptile is commonly kept as a pet in a terrarium?',
      type: 'SINGLE',
      explanation: 'Bearded dragons are popular reptile pets for beginners.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'Bearded dragon', isCorrect: true },
        { text: 'Chameleon', isCorrect: false },
        { text: 'Iguana', isCorrect: false },
        { text: 'Gecko', isCorrect: false },
      ],
    },
  ],

  // ─── Brain Teasers ─────────────────────────────────────────────
  'Brain Teasers': [
    {
      prompt: 'I speak without a mouth and hear without ears. What am I?',
      type: 'SINGLE',
      explanation: 'An echo is the reflection of sound.',
      timeLimitSec: 15,
      order: 1,
      choices: [
        { text: 'An echo', isCorrect: true },
        { text: 'A radio', isCorrect: false },
        { text: 'A telephone', isCorrect: false },
        { text: 'The wind', isCorrect: false },
      ],
    },
    {
      prompt: "What has keys but can't open locks?",
      type: 'SINGLE',
      explanation: 'A piano has musical keys but cannot open doors.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'A piano', isCorrect: true },
        { text: 'A computer', isCorrect: false },
        { text: 'A map', isCorrect: false },
        { text: 'A book', isCorrect: false },
      ],
    },
    {
      prompt: 'The more you take, the more you leave behind. What am I?',
      type: 'SINGLE',
      explanation: 'Footsteps — the more steps you take, the more footprints you leave.',
      timeLimitSec: 15,
      order: 3,
      choices: [
        { text: 'Footsteps', isCorrect: true },
        { text: 'Memories', isCorrect: false },
        { text: 'Time', isCorrect: false },
        { text: 'Money', isCorrect: false },
      ],
    },
    {
      prompt: 'What has a head and a tail but no body?',
      type: 'SINGLE',
      explanation: 'A coin has heads and tails sides but no physical body.',
      timeLimitSec: 10,
      order: 4,
      choices: [
        { text: 'A coin', isCorrect: true },
        { text: 'A snake', isCorrect: false },
        { text: 'A story', isCorrect: false },
        { text: 'A train', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: A riddle can have multiple correct answers.',
      type: 'TRUEFALSE',
      explanation:
        'Riddles typically have one intended answer, though creative alternatives may exist.',
      timeLimitSec: 10,
      order: 5,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
  ],

  // ─── Amazing Facts ─────────────────────────────────────────────
  'Amazing Facts': [
    {
      prompt: 'How many hearts does an octopus have?',
      type: 'SINGLE',
      explanation: 'An octopus has three hearts: two for the gills and one for the body.',
      timeLimitSec: 10,
      order: 1,
      choices: [
        { text: '3', isCorrect: true },
        { text: '1', isCorrect: false },
        { text: '2', isCorrect: false },
        { text: '4', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: Bananas are berries, but strawberries are not.',
      type: 'TRUEFALSE',
      explanation: 'Botanically, bananas qualify as berries while strawberries do not.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'What animal can sleep for up to 3 years?',
      type: 'SINGLE',
      explanation: 'Snails can hibernate for up to 3 years during extreme conditions.',
      timeLimitSec: 10,
      order: 3,
      choices: [
        { text: 'Snail', isCorrect: true },
        { text: 'Bear', isCorrect: false },
        { text: 'Tortoise', isCorrect: false },
        { text: 'Bat', isCorrect: false },
      ],
    },
    {
      prompt: 'How many Earths could fit inside the Sun?',
      type: 'SINGLE',
      explanation: "About 1.3 million Earths would fit inside the Sun's volume.",
      timeLimitSec: 15,
      order: 4,
      choices: [
        { text: 'About 1.3 million', isCorrect: true },
        { text: 'About 100,000', isCorrect: false },
        { text: 'About 10 million', isCorrect: false },
        { text: 'About 500,000', isCorrect: false },
      ],
    },
    {
      prompt: "What is the only letter that doesn't appear in any US state name?",
      type: 'SINGLE',
      explanation: 'The letter Q does not appear in any of the 50 US state names.',
      timeLimitSec: 15,
      order: 5,
      choices: [
        { text: 'Q', isCorrect: true },
        { text: 'Z', isCorrect: false },
        { text: 'X', isCorrect: false },
        { text: 'J', isCorrect: false },
      ],
    },
  ],
}
