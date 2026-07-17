import { PrismaClient, type Difficulty } from '@prisma/client'
import { generateUniqueSlug } from '../src/lib/slugify'
import {
  ALL_FORMATS,
  buildQuestionCreateData,
  validateAndNormalize,
  type GeneratedChoice,
  type GeneratedQuestion,
  type GeneratedQuiz,
  type QuizFormat,
} from '../src/server/ai-generate-utils'

const prisma = new PrismaClient()

type Topic = {
  title: string
  categoryHints: string[]
  tags: string[]
  nouns: string[]
  facts: Array<{
    prompt: string
    answer: string
    distractors: string[]
    explanation: string
    number?: { answer: number; min: number; max: number; tolerance: number; unit: string }
  }>
  orderSets: Array<{ prompt: string; items: string[]; explanation: string }>
  matchSets: Array<{ prompt: string; pairs: Array<[string, string]>; explanation: string }>
  groupSets: Array<{
    prompt: string
    groups: Array<{ key: string; items: string[] }>
    explanation: string
  }>
}

type DraftQuiz = {
  title: string
  description: string
  tags: string[]
  difficulty: Difficulty
  format: QuizFormat
  categoryId: string
  quiz: GeneratedQuiz
}

function choice(text: string, isCorrect: boolean): GeneratedChoice {
  return { text, isCorrect }
}

function rotate<T>(items: T[], offset: number) {
  return items.map((_, index) => items[(index + offset) % items.length])
}

function shuffle<T>(items: T[], seed: number) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = (seed * 31 + i * 17) % (i + 1)
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function scrambled(word: string, seed: number) {
  const clean = word.replace(/[^a-z]/gi, '').toUpperCase()
  const chars = shuffle(clean.split(''), seed)
  const result = chars.join('')
  return result === clean ? chars.reverse().join('') : result
}

const TOPICS: Topic[] = [
  {
    title: 'World Geography',
    categoryHints: ['geography', 'capital', 'world', 'travel'],
    tags: ['geography', 'countries', 'capitals', 'landmarks'],
    nouns: ['river', 'capital', 'desert', 'ocean', 'mountain', 'continent'],
    facts: [
      {
        prompt: 'What is the capital of Canada?',
        answer: 'Ottawa',
        distractors: ['Toronto', 'Vancouver', 'Montreal'],
        explanation: 'Ottawa is the federal capital of Canada.',
      },
      {
        prompt: 'Which ocean is the largest by area?',
        answer: 'Pacific Ocean',
        distractors: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'],
        explanation: 'The Pacific Ocean covers more area than any other ocean.',
      },
      {
        prompt: 'What is the largest hot desert on Earth?',
        answer: 'Sahara Desert',
        distractors: ['Gobi Desert', 'Kalahari Desert', 'Mojave Desert'],
        explanation: 'The Sahara is the largest hot desert, stretching across North Africa.',
      },
      {
        prompt: 'Which country is home to Machu Picchu?',
        answer: 'Peru',
        distractors: ['Chile', 'Mexico', 'Colombia'],
        explanation: 'Machu Picchu is an Inca site in the Andes Mountains of Peru.',
      },
      {
        prompt: 'What continent contains the Andes mountain range?',
        answer: 'South America',
        distractors: ['Europe', 'Africa', 'Asia'],
        explanation: 'The Andes run along the western edge of South America.',
      },
      {
        prompt: 'What is the approximate height of Mount Everest?',
        answer: '8,849 meters',
        distractors: ['6,194 meters', '7,200 meters', '9,900 meters'],
        explanation: 'Mount Everest is about 8,849 meters above sea level.',
        number: { answer: 8849, min: 6000, max: 10000, tolerance: 50, unit: 'meters' },
      },
    ],
    orderSets: [
      {
        prompt: 'Order these places from north to south:',
        items: ['Reykjavik', 'London', 'Cairo', 'Cape Town'],
        explanation: 'Reykjavik is farthest north, followed by London, Cairo, and Cape Town.',
      },
    ],
    matchSets: [
      {
        prompt: 'Match each country to its capital:',
        pairs: [
          ['France', 'Paris'],
          ['Japan', 'Tokyo'],
          ['Brazil', 'Brasilia'],
          ['Egypt', 'Cairo'],
        ],
        explanation: 'Each listed city is the capital of its paired country.',
      },
    ],
    groupSets: [
      {
        prompt: 'Group these places by type:',
        groups: [
          { key: 'rivers', items: ['Nile', 'Amazon'] },
          { key: 'deserts', items: ['Sahara', 'Gobi'] },
          { key: 'mountains', items: ['Everest', 'K2'] },
        ],
        explanation: 'The items sort into rivers, deserts, and mountains.',
      },
    ],
  },
  {
    title: 'Science Basics',
    categoryHints: ['science', 'biology', 'chemistry', 'space'],
    tags: ['science', 'biology', 'chemistry', 'physics'],
    nouns: ['atom', 'planet', 'cell', 'energy', 'element', 'organism'],
    facts: [
      {
        prompt: 'What chemical symbol represents gold?',
        answer: 'Au',
        distractors: ['Ag', 'Gd', 'Go'],
        explanation: 'Gold uses the symbol Au, from the Latin word aurum.',
      },
      {
        prompt: 'Which planet is known as the Red Planet?',
        answer: 'Mars',
        distractors: ['Venus', 'Jupiter', 'Mercury'],
        explanation: 'Mars looks red because iron oxide is common on its surface.',
      },
      {
        prompt: 'What part of the cell is often called the powerhouse?',
        answer: 'Mitochondria',
        distractors: ['Nucleus', 'Ribosome', 'Cell wall'],
        explanation: "Mitochondria produce much of a cell's usable energy.",
      },
      {
        prompt: 'What gas do plants absorb for photosynthesis?',
        answer: 'Carbon dioxide',
        distractors: ['Oxygen', 'Helium', 'Neon'],
        explanation: 'Plants use carbon dioxide, water, and light to make sugars.',
      },
      {
        prompt: 'Which element has atomic number 1?',
        answer: 'Hydrogen',
        distractors: ['Helium', 'Carbon', 'Oxygen'],
        explanation: 'Hydrogen has one proton, so it is first on the periodic table.',
      },
      {
        prompt: 'How many bones are in the adult human body?',
        answer: '206',
        distractors: ['186', '226', '260'],
        explanation: 'Most adults have 206 bones after some childhood bones fuse.',
        number: { answer: 206, min: 100, max: 300, tolerance: 3, unit: 'bones' },
      },
    ],
    orderSets: [
      {
        prompt: 'Order these biological levels from smallest to largest:',
        items: ['Cell', 'Tissue', 'Organ', 'Organ system'],
        explanation: 'Cells form tissues, tissues form organs, and organs form systems.',
      },
    ],
    matchSets: [
      {
        prompt: 'Match each science term to its field:',
        pairs: [
          ['Atom', 'Chemistry'],
          ['Ecosystem', 'Ecology'],
          ['Force', 'Physics'],
          ['Cell', 'Biology'],
        ],
        explanation: 'Each term is strongly associated with the paired science field.',
      },
    ],
    groupSets: [
      {
        prompt: 'Group these items by science area:',
        groups: [
          { key: 'space', items: ['Mars', 'Saturn'] },
          { key: 'biology', items: ['Cell', 'DNA'] },
          { key: 'chemistry', items: ['Atom', 'Molecule'] },
        ],
        explanation: 'The groups are space, biology, and chemistry.',
      },
    ],
  },
  {
    title: 'Pop Culture',
    categoryHints: ['entertainment', 'movies', 'music', 'culture'],
    tags: ['movies', 'music', 'television', 'culture'],
    nouns: ['film', 'album', 'character', 'director', 'genre', 'award'],
    facts: [
      {
        prompt: 'Who directed the movie Jaws?',
        answer: 'Steven Spielberg',
        distractors: ['George Lucas', 'James Cameron', 'Ridley Scott'],
        explanation: 'Steven Spielberg directed Jaws, released in 1975.',
      },
      {
        prompt: 'Which band released the album Abbey Road?',
        answer: 'The Beatles',
        distractors: ['The Rolling Stones', 'Queen', 'Pink Floyd'],
        explanation: 'Abbey Road is a 1969 album by The Beatles.',
      },
      {
        prompt: 'What fictional school does Harry Potter attend?',
        answer: 'Hogwarts',
        distractors: ['Narnia', 'Mordor', 'Neverland'],
        explanation: 'Harry Potter attends Hogwarts School of Witchcraft and Wizardry.',
      },
      {
        prompt: 'Which movie features the line "I am your father"?',
        answer: 'The Empire Strikes Back',
        distractors: ['A New Hope', 'Return of the Jedi', 'The Phantom Menace'],
        explanation: 'The famous reveal happens in The Empire Strikes Back.',
      },
      {
        prompt: 'Which singer is known as the Queen of Pop?',
        answer: 'Madonna',
        distractors: ['Adele', 'Cher', 'Dua Lipa'],
        explanation: 'Madonna is widely nicknamed the Queen of Pop.',
      },
      {
        prompt: 'How many Oscars did the film Titanic win?',
        answer: '11',
        distractors: ['7', '9', '13'],
        explanation: 'Titanic won 11 Academy Awards.',
        number: { answer: 11, min: 0, max: 15, tolerance: 0, unit: 'Oscars' },
      },
    ],
    orderSets: [
      {
        prompt: 'Order these film releases from earliest to latest:',
        items: ['Jaws', 'Star Wars', 'Jurassic Park', 'Titanic'],
        explanation: 'The films were released in 1975, 1977, 1993, and 1997.',
      },
    ],
    matchSets: [
      {
        prompt: 'Match each franchise to a character:',
        pairs: [
          ['Star Wars', 'Luke Skywalker'],
          ['Harry Potter', 'Hermione Granger'],
          ['The Lord of the Rings', 'Frodo Baggins'],
          ['Toy Story', 'Woody'],
        ],
        explanation: 'Each character is central to the paired franchise.',
      },
    ],
    groupSets: [
      {
        prompt: 'Group these by entertainment type:',
        groups: [
          { key: 'films', items: ['Jaws', 'Titanic'] },
          { key: 'bands', items: ['Queen', 'The Beatles'] },
          { key: 'characters', items: ['Woody', 'Hermione'] },
        ],
        explanation: 'The items group into films, bands, and characters.',
      },
    ],
  },
  {
    title: 'Sports Knowledge',
    categoryHints: ['sports', 'football', 'basketball', 'olympics'],
    tags: ['sports', 'rules', 'records', 'athletes'],
    nouns: ['team', 'stadium', 'record', 'goal', 'tournament', 'medal'],
    facts: [
      {
        prompt: 'How many players are on the field for one soccer team?',
        answer: '11',
        distractors: ['9', '10', '12'],
        explanation: 'A soccer team has 11 players on the field including the goalkeeper.',
      },
      {
        prompt: 'Which sport uses the term love for a score of zero?',
        answer: 'Tennis',
        distractors: ['Golf', 'Cricket', 'Basketball'],
        explanation: 'In tennis scoring, zero is called love.',
      },
      {
        prompt: 'How often are the Summer Olympic Games held?',
        answer: 'Every 4 years',
        distractors: ['Every 2 years', 'Every 3 years', 'Every 5 years'],
        explanation: 'The Summer Olympics are held every four years.',
      },
      {
        prompt: 'What sport features a slam dunk?',
        answer: 'Basketball',
        distractors: ['Baseball', 'Volleyball', 'Rugby'],
        explanation: 'A slam dunk is a basketball shot made by forcing the ball through the hoop.',
      },
      {
        prompt: 'What is one stroke under par in golf called?',
        answer: 'Birdie',
        distractors: ['Bogey', 'Eagle', 'Ace'],
        explanation: 'A birdie is a score of one stroke under par on a hole.',
      },
      {
        prompt: 'How many rings are on the Olympic flag?',
        answer: '5',
        distractors: ['4', '6', '7'],
        explanation: 'The Olympic flag has five interlocking rings.',
        number: { answer: 5, min: 1, max: 10, tolerance: 0, unit: 'rings' },
      },
    ],
    orderSets: [
      {
        prompt: 'Order these Olympic host cities from earliest to latest:',
        items: ['Athens 1896', 'Paris 1924', 'Tokyo 1964', 'London 2012'],
        explanation: 'These Summer Olympics happened in 1896, 1924, 1964, and 2012.',
      },
    ],
    matchSets: [
      {
        prompt: 'Match each sport to a common term:',
        pairs: [
          ['Tennis', 'Deuce'],
          ['Golf', 'Birdie'],
          ['Soccer', 'Penalty kick'],
          ['Baseball', 'Home run'],
        ],
        explanation: 'Each term belongs to the paired sport.',
      },
    ],
    groupSets: [
      {
        prompt: 'Group these terms by sport:',
        groups: [
          { key: 'tennis', items: ['Deuce', 'Ace'] },
          { key: 'golf', items: ['Birdie', 'Bogey'] },
          { key: 'baseball', items: ['Inning', 'Home run'] },
        ],
        explanation: 'The terms sort into tennis, golf, and baseball.',
      },
    ],
  },
  {
    title: 'History Highlights',
    categoryHints: ['history', 'world history', 'us-history'],
    tags: ['history', 'timeline', 'leaders', 'events'],
    nouns: ['empire', 'revolution', 'treaty', 'explorer', 'invention', 'era'],
    facts: [
      {
        prompt: 'Who was the first President of the United States?',
        answer: 'George Washington',
        distractors: ['Thomas Jefferson', 'John Adams', 'James Madison'],
        explanation: 'George Washington served as the first U.S. president.',
      },
      {
        prompt: 'In what year did World War II end?',
        answer: '1945',
        distractors: ['1939', '1941', '1950'],
        explanation: 'World War II ended in 1945.',
      },
      {
        prompt: 'Which civilization built Machu Picchu?',
        answer: 'Inca',
        distractors: ['Maya', 'Aztec', 'Roman'],
        explanation: 'Machu Picchu was built by the Inca civilization.',
      },
      {
        prompt: 'Who is credited with inventing the printing press in Europe?',
        answer: 'Johannes Gutenberg',
        distractors: ['Isaac Newton', 'Galileo Galilei', 'Leonardo da Vinci'],
        explanation: 'Gutenberg developed movable-type printing in Europe in the 15th century.',
      },
      {
        prompt: 'Which wall divided Berlin during the Cold War?',
        answer: 'Berlin Wall',
        distractors: ['Hadrian Wall', 'Great Wall', 'Western Wall'],
        explanation: 'The Berlin Wall divided East and West Berlin from 1961 to 1989.',
      },
      {
        prompt: 'In what year did the Berlin Wall fall?',
        answer: '1989',
        distractors: ['1979', '1991', '1969'],
        explanation: 'The Berlin Wall fell in November 1989.',
        number: { answer: 1989, min: 1900, max: 2020, tolerance: 0, unit: 'year' },
      },
    ],
    orderSets: [
      {
        prompt: 'Order these events from earliest to latest:',
        items: [
          'Roman Empire falls',
          'Magna Carta signed',
          'French Revolution begins',
          'World War I begins',
        ],
        explanation: 'The events happened in 476, 1215, 1789, and 1914.',
      },
    ],
    matchSets: [
      {
        prompt: 'Match each person to the historical association:',
        pairs: [
          ['Gutenberg', 'Printing press'],
          ['Cleopatra', 'Egypt'],
          ['Napoleon', 'France'],
          ['Gandhi', 'Indian independence'],
        ],
        explanation: 'Each person is strongly linked to the paired topic.',
      },
    ],
    groupSets: [
      {
        prompt: 'Group these items by historical theme:',
        groups: [
          { key: 'ancient', items: ['Cleopatra', 'Roman Empire'] },
          { key: 'modern', items: ['Berlin Wall', 'World War II'] },
          { key: 'inventions', items: ['Printing press', 'Steam engine'] },
        ],
        explanation: 'The terms group into ancient history, modern history, and inventions.',
      },
    ],
  },
]

const DIFFICULTIES: Difficulty[] = ['EASY', 'MEDIUM', 'HARD']
const FORMATS = ALL_FORMATS

function makeChoiceQuestion(
  topic: Topic,
  factIndex: number,
  format: QuizFormat
): GeneratedQuestion {
  const fact = topic.facts[factIndex % topic.facts.length]
  const choices = shuffle(
    [choice(fact.answer, true), ...fact.distractors.map((d) => choice(d, false))],
    factIndex + topic.title.length
  )

  if (format === 'VERSUS') {
    return {
      prompt: `Which ${topic.nouns[factIndex % topic.nouns.length]} has the higher value?`,
      choices: [
        { text: fact.answer, value: 100 + factIndex, isCorrect: true },
        { text: fact.distractors[0], value: 40 + factIndex, isCorrect: false },
      ],
      explanation: `${fact.answer} is the higher-valued option for this comparison.`,
      timeLimitSec: 15,
    }
  }

  if (format === 'ODD_ONE_OUT') {
    return {
      prompt: `Which item does not belong with this ${topic.title.toLowerCase()} set?`,
      choices: [
        choice(topic.nouns[(factIndex + 0) % topic.nouns.length], false),
        choice(topic.nouns[(factIndex + 1) % topic.nouns.length], false),
        choice(topic.nouns[(factIndex + 2) % topic.nouns.length], false),
        choice(fact.distractors[0], true),
      ],
      explanation: `${fact.distractors[0]} is the odd item in this set.`,
      timeLimitSec: 20,
    }
  }

  if (format === 'MEMORY_FLASH') {
    return {
      prompt: fact.prompt,
      studyText: `${fact.explanation} Remember this answer: ${fact.answer}.`,
      studyDurationMs: 5000,
      choices,
      explanation: `The study text pointed to ${fact.answer}.`,
      timeLimitSec: 20,
    }
  }

  return {
    prompt: fact.prompt,
    choices,
    explanation: fact.explanation,
    timeLimitSec: 20,
  }
}

function makeQuestion(topic: Topic, format: QuizFormat, index: number): GeneratedQuestion {
  if (format === 'ORDER') {
    const set = topic.orderSets[index % topic.orderSets.length]
    return {
      prompt: set.prompt,
      choices: rotate(set.items, index % set.items.length).map((text) => ({
        text,
        position: set.items.indexOf(text) + 1,
      })),
      explanation: set.explanation,
      timeLimitSec: 30,
    }
  }

  if (format === 'MATCH') {
    const set = topic.matchSets[index % topic.matchSets.length]
    const pairs = rotate(set.pairs, index % set.pairs.length)
    return {
      prompt: set.prompt,
      choices: [
        ...pairs.map(([left], pairIndex) => ({
          text: left,
          side: 'L' as const,
          matchKey: String(pairIndex + 1),
        })),
        ...shuffle(
          pairs.map(([, right], pairIndex) => ({
            text: right,
            side: 'R' as const,
            matchKey: String(pairIndex + 1),
          })),
          index
        ),
      ],
      explanation: set.explanation,
      timeLimitSec: 30,
    }
  }

  if (format === 'CONNECTIONS') {
    const set = topic.groupSets[index % topic.groupSets.length]
    return {
      prompt: set.prompt,
      choices: shuffle(
        set.groups.flatMap((group) => group.items.map((text) => ({ text, groupKey: group.key }))),
        index
      ),
      groups: set.groups.map((group) => group.key),
      explanation: set.explanation,
      timeLimitSec: 30,
    }
  }

  if (format === 'TYPE_ANSWER') {
    const fact = topic.facts[index % topic.facts.length]
    return {
      prompt: fact.prompt,
      choices: [],
      acceptedAnswers: [fact.answer],
      explanation: fact.explanation,
      timeLimitSec: 20,
    }
  }

  if (format === 'ANAGRAM') {
    const answer = topic.nouns[index % topic.nouns.length]
    return {
      prompt: `Unscramble this ${topic.title.toLowerCase()} word: ${scrambled(answer, index)}`,
      choices: [],
      acceptedAnswers: [answer],
      anagram: true,
      explanation: `The scrambled word is ${answer}.`,
      timeLimitSec: 20,
    }
  }

  if (format === 'NUMBER_GUESS') {
    const numbered =
      topic.facts.find((fact, offset) => offset >= index % topic.facts.length && fact.number) ??
      topic.facts.find((fact) => fact.number) ??
      topic.facts[0]
    const number = numbered.number ?? {
      answer: 100,
      min: 0,
      max: 200,
      tolerance: 5,
      unit: 'points',
    }
    return {
      prompt: numbered.prompt,
      choices: [],
      answer: number.answer,
      min: number.min,
      max: number.max,
      tolerance: number.tolerance,
      unit: number.unit,
      explanation: numbered.explanation,
      timeLimitSec: 20,
    }
  }

  return makeChoiceQuestion(topic, index, format)
}

function makeQuiz(
  topic: Topic,
  format: QuizFormat,
  sequence: number,
  categoryId: string
): DraftQuiz {
  const difficulty = DIFFICULTIES[sequence % DIFFICULTIES.length]
  const questions = Array.from({ length: 6 }, (_, index) =>
    makeQuestion(topic, format, sequence + index)
  )
  const label = format.replace(/_/g, ' ').toLowerCase()
  const title = `${topic.title}: ${label} draft ${sequence + 1}`
  return {
    title,
    categoryId,
    difficulty,
    format,
    tags: [...new Set([...topic.tags, label.split(' ')[0], 'random draft'])].slice(0, 8),
    description: `A ${difficulty.toLowerCase()} ${label} quiz about ${topic.title.toLowerCase()}, generated as an editable draft for BusQuiz Studio. It includes varied prompts, explanations, and answer data ready for review.`,
    quiz: {
      title,
      description: '',
      questions,
    },
  }
}

function scoreCategory(topic: Topic, category: { slug: string; name: string }) {
  const haystack = `${category.slug} ${category.name}`.toLowerCase()
  return topic.categoryHints.reduce((score, hint) => score + (haystack.includes(hint) ? 1 : 0), 0)
}

async function main() {
  const requestedCount = Number.parseInt(process.env.QUIZ_DRAFT_COUNT ?? '100', 10)
  const count = Number.isFinite(requestedCount) && requestedCount > 0 ? requestedCount : 100

  const author = process.env.SEED_AUTHOR_EMAIL
    ? await prisma.user.findUnique({
        where: { email: process.env.SEED_AUTHOR_EMAIL },
        select: { id: true, email: true, username: true, role: true },
      })
    : ((await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true, email: true, username: true, role: true },
      })) ??
      (await prisma.user.findFirst({
        select: { id: true, email: true, username: true, role: true },
      })))

  if (!author) {
    throw new Error('No user found. Create an account first, or set SEED_AUTHOR_EMAIL.')
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, slug: true, name: true },
  })
  if (categories.length === 0) {
    throw new Error('No categories found. Seed or create categories before generating quizzes.')
  }

  console.log(
    `Creating ${count} draft quizzes for ${author.email ?? author.username ?? author.id} (${author.role})`
  )

  const drafts = Array.from({ length: count }, (_, index) => {
    const topic = TOPICS[index % TOPICS.length]
    const format = FORMATS[index % FORMATS.length]
    const bestCategory =
      [...categories].sort((a, b) => scoreCategory(topic, b) - scoreCategory(topic, a))[0] ??
      categories[index % categories.length]
    return makeQuiz(topic, format, index, bestCategory.id)
  })

  let created = 0
  for (const draft of drafts) {
    const normalized = validateAndNormalize(draft.quiz, draft.format)
    const slug = await generateUniqueSlug(draft.title, (candidate) =>
      prisma.quiz.findUnique({ where: { slug: candidate } }).then(Boolean)
    )

    const quiz = await prisma.quiz.create({
      data: {
        title: draft.title,
        slug,
        description: draft.description,
        tags: draft.tags,
        authorId: author.id,
        categoryId: draft.categoryId,
        difficulty: draft.difficulty,
        format: draft.format,
        isPublished: false,
        reviewStatus: 'DRAFT',
      },
      select: { id: true, title: true, format: true },
    })

    await prisma.$transaction(
      normalized.questions.map((question, order) =>
        prisma.question.create({
          data: buildQuestionCreateData(question, draft.format, quiz.id, order),
        })
      )
    )

    created += 1
    console.log(`  ${created}. ${quiz.title} [${quiz.format}]`)
  }

  console.log(`Done. Created ${created} draft quizzes.`)
}

main()
  .catch((error) => {
    console.error('Draft generation failed:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
