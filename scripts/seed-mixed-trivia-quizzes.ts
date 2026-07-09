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
    categorySlug: 'trivia',
    difficulty: 'EASY',
    title: 'Super Easy Trivia: Warm-Up Round',
    description:
      'The simplest, most basic trivia questions to warm up your brain before diving into harder challenges. Perfect for kids, beginners, or anyone who just wants an easy win.',
    tags: ['trivia', 'easy trivia', 'general knowledge', 'warm-up', 'basics'],
    quiz: {
      title: 'Super Easy Trivia: Warm-Up Round',
      description: '',
      questions: [
        {
          prompt: 'What color do you get when you mix blue and yellow paint?',
          choices: [
            choice('Purple', false),
            choice('Green', true),
            choice('Orange', false),
            choice('Brown', false),
          ],
          explanation:
            'Blue and yellow are complementary primary colors that combine to make green.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many wheels does a standard bicycle have?',
          choices: [choice('1', false), choice('2', true), choice('3', false), choice('4', false)],
          explanation: 'A standard bicycle has two wheels, front and back.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the opposite of "up"?',
          choices: [
            choice('Down', true),
            choice('Left', false),
            choice('Right', false),
            choice('Forward', false),
          ],
          explanation: '"Down" is the direct opposite of "up."',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which meal is typically eaten in the morning?',
          choices: [
            choice('Lunch', false),
            choice('Breakfast', true),
            choice('Dinner', false),
            choice('Supper', false),
          ],
          explanation: 'Breakfast is the first meal of the day, eaten in the morning.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What shape is a stop sign?',
          choices: [
            choice('Circle', false),
            choice('Square', false),
            choice('Octagon', true),
            choice('Triangle', false),
          ],
          explanation:
            'Stop signs are eight-sided octagons, a shape unique to that sign in traffic systems.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many days are in a week?',
          choices: [choice('5', false), choice('6', false), choice('7', true), choice('8', false)],
          explanation: 'A standard week consists of seven days.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What do you call baby dogs?',
          choices: [
            choice('Kittens', false),
            choice('Puppies', true),
            choice('Cubs', false),
            choice('Chicks', false),
          ],
          explanation: 'Baby dogs are called puppies.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the frozen form of water called?',
          choices: [
            choice('Steam', false),
            choice('Ice', true),
            choice('Vapor', false),
            choice('Fog', false),
          ],
          explanation: 'Water freezes into a solid state called ice.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which season is typically the hottest of the year?',
          choices: [
            choice('Winter', false),
            choice('Spring', false),
            choice('Summer', true),
            choice('Fall', false),
          ],
          explanation: 'Summer is generally the warmest season of the year.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many wheels does a standard car have?',
          choices: [choice('2', false), choice('3', false), choice('4', true), choice('6', false)],
          explanation: 'Standard passenger cars have four wheels.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'MEDIUM',
    title: 'Weird & Wonderful World Records Trivia',
    description:
      'From the fastest animal to the smallest country, this quiz covers the extremes and world records that make our planet fascinating. A fun mix of biggest, smallest, fastest, and strangest facts.',
    tags: ['world records', 'trivia', 'fun facts', 'general knowledge', 'superlatives'],
    quiz: {
      title: 'Weird & Wonderful World Records Trivia',
      description: '',
      questions: [
        {
          prompt: 'What is the tallest breed of dog in the world, recognized by height?',
          choices: [
            choice('Great Dane', true),
            choice('Saint Bernard', false),
            choice('Mastiff', false),
            choice('Newfoundland', false),
          ],
          explanation: 'Great Danes are officially recognized as the tallest dog breed.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the fastest land animal on Earth?',
          choices: [
            choice('Cheetah', true),
            choice('Lion', false),
            choice('Pronghorn', false),
            choice('Ostrich', false),
          ],
          explanation: 'Cheetahs can reach speeds of up to 70 mph in short bursts.',
          timeLimitSec: 20,
        },
        {
          prompt: "What is generally recognized as the world's smallest country by area?",
          choices: [
            choice('Monaco', false),
            choice('Vatican City', true),
            choice('San Marino', false),
            choice('Nauru', false),
          ],
          explanation: 'Vatican City covers about 0.44 square kilometers.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which land animal species is commonly cited as one of the longest-living, with individuals surpassing 150 years?',
          choices: [
            choice('Elephant', false),
            choice('Galápagos tortoise', true),
            choice('Parrot', false),
            choice('Alligator', false),
          ],
          explanation:
            'Galápagos tortoises can live well over a century, with some individuals reaching 150+ years.',
          timeLimitSec: 20,
        },
        {
          prompt: "What is the world's tallest tree species?",
          choices: [
            choice('Sequoia', false),
            choice('Coast redwood', true),
            choice('Douglas fir', false),
            choice('Baobab', false),
          ],
          explanation: 'Coast redwoods can grow over 350 feet tall, the tallest trees on Earth.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the largest living species of lizard?',
          choices: [
            choice('Iguana', false),
            choice('Komodo dragon', true),
            choice('Monitor lizard', false),
            choice('Gecko', false),
          ],
          explanation:
            'Komodo dragons can grow up to 10 feet long and are the largest living lizards.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which animal is often cited as the loudest on Earth, with calls reaching nearly 190 decibels underwater?',
          choices: [
            choice('Blue whale', true),
            choice('Elephant', false),
            choice('Howler monkey', false),
            choice('Lion', false),
          ],
          explanation:
            "The blue whale's low-frequency calls are among the loudest sounds produced by any animal.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the fastest bird in the world during a hunting dive?',
          choices: [
            choice('Eagle', false),
            choice('Peregrine falcon', true),
            choice('Ostrich', false),
            choice('Hawk', false),
          ],
          explanation: 'Peregrine falcons can exceed 240 mph while diving for prey.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the largest hot desert in the world by area?',
          choices: [
            choice('Sahara', true),
            choice('Gobi', false),
            choice('Arabian Desert', false),
            choice('Kalahari', false),
          ],
          explanation:
            'The Sahara covers most of North Africa and is the largest hot desert on Earth.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the deepest known point in the ocean, located in the Pacific?',
          choices: [
            choice('Puerto Rico Trench', false),
            choice('Mariana Trench', true),
            choice('Java Trench', false),
            choice('Tonga Trench', false),
          ],
          explanation: 'The Mariana Trench reaches depths of nearly 11,000 meters.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'MEDIUM',
    title: 'Everyday Objects: Do You Know Their Origins?',
    description:
      'Ever wonder where Post-it Notes, Ketchup, or the Band-Aid actually came from? This quiz explores the surprising and often accidental origins of everyday objects.',
    tags: ['inventions', 'everyday objects', 'trivia', 'fun facts', 'history'],
    quiz: {
      title: 'Everyday Objects: Do You Know Their Origins?',
      description: '',
      questions: [
        {
          prompt:
            'What was bubble wrap originally invented to be, before becoming used as packaging material?',
          choices: [
            choice('A toy', false),
            choice('Wallpaper', true),
            choice('A raincoat material', false),
            choice('Insulation', false),
          ],
          explanation:
            'Bubble wrap was invented in 1957 as a textured wallpaper before its packaging use was discovered.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Ketchup was originally sold in pharmacies in the 1830s as what?',
          choices: [
            choice('A cleaning product', false),
            choice('A patent medicine', true),
            choice('Perfume', false),
            choice('A hair tonic', false),
          ],
          explanation:
            'Tomato ketchup was marketed as a cure for various ailments before becoming a condiment.',
          timeLimitSec: 20,
        },
        {
          prompt: "What were Levi's copper rivets on jeans originally designed to withstand?",
          choices: [
            choice('Farm and mining work', false),
            choice('Office wear', false),
            choice('Swimming', false),
            choice('Formal events', false),
          ],
          explanation:
            'Levi Strauss added copper rivets to reinforce jeans for laborers and miners.',
          timeLimitSec: 20,
        },
        {
          prompt: 'The Post-it Note was invented as a result of what kind of failed product?',
          choices: [
            choice('A super-strong glue', false),
            choice('A weak, reusable adhesive', true),
            choice('A type of paper', false),
            choice('A stapler', false),
          ],
          explanation:
            'A 3M scientist was trying to create a strong adhesive but ended up with a weak, reusable one instead.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What was the zipper originally marketed for before becoming common in clothing?',
          choices: [
            choice('Boots and tobacco pouches', true),
            choice('Military uniforms only', false),
            choice('Shoes only', false),
            choice('Furniture', false),
          ],
          explanation:
            'Early zippers were used on boots and tobacco pouches before clothing manufacturers adopted them.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What everyday item did Earle Dickson invent in 1920 to help his accident-prone wife?',
          choices: [
            choice('The Band-Aid', true),
            choice('The safety pin', false),
            choice('Tweezers', false),
            choice('The thermometer', false),
          ],
          explanation:
            'Dickson created an early adhesive bandage that Johnson & Johnson later marketed as the Band-Aid.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What was Coca-Cola originally marketed as when it was invented in 1886?',
          choices: [
            choice('A soft drink', false),
            choice('A medicinal tonic', true),
            choice('A cleaning product', false),
            choice('A hair treatment', false),
          ],
          explanation: 'John Pemberton originally sold Coca-Cola as a patent medicine.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'The microwave oven was invented after an engineer noticed what happened to a chocolate bar in his pocket?',
          choices: [
            choice('It melted near radar equipment', true),
            choice('It froze', false),
            choice('It caught fire', false),
            choice('It changed color', false),
          ],
          explanation:
            'Percy Spencer discovered microwave heating after a chocolate bar melted near a radar magnetron he was testing.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'The popsicle was reportedly invented by accident in 1905 when an 11-year-old left what outside overnight?',
          choices: [
            choice('A frozen soda drink with a stirring stick', true),
            choice('A frozen fruit snack', false),
            choice('An ice cream sandwich', false),
            choice('A snow cone', false),
          ],
          explanation:
            'Frank Epperson accidentally froze a soda with a stir stick in it, creating the first popsicle.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What was Play-Doh originally manufactured to be used for?',
          choices: [
            choice("A children's toy", false),
            choice('A wallpaper cleaner', true),
            choice('A pottery material', false),
            choice('A food product', false),
          ],
          explanation:
            'Play-Doh started as a wallpaper cleaning product before being reformulated as a toy in the 1950s.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'MEDIUM',
    title: 'Human Body: Strange & Surprising Facts',
    description:
      'Your body is stranger than you think. This quiz covers surprising facts about muscles, organs, and biology that most people never learn in school.',
    tags: ['human body', 'biology', 'trivia', 'science facts', 'anatomy'],
    quiz: {
      title: 'Human Body: Strange & Surprising Facts',
      description: '',
      questions: [
        {
          prompt: 'Approximately what percentage of the adult human body is made up of water?',
          choices: [
            choice('30%', false),
            choice('50%', false),
            choice('60%', true),
            choice('90%', false),
          ],
          explanation: 'The adult human body is roughly 60% water on average.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the strongest muscle in the human body relative to its size?',
          choices: [
            choice('Biceps', false),
            choice('Masseter (jaw muscle)', true),
            choice('Quadriceps', false),
            choice('Heart', false),
          ],
          explanation:
            'The masseter, used for chewing, generates the most force relative to its size.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'How many basic taste sensations are commonly recognized by the tongue, including umami?',
          choices: [choice('3', false), choice('4', false), choice('5', true), choice('6', false)],
          explanation: 'The five recognized tastes are sweet, salty, sour, bitter, and umami.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the only part of the human body that has no blood supply?',
          choices: [
            choice('Fingernails', false),
            choice('The cornea of the eye', true),
            choice('Hair', false),
            choice('Skin', false),
          ],
          explanation:
            'The cornea gets oxygen directly from the air rather than blood vessels, keeping it transparent.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Roughly how many times does the average human heart beat per day?',
          choices: [
            choice('About 10,000', false),
            choice('About 100,000', true),
            choice('About 1 million', false),
            choice('About 10 million', false),
          ],
          explanation: 'The average heart beats around 100,000 times per day.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the smallest bone in the human body, located in the ear?',
          choices: [
            choice('Malleus', false),
            choice('Stapes', true),
            choice('Incus', false),
            choice('Cochlea', false),
          ],
          explanation:
            'The stapes, part of the middle ear, is the smallest bone in the human body.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which organ in the human body is capable of regenerating itself, even after significant tissue loss?',
          choices: [
            choice('The heart', false),
            choice('The liver', true),
            choice('The kidney', false),
            choice('The lungs', false),
          ],
          explanation:
            'The liver can regrow to nearly its original size even after losing a large portion of its tissue.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many pairs of ribs does a typical adult human have?',
          choices: [
            choice('10', false),
            choice('12', true),
            choice('14', false),
            choice('16', false),
          ],
          explanation: 'Most adults have 12 pairs of ribs, totaling 24 individual ribs.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the medical term for the study of the skin?',
          choices: [
            choice('Cardiology', false),
            choice('Dermatology', true),
            choice('Neurology', false),
            choice('Osteology', false),
          ],
          explanation: 'Dermatology is the branch of medicine focused on skin, hair, and nails.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Roughly how long is the small intestine in an adult human?',
          choices: [
            choice('About 1 foot', false),
            choice('About 3 feet', false),
            choice('About 20 feet', true),
            choice('About 50 feet', false),
          ],
          explanation:
            "The small intestine is roughly 20 feet long, though it's coiled tightly inside the abdomen.",
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'MEDIUM',
    title: 'Animal Kingdom Oddities Trivia',
    description:
      "From sleepy koalas to chameleons with tongues longer than their bodies, this quiz dives into the animal kingdom's weirdest and most surprising facts.",
    tags: ['animals', 'wildlife', 'fun facts', 'trivia', 'nature'],
    quiz: {
      title: 'Animal Kingdom Oddities Trivia',
      description: '',
      questions: [
        {
          prompt:
            'Which animal is known to sleep for up to 20 hours a day, more than almost any other mammal?',
          choices: [
            choice('Lion', false),
            choice('Koala', true),
            choice('Elephant', false),
            choice('Giraffe', false),
          ],
          explanation:
            'Koalas sleep extensively partly because their eucalyptus diet is low in energy.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Why do flamingos often stand on one leg?',
          choices: [
            choice("It's a mating display", false),
            choice('It helps conserve body heat', true),
            choice('It helps them run faster', false),
            choice("It's purely random", false),
          ],
          explanation:
            'Standing on one leg is thought to help flamingos retain body heat while wading in cold water.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which animal has a tongue that can be longer than its own body?',
          choices: [
            choice('Chameleon', true),
            choice('Giraffe', false),
            choice('Anteater', false),
            choice('Frog', false),
          ],
          explanation:
            "A chameleon's tongue can extend to more than the length of its body to catch prey.",
          timeLimitSec: 20,
        },
        {
          prompt: "Which small sea creature's heart is unusually located in its head?",
          choices: [
            choice('Shrimp', true),
            choice('Octopus', false),
            choice('Snail', false),
            choice('Crab', false),
          ],
          explanation: "A shrimp's heart sits in its head/thorax region rather than its body.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which bird is known for building the largest nest of any bird species, sometimes weighing over a ton?',
          choices: [
            choice('Bald eagle', true),
            choice('Ostrich', false),
            choice('Stork', false),
            choice('Condor', false),
          ],
          explanation:
            'Bald eagles build enormous nests that they reuse and expand year after year.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a group of crows called?',
          choices: [
            choice('A murder', true),
            choice('A flock', false),
            choice('A gaggle', false),
            choice('A parliament', false),
          ],
          explanation: 'A group of crows is traditionally called "a murder."',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which creature has blue blood due to a copper-based protein rather than iron-based like humans?',
          choices: [
            choice('Octopus', false),
            choice('Horseshoe crab', true),
            choice('Jellyfish', false),
            choice('Starfish', false),
          ],
          explanation:
            'Horseshoe crab blood is copper-based and is even harvested for medical testing due to its unique properties.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which mammal is the only one capable of true, sustained flight?',
          choices: [
            choice('Flying squirrel', false),
            choice('Bat', true),
            choice('Sugar glider', false),
            choice('Colugo', false),
          ],
          explanation:
            'Bats are the only mammals capable of powered flight; other "flying" mammals just glide.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Is it true that sea otters hold hands while sleeping?',
          choices: [
            choice("It's a myth", false),
            choice('Yes — it keeps them from drifting apart in the water', true),
            choice("It's aggressive behavior", false),
            choice('It only happens in captivity', false),
          ],
          explanation:
            'Sea otters hold hands (or wrap themselves in kelp) to avoid drifting apart while resting on the water.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which insect can lift objects many times its own body weight, among the strongest animals relative to size?',
          choices: [
            choice('Ant', true),
            choice('Bee', false),
            choice('Beetle', false),
            choice('Grasshopper', false),
          ],
          explanation:
            'Ants can carry loads many times their own body weight due to their small size and muscle structure.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'EASY',
    title: 'Food & Drink Trivia: Fun Facts Edition',
    description:
      "A tasty mix of trivia covering where our favorite foods and drinks come from, from sourdough's tangy secret to the world's most consumed spice.",
    tags: ['food', 'drink', 'fun facts', 'trivia', 'cuisine'],
    quiz: {
      title: 'Food & Drink Trivia: Fun Facts Edition',
      description: '',
      questions: [
        {
          prompt: 'Which fruit has its seeds on the outside rather than the inside?',
          choices: [
            choice('Strawberry', true),
            choice('Kiwi', false),
            choice('Fig', false),
            choice('Blackberry', false),
          ],
          explanation:
            'Strawberries are unusual among fruits for carrying their seeds on their outer surface.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What popular breakfast food is made by fermenting milk with bacterial cultures?',
          choices: [
            choice('Cheese', false),
            choice('Yogurt', true),
            choice('Butter', false),
            choice('Cream', false),
          ],
          explanation: 'Yogurt is made by fermenting milk with live bacterial cultures.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Cacao, the source of chocolate, originated in which region of the world?',
          choices: [
            choice('Europe', false),
            choice('Mesoamerica', true),
            choice('Southeast Asia', false),
            choice('West Africa', false),
          ],
          explanation: 'Cacao was first cultivated by ancient civilizations in Mesoamerica.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the main herb in traditional Italian pesto sauce, besides olive oil and garlic?',
          choices: [
            choice('Basil', true),
            choice('Parsley', false),
            choice('Spinach', false),
            choice('Mint', false),
          ],
          explanation: 'Classic pesto is built around fresh basil leaves.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which hot beverage is made from roasted and ground coffee beans?',
          choices: [
            choice('Tea', false),
            choice('Coffee', true),
            choice('Hot chocolate', false),
            choice('Cider', false),
          ],
          explanation: 'Coffee is brewed from roasted, ground coffee beans.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What gives sourdough bread its distinctive tangy flavor?',
          choices: [
            choice('Added vinegar', false),
            choice('Wild yeast and bacteria fermentation', true),
            choice('Lemon juice', false),
            choice('Baking soda', false),
          ],
          explanation:
            'Sourdough relies on a natural starter culture of wild yeast and lactic acid bacteria.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which spice is derived from the bark of a tree and commonly used in baking?',
          choices: [
            choice('Nutmeg', false),
            choice('Cinnamon', true),
            choice('Cloves', false),
            choice('Ginger', false),
          ],
          explanation: 'Cinnamon comes from the inner bark of trees in the Cinnamomum genus.',
          timeLimitSec: 20,
        },
        {
          prompt: "What is the world's most widely consumed spice by volume?",
          choices: [
            choice('Black pepper', true),
            choice('Cinnamon', false),
            choice('Paprika', false),
            choice('Cumin', false),
          ],
          explanation:
            'Black pepper is used more than any other spice globally, earning the nickname "king of spices."',
          timeLimitSec: 20,
        },
        {
          prompt: "Which country is the world's largest producer of coffee?",
          choices: [
            choice('Colombia', false),
            choice('Brazil', true),
            choice('Vietnam', false),
            choice('Ethiopia', false),
          ],
          explanation: "Brazil has been the world's top coffee producer for over 150 years.",
          timeLimitSec: 20,
        },
        {
          prompt: "What is a bagel traditionally cooked in before it's baked?",
          choices: [
            choice('Fried', false),
            choice('Boiled', true),
            choice('Steamed', false),
            choice('Grilled', false),
          ],
          explanation:
            'Bagels are boiled briefly before baking, giving them their chewy texture and shiny crust.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'MEDIUM',
    title: 'Space & Universe: Mind-Blowing Facts',
    description:
      'From black holes to the age of the universe, this quiz covers mind-bending facts about space that will make you look at the night sky differently.',
    tags: ['space', 'astronomy', 'universe', 'trivia', 'science'],
    quiz: {
      title: 'Space & Universe: Mind-Blowing Facts',
      description: '',
      questions: [
        {
          prompt: 'How long does it take sunlight to reach Earth from the Sun?',
          choices: [
            choice('About 8 minutes', true),
            choice('About 1 hour', false),
            choice('About 1 second', false),
            choice('About 1 day', false),
          ],
          explanation: 'Light from the Sun takes roughly 8 minutes and 20 seconds to reach Earth.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the name of the galaxy that contains our solar system?',
          choices: [
            choice('Andromeda', false),
            choice('Milky Way', true),
            choice('Triangulum', false),
            choice('Whirlpool', false),
          ],
          explanation: 'Our solar system resides within the Milky Way galaxy.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'As of the mid-2020s, which planet holds the record for the most confirmed moons?',
          choices: [
            choice('Jupiter', false),
            choice('Saturn', true),
            choice('Uranus', false),
            choice('Neptune', false),
          ],
          explanation:
            "A wave of new discoveries pushed Saturn's confirmed moon count past Jupiter's in the 2020s.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a "black hole"?',
          choices: [
            choice('A hole in space with nothing in it', false),
            choice('A region of spacetime with gravity so strong not even light can escape', true),
            choice('A dead star that stopped burning', false),
            choice('An empty part of the universe', false),
          ],
          explanation:
            'Black holes form from collapsed matter with gravity strong enough to trap even light.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which was the first man-made satellite launched into space, in 1957?',
          choices: [
            choice('Explorer 1', false),
            choice('Sputnik 1', true),
            choice('Vostok 1', false),
            choice('Apollo 1', false),
          ],
          explanation: 'The Soviet Union launched Sputnik 1, kicking off the space age.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Approximately how old is the universe estimated to be?',
          choices: [
            choice('About 1 billion years', false),
            choice('About 4.5 billion years', false),
            choice('About 13.8 billion years', true),
            choice('About 100 billion years', false),
          ],
          explanation:
            'Cosmological measurements estimate the universe is about 13.8 billion years old.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the closest individual star to Earth besides the Sun?',
          choices: [
            choice('Alpha Centauri', false),
            choice('Proxima Centauri', true),
            choice('Sirius', false),
            choice('Betelgeuse', false),
          ],
          explanation:
            'Proxima Centauri, part of the Alpha Centauri star system, is the nearest individual star.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which planet spins on its side, with an axial tilt of about 98 degrees?',
          choices: [
            choice('Neptune', false),
            choice('Uranus', true),
            choice('Saturn', false),
            choice('Venus', false),
          ],
          explanation:
            'Uranus is tipped almost completely on its side, likely due to an ancient collision.',
          timeLimitSec: 20,
        },
        {
          prompt:
            "What is the term for the point in a planet's orbit when it is closest to the Sun?",
          choices: [
            choice('Aphelion', false),
            choice('Perihelion', true),
            choice('Apogee', false),
            choice('Perigee', false),
          ],
          explanation:
            'Perihelion refers to the closest point to the Sun in an orbit; aphelion is the farthest.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which spacecraft mission was the first to land humans on the Moon, in 1969?',
          choices: [
            choice('Apollo 8', false),
            choice('Apollo 11', true),
            choice('Apollo 13', false),
            choice('Gemini 4', false),
          ],
          explanation:
            'Apollo 11 landed Neil Armstrong and Buzz Aldrin on the Moon on July 20, 1969.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'HARD',
    title: "History's Weirdest Moments Trivia",
    description:
      "From the shortest war in history to the Great Molasses Flood, this quiz covers history's strangest, most unbelievable-but-true moments.",
    tags: ['history', 'weird history', 'trivia', 'fun facts', 'strange events'],
    quiz: {
      title: "History's Weirdest Moments Trivia",
      description: '',
      questions: [
        {
          prompt:
            'Which conflict is recorded as the shortest war in history, lasting under an hour between Britain and Zanzibar in 1896?',
          choices: [
            choice('The Anglo-Zanzibar War', true),
            choice('The Six-Day War', false),
            choice('The Football War', false),
            choice('The Toledo War', false),
          ],
          explanation:
            'The Anglo-Zanzibar War lasted roughly 38–45 minutes, the shortest war on record.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In medieval Europe, what were "trial by ordeal" practices used to determine?',
          choices: [
            choice('Guilt or innocence through physical tests', true),
            choice('Marriage compatibility', false),
            choice('Royal succession', false),
            choice('Land ownership', false),
          ],
          explanation:
            'Trial by ordeal subjected the accused to dangerous physical tests believed to reveal divine judgment.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which U.S. presidents have served two non-consecutive terms?',
          choices: [
            choice('Only Grover Cleveland', false),
            choice('Grover Cleveland and Donald Trump', true),
            choice('Only Donald Trump', false),
            choice('No president has done this', false),
          ],
          explanation:
            'Grover Cleveland (1885–89, 1893–97) and later Donald Trump (2017–21, 2025–present) both served non-consecutive terms.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What was the "Great Emu War" of 1932, fought in Australia?',
          choices: [
            choice('A military campaign against emus damaging crops', true),
            choice('A war between two rival farms', false),
            choice('A political scandal named after a bird', false),
            choice('A fictional event', false),
          ],
          explanation:
            'The Australian military attempted to cull emus that were destroying farmland, with limited success.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which ancient wonder of the world is the only one still standing today?',
          choices: [
            choice('The Colossus of Rhodes', false),
            choice('The Great Pyramid of Giza', true),
            choice('The Hanging Gardens of Babylon', false),
            choice('The Lighthouse of Alexandria', false),
          ],
          explanation:
            'The Great Pyramid of Giza is the only surviving Ancient Wonder of the World.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What caused the unusual "Great Molasses Flood" in Boston in 1919?',
          choices: [
            choice('A storage tank of molasses burst, flooding streets', true),
            choice('A ship carrying molasses sank', false),
            choice('A factory fire', false),
            choice('A hurricane', false),
          ],
          explanation:
            'A massive molasses storage tank ruptured, sending a wave of molasses through Boston streets.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which country dropped 13 days from its calendar in 1918 to switch from the Julian to the Gregorian calendar?',
          choices: [
            choice('Russia', true),
            choice('France', false),
            choice('Germany', false),
            choice('Spain', false),
          ],
          explanation:
            'Post-revolutionary Russia adopted the Gregorian calendar, skipping 13 days to align with the West.',
          timeLimitSec: 20,
        },
        {
          prompt: "What is the truth behind the popular myth about Napoleon's height?",
          choices: [
            choice('He was actually of average height for his era', true),
            choice('He was over 6 feet tall', false),
            choice('He was the tallest person in Europe', false),
            choice('His height was never recorded', false),
          ],
          explanation:
            'The "short Napoleon" myth largely stems from a mix-up between French and English measurement units.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which country first widely implemented Daylight Saving Time nationwide in 1916, to save energy during World War I?',
          choices: [
            choice('Germany', true),
            choice('United States', false),
            choice('United Kingdom', false),
            choice('France', false),
          ],
          explanation:
            'Germany was the first country to adopt nationwide Daylight Saving Time, with others quickly following.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What was the "Dancing Plague" of 1518 in Strasbourg?',
          choices: [
            choice('A festival celebrating dance', false),
            choice('An outbreak where hundreds reportedly danced uncontrollably for days', true),
            choice('A royal decree mandating dance', false),
            choice('A myth with no historical basis', false),
          ],
          explanation:
            'Historical records document dozens to hundreds of people compulsively dancing for days, some reportedly to exhaustion.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'MEDIUM',
    title: 'Inventions That Changed the World Quiz',
    description:
      'From the printing press to the airplane, this quiz covers the inventions and inventors who reshaped human civilization. Test your knowledge of the breakthroughs that changed everything.',
    tags: ['inventions', 'history', 'trivia', 'innovation', 'science history'],
    quiz: {
      title: 'Inventions That Changed the World Quiz',
      description: '',
      questions: [
        {
          prompt:
            'Who is credited with inventing the printing press with movable type in the 15th century?',
          choices: [
            choice('Johannes Gutenberg', true),
            choice('Leonardo da Vinci', false),
            choice('Isaac Newton', false),
            choice('Thomas Edison', false),
          ],
          explanation: "Gutenberg's press revolutionized the spread of information across Europe.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Who is credited with inventing the telephone in 1876?',
          choices: [
            choice('Thomas Edison', false),
            choice('Alexander Graham Bell', true),
            choice('Nikola Tesla', false),
            choice('Guglielmo Marconi', false),
          ],
          explanation: 'Alexander Graham Bell patented the telephone in 1876.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which 1879 invention by Thomas Edison made practical, long-lasting electric lighting widely available?',
          choices: [
            choice('The telegraph', false),
            choice('The light bulb', true),
            choice('The phonograph', false),
            choice('The battery', false),
          ],
          explanation:
            "Edison's improved light bulb design made electric lighting commercially viable.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Who is credited with inventing the World Wide Web in 1989?',
          choices: [
            choice('Bill Gates', false),
            choice('Tim Berners-Lee', true),
            choice('Steve Jobs', false),
            choice('Vint Cerf', false),
          ],
          explanation: 'Tim Berners-Lee created the Web while working at CERN.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which 19th-century invention revolutionized long-distance communication using electrical signals and Morse code?',
          choices: [
            choice('The telephone', false),
            choice('The telegraph', true),
            choice('Radio', false),
            choice('Television', false),
          ],
          explanation:
            'The telegraph enabled near-instant long-distance messaging decades before the telephone.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Who achieved the first powered flight in 1903, alongside a brother?',
          choices: [
            choice('The Wright Brothers', true),
            choice('Charles Lindbergh', false),
            choice('Amelia Earhart', false),
            choice('The Montgolfier Brothers', false),
          ],
          explanation:
            'Orville and Wilbur Wright achieved the first sustained, controlled powered flight.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which vaccine, developed by Edward Jenner in 1796, is considered the first successful vaccine in history?',
          choices: [
            choice('Polio vaccine', false),
            choice('Smallpox vaccine', true),
            choice('Measles vaccine', false),
            choice('Rabies vaccine', false),
          ],
          explanation: "Jenner's smallpox vaccine laid the foundation for modern immunology.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which group developed the packet-switching network technology in the late 1960s that led to the creation of the internet (ARPANET)?',
          choices: [
            choice('US Department of Defense researchers', true),
            choice('A private tech company', false),
            choice('A university student alone', false),
            choice('A telecom company', false),
          ],
          explanation: 'ARPANET was developed with funding from the US Department of Defense.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which household appliance, patented in the early 20th century, dramatically reduced the manual labor of cleaning clothes?',
          choices: [
            choice('The dishwasher', false),
            choice('The washing machine', true),
            choice('The vacuum cleaner', false),
            choice('The refrigerator', false),
          ],
          explanation:
            'Electric washing machines transformed household laundry work in the early 1900s.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Who is most credited with the steam engine improvements that powered the Industrial Revolution?',
          choices: [
            choice('James Watt', true),
            choice('George Stephenson', false),
            choice('Richard Trevithick', false),
            choice('Thomas Newcomen', false),
          ],
          explanation:
            "Watt's efficiency improvements made steam power practical for widespread industrial use.",
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'MEDIUM',
    title: 'Money & Currency Trivia Around the World',
    description:
      "From the yen to Bitcoin, this quiz covers currencies, monetary systems, and money facts from around the globe. A great test for anyone curious about how the world's economies work.",
    tags: ['money', 'currency', 'trivia', 'economics', 'world facts'],
    quiz: {
      title: 'Money & Currency Trivia Around the World',
      description: '',
      questions: [
        {
          prompt: 'What is the official currency of Japan?',
          choices: [
            choice('Yuan', false),
            choice('Won', false),
            choice('Yen', true),
            choice('Ringgit', false),
          ],
          explanation: "The yen has been Japan's currency since 1871.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Which organization is responsible for issuing and regulating the euro currency?',
          choices: [
            choice('The World Bank', false),
            choice('The European Central Bank', true),
            choice('The United Nations', false),
            choice('The IMF', false),
          ],
          explanation: 'The European Central Bank manages monetary policy for the eurozone.',
          timeLimitSec: 20,
        },
        {
          prompt: "What is Switzerland's currency, notably not the euro despite being in Europe?",
          choices: [
            choice('Swiss Euro', false),
            choice('Swiss Franc', true),
            choice('Swiss Pound', false),
            choice('Swiss Mark', false),
          ],
          explanation:
            'Switzerland retains its own currency, the Swiss franc, rather than using the euro.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which currency name is shared, with different values, by India, Pakistan, and several other South Asian nations?',
          choices: [
            choice('Rupee', true),
            choice('Ringgit', false),
            choice('Baht', false),
            choice('Dong', false),
          ],
          explanation: 'The rupee is used under various national forms across South Asia.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for money a government declares legal tender, without being backed by a commodity like gold?',
          choices: [
            choice('Commodity money', false),
            choice('Fiat money', true),
            choice('Digital money', false),
            choice('Representative money', false),
          ],
          explanation:
            'Fiat money derives value from government decree and public trust rather than a physical commodity.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which country was the first to introduce paper currency, over a thousand years ago?',
          choices: [
            choice('England', false),
            choice('China', true),
            choice('France', false),
            choice('Italy', false),
          ],
          explanation:
            'China introduced paper money during the Song Dynasty, centuries before Europe.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the name of the decentralized digital currency created in 2009 by the pseudonymous "Satoshi Nakamoto"?',
          choices: [
            choice('Ethereum', false),
            choice('Bitcoin', true),
            choice('Litecoin', false),
            choice('Dogecoin', false),
          ],
          explanation: 'Bitcoin was the first widely adopted decentralized cryptocurrency.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'When the euro was introduced in 1999/2002, what happened to national currencies like the Deutsche Mark and French Franc?',
          choices: [
            choice('They were replaced by the euro', true),
            choice('They stayed in circulation alongside the euro', false),
            choice('Only Eastern European currencies were replaced', false),
            choice('Nothing changed', false),
          ],
          explanation:
            'Eurozone countries phased out their national currencies in favor of the shared euro.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the smallest unit of currency in the United States commonly called?',
          choices: [
            choice('Dime', false),
            choice('Nickel', false),
            choice('Cent (penny)', true),
            choice('Quarter', false),
          ],
          explanation:
            'The cent, commonly called a penny, is the smallest denomination of US currency.',
          timeLimitSec: 20,
        },
        {
          prompt:
            "The Yuan, or Renminbi, is the official currency of which country, the world's most populous?",
          choices: [
            choice('Japan', false),
            choice('China', true),
            choice('South Korea', false),
            choice('Vietnam', false),
          ],
          explanation: 'The renminbi (unit: yuan) is the official currency of China.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'MEDIUM',
    title: "Nature's Extremes: Biggest, Smallest, Fastest",
    description:
      "From the world's tallest waterfall to its driest desert, this quiz explores nature's most extreme records. A fun geography and biology challenge for nature lovers.",
    tags: ['nature', 'world records', 'geography', 'trivia', 'fun facts'],
    quiz: {
      title: "Nature's Extremes: Biggest, Smallest, Fastest",
      description: '',
      questions: [
        {
          prompt:
            'What is the largest living organism on Earth by area — a fungus colony found in Oregon, USA?',
          choices: [
            choice('A giant sequoia', false),
            choice('A honey fungus (Armillaria) colony', true),
            choice('A coral reef', false),
            choice('A blue whale', false),
          ],
          explanation:
            'A single honey fungus colony in Oregon spans thousands of acres, making it the largest known organism by area.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the tallest waterfall in the world, located in Venezuela?',
          choices: [
            choice('Niagara Falls', false),
            choice('Angel Falls', true),
            choice('Victoria Falls', false),
            choice('Iguazu Falls', false),
          ],
          explanation:
            'Angel Falls drops over 3,200 feet, the tallest uninterrupted waterfall in the world.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the largest rainforest in the world by area?',
          choices: [
            choice('Congo Rainforest', false),
            choice('Amazon Rainforest', true),
            choice('Southeast Asian Rainforest', false),
            choice('Daintree Rainforest', false),
          ],
          explanation:
            'The Amazon Rainforest spans over 5 million square kilometers across South America.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the smallest ocean in the world by area?',
          choices: [
            choice('Indian Ocean', false),
            choice('Southern Ocean', false),
            choice('Arctic Ocean', true),
            choice('Atlantic Ocean', false),
          ],
          explanation:
            "The Arctic Ocean is the smallest and shallowest of the world's five oceans.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Which is the driest inhabited place on Earth, located in South America?',
          choices: [
            choice('Sahara Desert', false),
            choice('Atacama Desert', true),
            choice('Gobi Desert', false),
            choice('Death Valley', false),
          ],
          explanation:
            'Parts of the Atacama Desert in Chile receive virtually no rainfall for years at a time.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the deepest lake in the world, located in Russia?',
          choices: [
            choice('Lake Superior', false),
            choice('Lake Baikal', true),
            choice('Caspian Sea', false),
            choice('Lake Tanganyika', false),
          ],
          explanation:
            "Lake Baikal reaches depths of over 5,300 feet and holds about a fifth of the world's unfrozen fresh water.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the name of the parasitic plant that produces the largest individual flower in the world?',
          choices: [
            choice('Rafflesia arnoldii', true),
            choice('Titan arum', false),
            choice('Venus flytrap', false),
            choice('Orchid', false),
          ],
          explanation: 'Rafflesia arnoldii produces flowers that can exceed three feet across.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the fastest fish in the ocean, capable of speeds over 60 mph?',
          choices: [
            choice('Great white shark', false),
            choice('Sailfish', true),
            choice('Tuna', false),
            choice('Swordfish', false),
          ],
          explanation: 'Sailfish are widely regarded as the fastest fish in the ocean.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the coldest place on Earth, where the lowest natural temperature was recorded?',
          choices: [
            choice('Siberia', false),
            choice('Antarctica', true),
            choice('Greenland', false),
            choice('Northern Canada', false),
          ],
          explanation:
            'Antarctica holds the record for the coldest naturally occurring temperature ever measured on Earth.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the tallest mountain in North America?',
          choices: [
            choice('Mount Whitney', false),
            choice('Denali', true),
            choice('Mount Rainier', false),
            choice('Pikes Peak', false),
          ],
          explanation: 'Denali (formerly Mount McKinley) in Alaska stands at 20,310 feet.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'MEDIUM',
    title: 'World Customs & Traditions Trivia',
    description:
      'From Japanese tea ceremonies to the Māori haka, this quiz explores fascinating customs and traditions from cultures around the world.',
    tags: ['culture', 'traditions', 'world customs', 'trivia', 'geography'],
    quiz: {
      title: 'World Customs & Traditions Trivia',
      description: '',
      questions: [
        {
          prompt: "In Japan, what is it considered polite to do before entering someone's home?",
          choices: [
            choice('Bow twice', false),
            choice('Remove your shoes', true),
            choice('Bring a gift only', false),
            choice('Knock three times', false),
          ],
          explanation: 'Removing shoes before entering a home is a deeply rooted custom in Japan.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What does a white wedding dress typically symbolize, a tradition popularized by Queen Victoria in 1840?',
          choices: [
            choice('Wealth', false),
            choice('Purity and innocence', true),
            choice('Royalty', false),
            choice('Good luck', false),
          ],
          explanation:
            'White became associated with bridal purity after Queen Victoria wore it at her wedding.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the traditional Scottish garment worn by men, especially for formal occasions?',
          choices: [
            choice('A toga', false),
            choice('A kilt', true),
            choice('A sarong', false),
            choice('A poncho', false),
          ],
          explanation:
            'The kilt is a traditional Scottish Highland garment, often tied to clan tartans.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'In Thailand, what is considered disrespectful to do with your feet in many social situations?',
          choices: [
            choice('Point them at people or religious images', true),
            choice('Cross your legs', false),
            choice('Wear sandals', false),
            choice('Walk barefoot', false),
          ],
          explanation:
            'Feet are considered the lowest and least respectful part of the body in Thai culture.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is "Oktoberfest," a famous annual festival held in Munich, Germany?',
          choices: [
            choice('A film festival', false),
            choice('A beer and folk festival', true),
            choice('A religious pilgrimage', false),
            choice('A sporting event', false),
          ],
          explanation:
            'Oktoberfest is a major beer festival and folk celebration held annually in Munich.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'In many Latin American countries, what is "Día de los Muertos" (Day of the Dead) primarily a celebration of?',
          choices: [
            choice('Halloween-style scares', false),
            choice('Honoring and remembering deceased loved ones', true),
            choice('A harvest festival only', false),
            choice('A political holiday', false),
          ],
          explanation:
            'Día de los Muertos celebrates and honors the memory of deceased family members.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the traditional Indian festival of lights, celebrated by Hindus, Sikhs, and Jains?',
          choices: [
            choice('Holi', false),
            choice('Diwali', true),
            choice('Navratri', false),
            choice('Eid', false),
          ],
          explanation:
            'Diwali celebrates the triumph of light over darkness with lamps, fireworks, and festivities.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What does a red envelope containing money traditionally symbolize when given during Lunar New Year?',
          choices: [
            choice('Bad luck', false),
            choice('Good fortune and blessings', true),
            choice('A formal debt', false),
            choice('A wedding gift', false),
          ],
          explanation:
            'Red envelopes (hongbao) are given to convey good fortune and blessings for the new year.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the name of the traditional Japanese tea ceremony that emphasizes mindfulness and ritual preparation?',
          choices: [
            choice('Ikebana', false),
            choice('Chanoyu (or Sado)', true),
            choice('Origami', false),
            choice('Bonsai', false),
          ],
          explanation:
            'Chanoyu is the formalized, ritual preparation and serving of powdered green tea.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In New Zealand and among Māori culture, what is a "haka"?',
          choices: [
            choice('A style of cooking', false),
            choice('A ceremonial dance, often performed before events like rugby matches', true),
            choice('A type of clothing', false),
            choice('A greeting handshake', false),
          ],
          explanation:
            'The haka is a traditional Māori dance used in ceremonies and, famously, before rugby matches.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'MEDIUM',
    title: 'Trivia for Night Owls: Late-Night Random Facts',
    description:
      'A quiz for the night owls — covering sleep science, nocturnal animals, and the mysteries of the night sky. Perfect for a late-night trivia session.',
    tags: ['trivia', 'night', 'sleep facts', 'nocturnal', 'fun facts'],
    quiz: {
      title: 'Trivia for Night Owls: Late-Night Random Facts',
      description: '',
      questions: [
        {
          prompt: 'What is the scientific name for the fear of the dark?',
          choices: [
            choice('Claustrophobia', false),
            choice('Nyctophobia', true),
            choice('Acrophobia', false),
            choice('Arachnophobia', false),
          ],
          explanation: 'Nyctophobia refers specifically to a fear of darkness or the night.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the natural light phenomenon seen in polar regions, also called the Northern Lights?',
          choices: [
            choice('Solar flare', false),
            choice('Aurora borealis', true),
            choice('Meteor shower', false),
            choice('Lunar eclipse', false),
          ],
          explanation:
            "The aurora borealis is caused by charged particles from the Sun interacting with Earth's atmosphere.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'Roughly how many stars are visible to the naked eye from Earth on a clear night, out of the billions in our galaxy?',
          choices: [
            choice('About 100%', false),
            choice('Only a tiny fraction — a few thousand', true),
            choice('About 50%', false),
            choice('About 10 million', false),
          ],
          explanation:
            "Only a few thousand of the galaxy's hundreds of billions of stars are visible without a telescope.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which nocturnal bird of prey is known for its ability to rotate its head up to 270 degrees?',
          choices: [
            choice('Eagle', false),
            choice('Owl', true),
            choice('Hawk', false),
            choice('Falcon', false),
          ],
          explanation:
            "An owl's flexible neck lets it rotate its head far beyond what most animals can manage.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What is insomnia?',
          choices: [
            choice('Excessive sleepiness', false),
            choice('Difficulty falling or staying asleep', true),
            choice('Sleepwalking', false),
            choice('A type of nightmare', false),
          ],
          explanation:
            'Insomnia is a sleep disorder characterized by trouble falling or staying asleep.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the approximate length of one full human sleep cycle, including REM and non-REM stages?',
          choices: [
            choice('30 minutes', false),
            choice('90 minutes', true),
            choice('4 hours', false),
            choice('8 hours', false),
          ],
          explanation:
            'A typical sleep cycle lasts about 90 minutes and repeats several times per night.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a "meteor shower"?',
          choices: [
            choice('A storm with heavy rain', false),
            choice(
              'Multiple meteors entering the atmosphere from the same radiant point, often from comet debris',
              true
            ),
            choice('A type of aurora', false),
            choice('A lunar eclipse', false),
          ],
          explanation:
            'Meteor showers occur when Earth passes through debris left behind by a comet.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which planet is often visible to the naked eye at night and is sometimes called the "Evening Star" or "Morning Star"?',
          choices: [
            choice('Mars', false),
            choice('Venus', true),
            choice('Jupiter', false),
            choice('Saturn', false),
          ],
          explanation:
            "Venus's reflective clouds make it one of the brightest objects in the night sky.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a "graveyard shift," a term for certain work hours?',
          choices: [
            choice('A shift worked entirely outdoors', false),
            choice('Night-time work hours, often late night to early morning', true),
            choice('A part-time schedule', false),
            choice('Seasonal work', false),
          ],
          explanation: 'The graveyard shift refers to overnight working hours.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for animals that are active primarily at night, such as owls and bats?',
          choices: [
            choice('Diurnal', false),
            choice('Nocturnal', true),
            choice('Crepuscular', false),
            choice('Hibernating', false),
          ],
          explanation:
            'Nocturnal animals are adapted to be active during the night and rest during the day.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'HARD',
    title: 'Brain Teasers & Mind-Bending Facts',
    description:
      'Test your knowledge of psychology, logic, and the quirks of human thinking with this brain-bending trivia quiz. Covers cognitive biases, famous puzzles, and mind-bending concepts.',
    tags: ['brain teasers', 'psychology', 'logic', 'trivia', 'mind-bending'],
    quiz: {
      title: 'Brain Teasers & Mind-Bending Facts',
      description: '',
      questions: [
        {
          prompt: 'What is the term for an optical illusion where a static image appears to move?',
          choices: [
            choice('Autostereogram', false),
            choice('Motion illusion', true),
            choice('Afterimage', false),
            choice('Mirage', false),
          ],
          explanation:
            'Motion illusions trick the visual system into perceiving movement in a still image.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In psychology, what does the "Mandela Effect" commonly describe?',
          choices: [
            choice('A type of memory loss disorder', false),
            choice('A phenomenon where many people share the same false memory', true),
            choice('A visual illusion', false),
            choice('A sleep disorder', false),
          ],
          explanation:
            'The Mandela Effect describes widespread, collective misremembering of facts or events.',
          timeLimitSec: 20,
        },
        {
          prompt:
            "What is the term for a logical fallacy where someone assumes something is true because it hasn't been proven false?",
          choices: [
            choice('Slippery slope', false),
            choice('Argument from ignorance', true),
            choice('Straw man', false),
            choice('Ad hominem', false),
          ],
          explanation: 'The argument from ignorance fallacy treats a lack of disproof as proof.',
          timeLimitSec: 20,
        },
        {
          prompt:
            "What cognitive bias describes the tendency to favor information that confirms one's existing beliefs?",
          choices: [
            choice('Hindsight bias', false),
            choice('Confirmation bias', true),
            choice('Anchoring bias', false),
            choice('Availability bias', false),
          ],
          explanation:
            'Confirmation bias leads people to seek and weigh evidence that supports what they already believe.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the "Monty Hall problem," a famous probability puzzle named after a game show host?',
          choices: [
            choice('A puzzle about switching doors to improve your odds of winning a prize', true),
            choice('A card game', false),
            choice('A chess strategy', false),
            choice('A magic trick', false),
          ],
          explanation:
            'The Monty Hall problem shows that switching doors after a reveal actually improves your odds of winning.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a "palindrome number"?',
          choices: [
            choice('A number divisible by itself', false),
            choice('A number that reads the same forwards and backwards, like 1221', true),
            choice('A prime number', false),
            choice('A number ending in zero', false),
          ],
          explanation: 'Palindrome numbers mirror themselves, just like palindrome words.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes the feeling that a difficult decision seems obvious or predictable in retrospect?',
          choices: [
            choice('Hindsight bias', true),
            choice('Confirmation bias', false),
            choice('Placebo effect', false),
            choice('Déjà vu', false),
          ],
          explanation:
            'Hindsight bias makes past events feel more predictable than they actually were.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a "riddle"?',
          choices: [
            choice('A type of poem with no answer', false),
            choice(
              'A question or statement phrased puzzlingly, requiring clever thinking to solve',
              true
            ),
            choice('A magic trick', false),
            choice('A math equation', false),
          ],
          explanation: "Riddles are deliberately worded to challenge the solver's reasoning.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for the eerie feeling of having already experienced a current situation before?',
          choices: [
            choice('Jamais vu', false),
            choice('Déjà vu', true),
            choice('Lucid dreaming', false),
            choice('Amnesia', false),
          ],
          explanation:
            'Déjà vu is French for "already seen" and describes this familiar-feeling sensation.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In logic, what is a "paradox"?',
          choices: [
            choice('A statement that is always true', false),
            choice(
              'A statement that contradicts itself or defies intuition despite valid reasoning',
              true
            ),
            choice('A false statement', false),
            choice('A scientific law', false),
          ],
          explanation:
            'Paradoxes appear self-contradictory or counterintuitive even when built from sound logical steps.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'EASY',
    title: 'Pop Culture Meets General Knowledge Trivia',
    description:
      "A mix of everyday pop culture terms and general knowledge, from FOMO to genericized trademarks. A fun, modern trivia round for anyone plugged into today's culture.",
    tags: ['pop culture', 'trivia', 'general knowledge', 'modern life', 'fun facts'],
    quiz: {
      title: 'Pop Culture Meets General Knowledge Trivia',
      description: '',
      questions: [
        {
          prompt: 'What does the acronym "DIY" commonly stand for?',
          choices: [
            choice('Do It Yourself', true),
            choice('Design It Yearly', false),
            choice('Data In Yield', false),
            choice('Direct Item Yield', false),
          ],
          explanation:
            '"DIY" describes projects people complete themselves rather than hiring a professional.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which social media platform originally used a small blue bird as its logo, before rebranding to X?',
          choices: [
            choice('Facebook', false),
            choice('Twitter', true),
            choice('Instagram', false),
            choice('Snapchat', false),
          ],
          explanation: "Twitter's bird logo was iconic before the platform rebranded to X in 2023.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'What describes a brand name becoming so popular it\'s used generically for similar products, like "Kleenex" for tissues?',
          choices: [
            choice('Trademark dilution', false),
            choice('Genericized trademark', true),
            choice('Brand loyalty', false),
            choice('Product placement', false),
          ],
          explanation:
            'A genericized trademark happens when a brand name becomes the common word for a whole category of product.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "FOMO" stand for, a popular modern slang term?',
          choices: [
            choice('Fear Of Missing Out', true),
            choice('Fun On My Own', false),
            choice('Focus On My Outcome', false),
            choice('Friends Of My Own', false),
          ],
          explanation:
            '"FOMO" describes anxiety about missing an enjoyable event others are experiencing.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which annual event, held in Las Vegas, showcases the latest consumer technology and gadgets?',
          choices: [
            choice('Comic-Con', false),
            choice('CES (Consumer Electronics Show)', true),
            choice('SXSW', false),
            choice('E3', false),
          ],
          explanation: 'CES is one of the largest annual technology trade shows in the world.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "selfie" refer to, a term added to major dictionaries in the 2010s?',
          choices: [
            choice('A photo taken of oneself, typically with a smartphone', true),
            choice('A type of social media post', false),
            choice('A video call', false),
            choice('A digital avatar', false),
          ],
          explanation:
            '"Selfie" became widely popularized with the rise of front-facing smartphone cameras.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which annual shopping event, originating the day after Thanksgiving in the US, is known for major retail discounts?',
          choices: [
            choice('Cyber Monday', false),
            choice('Black Friday', true),
            choice('Prime Day', false),
            choice('Boxing Day', false),
          ],
          explanation: 'Black Friday has become one of the biggest retail shopping days in the US.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is "crowdfunding"?',
          choices: [
            choice(
              'Raising small amounts of money from many people, often online, to fund a project',
              true
            ),
            choice('A type of stock market trading', false),
            choice('A government grant program', false),
            choice('A type of bank loan', false),
          ],
          explanation:
            'Crowdfunding platforms let many individuals contribute small amounts to fund a project or business.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which of these is a popular annual music and arts festival held in the California desert?',
          choices: [
            choice('Lollapalooza', false),
            choice('Coachella', true),
            choice('Glastonbury', false),
            choice('Bonnaroo', false),
          ],
          explanation: 'Coachella is held annually in Indio, California.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "podcast" refer to?',
          choices: [
            choice('A live radio broadcast only', false),
            choice(
              'A digital audio program that can be downloaded or streamed, often in episodic form',
              true
            ),
            choice('A type of video game', false),
            choice('A social media app', false),
          ],
          explanation: 'Podcasts are episodic audio (or video) shows distributed digitally.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'HARD',
    title: 'Geography Oddities: Strange Places & Facts',
    description:
      "From pink lakes to countries with more pyramids than Egypt, this quiz covers geography's strangest and most surprising facts. A fun challenge for map lovers.",
    tags: ['geography', 'world facts', 'trivia', 'strange places', 'fun facts'],
    quiz: {
      title: 'Geography Oddities: Strange Places & Facts',
      description: '',
      questions: [
        {
          prompt:
            'Which is the largest island in the world, geographically part of North America but politically tied to Denmark?',
          choices: [
            choice('Iceland', false),
            choice('Greenland', true),
            choice('Svalbard', false),
            choice('Madagascar', false),
          ],
          explanation:
            "Greenland is the world's largest island and an autonomous territory of Denmark.",
          timeLimitSec: 20,
        },
        {
          prompt: "What is unique about Vatican City's status among world nations?",
          choices: [
            choice('It has its own time zone despite being tiny', false),
            choice(
              "It's the smallest sovereign state in the world by both area and population",
              true
            ),
            choice('It has no permanent residents', false),
            choice('It spans two continents', false),
          ],
          explanation:
            'Vatican City is the smallest internationally recognized sovereign state in the world.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which African country was never formally colonized by a European power, aside from a brief Italian occupation?',
          choices: [
            choice('Kenya', false),
            choice('Ethiopia', true),
            choice('Nigeria', false),
            choice('Ghana', false),
          ],
          explanation:
            'Ethiopia successfully repelled colonial conquest attempts and remained largely independent.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What alternative to GDP does the Kingdom of Bhutan use to measure national progress?',
          choices: [
            choice('Gross National Happiness', true),
            choice('Gross National Product only', false),
            choice('Population growth rate', false),
            choice('Literacy rate', false),
          ],
          explanation:
            'Bhutan officially prioritizes Gross National Happiness as a measure of societal well-being.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which country has the most time zones of any nation, due to its overseas territories?',
          choices: [
            choice('Russia', false),
            choice('United States', false),
            choice('France', true),
            choice('United Kingdom', false),
          ],
          explanation:
            "France's overseas departments and territories give it 12 time zones, more than any other country.",
          timeLimitSec: 20,
        },
        {
          prompt: "Which country's largest city, Istanbul, famously spans two continents?",
          choices: [
            choice('Russia', false),
            choice('Turkey', true),
            choice('Kazakhstan', false),
            choice('Egypt', false),
          ],
          explanation: 'Istanbul straddles both Europe and Asia across the Bosphorus strait.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which inhabited continent receives the least average rainfall?',
          choices: [
            choice('Africa', false),
            choice('Australia', true),
            choice('Antarctica', false),
            choice('Asia', false),
          ],
          explanation:
            'Australia is the driest inhabited continent (Antarctica is drier still, but uninhabited).',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which country is home to more pyramids than Egypt, despite them being smaller?',
          choices: [
            choice('Sudan', true),
            choice('Mexico', false),
            choice('Peru', false),
            choice('Ethiopia', false),
          ],
          explanation:
            'Ancient Nubian kingdoms in what is now Sudan built more pyramids than ancient Egypt, though smaller in scale.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is unusual about the Dead Sea, located between Jordan and Israel?',
          choices: [
            choice("It's the lowest point on Earth's land surface and extremely salty", true),
            choice("It's the deepest lake in the world", false),
            choice("It's entirely frozen year-round", false),
            choice('It has no salt at all', false),
          ],
          explanation:
            'The Dead Sea sits at the lowest land elevation on Earth and is roughly 10 times saltier than the ocean.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Lake Retba, famous for its distinctive pink color caused by algae, is located in which country?',
          choices: [
            choice('Senegal', true),
            choice('Australia', false),
            choice('Iceland', false),
            choice('Chile', false),
          ],
          explanation: 'Lake Retba near Dakar, Senegal, gets its pink hue from salt-loving algae.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'EASY',
    title: "Science You Didn't Know You Knew",
    description:
      'A quiz covering fundamental science facts you probably learned once but might have forgotten — from atmospheric gases to the boiling point of water.',
    tags: ['science', 'trivia', 'general knowledge', 'chemistry', 'physics'],
    quiz: {
      title: "Science You Didn't Know You Knew",
      description: '',
      questions: [
        {
          prompt: "What is the most abundant gas in Earth's atmosphere?",
          choices: [
            choice('Oxygen', false),
            choice('Carbon dioxide', false),
            choice('Nitrogen', true),
            choice('Hydrogen', false),
          ],
          explanation: "Nitrogen makes up about 78% of Earth's atmosphere.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for the force that pulls objects toward the center of the Earth?',
          choices: [
            choice('Magnetism', false),
            choice('Gravity', true),
            choice('Friction', false),
            choice('Inertia', false),
          ],
          explanation:
            "Gravity is the force of attraction between masses, pulling objects toward Earth's center.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the pH level of pure water, considered neutral on the pH scale?',
          choices: [
            choice('0', false),
            choice('7', true),
            choice('10', false),
            choice('14', false),
          ],
          explanation: 'Pure water has a neutral pH of 7 on the 0–14 scale.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the process by which plants convert sunlight into energy called?',
          choices: [
            choice('Respiration', false),
            choice('Photosynthesis', true),
            choice('Transpiration', false),
            choice('Fermentation', false),
          ],
          explanation:
            'Photosynthesis converts light energy into chemical energy stored as glucose.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the chemical symbol for sodium?',
          choices: [
            choice('So', false),
            choice('Sd', false),
            choice('Na', true),
            choice('S', false),
          ],
          explanation: 'Sodium\'s symbol, Na, comes from its Latin name "natrium."',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for a substance that speeds up a chemical reaction without being consumed by it?',
          choices: [
            choice('Catalyst', true),
            choice('Solvent', false),
            choice('Reagent', false),
            choice('Compound', false),
          ],
          explanation:
            'Catalysts lower the energy needed for a reaction without being used up themselves.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What force keeps planets in orbit around the Sun?',
          choices: [
            choice('Magnetism', false),
            choice('Gravity', true),
            choice('Solar wind', false),
            choice('Centrifugal force', false),
          ],
          explanation: "The Sun's gravity keeps planets locked in their orbital paths.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the boiling point of water at sea level in Celsius?',
          choices: [
            choice('90°C', false),
            choice('100°C', true),
            choice('110°C', false),
            choice('120°C', false),
          ],
          explanation: 'Water boils at 100°C (212°F) at standard sea-level pressure.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for an animal that maintains a constant internal body temperature, like mammals and birds?',
          choices: [
            choice('Ectotherm', false),
            choice('Endotherm', true),
            choice('Poikilotherm', false),
            choice('Hibernator', false),
          ],
          explanation:
            'Endotherms regulate their own body temperature internally, regardless of the environment.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the most abundant element in the universe by mass?',
          choices: [
            choice('Oxygen', false),
            choice('Helium', false),
            choice('Hydrogen', true),
            choice('Carbon', false),
          ],
          explanation:
            'Hydrogen makes up roughly 75% of the elemental mass of the observable universe.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'HARD',
    title: 'Deep Cuts: Obscure General Knowledge Quiz',
    description:
      'For true trivia experts — this quiz covers obscure, lesser-known facts that most people have never heard. A genuine challenge for know-it-alls.',
    tags: ['trivia', 'hard trivia', 'obscure facts', 'general knowledge', 'challenge'],
    quiz: {
      title: 'Deep Cuts: Obscure General Knowledge Quiz',
      description: '',
      questions: [
        {
          prompt:
            'What is the term for a word that is its own opposite, such as "cleave" (to split or to join)?',
          choices: [
            choice('Antonym', false),
            choice('Contronym', true),
            choice('Homophone', false),
            choice('Oxymoron', false),
          ],
          explanation:
            'Contronyms (or auto-antonyms) hold two contradictory meanings within a single word.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the oldest known living tree species, with individual trees estimated at over 4,800 years old?',
          choices: [
            choice('Giant sequoia', false),
            choice('Bristlecone pine', true),
            choice('Baobab', false),
            choice('Yew', false),
          ],
          explanation:
            'Great Basin bristlecone pines include some of the oldest known non-clonal living organisms.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the informal, tongue-in-cheek term for the fear of long words?',
          choices: [
            choice('Triskaidekaphobia', false),
            choice('Hippopotomonstrosesquippedaliophobia', true),
            choice('Arachnophobia', false),
            choice('Claustrophobia', false),
          ],
          explanation: 'This deliberately long word is a joking name for fear of long words.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which countries have national anthems with no official lyrics, only music?',
          choices: [
            choice('Spain', false),
            choice('Bosnia and Herzegovina', false),
            choice('Both Spain and Bosnia and Herzegovina', true),
            choice('San Marino', false),
          ],
          explanation:
            "Spain's and Bosnia's national anthems are both instrumental, without official lyrics.",
          timeLimitSec: 20,
        },
        {
          prompt: "What is the only letter that doesn't appear in the name of any U.S. state?",
          choices: [choice('Q', true), choice('X', false), choice('Z', false), choice('J', false)],
          explanation:
            'No U.S. state name contains the letter Q, while X (Texas), Z (Arizona), and J (New Jersey) all appear.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for unrelated organisms independently evolving similar traits, like wings in bats, birds, and insects?',
          choices: [
            choice('Divergent evolution', false),
            choice('Convergent evolution', true),
            choice('Coevolution', false),
            choice('Adaptive radiation', false),
          ],
          explanation:
            'Convergent evolution produces similar features in unrelated species facing similar environmental pressures.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is unusual about the number "four" (4) in English?',
          choices: [
            choice("It's spelled with the same number of letters as its value", true),
            choice("It's the only prime number under 10", false),
            choice('It has no rhyming word', false),
            choice("It's the only number with silent letters", false),
          ],
          explanation:
            '"Four" has exactly four letters — a coincidence unique among English number names.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which country consists of over 17,000 islands, making it the largest archipelagic country in the world?',
          choices: [
            choice('Philippines', false),
            choice('Indonesia', true),
            choice('Japan', false),
            choice('Maldives', false),
          ],
          explanation:
            'Indonesia is made up of more than 17,000 islands, more than any other country.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the term for a scientist who studies fungi?',
          choices: [
            choice('Botanist', false),
            choice('Mycologist', true),
            choice('Entomologist', false),
            choice('Herpetologist', false),
          ],
          explanation: 'Mycology is the branch of biology dedicated to the study of fungi.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which U.S. states were once independent countries before joining the union?',
          choices: [
            choice('California', false),
            choice('Hawaii', false),
            choice('Texas', false),
            choice('Both Hawaii and Texas', true),
          ],
          explanation:
            'Texas was the Republic of Texas and Hawaii was the Kingdom of Hawaii before joining the United States.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'MEDIUM',
    title: 'True or Weird: Bizarre But True Facts',
    description:
      "Honey never spoils. Wombats poop cubes. This quiz covers bizarre-but-true facts that sound made up but genuinely aren't.",
    tags: ['weird facts', 'trivia', 'fun facts', 'bizarre', 'general knowledge'],
    quiz: {
      title: 'True or Weird: Bizarre But True Facts',
      description: '',
      questions: [
        {
          prompt: 'What is a group of flamingos whimsically called?',
          choices: [
            choice('A flamboyance', true),
            choice('A flock', false),
            choice('A gaggle', false),
            choice('A colony', false),
          ],
          explanation:
            '"A flamboyance" is the fun, official collective noun for a group of flamingos.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is unusual about honey as a food product?',
          choices: [
            choice('It can spoil quickly', false),
            choice('It never spoils if stored properly', true),
            choice("It's the only food made by insects", false),
            choice('It contains no sugar', false),
          ],
          explanation:
            'Edible honey has been found in ancient Egyptian tombs thousands of years old.',
          timeLimitSec: 20,
        },
        {
          prompt: 'A human sneeze can expel air at speeds up to roughly how fast?',
          choices: [
            choice('10 mph', false),
            choice('50 mph', false),
            choice('100 mph', true),
            choice('200 mph', false),
          ],
          explanation: 'Sneezes are commonly cited as reaching speeds up to around 100 mph.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is unusual about bananas, according to their botanical classification?',
          choices: [
            choice('They are technically a type of berry', true),
            choice('They are not fruit at all', false),
            choice('They grow underground', false),
            choice('They are a vegetable', false),
          ],
          explanation:
            "Botanically speaking, bananas meet the definition of a berry, unlike some fruits that don't.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a group of owls traditionally called?',
          choices: [
            choice('A parliament', true),
            choice('A flock', false),
            choice('A murder', false),
            choice('A gaggle', false),
          ],
          explanation: '"A parliament" of owls is a whimsical but genuine English collective noun.',
          timeLimitSec: 20,
        },
        {
          prompt:
            "What is unusual about an octopus's blood color, due to a copper-based molecule called hemocyanin?",
          choices: [
            choice("It's green", false),
            choice("It's blue", true),
            choice("It's colorless", false),
            choice("It's purple", false),
          ],
          explanation:
            'Octopus blood is blue because it uses copper-based hemocyanin instead of iron-based hemoglobin.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What chili pepper was certified by Guinness World Records in 2023 as the new "world\'s hottest pepper," surpassing the Carolina Reaper?',
          choices: [
            choice('Ghost Pepper', false),
            choice('Pepper X', true),
            choice('Habanero', false),
            choice('Scotch Bonnet', false),
          ],
          explanation:
            'Pepper X, bred by the same grower behind the Carolina Reaper, took the title in 2023.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is unusual about the "Immortal Jellyfish" (Turritopsis dohrnii)?',
          choices: [
            choice(
              'It can revert its cells to a juvenile state, effectively avoiding death from aging',
              true
            ),
            choice('It has no natural predators', false),
            choice("It's the largest jellyfish species", false),
            choice('It glows in the dark', false),
          ],
          explanation:
            'This jellyfish can transform back into its juvenile polyp stage, making it biologically "immortal."',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is unusual about wombat droppings, a genuinely documented biological oddity?',
          choices: [
            choice('They are cube-shaped', true),
            choice('They glow in the dark', false),
            choice('They float indefinitely', false),
            choice('They are edible', false),
          ],
          explanation:
            "A wombat's unique intestinal structure produces distinctively cube-shaped droppings.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a "group of pandas" called, a whimsical but real collective noun?',
          choices: [
            choice('An embarrassment', true),
            choice('A cuddle', false),
            choice('A bamboo', false),
            choice('A troop', false),
          ],
          explanation:
            '"An embarrassment" of pandas is a genuine, if unusual, English collective noun.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'trivia',
    difficulty: 'HARD',
    title: 'Ultimate Mixed Bag Trivia Challenge',
    description:
      'The ultimate grab-bag of hard trivia, covering flags, language quirks, geography, and more. For trivia champions who want a real challenge.',
    tags: ['trivia', 'hard trivia', 'general knowledge', 'challenge', 'mixed trivia'],
    quiz: {
      title: 'Ultimate Mixed Bag Trivia Challenge',
      description: '',
      questions: [
        {
          prompt: 'Which country has the only national flag that is not rectangular?',
          choices: [
            choice('Switzerland', false),
            choice('Nepal', true),
            choice('Vatican City', false),
            choice('Bhutan', false),
          ],
          explanation:
            "Nepal's flag is a unique double-pennant shape, unlike any other national flag.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'Switzerland has one of only two square national flags in the world. What is the other?',
          choices: [
            choice('Vatican City', true),
            choice('San Marino', false),
            choice('Monaco', false),
            choice('Liechtenstein', false),
          ],
          explanation:
            'Switzerland and Vatican City are the only countries with perfectly square national flags.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the only mammal that cannot jump?',
          choices: [
            choice('Sloth', false),
            choice('Elephant', true),
            choice('Hippopotamus', false),
            choice('Rhinoceros', false),
          ],
          explanation: "An elephant's skeletal structure and weight prevent it from jumping.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which country is famously cited as having no permanent rivers due to its extremely arid climate?',
          choices: [
            choice('Egypt', false),
            choice('Saudi Arabia', true),
            choice('Iran', false),
            choice('Libya', false),
          ],
          explanation:
            "Saudi Arabia's climate is dry enough that it has no permanently flowing rivers.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the only number in English whose letters are in alphabetical order?',
          choices: [
            choice('Six', false),
            choice('Forty', true),
            choice('One', false),
            choice('Two', false),
          ],
          explanation:
            'F-O-R-T-Y is the only cardinal number spelled with its letters in strict alphabetical order.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which of these is technically classified as a grass, despite growing over 100 feet tall in some species?',
          choices: [
            choice('Corn', false),
            choice('Bamboo', true),
            choice('Sugarcane', false),
            choice('Wheat', false),
          ],
          explanation:
            'Bamboo is a true grass, and some species are among the fastest-growing and tallest plants on Earth.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which country invented the sport of golf, as we know it today, in the 15th century?',
          choices: [
            choice('England', false),
            choice('Scotland', true),
            choice('Netherlands', false),
            choice('Ireland', false),
          ],
          explanation: 'Modern golf traces its origins to 15th-century Scotland.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is unusual about a "jiffy" as a unit of time?',
          choices: [
            choice("It's not a real unit", false),
            choice("It's an actual, specific unit of time used in physics and electronics", true),
            choice("It's exactly one minute", false),
            choice("It's a unit only used in cooking", false),
          ],
          explanation:
            'A "jiffy" has precise technical definitions in physics and electrical engineering contexts.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the specific term for a fear of Friday the 13th?',
          choices: [
            choice('Triskaidekaphobia', false),
            choice('Paraskevidekatriaphobia', true),
            choice('Arachnophobia', false),
            choice('Nyctophobia', false),
          ],
          explanation:
            'While triskaidekaphobia is fear of the number 13 generally, this longer term names the Friday-specific fear.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the only planet in our solar system not named after a Greek or Roman god?',
          choices: [
            choice('Mars', false),
            choice('Earth', true),
            choice('Venus', false),
            choice('Jupiter', false),
          ],
          explanation:
            '"Earth" derives from Old English/Germanic words for ground or soil, unlike the other planets.',
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
