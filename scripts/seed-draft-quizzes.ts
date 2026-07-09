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
  {
    categorySlug: 'science',
    difficulty: 'MEDIUM',
    title: 'General Science Trivia: From Atoms to Space',
    description:
      'Test your knowledge of the natural world with this general science quiz covering chemistry, biology, physics, and astronomy. From the periodic table to the human body to the speed of light, these ten questions span the essentials every science fan should know. Perfect for students, trivia night regulars, or anyone curious about how the universe works.',
    tags: ['science', 'chemistry', 'biology', 'physics', 'space'],
    quiz: {
      title: 'General Science Trivia: From Atoms to Space',
      description: '',
      questions: [
        {
          prompt: 'What is the chemical symbol for gold?',
          choices: [
            choice('Au', true),
            choice('Ag', false),
            choice('Gd', false),
            choice('Go', false),
          ],
          explanation: 'Gold\'s symbol "Au" comes from its Latin name, aurum.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which planet is known as the Red Planet?',
          choices: [
            choice('Venus', false),
            choice('Mars', true),
            choice('Jupiter', false),
            choice('Mercury', false),
          ],
          explanation: 'Mars appears red due to iron oxide (rust) covering its surface.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What gas do plants primarily absorb from the atmosphere for photosynthesis?',
          choices: [
            choice('Oxygen', false),
            choice('Nitrogen', false),
            choice('Carbon dioxide', true),
            choice('Hydrogen', false),
          ],
          explanation:
            'Plants absorb carbon dioxide and use light energy to convert it into glucose and oxygen.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is often called the "powerhouse of the cell"?',
          choices: [
            choice('Nucleus', false),
            choice('Ribosome', false),
            choice('Mitochondria', true),
            choice('Golgi apparatus', false),
          ],
          explanation:
            "Mitochondria generate most of the cell's supply of ATP, used as chemical energy.",
          timeLimitSec: 20,
        },
        {
          prompt: 'How many bones are in the adult human body?',
          choices: [
            choice('186', false),
            choice('206', true),
            choice('226', false),
            choice('246', false),
          ],
          explanation:
            'Adults have 206 bones, down from around 300 at birth as some fuse together.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the approximate speed of light in a vacuum?',
          choices: [
            choice('300,000 km/s', true),
            choice('150,000 km/s', false),
            choice('3,000 km/s', false),
            choice('30,000 km/s', false),
          ],
          explanation: 'Light travels at roughly 299,792 kilometers per second in a vacuum.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which element has the atomic number 1?',
          choices: [
            choice('Helium', false),
            choice('Oxygen', false),
            choice('Hydrogen', true),
            choice('Carbon', false),
          ],
          explanation: 'Hydrogen, with one proton, is the first element on the periodic table.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What type of energy is stored in chemical bonds?',
          choices: [
            choice('Kinetic', false),
            choice('Potential', true),
            choice('Thermal', false),
            choice('Nuclear', false),
          ],
          explanation:
            'Chemical bonds store potential energy that is released or absorbed during reactions.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which scientist developed the theory of general relativity?',
          choices: [
            choice('Isaac Newton', false),
            choice('Niels Bohr', false),
            choice('Albert Einstein', true),
            choice('Galileo Galilei', false),
          ],
          explanation: 'Einstein published his theory of general relativity in 1915.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the smallest unit of life?',
          choices: [
            choice('Atom', false),
            choice('Cell', true),
            choice('Molecule', false),
            choice('Tissue', false),
          ],
          explanation:
            'The cell is the basic structural and functional unit of all known living organisms.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'geography',
    difficulty: 'MEDIUM',
    title: 'World Geography Challenge',
    description:
      "Explore the world's rivers, deserts, oceans, and borders in this geography challenge covering all seven continents. You'll be tested on capitals, landmarks, and the countries that shape our planet's map. A great warm-up for travelers, students, and armchair geographers alike.",
    tags: ['geography', 'world', 'countries', 'capitals', 'travel'],
    quiz: {
      title: 'World Geography Challenge',
      description: '',
      questions: [
        {
          prompt: 'What is the longest river in the world?',
          choices: [
            choice('Amazon', false),
            choice('Nile', true),
            choice('Yangtze', false),
            choice('Mississippi', false),
          ],
          explanation:
            'The Nile, at roughly 6,650 km, is traditionally considered the longest river in the world.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which country currently has the largest population in the world?',
          choices: [
            choice('United States', false),
            choice('India', true),
            choice('China', false),
            choice('Indonesia', false),
          ],
          explanation: "India surpassed China as the world's most populous country in 2023.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the smallest country in the world by area?',
          choices: [
            choice('Monaco', false),
            choice('San Marino', false),
            choice('Vatican City', true),
            choice('Liechtenstein', false),
          ],
          explanation:
            'Vatican City covers about 0.44 square kilometers, making it the smallest sovereign state.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which desert is the largest hot desert in the world?',
          choices: [
            choice('Gobi', false),
            choice('Kalahari', false),
            choice('Sahara', true),
            choice('Mojave', false),
          ],
          explanation:
            'The Sahara covers most of North Africa and is the largest hot desert on Earth.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Mount Everest sits on the border of Nepal and which other territory?',
          choices: [
            choice('India', false),
            choice('China (Tibet)', true),
            choice('Bhutan', false),
            choice('Pakistan', false),
          ],
          explanation:
            'Mount Everest lies on the border between Nepal and the Tibet Autonomous Region of China.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which ocean is the largest by area?',
          choices: [
            choice('Atlantic', false),
            choice('Indian', false),
            choice('Arctic', false),
            choice('Pacific', true),
          ],
          explanation:
            "The Pacific Ocean covers more area than all of Earth's landmasses combined.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the capital of Australia?',
          choices: [
            choice('Sydney', false),
            choice('Melbourne', false),
            choice('Canberra', true),
            choice('Perth', false),
          ],
          explanation:
            'Canberra was purpose-built as a compromise capital between rivals Sydney and Melbourne.',
          timeLimitSec: 20,
        },
        {
          prompt: 'On which continent is the Sahara Desert located?',
          choices: [
            choice('Asia', false),
            choice('Africa', true),
            choice('South America', false),
            choice('Australia', false),
          ],
          explanation: 'The Sahara stretches across North Africa, spanning several countries.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which country is transcontinental, spanning both Europe and Asia?',
          choices: [
            choice('Turkey', true),
            choice('Egypt', false),
            choice('Morocco', false),
            choice('Greece', false),
          ],
          explanation: 'Turkey straddles both continents, split by the Bosphorus strait.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the longest mountain range in the world?',
          choices: [
            choice('Rocky Mountains', false),
            choice('Andes', true),
            choice('Himalayas', false),
            choice('Alps', false),
          ],
          explanation: 'The Andes stretch about 7,000 km along the western edge of South America.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'animals',
    difficulty: 'EASY',
    title: 'Amazing Animal Kingdom Trivia',
    description:
      "From the fastest land animal to the ocean's largest creature, this quiz dives into the wild facts of the animal kingdom. Ten fun, family-friendly questions cover mammals, birds, reptiles, and more. Great for animal lovers of every age.",
    tags: ['animals', 'wildlife', 'nature', 'biology'],
    quiz: {
      title: 'Amazing Animal Kingdom Trivia',
      description: '',
      questions: [
        {
          prompt: 'What is the fastest land animal?',
          choices: [
            choice('Lion', false),
            choice('Cheetah', true),
            choice('Gazelle', false),
            choice('Horse', false),
          ],
          explanation: 'Cheetahs can reach speeds of up to 70 mph (113 km/h) in short bursts.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which mammal is known as the "King of the Jungle"?',
          choices: [
            choice('Tiger', false),
            choice('Lion', true),
            choice('Elephant', false),
            choice('Gorilla', false),
          ],
          explanation:
            'Lions have long held the nickname despite mostly living on grasslands, not jungles.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many hearts does an octopus have?',
          choices: [choice('1', false), choice('2', false), choice('3', true), choice('4', false)],
          explanation:
            'Two hearts pump blood to the gills, and a third pumps it to the rest of the body.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the largest animal on Earth?',
          choices: [
            choice('African elephant', false),
            choice('Blue whale', true),
            choice('Giraffe', false),
            choice('Great white shark', false),
          ],
          explanation:
            'Blue whales can grow up to 30 meters long, the largest animal known to have existed.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which of these birds cannot fly?',
          choices: [
            choice('Eagle', false),
            choice('Penguin', true),
            choice('Falcon', false),
            choice('Sparrow', false),
          ],
          explanation:
            'Penguins are flightless birds whose wings evolved into flippers for swimming.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What do you call a baby kangaroo?',
          choices: [
            choice('Cub', false),
            choice('Joey', true),
            choice('Kid', false),
            choice('Pup', false),
          ],
          explanation: "A baby kangaroo is called a joey, and it develops in its mother's pouch.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which animal has stripes that are unique to each individual, like a fingerprint?',
          choices: [
            choice('Panda', false),
            choice('Zebra', true),
            choice('Skunk', false),
            choice('Orca', false),
          ],
          explanation: 'No two zebras have exactly the same stripe pattern.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many legs does a spider have?',
          choices: [
            choice('6', false),
            choice('8', true),
            choice('10', false),
            choice('12', false),
          ],
          explanation:
            'Spiders are arachnids, which have eight legs, unlike insects which have six.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a group of lions called?',
          choices: [
            choice('Pack', false),
            choice('Herd', false),
            choice('Pride', true),
            choice('Flock', false),
          ],
          explanation:
            'A group of lions is called a pride, usually made up of related females and their cubs.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which reptile can regrow its tail if it loses it?',
          choices: [
            choice('Snake', false),
            choice('Crocodile', false),
            choice('Lizard', true),
            choice('Turtle', false),
          ],
          explanation:
            'Many lizard species can shed and regrow their tails as a defense mechanism.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'technology',
    difficulty: 'MEDIUM',
    title: 'Tech Through the Ages',
    description:
      'Trace the history of computing and the internet, from the first iPhone to the founders of Apple and Microsoft. This quiz covers the people, products, and protocols that built the tech world we live in today. Ideal for anyone who grew up online or wants to brush up on tech history.',
    tags: ['technology', 'tech', 'computers', 'internet', 'history'],
    quiz: {
      title: 'Tech Through the Ages',
      description: '',
      questions: [
        {
          prompt: 'Who co-founded Apple Inc. alongside Steve Jobs?',
          choices: [
            choice('Bill Gates', false),
            choice('Steve Wozniak', true),
            choice('Elon Musk', false),
            choice('Larry Page', false),
          ],
          explanation: 'Steve Wozniak co-founded Apple with Steve Jobs in 1976.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "HTTP" stand for?',
          choices: [
            choice('HyperText Transfer Protocol', true),
            choice('High Transfer Text Protocol', false),
            choice('HyperText Technical Process', false),
            choice('Home Tool Transfer Protocol', false),
          ],
          explanation: 'HTTP is the protocol used for transmitting web pages across the internet.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In what year was the first iPhone released?',
          choices: [
            choice('2005', false),
            choice('2007', true),
            choice('2009', false),
            choice('2010', false),
          ],
          explanation: 'Steve Jobs unveiled the first iPhone in January 2007.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "CPU" stand for?',
          choices: [
            choice('Central Process Unit', false),
            choice('Central Processing Unit', true),
            choice('Computer Personal Unit', false),
            choice('Central Processor Utility', false),
          ],
          explanation: 'The CPU is the primary component that executes instructions in a computer.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which company developed the Windows operating system?',
          choices: [
            choice('Apple', false),
            choice('IBM', false),
            choice('Microsoft', true),
            choice('Google', false),
          ],
          explanation: 'Microsoft first released Windows in 1985.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What was the name of one of the first widely-used web browsers, released in 1993?',
          choices: [
            choice('Internet Explorer', false),
            choice('Netscape Navigator', false),
            choice('Mosaic', true),
            choice('Firefox', false),
          ],
          explanation: 'NCSA Mosaic helped popularize the World Wide Web to a general audience.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "AI" stand for in technology?',
          choices: [
            choice('Automated Interface', false),
            choice('Artificial Intelligence', true),
            choice('Applied Informatics', false),
            choice('Advanced Integration', false),
          ],
          explanation:
            'Artificial Intelligence refers to systems that simulate human-like reasoning or learning.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which company originally created Android before Google acquired it?',
          choices: [
            choice('Android Inc.', true),
            choice('Nokia', false),
            choice('Motorola', false),
            choice('Samsung', false),
          ],
          explanation:
            'Google acquired Android Inc. in 2005 and built it into the mobile OS used today.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which unit of data storage is larger than a gigabyte?',
          choices: [
            choice('Megabyte', false),
            choice('Terabyte', true),
            choice('Kilobyte', false),
            choice('Bit', false),
          ],
          explanation: 'A terabyte is equal to roughly 1,000 gigabytes.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Who is known as the "father of the World Wide Web"?',
          choices: [
            choice('Bill Gates', false),
            choice('Tim Berners-Lee', true),
            choice('Vint Cerf', false),
            choice('Steve Jobs', false),
          ],
          explanation: 'Tim Berners-Lee invented the World Wide Web in 1989 while at CERN.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'music',
    difficulty: 'MEDIUM',
    title: 'Music Trivia: Legends & Hits',
    description:
      'From classical composers to pop icons, this music trivia quiz spans genres and generations. Test your knowledge of legendary bands, instruments, and the artists who defined modern music. A must-play for music lovers of every taste.',
    tags: ['music', 'pop culture', 'bands', 'instruments'],
    quiz: {
      title: 'Music Trivia: Legends & Hits',
      description: '',
      questions: [
        {
          prompt: 'Which artist is known as the "King of Pop"?',
          choices: [
            choice('Elvis Presley', false),
            choice('Michael Jackson', true),
            choice('Prince', false),
            choice('James Brown', false),
          ],
          explanation:
            'Michael Jackson earned the nickname through decades of chart-topping hits and performances.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many strings does a standard guitar have?',
          choices: [choice('4', false), choice('5', false), choice('6', true), choice('7', false)],
          explanation: 'A standard acoustic or electric guitar has six strings.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which band released the album "Abbey Road"?',
          choices: [
            choice('The Rolling Stones', false),
            choice('The Beatles', true),
            choice('Led Zeppelin', false),
            choice('Pink Floyd', false),
          ],
          explanation: 'Abbey Road was released by The Beatles in 1969.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What musical instrument typically has 88 keys?',
          choices: [
            choice('Organ', false),
            choice('Piano', true),
            choice('Accordion', false),
            choice('Harpsichord', false),
          ],
          explanation: 'A standard modern piano has 88 keys, spanning just over seven octaves.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which composer wrote "The Four Seasons"?',
          choices: [
            choice('Mozart', false),
            choice('Beethoven', false),
            choice('Vivaldi', true),
            choice('Bach', false),
          ],
          explanation: 'Antonio Vivaldi composed "The Four Seasons" around 1723.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which singer is nicknamed "Queen Bey"?',
          choices: [
            choice('Rihanna', false),
            choice('Beyoncé', true),
            choice('Adele', false),
            choice('Taylor Swift', false),
          ],
          explanation:
            'Beyoncé earned the nickname through her dominant, decades-long music career.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What genre of music originated in New Orleans in the late 19th and early 20th century?',
          choices: [
            choice('Blues', false),
            choice('Jazz', true),
            choice('Rock and roll', false),
            choice('Country', false),
          ],
          explanation:
            'Jazz emerged from New Orleans, blending African American musical traditions with ragtime and blues.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which music streaming service uses a green logo with a circle?',
          choices: [
            choice('Apple Music', false),
            choice('Tidal', false),
            choice('Spotify', true),
            choice('SoundCloud', false),
          ],
          explanation: "Spotify's brand color and logo are instantly recognizable green.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Who composed the famous "Symphony No. 9," known for "Ode to Joy"?',
          choices: [
            choice('Mozart', false),
            choice('Beethoven', true),
            choice('Brahms', false),
            choice('Schubert', false),
          ],
          explanation:
            'Beethoven completed his Ninth Symphony in 1824, despite being nearly completely deaf.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which of these is NOT a string instrument?',
          choices: [
            choice('Violin', false),
            choice('Cello', false),
            choice('Clarinet', true),
            choice('Viola', false),
          ],
          explanation:
            'The clarinet is a woodwind instrument, while the others are all string instruments.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'mythology',
    difficulty: 'MEDIUM',
    title: 'Gods, Myths & Legends',
    description:
      "Journey through Greek, Norse, Roman, and Egyptian mythology in this quiz covering gods, monsters, and legendary heroes. From Zeus and Thor to Medusa and the Twelve Labors of Heracles, these ten questions test your knowledge of the ancient world's greatest stories. Perfect for fans of mythology, fantasy, and classic literature.",
    tags: ['mythology', 'greek mythology', 'norse mythology', 'gods', 'legends'],
    quiz: {
      title: 'Gods, Myths & Legends',
      description: '',
      questions: [
        {
          prompt: 'In Greek mythology, who is the king of the gods?',
          choices: [
            choice('Poseidon', false),
            choice('Hades', false),
            choice('Zeus', true),
            choice('Apollo', false),
          ],
          explanation: 'Zeus rules over Mount Olympus and the sky in Greek mythology.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Who is the Norse god of thunder?',
          choices: [
            choice('Odin', false),
            choice('Loki', false),
            choice('Thor', true),
            choice('Baldur', false),
          ],
          explanation: 'Thor wields the hammer Mjolnir and is associated with thunder and storms.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In Egyptian mythology, who is the god of the afterlife?',
          choices: [
            choice('Ra', false),
            choice('Osiris', true),
            choice('Anubis', false),
            choice('Horus', false),
          ],
          explanation: 'Osiris rules over the underworld and judges the souls of the dead.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What creature in Greek mythology has the body of a lion and the head of a human?',
          choices: [
            choice('Minotaur', false),
            choice('Sphinx', true),
            choice('Griffin', false),
            choice('Chimera', false),
          ],
          explanation: 'The Sphinx famously guarded Thebes and posed a riddle to travelers.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Who is the Greek goddess of wisdom?',
          choices: [
            choice('Aphrodite', false),
            choice('Hera', false),
            choice('Athena', true),
            choice('Artemis', false),
          ],
          explanation:
            "Athena, goddess of wisdom and war strategy, was born fully armed from Zeus's head.",
          timeLimitSec: 20,
        },
        {
          prompt: 'In Norse mythology, what is the name of the world tree?',
          choices: [
            choice('Valhalla', false),
            choice('Yggdrasil', true),
            choice('Asgard', false),
            choice('Midgard', false),
          ],
          explanation: 'Yggdrasil is the giant ash tree said to connect the nine worlds.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which Greek hero is known for completing the Twelve Labors?',
          choices: [
            choice('Achilles', false),
            choice('Perseus', false),
            choice('Heracles (Hercules)', true),
            choice('Theseus', false),
          ],
          explanation:
            'Heracles performed twelve legendary tasks as penance imposed by King Eurystheus.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Who is the Roman god of war, equivalent to the Greek Ares?',
          choices: [
            choice('Jupiter', false),
            choice('Mars', true),
            choice('Neptune', false),
            choice('Mercury', false),
          ],
          explanation:
            'Mars was one of the most important gods in Roman religion, associated with war and agriculture.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In Greek mythology, what did Pandora release when she opened her box?',
          choices: [
            choice('Gold', false),
            choice('Evils and troubles', true),
            choice('Fire', false),
            choice('Wisdom', false),
          ],
          explanation:
            "Pandora's curiosity released all the evils of the world, leaving only hope inside.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Which mythical creature could turn people to stone with her gaze?',
          choices: [
            choice('Medusa', true),
            choice('Circe', false),
            choice('Siren', false),
            choice('Harpy', false),
          ],
          explanation:
            'Medusa was a Gorgon whose gaze turned onlookers to stone; she was slain by Perseus.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'food-drink',
    difficulty: 'EASY',
    title: 'Foodie Trivia Challenge',
    description:
      'Sample trivia from kitchens and dinner tables around the world, covering the origins of pizza, sushi, wine, and more. This quiz tests your knowledge of ingredients, cuisines, and culinary traditions across different cultures. Great for foodies and home cooks alike.',
    tags: ['food', 'drink', 'cooking', 'cuisine', 'culture'],
    quiz: {
      title: 'Foodie Trivia Challenge',
      description: '',
      questions: [
        {
          prompt: 'What is the main ingredient in guacamole?',
          choices: [
            choice('Tomato', false),
            choice('Avocado', true),
            choice('Onion', false),
            choice('Lime', false),
          ],
          explanation: 'Guacamole is made primarily from mashed avocado.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which country is credited with inventing pizza as we know it?',
          choices: [
            choice('France', false),
            choice('Greece', false),
            choice('Italy', true),
            choice('Spain', false),
          ],
          explanation: 'Modern pizza originated in Naples, Italy.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which fruit is used to make wine?',
          choices: [
            choice('Apple', false),
            choice('Grape', true),
            choice('Cherry', false),
            choice('Peach', false),
          ],
          explanation: 'Wine is made by fermenting the juice of crushed grapes.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What spice, derived from the crocus flower, is the most expensive by weight?',
          choices: [
            choice('Cinnamon', false),
            choice('Saffron', true),
            choice('Vanilla', false),
            choice('Nutmeg', false),
          ],
          explanation:
            'Saffron comes from hand-picked crocus stigmas, making it extremely labor-intensive to produce.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which country is the origin of sushi?',
          choices: [
            choice('China', false),
            choice('Korea', false),
            choice('Japan', true),
            choice('Thailand', false),
          ],
          explanation:
            'Sushi originated in Japan, evolving from an ancient method of preserving fish in rice.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the primary ingredient in traditional hummus?',
          choices: [
            choice('Black beans', false),
            choice('Chickpeas', true),
            choice('Lentils', false),
            choice('Kidney beans', false),
          ],
          explanation: 'Hummus is made from blended chickpeas, tahini, lemon juice, and garlic.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which drink is made by fermenting crushed grapes?',
          choices: [
            choice('Beer', false),
            choice('Wine', true),
            choice('Cider', false),
            choice('Whiskey', false),
          ],
          explanation: 'Wine results from the fermentation of grape juice by yeast.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the main grain used to make traditional Japanese sake?',
          choices: [
            choice('Wheat', false),
            choice('Barley', false),
            choice('Rice', true),
            choice('Corn', false),
          ],
          explanation: 'Sake is brewed from fermented polished rice.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which cheese is traditionally used on a classic Margherita pizza?',
          choices: [
            choice('Cheddar', false),
            choice('Mozzarella', true),
            choice('Parmesan', false),
            choice('Feta', false),
          ],
          explanation:
            'Fresh mozzarella is the traditional cheese for a Neapolitan Margherita pizza.',
          timeLimitSec: 20,
        },
        {
          prompt: "What is the world's most consumed beverage after water?",
          choices: [
            choice('Coffee', false),
            choice('Tea', true),
            choice('Orange juice', false),
            choice('Soda', false),
          ],
          explanation: 'Tea is consumed more widely worldwide than any beverage besides water.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'sports',
    difficulty: 'MEDIUM',
    title: 'Sports Trivia: Rules, Records & Legends',
    description:
      "Cover the rules, records, and legends across soccer, basketball, tennis, golf, and the Olympics in this sports trivia quiz. Whether you're a casual fan or a die-hard sports enthusiast, these ten questions will test what you really know. Lace up and see how you score.",
    tags: ['sports', 'football', 'basketball', 'tennis', 'olympics'],
    quiz: {
      title: 'Sports Trivia: Rules, Records & Legends',
      description: '',
      questions: [
        {
          prompt: 'How many players are on a standard soccer team on the field at once?',
          choices: [
            choice('9', false),
            choice('10', false),
            choice('11', true),
            choice('12', false),
          ],
          explanation: 'Each soccer team fields 11 players, including the goalkeeper.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In which sport would you perform a "slam dunk"?',
          choices: [
            choice('Volleyball', false),
            choice('Basketball', true),
            choice('Tennis', false),
            choice('Baseball', false),
          ],
          explanation:
            'A slam dunk is scored by forcefully putting the ball through the basketball hoop.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How often are the Summer Olympic Games held?',
          choices: [
            choice('Every 2 years', false),
            choice('Every 3 years', false),
            choice('Every 4 years', true),
            choice('Every 5 years', false),
          ],
          explanation: 'The Summer Olympics occur once every four years, known as an Olympiad.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In tennis, what is a score of zero called?',
          choices: [
            choice('Deuce', false),
            choice('Love', true),
            choice('Ace', false),
            choice('Fault', false),
          ],
          explanation:
            'A score of zero in tennis is called "love," possibly from the French "l\'oeuf" (egg).',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which country has won the most FIFA World Cup titles?',
          choices: [
            choice('Germany', false),
            choice('Argentina', false),
            choice('Brazil', true),
            choice('Italy', false),
          ],
          explanation: 'Brazil has won five World Cup titles, the most of any nation.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many rings are on the Olympic flag?',
          choices: [choice('4', false), choice('5', true), choice('6', false), choice('7', false)],
          explanation:
            'The five interlocking rings represent the five inhabited continents joined by Olympism.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In golf, what term describes completing a hole one stroke under par?',
          choices: [
            choice('Bogey', false),
            choice('Eagle', false),
            choice('Birdie', true),
            choice('Albatross', false),
          ],
          explanation: 'A birdie means finishing a hole in one stroke fewer than par.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which sport uses the terms "love," "deuce," and "ace"?',
          choices: [
            choice('Badminton', false),
            choice('Table tennis', false),
            choice('Tennis', true),
            choice('Squash', false),
          ],
          explanation: 'These scoring terms are specific to tennis.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How long is a standard marathon race?',
          choices: [
            choice('26.2 miles', true),
            choice('20 miles', false),
            choice('30 miles', false),
            choice('22.5 miles', false),
          ],
          explanation: 'The marathon distance of 26.2 miles (42.195 km) was standardized in 1921.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the maximum score possible in a single frame of ten-pin bowling (with two bonus balls after a strike)?',
          choices: [
            choice('10', false),
            choice('20', false),
            choice('30', true),
            choice('40', false),
          ],
          explanation: 'A strike followed by two more strikes scores 10+10+10 = 30 for that frame.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'art',
    difficulty: 'HARD',
    title: 'Art History Essentials',
    description:
      "Step into the world's great museums with this art history quiz covering the Renaissance, Impressionism, Cubism, and Pop Art. From Leonardo da Vinci to Andy Warhol, test your knowledge of the artists and movements that shaped visual culture. A rewarding challenge for art lovers and museum-goers.",
    tags: ['art', 'art history', 'painting', 'renaissance', 'culture'],
    quiz: {
      title: 'Art History Essentials',
      description: '',
      questions: [
        {
          prompt: 'Who painted the "Mona Lisa"?',
          choices: [
            choice('Michelangelo', false),
            choice('Raphael', false),
            choice('Leonardo da Vinci', true),
            choice('Donatello', false),
          ],
          explanation: 'Leonardo da Vinci painted the Mona Lisa in the early 16th century.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which art movement is Salvador Dalí most associated with?',
          choices: [
            choice('Cubism', false),
            choice('Surrealism', true),
            choice('Impressionism', false),
            choice('Expressionism', false),
          ],
          explanation:
            'Dalí was a leading figure of the Surrealist movement, known for dreamlike imagery.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Who painted "The Starry Night"?',
          choices: [
            choice('Claude Monet', false),
            choice('Vincent van Gogh', true),
            choice('Pablo Picasso', false),
            choice('Edgar Degas', false),
          ],
          explanation:
            'Van Gogh painted "The Starry Night" in 1889 while at an asylum in Saint-Rémy.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which Renaissance artist painted the ceiling of the Sistine Chapel?',
          choices: [
            choice('Leonardo da Vinci', false),
            choice('Raphael', false),
            choice('Michelangelo', true),
            choice('Titian', false),
          ],
          explanation: 'Michelangelo painted the Sistine Chapel ceiling between 1508 and 1512.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Pablo Picasso and Georges Braque are most associated with which art movement?',
          choices: [
            choice('Cubism', true),
            choice('Fauvism', false),
            choice('Dadaism', false),
            choice('Baroque', false),
          ],
          explanation: 'Picasso and Braque pioneered Cubism in the early 20th century.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which artist is famous for cutting off part of his own ear?',
          choices: [
            choice('Paul Gauguin', false),
            choice('Vincent van Gogh', true),
            choice('Henri Matisse', false),
            choice('Claude Monet', false),
          ],
          explanation: 'Van Gogh severed part of his ear during a mental health crisis in 1888.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Claude Monet is a founding figure of which art movement?',
          choices: [
            choice('Impressionism', true),
            choice('Realism', false),
            choice('Romanticism', false),
            choice('Baroque', false),
          ],
          explanation:
            'Monet\'s painting "Impression, Sunrise" gave the Impressionist movement its name.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which sculptor created "The Thinker"?',
          choices: [
            choice('Donatello', false),
            choice('Auguste Rodin', true),
            choice('Michelangelo', false),
            choice('Constantin Brâncuși', false),
          ],
          explanation: 'Auguste Rodin created "The Thinker" as part of a larger commissioned work.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In which Italian city is the Uffizi Gallery located?',
          choices: [
            choice('Rome', false),
            choice('Venice', false),
            choice('Florence', true),
            choice('Milan', false),
          ],
          explanation:
            "The Uffizi Gallery in Florence houses one of the world's greatest art collections.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Andy Warhol is most closely associated with which art movement?',
          choices: [
            choice('Pop Art', true),
            choice('Abstract Expressionism', false),
            choice('Minimalism', false),
            choice('Surrealism', false),
          ],
          explanation:
            "Warhol's work with consumer imagery, like his Campbell's Soup Cans, defined Pop Art.",
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'us-history',
    difficulty: 'MEDIUM',
    title: 'United States History Trivia',
    description:
      'From the Revolutionary War to the Moon landing, this quiz covers the pivotal people and moments that shaped the United States. Test your knowledge of presidents, founding documents, and turning points in American history. Great for students and history buffs alike.',
    tags: ['history', 'us history', 'american history', 'presidents'],
    quiz: {
      title: 'United States History Trivia',
      description: '',
      questions: [
        {
          prompt: 'Who was the first President of the United States?',
          choices: [
            choice('Thomas Jefferson', false),
            choice('John Adams', false),
            choice('George Washington', true),
            choice('Benjamin Franklin', false),
          ],
          explanation: 'George Washington served as the first U.S. president from 1789 to 1797.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In what year did the United States declare independence?',
          choices: [
            choice('1776', true),
            choice('1789', false),
            choice('1801', false),
            choice('1763', false),
          ],
          explanation: 'The Declaration of Independence was adopted on July 4, 1776.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which document begins with the words "We the People"?',
          choices: [
            choice('Declaration of Independence', false),
            choice('The Constitution', true),
            choice('The Bill of Rights', false),
            choice('The Federalist Papers', false),
          ],
          explanation: 'The U.S. Constitution\'s preamble opens with "We the People."',
          timeLimitSec: 20,
        },
        {
          prompt: 'The American Civil War was primarily fought between which two sides?',
          choices: [
            choice('The North and South', true),
            choice('The East and West', false),
            choice('Federalists and Anti-Federalists', false),
            choice('Colonists and the British', false),
          ],
          explanation: 'The Union (North) fought the Confederacy (South) from 1861 to 1865.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Who delivered the Gettysburg Address?',
          choices: [
            choice('Ulysses S. Grant', false),
            choice('Abraham Lincoln', true),
            choice('Robert E. Lee', false),
            choice('Andrew Johnson', false),
          ],
          explanation:
            "Lincoln delivered the address at the dedication of the Soldiers' National Cemetery in 1863.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Which amendment to the U.S. Constitution abolished slavery?',
          choices: [
            choice('13th Amendment', true),
            choice('14th Amendment', false),
            choice('15th Amendment', false),
            choice('19th Amendment', false),
          ],
          explanation:
            'The 13th Amendment, ratified in 1865, abolished slavery in the United States.',
          timeLimitSec: 20,
        },
        {
          prompt: "What event triggered the United States' entry into World War II?",
          choices: [
            choice('The invasion of Poland', false),
            choice('The attack on Pearl Harbor', true),
            choice('The sinking of the Lusitania', false),
            choice('The Battle of Britain', false),
          ],
          explanation:
            "Japan's attack on Pearl Harbor on December 7, 1941, led the U.S. to declare war.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Which U.S. president served during both the Great Depression and World War II?',
          choices: [
            choice('Herbert Hoover', false),
            choice('Franklin D. Roosevelt', true),
            choice('Harry Truman', false),
            choice('Woodrow Wilson', false),
          ],
          explanation:
            'FDR was elected in 1932 and led the country through the Depression and most of WWII.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'The Louisiana Purchase, which doubled the size of the U.S., occurred during whose presidency?',
          choices: [
            choice('George Washington', false),
            choice('Thomas Jefferson', true),
            choice('James Madison', false),
            choice('John Adams', false),
          ],
          explanation:
            'Jefferson negotiated the purchase of the Louisiana Territory from France in 1803.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In what year did Apollo 11 land the first humans on the Moon?',
          choices: [
            choice('1965', false),
            choice('1969', true),
            choice('1972', false),
            choice('1975', false),
          ],
          explanation: 'Neil Armstrong and Buzz Aldrin walked on the Moon on July 20, 1969.',
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

  const slugs = DRAFTS.map((d) => d.categorySlug)
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
