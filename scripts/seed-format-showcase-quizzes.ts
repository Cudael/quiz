import { PrismaClient } from '@prisma/client'
import { generateUniqueSlug } from '../src/lib/slugify'
import {
  validateAndNormalize,
  buildQuestionCreateData,
  type GeneratedQuiz,
  type GeneratedQuestion,
  type QuizFormat,
} from '../src/server/ai-generate-utils'

const prisma = new PrismaClient()

interface DraftQuizInput {
  categorySlug: string
  title: string
  description: string
  tags: string[]
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  format: QuizFormat
  quiz: GeneratedQuiz
}

function choice(text: string, isCorrect: boolean) {
  return { text, isCorrect }
}

function orderItem(text: string, position: number) {
  return { text, position }
}

function matchItem(text: string, side: 'L' | 'R', matchKey: string) {
  return { text, side, matchKey }
}

function groupItem(text: string, groupKey: string) {
  return { text, groupKey }
}

function versusItem(text: string, value: number) {
  return { text, value }
}

const DRAFTS: DraftQuizInput[] = [
  // ── ORDER ────────────────────────────────────────────────────────────────
  {
    categorySlug: 'history',
    difficulty: 'MEDIUM',
    format: 'ORDER',
    title: 'Historical Events in Order',
    description:
      'Test your sense of history by putting major events, inventions, and voyages in the correct chronological order. A fun way to sharpen your timeline of world history.',
    tags: ['history', 'chronology', 'order', 'timeline', 'world history'],
    quiz: {
      title: 'Historical Events in Order',
      description: '',
      questions: [
        {
          prompt: 'Put these events in chronological order (earliest to latest):',
          choices: [
            orderItem('Fall of the Roman Empire (476 CE)', 1),
            orderItem('Columbus reaches the Americas (1492)', 2),
            orderItem('French Revolution begins (1789)', 3),
            orderItem('World War I begins (1914)', 4),
          ],
          explanation:
            'These events span nearly 1,500 years of world history, from antiquity to the modern era.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Put these inventions in order of when they were invented (earliest to latest):',
          choices: [
            orderItem('The printing press (Gutenberg, ~1440)', 1),
            orderItem('The telephone (1876)', 2),
            orderItem('The airplane (Wright Brothers, 1903)', 3),
            orderItem('The World Wide Web (1989)', 4),
          ],
          explanation: 'Each of these inventions transformed how humans communicate and travel.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Order these US presidents by when they took office (earliest to latest):',
          choices: [
            orderItem('George Washington (1789)', 1),
            orderItem('Abraham Lincoln (1861)', 2),
            orderItem('Franklin D. Roosevelt (1933)', 3),
            orderItem('Barack Obama (2009)', 4),
          ],
          explanation:
            'These four presidents span the founding, the Civil War, the Depression/WWII era, and the 21st century.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Put these space milestones in chronological order (earliest to latest):',
          choices: [
            orderItem('Sputnik 1 launched (1957)', 1),
            orderItem('Yuri Gagarin becomes first human in space (1961)', 2),
            orderItem('Apollo 11 Moon landing (1969)', 3),
            orderItem('First Space Shuttle launch (1981)', 4),
          ],
          explanation: 'The Space Race accelerated rapidly across these two and a half decades.',
          timeLimitSec: 30,
        },
        {
          prompt: "Order these ancient civilizations' peak eras from earliest to latest:",
          choices: [
            orderItem('Ancient Egypt, Old Kingdom (~2600 BCE)', 1),
            orderItem('Ancient Greece, Classical era (~500 BCE)', 2),
            orderItem('Roman Empire, height of power (~117 CE)', 3),
            orderItem('Byzantine Empire, height of power (~550 CE)', 4),
          ],
          explanation:
            'Each civilization built on and eventually succeeded the influence of the one before it.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Put these wars in chronological order by start date (earliest to latest):',
          choices: [
            orderItem('American Revolutionary War (1775)', 1),
            orderItem('Napoleonic Wars (1803)', 2),
            orderItem('American Civil War (1861)', 3),
            orderItem('World War II (1939)', 4),
          ],
          explanation:
            'These conflicts span from the birth of the United States to the mid-20th century.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Order these technological milestones from earliest to latest:',
          choices: [
            orderItem('The wheel invented (~3500 BCE)', 1),
            orderItem('The printing press (~1440)', 2),
            orderItem('The steam engine (James Watt, 1769)', 3),
            orderItem('The personal computer (1970s)', 4),
          ],
          explanation:
            'Human technology advanced slowly for millennia before accelerating rapidly in the industrial and digital ages.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Put these historic voyages and expeditions in chronological order:',
          choices: [
            orderItem('Marco Polo travels to Asia (1271)', 1),
            orderItem('Columbus reaches the Americas (1492)', 2),
            orderItem("Magellan's expedition circumnavigates the globe (1519-1522)", 3),
            orderItem('The Lewis and Clark Expedition (1804)', 4),
          ],
          explanation: 'These expeditions reshaped how Europeans understood and mapped the world.',
          timeLimitSec: 30,
        },
      ],
    },
  },
  // ── MATCH ────────────────────────────────────────────────────────────────
  {
    categorySlug: 'capitals',
    difficulty: 'MEDIUM',
    format: 'MATCH',
    title: 'Match the Capital to the Country',
    description:
      'Match each country to its capital city in this classic pairing quiz covering every continent. A great way to test and sharpen your world geography knowledge.',
    tags: ['geography', 'capitals', 'match', 'world capitals', 'countries'],
    quiz: {
      title: 'Match the Capital to the Country',
      description: '',
      questions: [
        {
          prompt: 'Match each country to its capital city:',
          choices: [
            matchItem('France', 'L', '1'),
            matchItem('Japan', 'L', '2'),
            matchItem('Brazil', 'L', '3'),
            matchItem('Egypt', 'L', '4'),
            matchItem('Paris', 'R', '1'),
            matchItem('Tokyo', 'R', '2'),
            matchItem('Brasília', 'R', '3'),
            matchItem('Cairo', 'R', '4'),
          ],
          explanation:
            'Paris, Tokyo, Brasília, and Cairo are the capitals of France, Japan, Brazil, and Egypt.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Match each country to its capital city:',
          choices: [
            matchItem('Canada', 'L', '1'),
            matchItem('Australia', 'L', '2'),
            matchItem('Germany', 'L', '3'),
            matchItem('Italy', 'L', '4'),
            matchItem('Ottawa', 'R', '1'),
            matchItem('Canberra', 'R', '2'),
            matchItem('Berlin', 'R', '3'),
            matchItem('Rome', 'R', '4'),
          ],
          explanation:
            'Ottawa, Canberra, Berlin, and Rome are the capitals of Canada, Australia, Germany, and Italy.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Match each country to its capital city:',
          choices: [
            matchItem('Russia', 'L', '1'),
            matchItem('China', 'L', '2'),
            matchItem('India', 'L', '3'),
            matchItem('Mexico', 'L', '4'),
            matchItem('Moscow', 'R', '1'),
            matchItem('Beijing', 'R', '2'),
            matchItem('New Delhi', 'R', '3'),
            matchItem('Mexico City', 'R', '4'),
          ],
          explanation:
            'Moscow, Beijing, New Delhi, and Mexico City are the capitals of Russia, China, India, and Mexico.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Match each country to its capital city:',
          choices: [
            matchItem('Spain', 'L', '1'),
            matchItem('Portugal', 'L', '2'),
            matchItem('Greece', 'L', '3'),
            matchItem('Turkey', 'L', '4'),
            matchItem('Madrid', 'R', '1'),
            matchItem('Lisbon', 'R', '2'),
            matchItem('Athens', 'R', '3'),
            matchItem('Ankara', 'R', '4'),
          ],
          explanation:
            'Madrid, Lisbon, Athens, and Ankara are the capitals of Spain, Portugal, Greece, and Turkey.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Match each country to its capital city:',
          choices: [
            matchItem('South Korea', 'L', '1'),
            matchItem('Thailand', 'L', '2'),
            matchItem('Vietnam', 'L', '3'),
            matchItem('Indonesia', 'L', '4'),
            matchItem('Seoul', 'R', '1'),
            matchItem('Bangkok', 'R', '2'),
            matchItem('Hanoi', 'R', '3'),
            matchItem('Jakarta', 'R', '4'),
          ],
          explanation:
            'Seoul, Bangkok, Hanoi, and Jakarta are the capitals of South Korea, Thailand, Vietnam, and Indonesia.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Match each country to its capital city:',
          choices: [
            matchItem('Argentina', 'L', '1'),
            matchItem('Chile', 'L', '2'),
            matchItem('Peru', 'L', '3'),
            matchItem('Colombia', 'L', '4'),
            matchItem('Buenos Aires', 'R', '1'),
            matchItem('Santiago', 'R', '2'),
            matchItem('Lima', 'R', '3'),
            matchItem('Bogotá', 'R', '4'),
          ],
          explanation:
            'Buenos Aires, Santiago, Lima, and Bogotá are the capitals of Argentina, Chile, Peru, and Colombia.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Match each country to its capital city:',
          choices: [
            matchItem('Kenya', 'L', '1'),
            matchItem('Nigeria', 'L', '2'),
            matchItem('South Africa', 'L', '3'),
            matchItem('Morocco', 'L', '4'),
            matchItem('Nairobi', 'R', '1'),
            matchItem('Abuja', 'R', '2'),
            matchItem('Pretoria', 'R', '3'),
            matchItem('Rabat', 'R', '4'),
          ],
          explanation:
            'Nairobi, Abuja, Pretoria, and Rabat are the capitals of Kenya, Nigeria, South Africa, and Morocco.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Match each country to its capital city:',
          choices: [
            matchItem('Sweden', 'L', '1'),
            matchItem('Norway', 'L', '2'),
            matchItem('Finland', 'L', '3'),
            matchItem('Denmark', 'L', '4'),
            matchItem('Stockholm', 'R', '1'),
            matchItem('Oslo', 'R', '2'),
            matchItem('Helsinki', 'R', '3'),
            matchItem('Copenhagen', 'R', '4'),
          ],
          explanation:
            'Stockholm, Oslo, Helsinki, and Copenhagen are the capitals of Sweden, Norway, Finland, and Denmark.',
          timeLimitSec: 30,
        },
      ],
    },
  },
  // ── ODD_ONE_OUT ──────────────────────────────────────────────────────────
  {
    categorySlug: 'trivia',
    difficulty: 'EASY',
    format: 'ODD_ONE_OUT',
    title: "Which One Doesn't Belong?",
    description:
      'Spot the odd one out in each group of four — covering animals, instruments, planets, and more. A quick, fun way to test your general knowledge and pattern recognition.',
    tags: ['trivia', 'odd one out', 'general knowledge', 'pattern recognition', 'fun quiz'],
    quiz: {
      title: "Which One Doesn't Belong?",
      description: '',
      questions: [
        {
          prompt: 'Which of these is NOT a traditional primary color?',
          choices: [
            choice('Red', false),
            choice('Blue', false),
            choice('Green', true),
            choice('Yellow', false),
          ],
          explanation:
            'Red, blue, and yellow are the traditional primary colors; green is a secondary color made by mixing blue and yellow.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which of these is NOT a mammal?',
          choices: [
            choice('Dolphin', false),
            choice('Shark', true),
            choice('Bat', false),
            choice('Elephant', false),
          ],
          explanation: 'Sharks are fish, not mammals — dolphins, bats, and elephants all are.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which of these is NOT currently classified as a planet in our solar system?',
          choices: [
            choice('Mars', false),
            choice('Venus', false),
            choice('Pluto', true),
            choice('Jupiter', false),
          ],
          explanation: 'Pluto was reclassified as a dwarf planet in 2006.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which of these is NOT a Scandinavian country?',
          choices: [
            choice('Norway', false),
            choice('Sweden', false),
            choice('Denmark', false),
            choice('Netherlands', true),
          ],
          explanation: 'The Netherlands is in Western Europe, not Scandinavia.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which of these is NOT a string instrument?',
          choices: [
            choice('Violin', false),
            choice('Cello', false),
            choice('Flute', true),
            choice('Guitar', false),
          ],
          explanation: 'The flute is a woodwind instrument; the others are all string instruments.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which of these is NOT a type of pasta?',
          choices: [
            choice('Penne', false),
            choice('Fusilli', false),
            choice('Risotto', true),
            choice('Farfalle', false),
          ],
          explanation: 'Risotto is a rice dish, not a pasta shape.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which of these is NOT a currency?',
          choices: [
            choice('Yen', false),
            choice('Peso', false),
            choice('Sherpa', true),
            choice('Rupee', false),
          ],
          explanation: 'A Sherpa is a mountain guide, not a currency.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which of these is NOT one of the five Great Lakes?',
          choices: [
            choice('Superior', false),
            choice('Michigan', false),
            choice('Erie', false),
            choice('Champlain', true),
          ],
          explanation:
            'Lake Champlain is a separate lake on the US-Canada border, not one of the five Great Lakes.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which of these is NOT a reptile?',
          choices: [
            choice('Crocodile', false),
            choice('Salamander', true),
            choice('Turtle', false),
            choice('Snake', false),
          ],
          explanation: 'Salamanders are amphibians, not reptiles.',
          timeLimitSec: 20,
        },
        {
          prompt: "Which of these is NOT one of Shakespeare's plays?",
          choices: [
            choice('Hamlet', false),
            choice('Macbeth', false),
            choice('Frankenstein', true),
            choice('Othello', false),
          ],
          explanation: 'Frankenstein is a novel by Mary Shelley, not a Shakespeare play.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── TYPE_ANSWER ──────────────────────────────────────────────────────────
  {
    categorySlug: 'geography',
    difficulty: 'MEDIUM',
    format: 'TYPE_ANSWER',
    title: 'Type the Answer: World Geography Challenge',
    description:
      'No multiple choice here — type in your answers to these world geography questions from memory. A tougher, more rewarding way to test what you really know.',
    tags: ['geography', 'type answer', 'world facts', 'trivia', 'challenge'],
    quiz: {
      title: 'Type the Answer: World Geography Challenge',
      description: '',
      questions: [
        {
          prompt: 'What is the largest country in the world by land area?',
          choices: [],
          acceptedAnswers: ['Russia'],
          explanation:
            'Russia spans over 17 million square kilometers, the largest of any country.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the smallest country in the world?',
          choices: [],
          acceptedAnswers: ['Vatican City', 'Vatican'],
          explanation: 'Vatican City covers about 0.44 square kilometers.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the capital of Australia?',
          choices: [],
          acceptedAnswers: ['Canberra'],
          explanation: "Canberra, not Sydney, is Australia's capital city.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the longest river in the world?',
          choices: [],
          acceptedAnswers: ['Nile', 'The Nile', 'Nile River'],
          explanation: 'The Nile is traditionally considered the longest river on Earth.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the tallest mountain in the world?',
          choices: [],
          acceptedAnswers: ['Mount Everest', 'Everest'],
          explanation: 'Mount Everest stands at 8,849 meters above sea level.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the largest hot desert in the world?',
          choices: [],
          acceptedAnswers: ['Sahara', 'The Sahara', 'Sahara Desert'],
          explanation: 'The Sahara covers most of North Africa.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the official language of Brazil?',
          choices: [],
          acceptedAnswers: ['Portuguese'],
          explanation: 'Brazil was colonized by Portugal, making Portuguese its official language.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the largest ocean by area?',
          choices: [],
          acceptedAnswers: ['Pacific', 'Pacific Ocean', 'The Pacific'],
          explanation: 'The Pacific Ocean covers more area than all landmasses combined.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What continent is the Sahara Desert located on?',
          choices: [],
          acceptedAnswers: ['Africa'],
          explanation: 'The Sahara stretches across North Africa.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the currency used in Japan?',
          choices: [],
          acceptedAnswers: ['Yen', 'Japanese Yen'],
          explanation: "The yen has been Japan's currency since 1871.",
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── NUMBER_GUESS ─────────────────────────────────────────────────────────
  {
    categorySlug: 'science',
    difficulty: 'MEDIUM',
    format: 'NUMBER_GUESS',
    title: 'Guess the Number: Facts & Figures',
    description:
      'How close can you get? Guess the exact numbers behind fascinating facts, from human anatomy to historic dates. Partial credit for getting close!',
    tags: ['trivia', 'number guess', 'facts', 'estimation', 'fun quiz'],
    quiz: {
      title: 'Guess the Number: Facts & Figures',
      description: '',
      questions: [
        {
          prompt: 'How many bones are in the adult human body?',
          choices: [],
          answer: 206,
          min: 100,
          max: 300,
          tolerance: 5,
          unit: 'bones',
          explanation:
            'Adults have 206 bones, down from around 300 at birth as some fuse together.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In what year did World War II end?',
          choices: [],
          answer: 1945,
          min: 1900,
          max: 2000,
          tolerance: 1,
          unit: 'year',
          explanation: 'World War II ended in 1945 with the surrender of Japan.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many countries are member states of the United Nations?',
          choices: [],
          answer: 193,
          min: 100,
          max: 250,
          tolerance: 5,
          unit: 'countries',
          explanation: 'The UN currently has 193 member states.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is normal human body temperature in Celsius, rounded to the nearest degree?',
          choices: [],
          answer: 37,
          min: 30,
          max: 45,
          tolerance: 1,
          unit: '°C',
          explanation: 'Average human body temperature is about 37°C (98.6°F).',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many minutes are there in a full day?',
          choices: [],
          answer: 1440,
          min: 1000,
          max: 2000,
          tolerance: 10,
          unit: 'minutes',
          explanation: 'There are 24 hours in a day, and 24 × 60 = 1,440 minutes.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In what year did the Berlin Wall fall?',
          choices: [],
          answer: 1989,
          min: 1900,
          max: 2000,
          tolerance: 1,
          unit: 'year',
          explanation:
            'The Berlin Wall fell in November 1989, symbolizing the end of the Cold War divide.',
          timeLimitSec: 20,
        },
        {
          prompt: "How many bones does a shark's skeleton contain? (Hint: it's made of cartilage.)",
          choices: [],
          answer: 0,
          min: 0,
          max: 50,
          tolerance: 0,
          unit: 'bones',
          explanation:
            'Sharks have no bones at all — their skeletons are made entirely of cartilage.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the freezing point of water in Fahrenheit?',
          choices: [],
          answer: 32,
          min: -20,
          max: 100,
          tolerance: 2,
          unit: '°F',
          explanation: 'Water freezes at 32°F, equivalent to 0°C.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many time zones does Russia span?',
          choices: [],
          answer: 11,
          min: 1,
          max: 15,
          tolerance: 1,
          unit: 'time zones',
          explanation: "Russia's vast size gives it 11 time zones, more than any other country.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Roughly what percentage of the human body is made up of water?',
          choices: [],
          answer: 60,
          min: 20,
          max: 100,
          tolerance: 5,
          unit: '%',
          explanation: 'The adult human body is roughly 60% water on average.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── CONNECTIONS ──────────────────────────────────────────────────────────
  {
    categorySlug: 'trivia',
    difficulty: 'MEDIUM',
    format: 'CONNECTIONS',
    title: 'Connections: Group the Related Items',
    description:
      'Sort eight items into four hidden categories in this connections-style puzzle. Covers everything from planets and rivers to musical instruments and gemstones.',
    tags: ['trivia', 'connections', 'puzzle', 'categories', 'brain teaser'],
    quiz: {
      title: 'Connections: Group the Related Items',
      description: '',
      questions: [
        {
          prompt: 'Group these 8 items into 4 pairs by theme:',
          choices: [
            groupItem('Apple', 'fruits'),
            groupItem('Banana', 'fruits'),
            groupItem('Toyota', 'car-brands'),
            groupItem('Honda', 'car-brands'),
            groupItem('Rose', 'flowers'),
            groupItem('Tulip', 'flowers'),
            groupItem('Everest', 'mountains'),
            groupItem('K2', 'mountains'),
          ],
          groups: ['fruits', 'car-brands', 'flowers', 'mountains'],
          explanation: 'The four categories are fruits, car brands, flowers, and mountains.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Group these 8 items into 4 pairs by theme:',
          choices: [
            groupItem('Jupiter', 'planets'),
            groupItem('Saturn', 'planets'),
            groupItem('Nile', 'rivers'),
            groupItem('Amazon', 'rivers'),
            groupItem('Beethoven', 'composers'),
            groupItem('Mozart', 'composers'),
            groupItem('Shakespeare', 'writers'),
            groupItem('Hemingway', 'writers'),
          ],
          groups: ['planets', 'rivers', 'composers', 'writers'],
          explanation: 'The four categories are planets, rivers, composers, and writers.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Group these 8 items into 4 pairs by theme:',
          choices: [
            groupItem('Lion', 'big-cats'),
            groupItem('Tiger', 'big-cats'),
            groupItem('Salmon', 'fish'),
            groupItem('Trout', 'fish'),
            groupItem('Oak', 'trees'),
            groupItem('Pine', 'trees'),
            groupItem('Ruby', 'gemstones'),
            groupItem('Emerald', 'gemstones'),
          ],
          groups: ['big-cats', 'fish', 'trees', 'gemstones'],
          explanation: 'The four categories are big cats, fish, trees, and gemstones.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Group these 8 items into 4 pairs by theme:',
          choices: [
            groupItem('Python', 'programming-languages'),
            groupItem('Java', 'programming-languages'),
            groupItem('Paris', 'capital-cities'),
            groupItem('Tokyo', 'capital-cities'),
            groupItem('Bitcoin', 'cryptocurrencies'),
            groupItem('Ethereum', 'cryptocurrencies'),
            groupItem('Guitar', 'instruments'),
            groupItem('Piano', 'instruments'),
          ],
          groups: ['programming-languages', 'capital-cities', 'cryptocurrencies', 'instruments'],
          explanation:
            'The four categories are programming languages, capital cities, cryptocurrencies, and musical instruments.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Group these 8 items into 4 pairs by theme:',
          choices: [
            groupItem('Soccer', 'sports'),
            groupItem('Basketball', 'sports'),
            groupItem('Mercury', 'planets'),
            groupItem('Venus', 'planets'),
            groupItem('Einstein', 'scientists'),
            groupItem('Newton', 'scientists'),
            groupItem('Picasso', 'painters'),
            groupItem('Van Gogh', 'painters'),
          ],
          groups: ['sports', 'planets', 'scientists', 'painters'],
          explanation: 'The four categories are sports, planets, scientists, and painters.',
          timeLimitSec: 30,
        },
        {
          prompt: 'Group these 8 items into 4 pairs by theme:',
          choices: [
            groupItem('Titanic', 'movies'),
            groupItem('Avatar', 'movies'),
            groupItem('Everest', 'mountains'),
            groupItem('Kilimanjaro', 'mountains'),
            groupItem('Amazon', 'rivers'),
            groupItem('Nile', 'rivers'),
            groupItem('iPhone', 'tech-platforms'),
            groupItem('Android', 'tech-platforms'),
          ],
          groups: ['movies', 'mountains', 'rivers', 'tech-platforms'],
          explanation: 'The four categories are movies, mountains, rivers, and tech platforms.',
          timeLimitSec: 30,
        },
      ],
    },
  },
  // ── ANAGRAM ──────────────────────────────────────────────────────────────
  {
    categorySlug: 'language',
    difficulty: 'EASY',
    format: 'ANAGRAM',
    title: 'Anagram Challenge: Unscramble the Word',
    description:
      'Unscramble the letters to reveal everyday words in this classic word puzzle. A fun vocabulary workout for word game lovers.',
    tags: ['language', 'anagram', 'word puzzle', 'vocabulary', 'wordplay'],
    quiz: {
      title: 'Anagram Challenge: Unscramble the Word',
      description: '',
      questions: [
        {
          prompt: 'Unscramble these letters to reveal a word: TALPEN',
          choices: [],
          acceptedAnswers: ['PLANET'],
          anagram: true,
          explanation: 'TALPEN unscrambles to PLANET.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Unscramble these letters to reveal a word: ROTCDO',
          choices: [],
          acceptedAnswers: ['DOCTOR'],
          anagram: true,
          explanation: 'ROTCDO unscrambles to DOCTOR.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Unscramble these letters to reveal a word: TIUGAR',
          choices: [],
          acceptedAnswers: ['GUITAR'],
          anagram: true,
          explanation: 'TIUGAR unscrambles to GUITAR.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Unscramble these letters to reveal a word: ELPPA',
          choices: [],
          acceptedAnswers: ['APPLE'],
          anagram: true,
          explanation: 'ELPPA unscrambles to APPLE.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Unscramble these letters to reveal a word: LICNEP',
          choices: [],
          acceptedAnswers: ['PENCIL'],
          anagram: true,
          explanation: 'LICNEP unscrambles to PENCIL.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Unscramble these letters to reveal a word: NIRAT',
          choices: [],
          acceptedAnswers: ['TRAIN'],
          anagram: true,
          explanation: 'NIRAT unscrambles to TRAIN.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Unscramble these letters to reveal a word: ELCATS',
          choices: [],
          acceptedAnswers: ['CASTLE'],
          anagram: true,
          explanation: 'ELCATS unscrambles to CASTLE.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Unscramble these letters to reveal a word: RAGDNE',
          choices: [],
          acceptedAnswers: ['GARDEN'],
          anagram: true,
          explanation: 'RAGDNE unscrambles to GARDEN.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Unscramble these letters to reveal a word: RINPT',
          choices: [],
          acceptedAnswers: ['PRINT'],
          anagram: true,
          explanation: 'RINPT unscrambles to PRINT.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Unscramble these letters to reveal a word: TEKCIRC',
          choices: [],
          acceptedAnswers: ['CRICKET'],
          anagram: true,
          explanation: 'TEKCIRC unscrambles to CRICKET.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── VERSUS ───────────────────────────────────────────────────────────────
  {
    categorySlug: 'nature',
    difficulty: 'MEDIUM',
    format: 'VERSUS',
    title: 'Versus: Which Is Bigger, Faster, or Older?',
    description:
      'Head-to-head trivia where you pick the winner — biggest planet, fastest animal, oldest landmark, and more. A fast-paced way to test your knowledge of extremes.',
    tags: ['nature', 'versus', 'comparisons', 'trivia', 'fun facts'],
    quiz: {
      title: 'Versus: Which Is Bigger, Faster, or Older?',
      description: '',
      questions: [
        {
          prompt: 'Which planet is bigger?',
          choices: [versusItem('Jupiter', 139820), versusItem('Earth', 12742)],
          explanation: "Jupiter's diameter of about 139,820 km dwarfs Earth's 12,742 km.",
          timeLimitSec: 15,
        },
        {
          prompt: 'Which animal is faster (top speed)?',
          choices: [versusItem('Cheetah', 70), versusItem('Lion', 50)],
          explanation: "Cheetahs can reach about 70 mph, faster than a lion's roughly 50 mph.",
          timeLimitSec: 15,
        },
        {
          prompt: 'Which mountain is taller?',
          choices: [versusItem('Mount Everest', 8849), versusItem('K2', 8611)],
          explanation: "Everest stands at 8,849 meters versus K2's 8,611 meters.",
          timeLimitSec: 15,
        },
        {
          prompt: 'Which country has a larger population?',
          choices: [versusItem('India', 1440), versusItem('United States', 335)],
          explanation:
            "India, with roughly 1.44 billion people, surpassed the US's roughly 335 million in the 2020s.",
          timeLimitSec: 15,
        },
        {
          prompt: 'Which ocean is larger by area?',
          choices: [versusItem('Pacific Ocean', 165), versusItem('Atlantic Ocean', 85)],
          explanation:
            "The Pacific covers about 165 million km², nearly double the Atlantic's 85 million km².",
          timeLimitSec: 15,
        },
        {
          prompt: 'Which river is longer?',
          choices: [versusItem('Nile', 6650), versusItem('Amazon', 6400)],
          explanation:
            'The Nile, at roughly 6,650 km, is traditionally considered slightly longer than the Amazon.',
          timeLimitSec: 15,
        },
        {
          prompt: 'Which animal typically lives longer?',
          choices: [versusItem('Galápagos tortoise', 100), versusItem('African elephant', 65)],
          explanation:
            "Galápagos tortoises can live well over 100 years, far longer than an elephant's 60-70 year lifespan.",
          timeLimitSec: 15,
        },
        {
          prompt: 'Which is older?',
          choices: [versusItem('Great Wall of China', 2700), versusItem('The Colosseum', 1950)],
          explanation:
            "The earliest sections of the Great Wall date back roughly 2,700 years, far older than the Colosseum's ~1,950 years.",
          timeLimitSec: 15,
        },
        {
          prompt: 'Which planet has more moons?',
          choices: [versusItem('Saturn', 146), versusItem('Earth', 1)],
          explanation: "Saturn has well over 100 confirmed moons, compared to Earth's single Moon.",
          timeLimitSec: 15,
        },
        {
          prompt: 'Which is heavier (typical adult weight)?',
          choices: [versusItem('Blue whale', 150000), versusItem('African elephant', 6000)],
          explanation:
            "A blue whale can weigh up to 150,000 kg, dwarfing an elephant's roughly 6,000 kg.",
          timeLimitSec: 15,
        },
      ],
    },
  },
  // ── MEMORY_FLASH ─────────────────────────────────────────────────────────
  {
    categorySlug: 'trivia',
    difficulty: 'MEDIUM',
    format: 'MEMORY_FLASH',
    title: 'Memory Flash: Quick Facts Recall',
    description:
      'Read a quick fact, then test how well you remember it. A fast-paced memory and recall challenge covering landmarks, animals, and history.',
    tags: ['trivia', 'memory', 'recall', 'quick facts', 'brain training'],
    quiz: {
      title: 'Memory Flash: Quick Facts Recall',
      description: '',
      questions: [
        {
          prompt: 'In what year was the Eiffel Tower completed?',
          studyText:
            'The Eiffel Tower was completed in 1889 and stands 330 meters tall in Paris, France.',
          studyDurationMs: 5000,
          choices: [
            choice('1889', true),
            choice('1901', false),
            choice('1875', false),
            choice('1920', false),
          ],
          explanation: 'The study text stated the Eiffel Tower was completed in 1889.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How tall is Mount Everest?',
          studyText:
            "Mount Everest, the world's tallest mountain, stands at 8,849 meters and is located on the border of Nepal and China.",
          studyDurationMs: 5000,
          choices: [
            choice('8,849 meters', true),
            choice('7,200 meters', false),
            choice('9,500 meters', false),
            choice('6,000 meters', false),
          ],
          explanation: 'The study text stated Mount Everest stands at 8,849 meters.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How long does the Great Barrier Reef stretch?',
          studyText:
            "The Great Barrier Reef, off the coast of Australia, is the world's largest coral reef system, stretching over 2,300 kilometers.",
          studyDurationMs: 5000,
          choices: [
            choice('2,300 km', true),
            choice('1,000 km', false),
            choice('500 km', false),
            choice('4,500 km', false),
          ],
          explanation: 'The study text stated the reef stretches over 2,300 kilometers.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Where does the Mona Lisa currently hang?',
          studyText:
            'Leonardo da Vinci painted the Mona Lisa in the early 16th century; it now hangs in the Louvre Museum in Paris.',
          studyDurationMs: 5000,
          choices: [
            choice('The Louvre', true),
            choice('The Uffizi Gallery', false),
            choice('The British Museum', false),
            choice('The Vatican Museums', false),
          ],
          explanation: 'The study text stated the Mona Lisa hangs in the Louvre Museum.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How long can a blue whale grow?',
          studyText:
            'The blue whale is the largest animal to have ever lived, reaching lengths of up to 30 meters and weighing as much as 150 tons.',
          studyDurationMs: 5000,
          choices: [
            choice('Up to 30 meters', true),
            choice('Up to 15 meters', false),
            choice('Up to 50 meters', false),
            choice('Up to 10 meters', false),
          ],
          explanation: 'The study text stated blue whales can reach up to 30 meters.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How long is the Great Wall of China?',
          studyText:
            'The Great Wall of China stretches over 21,000 kilometers and was built over centuries by several Chinese dynasties.',
          studyDurationMs: 5000,
          choices: [
            choice('Over 21,000 km', true),
            choice('About 5,000 km', false),
            choice('About 10,000 km', false),
            choice('About 50,000 km', false),
          ],
          explanation: 'The study text stated the Great Wall stretches over 21,000 kilometers.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many plays did Shakespeare write?',
          studyText:
            'William Shakespeare wrote 39 plays and over 150 sonnets during his lifetime in England.',
          studyDurationMs: 5000,
          choices: [
            choice('39', true),
            choice('25', false),
            choice('50', false),
            choice('12', false),
          ],
          explanation: 'The study text stated Shakespeare wrote 39 plays.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Approximately how many neurons are in the human brain?',
          studyText:
            'The human brain contains approximately 86 billion neurons, which communicate through trillions of connections called synapses.',
          studyDurationMs: 5000,
          choices: [
            choice('86 billion', true),
            choice('10 million', false),
            choice('1 billion', false),
            choice('500 billion', false),
          ],
          explanation: 'The study text stated the brain contains approximately 86 billion neurons.',
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

    // Cast: our hand-built question objects intentionally include only the
    // fields relevant to each format (choices vary in shape per format).
    const normalized = validateAndNormalize(draft.quiz as GeneratedQuiz, draft.format)

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
        format: draft.format,
        isPublished: false,
      },
      select: { id: true },
    })

    await prisma.$transaction(
      normalized.questions.map((q: GeneratedQuestion, index: number) =>
        prisma.question.create({
          data: buildQuestionCreateData(q, draft.format, quiz.id, index),
        })
      )
    )

    created++
    console.log(
      `  Created draft: "${draft.title}" [${draft.format}] (${draft.categorySlug}) — ${quiz.id}`
    )
  }

  console.log(`\nDone. Created ${created} draft quizzes for admin review.`)
}

main()
  .catch((err) => {
    console.error('Seeding failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
