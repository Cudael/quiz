/**
 * Seed data for QuizArena.
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
export type PlayMode = 'CLASSIC' | 'TIMED' | 'SURVIVAL' | 'DAILY'
export type Role = 'USER' | 'ADMIN'

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export interface CategoryData {
  slug: string
  name: string
  description: string
  icon: string // lucide icon name
  color: string // tailwind gradient or hex
}

export const categories: CategoryData[] = [
  {
    slug: 'science',
    name: 'Science',
    description: 'Physics, chemistry, biology, and beyond',
    icon: 'FlaskConical',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    slug: 'history',
    name: 'History',
    description: 'From ancient civilizations to modern times',
    icon: 'Landmark',
    color: 'from-amber-600 to-yellow-400',
  },
  {
    slug: 'movies',
    name: 'Movies',
    description: 'Lights, camera, action! Test your film knowledge',
    icon: 'Clapperboard',
    color: 'from-sky-500 to-indigo-400',
  },
  {
    slug: 'music',
    name: 'Music',
    description: 'Beats, lyrics, genres, and legendary artists',
    icon: 'Music',
    color: 'from-green-500 to-teal-400',
  },
  {
    slug: 'geography',
    name: 'Geography',
    description: 'Countries, capitals, rivers, and mountains',
    icon: 'Globe',
    color: 'from-emerald-500 to-lime-400',
  },
  {
    slug: 'sports',
    name: 'Sports',
    description: 'Athletics, records, and iconic moments',
    icon: 'Trophy',
    color: 'from-orange-500 to-red-400',
  },
  {
    slug: 'tech',
    name: 'Technology',
    description: 'Software, hardware, and the digital world',
    icon: 'Cpu',
    color: 'from-violet-500 to-purple-400',
  },
  {
    slug: 'gaming',
    name: 'Gaming',
    description: 'Video games, consoles, and gaming history',
    icon: 'Gamepad2',
    color: 'from-pink-500 to-rose-400',
  },
  {
    slug: 'anime',
    name: 'Anime',
    description: 'Japanese animation, manga, and pop culture',
    icon: 'Sparkles',
    color: 'from-fuchsia-500 to-pink-400',
  },
  {
    slug: 'general',
    name: 'General Knowledge',
    description: 'A little bit of everything',
    icon: 'Brain',
    color: 'from-slate-500 to-gray-400',
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
    name: 'Week Warrior',
    description: 'Play every day for 7 days in a row',
    icon: 'Flame',
    criteria: { type: 'streak', days: 7 },
  },
  {
    slug: 'streak-30',
    name: 'Monthly Master',
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
  {
    slug: 'daily-devotee',
    name: 'Daily Devotee',
    description: 'Complete 14 daily challenges',
    icon: 'CalendarCheck',
    criteria: { type: 'dailyChallenges', count: 14 },
  },
]

// ---------------------------------------------------------------------------
// Demo users
// ---------------------------------------------------------------------------
export interface UserData {
  id: string
  name: string
  email: string
  role: Role
  xp: number
  level: number
  streakDays: number
}

export const users: UserData[] = [
  {
    id: 'user_admin_quizarena',
    name: 'QuizArena Admin',
    email: 'admin@quizarena.dev',
    role: 'ADMIN',
    xp: 99999,
    level: 99,
    streakDays: 365,
  },
  {
    id: 'user_demo_alice',
    name: 'Alice Chen',
    email: 'alice@quizarena.dev',
    role: 'USER',
    xp: 12450,
    level: 18,
    streakDays: 14,
  },
  {
    id: 'user_demo_bob',
    name: 'Bob Martinez',
    email: 'bob@quizarena.dev',
    role: 'USER',
    xp: 8200,
    level: 13,
    streakDays: 7,
  },
  {
    id: 'user_demo_carol',
    name: 'Carol Zhang',
    email: 'carol@quizarena.dev',
    role: 'USER',
    xp: 5100,
    level: 9,
    streakDays: 3,
  },
  {
    id: 'user_demo_dave',
    name: 'Dave Okonkwo',
    email: 'demo@quizarena.dev',
    role: 'USER',
    xp: 2300,
    level: 5,
    streakDays: 1,
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
  // Science
  {
    title: 'Elementary Physics',
    description: 'Newton, forces, and basic mechanics',
    difficulty: 'EASY',
    categorySlug: 'science',
    authorId: 'user_admin_quizarena',
    playCount: 1203,
    avgScore: 72.4,
  },
  {
    title: 'Periodic Table Challenge',
    description: 'Elements, symbols, and atomic numbers',
    difficulty: 'MEDIUM',
    categorySlug: 'science',
    authorId: 'user_demo_alice',
    playCount: 876,
    avgScore: 61.8,
  },
  {
    title: 'Quantum Mechanics & Relativity',
    description: 'Advanced physics for the curious mind',
    difficulty: 'HARD',
    categorySlug: 'science',
    authorId: 'user_admin_quizarena',
    playCount: 412,
    avgScore: 48.2,
  },

  // History
  {
    title: 'Ancient Civilizations',
    description: 'Egypt, Rome, Greece, and Mesopotamia',
    difficulty: 'EASY',
    categorySlug: 'history',
    authorId: 'user_admin_quizarena',
    playCount: 934,
    avgScore: 68.5,
  },
  {
    title: 'World War II',
    description: 'Key battles, leaders, and turning points',
    difficulty: 'MEDIUM',
    categorySlug: 'history',
    authorId: 'user_demo_bob',
    playCount: 1547,
    avgScore: 65.0,
  },
  {
    title: 'Cold War & Modern History',
    description: 'Post-WWII geopolitics and the space race',
    difficulty: 'HARD',
    categorySlug: 'history',
    authorId: 'user_admin_quizarena',
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
    authorId: 'user_admin_quizarena',
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
    authorId: 'user_admin_quizarena',
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
    authorId: 'user_admin_quizarena',
    playCount: 298,
    avgScore: 44.7,
  },

  // Geography
  {
    title: 'World Capitals',
    description: 'Can you name the capital of every country?',
    difficulty: 'EASY',
    categorySlug: 'geography',
    authorId: 'user_demo_bob',
    playCount: 3201,
    avgScore: 70.9,
  },
  {
    title: 'Mountains & Rivers',
    description: 'Highest peaks and longest rivers worldwide',
    difficulty: 'MEDIUM',
    categorySlug: 'geography',
    authorId: 'user_admin_quizarena',
    playCount: 876,
    avgScore: 59.4,
  },
  {
    title: 'Political Borders & Flags',
    description: 'Nations, territories, and their symbols',
    difficulty: 'HARD',
    categorySlug: 'geography',
    authorId: 'user_demo_alice',
    playCount: 412,
    avgScore: 47.8,
  },

  // Sports
  {
    title: 'Olympic Records',
    description: 'Gold medalists and world records',
    difficulty: 'EASY',
    categorySlug: 'sports',
    authorId: 'user_admin_quizarena',
    playCount: 1567,
    avgScore: 73.2,
  },
  {
    title: 'Football World Cup',
    description: 'Winners, top scorers, and memorable moments',
    difficulty: 'MEDIUM',
    categorySlug: 'sports',
    authorId: 'user_demo_dave',
    playCount: 2109,
    avgScore: 64.7,
  },
  {
    title: 'Niche Sports Trivia',
    description: 'Curling, polo, and more obscure athletics',
    difficulty: 'HARD',
    categorySlug: 'sports',
    authorId: 'user_admin_quizarena',
    playCount: 234,
    avgScore: 41.5,
  },

  // Tech
  {
    title: 'Internet Basics',
    description: 'How the web works, protocols, and browsers',
    difficulty: 'EASY',
    categorySlug: 'tech',
    authorId: 'user_demo_carol',
    playCount: 1456,
    avgScore: 77.3,
  },
  {
    title: 'Programming Languages',
    description: 'Syntax, paradigms, and language history',
    difficulty: 'MEDIUM',
    categorySlug: 'tech',
    authorId: 'user_admin_quizarena',
    playCount: 1876,
    avgScore: 62.1,
  },
  {
    title: 'Algorithms & Data Structures',
    description: 'Big-O, trees, graphs, and sorting',
    difficulty: 'HARD',
    categorySlug: 'tech',
    authorId: 'user_demo_alice',
    playCount: 678,
    avgScore: 49.6,
  },

  // Gaming
  {
    title: 'Console History',
    description: 'From Atari to PlayStation 5',
    difficulty: 'EASY',
    categorySlug: 'gaming',
    authorId: 'user_admin_quizarena',
    playCount: 2345,
    avgScore: 75.8,
  },
  {
    title: 'Nintendo Classics',
    description: 'Mario, Zelda, Pokémon, and Samus',
    difficulty: 'MEDIUM',
    categorySlug: 'gaming',
    authorId: 'user_demo_bob',
    playCount: 3102,
    avgScore: 68.4,
  },
  {
    title: 'Speedrunning & eSports',
    description: 'Records, tournaments, and legendary plays',
    difficulty: 'HARD',
    categorySlug: 'gaming',
    authorId: 'user_admin_quizarena',
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
    authorId: 'user_admin_quizarena',
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

  // General Knowledge
  {
    title: 'Everyday Trivia',
    description: 'Fun facts for the whole family',
    difficulty: 'EASY',
    categorySlug: 'general',
    authorId: 'user_admin_quizarena',
    playCount: 4567,
    avgScore: 79.5,
  },
  {
    title: 'Mixed Bag',
    description: 'History, science, pop culture — anything goes',
    difficulty: 'MEDIUM',
    categorySlug: 'general',
    authorId: 'user_demo_dave',
    playCount: 2890,
    avgScore: 66.3,
  },
  {
    title: 'Expert Knowledge',
    description: 'Only the most well-read will prevail',
    difficulty: 'HARD',
    categorySlug: 'general',
    authorId: 'user_admin_quizarena',
    playCount: 1023,
    avgScore: 50.7,
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
      explanation: "Newton's First Law states that an object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.",
      timeLimitSec: 20,
      order: 1,
      choices: [
        { text: 'An object remains at rest or in uniform motion unless acted upon by a force', isCorrect: true },
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
      explanation: 'Mass is the amount of matter in an object (kg), while weight is the gravitational force acting on that mass (N). They differ by location.',
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
      explanation: 'Potential energy is stored energy. A stretched spring and a raised weight both have gravitational or elastic potential energy.',
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
      explanation: "The standard acceleration due to gravity on Earth's surface is approximately 9.8 m/s².",
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
      explanation: 'The speed of light in a vacuum is approximately 3 × 10⁸ m/s (299,792,458 m/s exactly).',
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
      explanation: 'Sound is a mechanical wave that requires a medium (solid, liquid, or gas) to travel through. It cannot travel through a vacuum.',
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
      explanation: 'There are 118 confirmed elements in the periodic table, the most recent being Oganesson (118).',
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
      explanation: 'Hydrogen (H) is the lightest and most abundant element in the universe, with atomic number 1.',
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
      explanation: 'Noble gases (Group 18) have full valence electron shells, making them extremely unreactive under normal conditions.',
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
      explanation: 'Halogens are Group 17 elements: Fluorine (F), Chlorine (Cl), Bromine (Br), Iodine (I), and Astatine (At).',
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
      explanation: 'Carbon has atomic number 6, meaning it has 6 protons in its nucleus. It is the basis of all organic chemistry.',
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
      explanation: 'The Nile River provided fertile land, water, and a transportation route that was essential for Ancient Egyptian civilization.',
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
      explanation: 'Augustus (also known as Octavian) became the first Roman Emperor in 27 BC after defeating Mark Antony and Cleopatra.',
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
      explanation: 'While the Ming Dynasty (1368–1644) built much of the wall we see today, earlier walls were constructed during the Qin, Han, and other dynasties.',
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
      explanation: 'The Seven Wonders included the Great Pyramid (still standing), the Hanging Gardens of Babylon, the Colossus of Rhodes, the Lighthouse of Alexandria, and others.',
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
      explanation: 'Machu Picchu was built by the Inca civilization, constructed around 1450 CE at 2,430 meters above sea level in Peru.',
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
      explanation: 'Socrates was born in Athens, Greece around 470 BC. He is one of the founders of Western philosophy.',
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
      explanation: 'Ancient Egyptians used hieroglyphics, a complex writing system combining logographic and alphabetic elements.',
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
      explanation: 'Yes, at its peak the Roman Empire controlled much of Britain (Britannia). Hadrian\'s Wall marked the northern frontier.',
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
      explanation: 'World War II is generally considered to have begun on September 1, 1939, when Nazi Germany invaded Poland.',
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
      explanation: "Operation Overlord was the code name for the Battle of Normandy. June 6, 1944 is known as D-Day — the largest seaborne invasion in history.",
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
      explanation: 'Japan attacked Pearl Harbor on December 7, 1941, prompting the US to declare war on Japan the next day. Germany and Italy then declared war on the US.',
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
      explanation: 'The main Axis powers were Germany, Italy, and Japan. They were formally allied through the Tripartite Pact signed in September 1940.',
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
      explanation: 'Winston Churchill served as UK Prime Minister from May 1940 to July 1945, leading Britain through most of the war.',
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
      explanation: 'Victory in Europe Day (V-E Day) was May 8, 1945, marking Germany\'s unconditional surrender.',
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
      explanation: 'The Manhattan Project was the secret US-led research project that produced the first nuclear weapons, culminating in the bombings of Hiroshima and Nagasaki.',
      timeLimitSec: 20,
      order: 7,
      choices: [
        { text: 'Manhattan Project', isCorrect: true },
        { text: 'The Manhattan Project', isCorrect: true },
        { text: 'Operation Trinity', isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: The Holocaust resulted in the deaths of approximately 6 million Jewish people.',
      type: 'TRUEFALSE',
      explanation: 'Yes, approximately 6 million Jewish people were systematically murdered by Nazi Germany and its collaborators during the Holocaust.',
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
      explanation: 'The Battle of Stalingrad (1942–43) was the decisive turning point on the Eastern Front, ending in a Soviet victory and massive German losses.',
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
      explanation: 'Iron Man (2008), directed by Jon Favreau and starring Robert Downey Jr., was the first film in the MCU.',
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
      explanation: "Thor's enchanted hammer is called Mjolnir, forged by dwarves in the heart of a dying star. Only those deemed worthy can lift it.",
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
      explanation: 'False. Black Widow (Natasha Romanoff) has no superhuman powers — she relies on her elite spy training, combat skills, and technology.',
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
      explanation: 'The Mind Stone is yellow and the Soul Stone is orange. There are six Infinity Stones in total.',
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
      prompt: 'What is Tony Stark\'s AI assistant called in the original Iron Man films?',
      type: 'SINGLE',
      explanation: "JARVIS (Just A Rather Very Intelligent System) was Tony Stark's AI assistant before being uploaded into Vision.",
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
      explanation: 'Wakanda is a fictional African nation in the MCU, located in eastern Africa. The films were largely inspired by real African cultures.',
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
      explanation: 'Thanos is from the planet Titan — more specifically, he is an Eternal from Titan, a moon of Saturn.',
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
      explanation: 'Tony Stark says "I am Iron Man" before using the Infinity Gauntlet to snap away Thanos and his army, sacrificing his own life.',
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
      explanation: 'Canberra is the capital of Australia. Many people mistakenly think it\'s Sydney or Melbourne — it was a compromise between the two rival cities.',
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
      explanation: 'Oslo is the capital of Norway, Stockholm is the capital of Sweden, and Copenhagen is the capital of Denmark — all Scandinavian countries.',
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
      explanation: 'Tokyo is the capital of Japan and the world\'s most populous metropolitan area.',
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
      explanation: 'Brasília is the capital of Brazil, built from scratch in the 1950s to be a planned capital city.',
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
      explanation: 'South Africa has three capitals: Pretoria (administrative), Cape Town (legislative), and Bloemfontein (judicial). Pretoria is usually considered the primary capital.',
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
      explanation: 'True. Washington, D.C. (District of Columbia) has been the capital of the United States since 1800.',
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
      explanation: 'HTTP stands for HyperText Transfer Protocol. It is the foundation of data communication on the World Wide Web.',
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
      explanation: 'DNS stands for Domain Name System. It translates human-readable domain names (like google.com) into IP addresses.',
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
      explanation: 'HTTPS (HTTP Secure) encrypts data using TLS/SSL, making it more secure than plain HTTP which transmits data in cleartext.',
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
      explanation: 'POST is the standard method for sending data (e.g., form submissions). PUT is used to update or create resources. Both send data in the request body.',
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
      explanation: 'IP stands for Internet Protocol. An IP address is a numerical label assigned to each device connected to a computer network.',
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
      explanation: '127.0.0.1 is the loopback address (also called "localhost"). It always refers to the local machine.',
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
      explanation: 'A URL (Uniform Resource Locator) is a specific type of URI (Uniform Resource Identifier) that specifies the location AND how to retrieve a resource. All URLs are URIs, but not all URIs are URLs.',
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
      explanation: 'Atari released the Atari 2600 (originally called VCS) in 1977, which became the first commercially successful home video game console.',
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
      explanation: 'Sony launched the original PlayStation in Japan on December 3, 1994. It launched in North America on September 9, 1995.',
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
      explanation: 'True. The Nintendo Switch is a hybrid gaming console that can be played on a TV (docked mode) or as a portable device.',
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
      explanation: 'The 16-bit era featured the Super Nintendo Entertainment System (SNES) and the Sega Genesis/Mega Drive as the dominant consoles.',
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
      explanation: 'The PlayStation 2 (PS2) is the best-selling video game console of all time with over 155 million units sold.',
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
      explanation: 'The first Xbox was simply called "Xbox." It was Microsoft\'s entry into the home console market, released in 2001.',
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
      explanation: 'The PlayStation 5 uses a custom AMD Zen 2 CPU (x86-64 architecture) along with an AMD RDNA 2 GPU.',
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
      explanation: 'True. The Sega Dreamcast (1998–2001) was the last home console produced by Sega. After its discontinuation, Sega became a third-party software publisher.',
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
      explanation: 'Naruto Uzumaki is the protagonist of the series "Naruto" by Masashi Kishimoto. He aspires to become the Hokage of his village.',
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
      explanation: '"Spirited Away" (Sen to Chihiro no Kamikakushi, 2001) directed by Hayao Miyazaki features Chihiro as the protagonist. It won the Academy Award for Best Animated Feature.',
      timeLimitSec: 15,
      order: 2,
      choices: [
        { text: 'Spirited Away', isCorrect: true },
        { text: "My Neighbor Totoro", isCorrect: false },
        { text: "Princess Mononoke", isCorrect: false },
        { text: "Howl's Moving Castle", isCorrect: false },
      ],
    },
    {
      prompt: 'True or False: "Attack on Titan" is based on a manga.',
      type: 'TRUEFALSE',
      explanation: 'True. "Attack on Titan" (Shingeki no Kyojin) is based on the manga by Hajime Isayama, which ran from 2009 to 2021.',
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
      explanation: 'Monkey D. Luffy is the protagonist of "One Piece" by Eiichiro Oda. He is a pirate who ate a Devil Fruit and can stretch his body like rubber.',
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
      explanation: 'MAPPA, Wit Studio, Toei Animation, and Bones are among the most well-known and critically acclaimed anime studios.',
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
      explanation: 'In "Death Note," writing a person\'s name in the supernatural notebook while picturing their face causes that person to die.',
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
      explanation: 'The giant biomechanical mecha in "Neon Genesis Evangelion" are called "Evangelion" units (or EVA units). Unit 01 is the one most associated with the protagonist Shinji.',
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
      explanation: 'True. "Dragon Ball Z" continues the story of Goku from "Dragon Ball," following him as an adult with a son named Gohan.',
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
      explanation: 'The Pacific Ocean is the largest ocean, covering more than 165 million square kilometers — larger than all land masses combined.',
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
      explanation: 'False. Bats are mammals (order Chiroptera), not birds. They are the only mammals capable of sustained flight.',
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
      explanation: 'All four gas/ice giant planets have ring systems: Saturn (most prominent), Jupiter, Uranus, and Neptune.',
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
      explanation: 'Mount Everest, located in the Himalayas on the Nepal–Tibet border, is the world\'s highest mountain at 8,848.86 meters above sea level.',
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
      explanation: 'Earth has 7 continents: Africa, Antarctica, Asia, Australia/Oceania, Europe, North America, and South America.',
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
      explanation: 'True! A group of crows is indeed called a "murder of crows." Other fun collective nouns: a parliament of owls, a crash of rhinos.',
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
      explanation: 'Python was created by Guido van Rossum and first released in 1991. Van Rossum was its "Benevolent Dictator For Life" until 2018.',
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
      explanation: 'True (approximately). Brendan Eich created JavaScript in about 10 days in May 1995 while working at Netscape.',
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
      explanation: 'Java and Rust are statically typed languages where types are checked at compile time. Python and JavaScript are dynamically typed.',
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
      explanation: 'SQL stands for Structured Query Language. It is the standard language for relational database management systems.',
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
      explanation: 'TypeScript was developed by Microsoft and first released in October 2012. It adds static typing to JavaScript.',
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
      explanation: 'Python files use the .py extension. Python also supports .pyw for Windows GUI applications.',
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
      explanation: 'Mostly true — C++ was designed to be largely backward-compatible with C, but there are some differences that make this not strictly true in all cases.',
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
      explanation: 'Haskell is a purely functional programming language. It emphasizes immutability, higher-order functions, and type safety.',
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
      explanation: '"Thriller" by Michael Jackson is the best-selling album of all time, with an estimated 66–70 million copies sold worldwide.',
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
      explanation: 'True. "Bohemian Rhapsody" was released by Queen in 1975. It was written by Freddie Mercury and reached number one in multiple countries.',
      timeLimitSec: 10,
      order: 2,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
    {
      prompt: 'Which decade featured artists like Madonna, Prince, and Michael Jackson at their peak?',
      type: 'SINGLE',
      explanation: 'The 1980s were a golden era for pop music, featuring Madonna, Prince, Michael Jackson, and the rise of MTV music videos.',
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
      explanation: '"White Christmas" by Bing Crosby is estimated to be the best-selling physical single of all time, with 50+ million copies sold.',
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
      explanation: 'Taylor Swift has won the most Album of the Year Grammys (4), and Adele has also won this award multiple times.',
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
      prompt: "What was the first music video played on MTV?",
      type: 'SINGLE',
      explanation: '"Video Killed the Radio Star" by The Buggles was the first music video played on MTV when the channel launched on August 1, 1981.',
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
      explanation: 'The opening line of "Bohemian Rhapsody" by Queen is "Is this the real life? Is this just fantasy?"',
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
      explanation: 'True. The Beatles (John Lennon, Paul McCartney, George Harrison, and Ringo Starr) were all from Liverpool, England.',
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
      explanation: 'Brazil has won the FIFA World Cup 5 times (1958, 1962, 1970, 1994, 2002), more than any other nation.',
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
      explanation: 'True. The first FIFA World Cup was held in Uruguay in 1930. Uruguay won the inaugural tournament.',
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
      explanation: 'Miroslav Klose of Germany holds the record with 16 World Cup goals, scored across the 2002, 2006, 2010, and 2014 tournaments.',
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
      explanation: 'The 2026 FIFA World Cup was co-hosted by the United States, Canada, and Mexico — the first World Cup with three host nations.',
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
      explanation: 'Starting from the 2026 World Cup, the tournament expanded from 32 to 48 participating teams.',
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
      explanation: 'The current FIFA World Cup trophy is named "FIFA World Cup Trophy" but is colloquially known as the "FIFA World Cup Trophy." The previous trophy was the Jules Rimet Trophy.',
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
      explanation: 'True. Argentina beat France in the 2022 FIFA World Cup final in Qatar, winning on penalties after a 3–3 draw.',
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
      explanation: 'Diego Maradona scored the "Hand of God" goal against England in the 1986 quarter-finals, punching the ball into the net with his hand.',
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
      explanation: 'Mars is called the Red Planet because of its reddish appearance, caused by iron oxide (rust) on its surface.',
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
      explanation: 'Leonardo da Vinci painted the Mona Lisa between approximately 1503 and 1519. It is housed in the Louvre Museum in Paris.',
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
      explanation: 'True. The Great Barrier Reef is the world\'s largest coral reef system, located in the Coral Sea off the coast of Queensland, Australia.',
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
      explanation: 'Object-oriented and functional are programming paradigms. HTML is a markup language, and SQL is a query language.',
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
      explanation: 'The Japanese yen (JPY, ¥) is the official currency of Japan. It is the third most traded currency in the foreign exchange market.',
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
      explanation: 'A standard acoustic or electric guitar has 6 strings. Bass guitars typically have 4.',
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
      explanation: 'True. The Sun is a G-type main-sequence star (yellow dwarf) at the center of our solar system.',
      timeLimitSec: 5,
      order: 8,
      choices: [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ],
    },
  ],
}
