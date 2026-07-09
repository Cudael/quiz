import { PrismaClient } from '@prisma/client'
import { generateUniqueSlug } from '../src/lib/slugify'
import {
  validateAndNormalize,
  buildQuestionCreateData,
  type GeneratedQuiz,
} from '../src/server/ai-generate-utils'

const prisma = new PrismaClient()

interface DraftQuizInput {
  categorySlug: string
  title: string
  description: string
  tags: string[]
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  quiz: GeneratedQuiz
}

function choice(text: string, isCorrect: boolean) {
  return { text, isCorrect }
}

const DRAFTS: DraftQuizInput[] = [
  // ── General Knowledge (parent) ──────────────────────────────────────────
  {
    categorySlug: 'general',
    difficulty: 'EASY',
    title: 'General Knowledge Warm-Up Quiz',
    description:
      'A friendly mix of easy general knowledge questions covering geography, science, and everyday facts. Perfect for warming up before trivia night or testing what you already know.',
    tags: ['general knowledge', 'trivia', 'easy quiz', 'facts', 'warm-up'],
    quiz: {
      title: 'General Knowledge Warm-Up Quiz',
      description: '',
      questions: [
        {
          prompt: 'How many days are there in a leap year?',
          choices: [
            choice('364', false),
            choice('365', false),
            choice('366', true),
            choice('367', false),
          ],
          explanation: 'A leap year adds an extra day in February, making 366 days total.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the freezing point of water in Celsius?',
          choices: [
            choice('0°C', true),
            choice('32°C', false),
            choice('100°C', false),
            choice('-1°C', false),
          ],
          explanation: 'Water freezes at 0 degrees Celsius (32 degrees Fahrenheit).',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many continents are there on Earth?',
          choices: [choice('5', false), choice('6', false), choice('7', true), choice('8', false)],
          explanation:
            'The seven continents are Africa, Antarctica, Asia, Australia, Europe, North America, and South America.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the largest planet in our solar system?',
          choices: [
            choice('Earth', false),
            choice('Saturn', false),
            choice('Jupiter', true),
            choice('Neptune', false),
          ],
          explanation:
            'Jupiter is by far the largest planet in the solar system by both mass and volume.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many colors are traditionally listed in a rainbow?',
          choices: [choice('5', false), choice('6', false), choice('7', true), choice('8', false)],
          explanation:
            'The traditional rainbow spectrum includes red, orange, yellow, green, blue, indigo, and violet.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the capital city of Japan?',
          choices: [
            choice('Seoul', false),
            choice('Beijing', false),
            choice('Tokyo', true),
            choice('Bangkok', false),
          ],
          explanation: 'Tokyo has been the capital of Japan since 1868.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many minutes are there in a full day?',
          choices: [
            choice('1,440', true),
            choice('1,000', false),
            choice('1,200', false),
            choice('24', false),
          ],
          explanation: 'There are 24 hours in a day, and 24 × 60 = 1,440 minutes.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the primary language spoken in Brazil?',
          choices: [
            choice('Spanish', false),
            choice('Portuguese', true),
            choice('French', false),
            choice('Italian', false),
          ],
          explanation: 'Brazil was colonized by Portugal, making Portuguese its official language.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many sides does a hexagon have?',
          choices: [choice('5', false), choice('6', true), choice('7', false), choice('8', false)],
          explanation: 'A hexagon is a polygon with six sides.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What organ in the human body pumps blood?',
          choices: [
            choice('Lungs', false),
            choice('Liver', false),
            choice('Heart', true),
            choice('Kidneys', false),
          ],
          explanation: 'The heart circulates blood throughout the body via the circulatory system.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'general',
    difficulty: 'MEDIUM',
    title: 'Random Facts & Everyday Knowledge Trivia',
    description:
      'From world geography to chemistry and history, this quiz covers a wide mix of everyday facts worth knowing. A well-rounded challenge for trivia fans who like a bit of everything.',
    tags: ['general knowledge', 'trivia', 'facts', 'mixed trivia', 'random knowledge'],
    quiz: {
      title: 'Random Facts & Everyday Knowledge Trivia',
      description: '',
      questions: [
        {
          prompt: 'What is the tallest mountain in the world, measured from sea level?',
          choices: [
            choice('K2', false),
            choice('Mount Everest', true),
            choice('Denali', false),
            choice('Kilimanjaro', false),
          ],
          explanation: 'Mount Everest stands at 8,849 meters (29,032 feet) above sea level.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the smallest prime number?',
          choices: [choice('0', false), choice('1', false), choice('2', true), choice('3', false)],
          explanation: '2 is the smallest and only even prime number.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which currency is used in the United Kingdom?',
          choices: [
            choice('Euro', false),
            choice('Dollar', false),
            choice('Pound sterling', true),
            choice('Franc', false),
          ],
          explanation: "The pound sterling has been the UK's currency for centuries.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the largest organ in the human body?',
          choices: [
            choice('Liver', false),
            choice('Skin', true),
            choice('Brain', false),
            choice('Lungs', false),
          ],
          explanation: "The skin is the body's largest organ by surface area and weight.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the chemical formula for table salt?',
          choices: [
            choice('NaCl', true),
            choice('H2O', false),
            choice('CO2', false),
            choice('KCl', false),
          ],
          explanation: 'Table salt is sodium chloride, written as NaCl.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the longest river in Africa?',
          choices: [
            choice('Congo River', false),
            choice('Niger River', false),
            choice('Nile River', true),
            choice('Zambezi River', false),
          ],
          explanation:
            'The Nile is traditionally considered the longest river in Africa and the world.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What year did World War II end?',
          choices: [
            choice('1943', false),
            choice('1945', true),
            choice('1947', false),
            choice('1950', false),
          ],
          explanation: 'World War II ended in 1945 with the surrender of Japan following V-J Day.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which planet is known for its prominent ring system, visible even from Earth with a telescope?',
          choices: [
            choice('Jupiter', false),
            choice('Saturn', true),
            choice('Uranus', false),
            choice('Neptune', false),
          ],
          explanation:
            "Saturn's rings, made of ice and rock, are the most prominent in the solar system.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the study of weather and atmospheric conditions called?',
          choices: [
            choice('Geology', false),
            choice('Meteorology', true),
            choice('Astronomy', false),
            choice('Ecology', false),
          ],
          explanation:
            'Meteorology is the scientific study of the atmosphere and weather patterns.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many strings does a standard violin have?',
          choices: [choice('3', false), choice('4', true), choice('5', false), choice('6', false)],
          explanation: 'A standard violin has four strings, tuned in perfect fifths.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── Math & Logic ─────────────────────────────────────────────────────────
  {
    categorySlug: 'math',
    difficulty: 'EASY',
    title: 'Math Basics: Numbers & Arithmetic Quiz',
    description:
      'Brush up on basic arithmetic, shapes, and simple equations with this friendly math quiz. Great for students or anyone who wants a quick mental math warm-up.',
    tags: ['math', 'arithmetic', 'numbers', 'math basics', 'beginner'],
    quiz: {
      title: 'Math Basics: Numbers & Arithmetic Quiz',
      description: '',
      questions: [
        {
          prompt: 'What is 7 × 8?',
          choices: [
            choice('54', false),
            choice('56', true),
            choice('58', false),
            choice('64', false),
          ],
          explanation: '7 multiplied by 8 equals 56.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the square root of 64?',
          choices: [choice('6', false), choice('7', false), choice('8', true), choice('9', false)],
          explanation: '8 × 8 = 64, so the square root of 64 is 8.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What do you call a number that can only be divided evenly by 1 and itself?',
          choices: [
            choice('Composite number', false),
            choice('Prime number', true),
            choice('Even number', false),
            choice('Odd number', false),
          ],
          explanation: 'Prime numbers have exactly two factors: 1 and themselves.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is 15% of 200?',
          choices: [
            choice('20', false),
            choice('25', false),
            choice('30', true),
            choice('35', false),
          ],
          explanation: '15% of 200 is calculated as 0.15 × 200 = 30.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the value of pi (π), rounded to two decimal places?',
          choices: [
            choice('3.41', false),
            choice('3.14', true),
            choice('3.12', false),
            choice('3.16', false),
          ],
          explanation: 'Pi is approximately 3.14159, rounding to 3.14.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the sum of the angles in a triangle?',
          choices: [
            choice('90 degrees', false),
            choice('180 degrees', true),
            choice('270 degrees', false),
            choice('360 degrees', false),
          ],
          explanation: 'The interior angles of any triangle always sum to 180 degrees.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is 100 divided by 4?',
          choices: [
            choice('20', false),
            choice('25', true),
            choice('30', false),
            choice('40', false),
          ],
          explanation: '100 divided by 4 equals 25.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In the equation 2x = 10, what is x?',
          choices: [choice('3', false), choice('5', true), choice('8', false), choice('20', false)],
          explanation: 'Dividing both sides by 2 gives x = 5.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the term for a shape with four equal sides and four right angles?',
          choices: [
            choice('Rectangle', false),
            choice('Square', true),
            choice('Rhombus', false),
            choice('Trapezoid', false),
          ],
          explanation: 'A square has four equal sides and four 90-degree angles.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is 9 squared (9²)?',
          choices: [
            choice('18', false),
            choice('72', false),
            choice('81', true),
            choice('99', false),
          ],
          explanation: '9 squared means 9 × 9, which equals 81.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'math',
    difficulty: 'MEDIUM',
    title: 'Famous Mathematicians & Math History Trivia',
    description:
      'From Pythagoras to Ada Lovelace, this quiz explores the mathematicians and ideas that shaped the field of mathematics. Test your knowledge of math history and the people behind the numbers.',
    tags: ['math', 'math history', 'mathematicians', 'math trivia', 'education'],
    quiz: {
      title: 'Famous Mathematicians & Math History Trivia',
      description: '',
      questions: [
        {
          prompt:
            'Which ancient Greek mathematician is credited with the theorem relating the sides of a right triangle (a² + b² = c²)?',
          choices: [
            choice('Euclid', false),
            choice('Pythagoras', true),
            choice('Archimedes', false),
            choice('Aristotle', false),
          ],
          explanation: 'The Pythagorean theorem is named after Pythagoras of Samos.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which mathematician developed calculus independently around the same time as Isaac Newton?',
          choices: [
            choice('René Descartes', false),
            choice('Gottfried Leibniz', true),
            choice('Blaise Pascal', false),
            choice('Leonhard Euler', false),
          ],
          explanation:
            'Leibniz and Newton developed calculus separately, leading to a famous historical dispute over priority.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for numbers that cannot be expressed as a simple fraction, such as pi or the square root of 2?',
          choices: [
            choice('Rational numbers', false),
            choice('Irrational numbers', true),
            choice('Whole numbers', false),
            choice('Integers', false),
          ],
          explanation: 'Irrational numbers have non-repeating, non-terminating decimal expansions.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which mathematician is credited with formalizing the mathematical rules for zero in ancient India?',
          choices: [
            choice('Aryabhata', false),
            choice('Brahmagupta', true),
            choice('Fibonacci', false),
            choice('Al-Khwarizmi', false),
          ],
          explanation:
            'Brahmagupta, in the 7th century, was among the first to treat zero as a number with defined rules.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which branch of mathematics deals specifically with shapes, sizes, and properties of space?',
          choices: [
            choice('Algebra', false),
            choice('Geometry', true),
            choice('Calculus', false),
            choice('Statistics', false),
          ],
          explanation: 'Geometry studies points, lines, shapes, and spatial relationships.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'The term "algorithm" is derived from the name of which 9th-century Persian mathematician?',
          choices: [
            choice('Al-Khwarizmi', true),
            choice('Omar Khayyam', false),
            choice('Avicenna', false),
            choice('Ibn al-Haytham', false),
          ],
          explanation: '"Algorithm" comes from a Latinized version of Al-Khwarizmi\'s name.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which Italian mathematician introduced the famous sequence where each number is the sum of the two preceding ones?',
          choices: [
            choice('Fibonacci', true),
            choice('Galileo', false),
            choice('Pascal', false),
            choice('Cardano', false),
          ],
          explanation:
            'The Fibonacci sequence is named after Leonardo of Pisa, known as Fibonacci.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for a mathematical statement that has been proven true based on previously established statements?',
          choices: [
            choice('Hypothesis', false),
            choice('Theorem', true),
            choice('Variable', false),
            choice('Estimate', false),
          ],
          explanation: 'A theorem is a proven mathematical result, backed by logical proof.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which mathematician, working with Charles Babbage, is considered the first computer programmer?',
          choices: [
            choice('Marie Curie', false),
            choice('Ada Lovelace', true),
            choice('Emmy Noether', false),
            choice('Sofia Kovalevskaya', false),
          ],
          explanation:
            'Ada Lovelace wrote what is considered the first algorithm intended for a machine.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "geometry" literally mean, derived from Greek?',
          choices: [
            choice('Study of numbers', false),
            choice('Earth measurement', true),
            choice('Study of shapes', false),
            choice('Logical reasoning', false),
          ],
          explanation: '"Geometry" comes from Greek "geo" (earth) and "metron" (measure).',
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── Religion & Philosophy ────────────────────────────────────────────────
  {
    categorySlug: 'religion',
    difficulty: 'EASY',
    title: 'World Religions Basics Quiz',
    description:
      "Learn the basics of the world's major religions, from their holy books and founders to key beliefs and practices. A respectful, educational primer on Christianity, Islam, Hinduism, Buddhism, and more.",
    tags: ['religion', 'world religions', 'beliefs', 'religion basics', 'culture'],
    quiz: {
      title: 'World Religions Basics Quiz',
      description: '',
      questions: [
        {
          prompt: 'Which religion is based on the teachings of Jesus Christ?',
          choices: [
            choice('Islam', false),
            choice('Christianity', true),
            choice('Judaism', false),
            choice('Buddhism', false),
          ],
          explanation: 'Christianity is founded on the life and teachings of Jesus Christ.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the holy book of Islam called?',
          choices: [
            choice('The Bible', false),
            choice('The Torah', false),
            choice('The Quran', true),
            choice('The Vedas', false),
          ],
          explanation:
            'Muslims consider the Quran the literal word of God revealed to the Prophet Muhammad.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which religion originated in ancient India and includes belief in karma and reincarnation, with many deities?',
          choices: [
            choice('Islam', false),
            choice('Hinduism', true),
            choice('Judaism', false),
            choice('Sikhism', false),
          ],
          explanation:
            "Hinduism is one of the world's oldest religions, originating in the Indian subcontinent.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Who is considered the founder of Buddhism?',
          choices: [
            choice('Confucius', false),
            choice('Siddhartha Gautama (the Buddha)', true),
            choice('Guru Nanak', false),
            choice('Laozi', false),
          ],
          explanation: 'Siddhartha Gautama achieved enlightenment and became known as the Buddha.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the holy book of Judaism, containing its foundational texts?',
          choices: [
            choice('The Quran', false),
            choice('The Torah', true),
            choice('The Bhagavad Gita', false),
            choice('The Tripitaka', false),
          ],
          explanation: 'The Torah comprises the first five books of the Hebrew Bible.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which city is considered holy by Judaism, Christianity, and Islam alike?',
          choices: [
            choice('Mecca', false),
            choice('Rome', false),
            choice('Jerusalem', true),
            choice('Varanasi', false),
          ],
          explanation:
            'Jerusalem holds deep religious significance across all three Abrahamic faiths.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes a person who does not believe in the existence of any god or gods?',
          choices: [
            choice('Agnostic', false),
            choice('Atheist', true),
            choice('Theist', false),
            choice('Pantheist', false),
          ],
          explanation: 'An atheist does not hold a belief in any deity.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which religion was founded by Guru Nanak in the Punjab region of South Asia?',
          choices: [
            choice('Buddhism', false),
            choice('Sikhism', true),
            choice('Jainism', false),
            choice('Hinduism', false),
          ],
          explanation: 'Sikhism was founded in the 15th century by Guru Nanak.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the Islamic holy month of fasting called?',
          choices: [
            choice('Eid', false),
            choice('Ramadan', true),
            choice('Hajj', false),
            choice('Sharia', false),
          ],
          explanation: 'During Ramadan, observant Muslims fast from dawn until sunset.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which tradition, founded by Confucius, emphasizes morality, family respect, and social harmony in Chinese culture?',
          choices: [
            choice('Taoism', false),
            choice('Confucianism', true),
            choice('Buddhism', false),
            choice('Shinto', false),
          ],
          explanation:
            'Confucianism has profoundly shaped Chinese ethics and social structure for centuries.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'religion',
    difficulty: 'MEDIUM',
    title: 'Philosophy & Religious History Trivia',
    description:
      'Explore the philosophers and religious history that shaped human thought, from Socrates and Plato to the Five Pillars of Islam. A thoughtful quiz for anyone curious about belief systems and big ideas.',
    tags: ['philosophy', 'religious history', 'world religions', 'ethics', 'trivia'],
    quiz: {
      title: 'Philosophy & Religious History Trivia',
      description: '',
      questions: [
        {
          prompt:
            'Which ancient Greek philosopher is known for the Socratic method and was sentenced to death by drinking hemlock?',
          choices: [
            choice('Plato', false),
            choice('Aristotle', false),
            choice('Socrates', true),
            choice('Epicurus', false),
          ],
          explanation:
            'Socrates was condemned to death in Athens in 399 BC for "corrupting the youth."',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which philosopher wrote "The Republic," exploring justice and the ideal state?',
          choices: [
            choice('Aristotle', false),
            choice('Plato', true),
            choice('Socrates', false),
            choice('Confucius', false),
          ],
          explanation:
            'Plato\'s "The Republic" is one of the most influential works in Western philosophy.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes the branch of philosophy concerned with questions of existence, reality, and being?',
          choices: [
            choice('Ethics', false),
            choice('Metaphysics', true),
            choice('Epistemology', false),
            choice('Aesthetics', false),
          ],
          explanation: 'Metaphysics explores fundamental questions about the nature of reality.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which religious council, held in 325 CE, established key Christian doctrine and produced the Nicene Creed?',
          choices: [
            choice('The Council of Trent', false),
            choice('The First Council of Nicaea', true),
            choice('The Council of Jerusalem', false),
            choice('Vatican II', false),
          ],
          explanation:
            'The First Council of Nicaea addressed major theological disputes in early Christianity.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which German philosopher famously declared "God is dead" in his critique of traditional morality?',
          choices: [
            choice('Immanuel Kant', false),
            choice('Friedrich Nietzsche', true),
            choice('Karl Marx', false),
            choice('Georg Hegel', false),
          ],
          explanation:
            'Nietzsche used the phrase to describe the decline of traditional religious authority in modern society.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which of the Five Pillars of Islam involves a pilgrimage to Mecca?',
          choices: [
            choice('Salat', false),
            choice('Zakat', false),
            choice('Hajj', true),
            choice('Sawm', false),
          ],
          explanation:
            'The Hajj is a pilgrimage to Mecca that Muslims are expected to undertake at least once if able.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which Chinese philosophical tradition, associated with Laozi, emphasizes living in harmony with the "Tao"?',
          choices: [
            choice('Confucianism', false),
            choice('Taoism', true),
            choice('Legalism', false),
            choice('Mohism', false),
          ],
          explanation: 'Taoism teaches alignment with the natural flow and order of the universe.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes the branch of philosophy dealing with moral principles and questions of right and wrong?',
          choices: [
            choice('Ethics', true),
            choice('Metaphysics', false),
            choice('Logic', false),
            choice('Epistemology', false),
          ],
          explanation: 'Ethics examines what constitutes good, bad, right, and wrong conduct.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which Enlightenment philosopher wrote "The Social Contract," arguing legitimate political authority comes from agreement among individuals?',
          choices: [
            choice('John Locke', false),
            choice('Jean-Jacques Rousseau', true),
            choice('Voltaire', false),
            choice('Thomas Hobbes', false),
          ],
          explanation:
            "Rousseau's 1762 work influenced modern political philosophy and democratic theory.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'In Buddhism, what term describes the cycle of death and rebirth that practitioners seek to escape through enlightenment?',
          choices: [
            choice('Nirvana', false),
            choice('Samsara', true),
            choice('Dharma', false),
            choice('Karma', false),
          ],
          explanation:
            'Samsara is the continuous cycle of birth, death, and rebirth in Buddhist and Hindu thought.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── Mixed Trivia ─────────────────────────────────────────────────────────
  {
    categorySlug: 'trivia',
    difficulty: 'EASY',
    title: 'Quick-Fire Trivia: General Knowledge Challenge',
    description:
      'A fast, easy round of general knowledge questions covering geography, animals, food, and more. Perfect for a quick trivia break or testing the basics.',
    tags: ['trivia', 'general knowledge', 'quick quiz', 'easy trivia', 'fun facts'],
    quiz: {
      title: 'Quick-Fire Trivia: General Knowledge Challenge',
      description: '',
      questions: [
        {
          prompt: 'What is the largest ocean on Earth?',
          choices: [
            choice('Atlantic', false),
            choice('Indian', false),
            choice('Pacific', true),
            choice('Arctic', false),
          ],
          explanation: "The Pacific Ocean is the largest and deepest of Earth's oceans.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Which country is famous for the Eiffel Tower?',
          choices: [
            choice('Italy', false),
            choice('France', true),
            choice('Spain', false),
            choice('Germany', false),
          ],
          explanation: 'The Eiffel Tower stands in Paris, France, completed in 1889.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the main ingredient in bread?',
          choices: [
            choice('Rice', false),
            choice('Flour', true),
            choice('Sugar', false),
            choice('Butter', false),
          ],
          explanation:
            'Bread is primarily made from flour, water, and a leavening agent like yeast.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many legs does an insect have?',
          choices: [choice('4', false), choice('6', true), choice('8', false), choice('10', false)],
          explanation:
            'All insects have six legs, distinguishing them from arachnids, which have eight.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the currency used in the United States?',
          choices: [
            choice('Euro', false),
            choice('Pound', false),
            choice('Dollar', true),
            choice('Yen', false),
          ],
          explanation: 'The US dollar is the official currency of the United States.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which planet is closest to the Sun?',
          choices: [
            choice('Venus', false),
            choice('Earth', false),
            choice('Mercury', true),
            choice('Mars', false),
          ],
          explanation: 'Mercury is the smallest and innermost planet in the solar system.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What do bees produce that humans commonly eat?',
          choices: [
            choice('Milk', false),
            choice('Honey', true),
            choice('Syrup', false),
            choice('Butter', false),
          ],
          explanation: 'Bees produce honey from the nectar of flowers.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the tallest animal in the world?',
          choices: [
            choice('Elephant', false),
            choice('Giraffe', true),
            choice('Horse', false),
            choice('Camel', false),
          ],
          explanation: 'Giraffes can grow up to about 18 feet (5.5 meters) tall.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What season comes after winter?',
          choices: [
            choice('Summer', false),
            choice('Fall', false),
            choice('Spring', true),
            choice('Autumn', false),
          ],
          explanation: 'Spring follows winter in the traditional four-season cycle.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many letters are in the English alphabet?',
          choices: [
            choice('24', false),
            choice('25', false),
            choice('26', true),
            choice('27', false),
          ],
          explanation: 'The modern English alphabet has 26 letters.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'MEDIUM',
    title: 'Trivia Night Challenge: General Knowledge Mix',
    description:
      'A well-rounded mix of general knowledge questions covering science, geography, language, and culture. Great for trivia night teams looking for a solid mid-level challenge.',
    tags: ['trivia', 'general knowledge', 'trivia night', 'mixed trivia', 'quiz'],
    quiz: {
      title: 'Trivia Night Challenge: General Knowledge Mix',
      description: '',
      questions: [
        {
          prompt: 'What is the largest desert in the world by total area, including cold deserts?',
          choices: [
            choice('Sahara', false),
            choice('Antarctic Desert', true),
            choice('Arabian Desert', false),
            choice('Gobi Desert', false),
          ],
          explanation:
            'The Antarctic Desert is the largest desert in the world when polar deserts are included.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the national sport of Japan?',
          choices: [
            choice('Baseball', false),
            choice('Sumo wrestling', true),
            choice('Judo', false),
            choice('Soccer', false),
          ],
          explanation:
            "Sumo wrestling is considered Japan's national sport, with deep cultural roots.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Which metal is liquid at room temperature?',
          choices: [
            choice('Iron', false),
            choice('Mercury', true),
            choice('Lead', false),
            choice('Aluminum', false),
          ],
          explanation: 'Mercury is the only metal that is liquid at standard room temperature.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the study of celestial objects like stars and planets called?',
          choices: [
            choice('Geology', false),
            choice('Astronomy', true),
            choice('Biology', false),
            choice('Meteorology', false),
          ],
          explanation: 'Astronomy is the scientific study of celestial objects and phenomena.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which country gifted the Statue of Liberty to the United States?',
          choices: [
            choice('United Kingdom', false),
            choice('France', true),
            choice('Spain', false),
            choice('Italy', false),
          ],
          explanation:
            'France gave the statue to the US in 1886 to mark a century of American independence.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the term for an animal that eats both plants and meat?',
          choices: [
            choice('Carnivore', false),
            choice('Herbivore', false),
            choice('Omnivore', true),
            choice('Insectivore', false),
          ],
          explanation: 'Omnivores, like humans and bears, eat both plant and animal matter.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which language has the most native speakers in the world?',
          choices: [
            choice('English', false),
            choice('Spanish', false),
            choice('Mandarin Chinese', true),
            choice('Hindi', false),
          ],
          explanation: 'Mandarin Chinese has more native speakers than any other language.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the hardest natural substance on Earth?',
          choices: [
            choice('Gold', false),
            choice('Diamond', true),
            choice('Quartz', false),
            choice('Iron', false),
          ],
          explanation:
            'Diamond ranks 10 on the Mohs hardness scale, the hardest natural material known.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which U.S. president appears on the one-dollar bill?',
          choices: [
            choice('Abraham Lincoln', false),
            choice('George Washington', true),
            choice('Thomas Jefferson', false),
            choice('Benjamin Franklin', false),
          ],
          explanation: 'George Washington has appeared on the one-dollar bill since 1869.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for a word that is spelled the same forward and backward, like "level" or "racecar"?',
          choices: [
            choice('Synonym', false),
            choice('Palindrome', true),
            choice('Acronym', false),
            choice('Homophone', false),
          ],
          explanation: 'A palindrome reads identically in both directions.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── Language & Words ─────────────────────────────────────────────────────
  {
    categorySlug: 'language',
    difficulty: 'EASY',
    title: 'English Grammar & Vocabulary Basics Quiz',
    description:
      'Test your knowledge of basic grammar rules, parts of speech, and vocabulary terms. A helpful refresher for students, writers, or anyone brushing up on the English language.',
    tags: ['grammar', 'vocabulary', 'english language', 'language basics', 'education'],
    quiz: {
      title: 'English Grammar & Vocabulary Basics Quiz',
      description: '',
      questions: [
        {
          prompt: 'What part of speech describes an action or state of being (e.g., "run," "is")?',
          choices: [
            choice('Noun', false),
            choice('Verb', true),
            choice('Adjective', false),
            choice('Adverb', false),
          ],
          explanation: 'Verbs express actions, occurrences, or states of being.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a word that describes or modifies a noun called?',
          choices: [
            choice('Verb', false),
            choice('Adjective', true),
            choice('Pronoun', false),
            choice('Conjunction', false),
          ],
          explanation: 'Adjectives add detail or description to nouns.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the plural form of "child"?',
          choices: [
            choice('Childs', false),
            choice('Childes', false),
            choice('Children', true),
            choice('Childrens', false),
          ],
          explanation:
            '"Children" is an irregular plural that doesn\'t follow the standard "-s" rule.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What punctuation mark is used to indicate a question?',
          choices: [
            choice('Period', false),
            choice('Exclamation point', false),
            choice('Question mark', true),
            choice('Comma', false),
          ],
          explanation: 'A question mark signals that a sentence is asking something.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a word that has the same or similar meaning as another word called?',
          choices: [
            choice('Antonym', false),
            choice('Synonym', true),
            choice('Homophone', false),
            choice('Acronym', false),
          ],
          explanation: 'Synonyms share similar meanings, like "happy" and "joyful."',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a word that means the opposite of another word called?',
          choices: [
            choice('Synonym', false),
            choice('Antonym', true),
            choice('Homograph', false),
            choice('Pronoun', false),
          ],
          explanation: 'Antonyms have opposite meanings, like "hot" and "cold."',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which word correctly completes the sentence: "She ___ to the store yesterday"?',
          choices: [
            choice('go', false),
            choice('goes', false),
            choice('went', true),
            choice('going', false),
          ],
          explanation:
            '"Went" is the correct past-tense form of "go" for an action that already happened.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for a group of words that expresses a complete thought, containing a subject and a verb?',
          choices: [
            choice('Phrase', false),
            choice('Sentence', true),
            choice('Paragraph', false),
            choice('Clause only', false),
          ],
          explanation:
            'A sentence expresses a complete idea and includes at least a subject and a verb.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What punctuation mark is used to separate items in a list?',
          choices: [
            choice('Period', false),
            choice('Comma', true),
            choice('Semicolon', false),
            choice('Colon', false),
          ],
          explanation: 'Commas are the standard way to separate items in a simple list.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the term for a word used in place of a noun, like "he," "she," or "it"?',
          choices: [
            choice('Adjective', false),
            choice('Pronoun', true),
            choice('Preposition', false),
            choice('Conjunction', false),
          ],
          explanation: 'Pronouns stand in for nouns to avoid repetition.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'language',
    difficulty: 'MEDIUM',
    title: 'Word Origins & World Languages Trivia',
    description:
      "Explore the origins and quirks of world languages, from Latin's influence on Romance languages to constructed languages like Esperanto. A fascinating quiz for word nerds and language lovers.",
    tags: ['language', 'word origins', 'etymology', 'world languages', 'linguistics'],
    quiz: {
      title: 'Word Origins & World Languages Trivia',
      description: '',
      questions: [
        {
          prompt: 'English belongs to which language family?',
          choices: [
            choice('Romance', false),
            choice('Germanic', true),
            choice('Slavic', false),
            choice('Sino-Tibetan', false),
          ],
          explanation:
            'English is a Germanic language, though it borrows heavily from Latin and French.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which language contributed the most loanwords to English after the Norman Conquest of 1066?',
          choices: [
            choice('German', false),
            choice('French', true),
            choice('Spanish', false),
            choice('Latin', false),
          ],
          explanation: 'Norman French heavily influenced English vocabulary after 1066.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the most widely spoken language in the world by total number of speakers, counting native and second-language speakers?',
          choices: [
            choice('Mandarin Chinese', false),
            choice('Spanish', false),
            choice('English', true),
            choice('Hindi', false),
          ],
          explanation:
            'English has the largest combined total of native and second-language speakers worldwide.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which alphabet is used to write Russian and many other Slavic languages?',
          choices: [
            choice('Latin alphabet', false),
            choice('Cyrillic alphabet', true),
            choice('Greek alphabet', false),
            choice('Arabic alphabet', false),
          ],
          explanation:
            'The Cyrillic alphabet is used across Russian and several other Slavic languages.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for a word borrowed from another language and used largely unchanged, like "déjà vu" from French?',
          choices: [
            choice('Idiom', false),
            choice('Loanword', true),
            choice('Synonym', false),
            choice('Acronym', false),
          ],
          explanation: 'Loanwords are adopted directly from another language into everyday use.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which ancient language is the root of most modern Romance languages, including Spanish, French, and Italian?',
          choices: [
            choice('Greek', false),
            choice('Latin', true),
            choice('Sanskrit', false),
            choice('Old English', false),
          ],
          explanation:
            'Romance languages evolved from Vulgar Latin spoken across the Roman Empire.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the official language with the most native speakers across Africa?',
          choices: [
            choice('English', false),
            choice('French', false),
            choice('Arabic', true),
            choice('Swahili', false),
          ],
          explanation:
            "Arabic has the largest number of native speakers among Africa's official languages.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for a phrase whose meaning can\'t be understood from the literal definitions of its words, like "kick the bucket"?',
          choices: [
            choice('Metaphor', false),
            choice('Idiom', true),
            choice('Simile', false),
            choice('Proverb', false),
          ],
          explanation: 'Idioms carry figurative meanings distinct from their literal wording.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Esperanto is an example of what kind of language?',
          choices: [
            choice('A dead language', false),
            choice('A constructed (artificial) language', true),
            choice('A sign language', false),
            choice('A programming language', false),
          ],
          explanation:
            'Esperanto was deliberately created in the 1880s to serve as a universal second language.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for a language no longer spoken natively by any community, such as Latin or Ancient Greek?',
          choices: [
            choice('Endangered language', false),
            choice('Dead language', true),
            choice('Pidgin', false),
            choice('Dialect', false),
          ],
          explanation:
            'A "dead" language has no native speakers left, even if it\'s still studied or used ceremonially.',
          timeLimitSec: 20,
        },
      ],
    },
  },
]

async function main() {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    select: { id: true, email: true },
  })
  if (!admin) {
    throw new Error('No ADMIN user found to attribute these drafts to.')
  }
  console.log(`Attributing drafts to admin: ${admin.email} (${admin.id})`)

  const slugs = [...new Set(DRAFTS.map((d) => d.categorySlug))]
  const categories = await prisma.category.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true },
  })
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]))

  const missing = slugs.filter((s) => !categoryBySlug.has(s))
  if (missing.length > 0) {
    throw new Error(`Missing categories in DB: ${missing.join(', ')}`)
  }

  let created = 0
  for (const draft of DRAFTS) {
    const categoryId = categoryBySlug.get(draft.categorySlug)!
    const normalized = validateAndNormalize(draft.quiz, 'TEXT_CHOICE')

    const slug = await generateUniqueSlug(draft.title, (s) =>
      prisma.quiz.findUnique({ where: { slug: s } }).then((q) => !!q)
    )

    const quiz = await prisma.quiz.create({
      data: {
        title: draft.title,
        slug,
        description: draft.description,
        tags: draft.tags,
        authorId: admin.id,
        categoryId,
        difficulty: draft.difficulty,
        format: 'TEXT_CHOICE',
        isPublished: false,
      },
      select: { id: true },
    })

    await prisma.$transaction(
      normalized.questions.map((q, index) =>
        prisma.question.create({
          data: buildQuestionCreateData(q, 'TEXT_CHOICE', quiz.id, index),
        })
      )
    )

    created++
    console.log(`  Created draft: "${draft.title}" (${draft.categorySlug}) — ${quiz.id}`)
  }

  console.log(`\nDone. Created ${created} draft quizzes for admin review.`)
}

main()
  .catch((err) => {
    console.error('Seeding failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
