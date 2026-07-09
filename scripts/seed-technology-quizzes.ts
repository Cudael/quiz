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
  // ── Programming ──────────────────────────────────────────────────────────
  {
    categorySlug: 'programming',
    difficulty: 'EASY',
    title: 'Programming Basics & Coding Terms Quiz',
    description:
      'New to coding or brushing up on the fundamentals? This quiz covers essential programming terms — variables, loops, algorithms, and debugging — in a beginner-friendly format. A great starting point before diving into your first language.',
    tags: ['programming', 'coding basics', 'computer science', 'beginner', 'software development'],
    quiz: {
      title: 'Programming Basics & Coding Terms Quiz',
      description: '',
      questions: [
        {
          prompt: 'What does "HTML" stand for?',
          choices: [
            choice('HyperText Markup Language', true),
            choice('High Tech Modern Language', false),
            choice('Hyperlink and Text Markup Language', false),
            choice('Home Tool Markup Language', false),
          ],
          explanation: 'HTML is the standard markup language used to structure content on the web.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a "bug" in programming?',
          choices: [
            choice('A type of virus', false),
            choice('An error or flaw in code', true),
            choice('A software update', false),
            choice('A programming language', false),
          ],
          explanation: 'A bug is a mistake in code that causes unexpected or incorrect behavior.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the term for a set of step-by-step instructions to solve a problem?',
          choices: [
            choice('Algorithm', true),
            choice('Variable', false),
            choice('Function', false),
            choice('Loop', false),
          ],
          explanation:
            'An algorithm is a defined sequence of steps used to solve a problem or perform a task.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which symbol commonly denotes a comment in Python code?',
          choices: [
            choice('//', false),
            choice('#', true),
            choice('**', false),
            choice('&&', false),
          ],
          explanation:
            'Python uses the # symbol to mark a line as a comment, ignored when the code runs.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a "variable" in programming?',
          choices: [
            choice('A fixed value that never changes', false),
            choice('A named storage location that holds a value', true),
            choice('A type of loop', false),
            choice('A syntax error', false),
          ],
          explanation:
            'Variables store data that a program can reference and change while it runs.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "IDE" stand for in software development?',
          choices: [
            choice('Internal Data Exchange', false),
            choice('Integrated Development Environment', true),
            choice('Interface Design Element', false),
            choice('Interactive Debug Engine', false),
          ],
          explanation:
            'An IDE is software that provides tools like a code editor, debugger, and compiler in one place.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the term for repeating a block of code multiple times?',
          choices: [
            choice('Function', false),
            choice('Loop', true),
            choice('Array', false),
            choice('Class', false),
          ],
          explanation: 'Loops let a program repeat instructions without rewriting the same code.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which programming language, created by Brendan Eich in 1995, is widely used for web development?',
          choices: [
            choice('Python', false),
            choice('JavaScript', true),
            choice('Ruby', false),
            choice('Swift', false),
          ],
          explanation:
            'JavaScript runs in web browsers and powers most interactive website behavior.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is "debugging"?',
          choices: [
            choice('Writing new code', false),
            choice('Finding and fixing errors in code', true),
            choice('Deleting a program', false),
            choice('Compiling code', false),
          ],
          explanation: 'Debugging is the process of identifying and correcting bugs in a program.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What symbol is commonly used to assign a value to a variable in most programming languages?',
          choices: [
            choice('==', false),
            choice('=', true),
            choice('!=', false),
            choice('=>', false),
          ],
          explanation:
            'A single equals sign assigns a value, while double equals typically compares values.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'programming',
    difficulty: 'MEDIUM',
    title: 'Programming Languages & Computer Science History Trivia',
    description:
      "From Ada Lovelace's first algorithm to the invention of Python and Java, this quiz covers the pioneers and milestones of computer science history. Test your knowledge of the languages and people who built modern software.",
    tags: [
      'programming',
      'computer science history',
      'programming languages',
      'coding',
      'tech trivia',
    ],
    quiz: {
      title: 'Programming Languages & Computer Science History Trivia',
      description: '',
      questions: [
        {
          prompt:
            "Who is widely credited as the first computer programmer, having written an algorithm for Charles Babbage's Analytical Engine in the 1840s?",
          choices: [
            choice('Grace Hopper', false),
            choice('Ada Lovelace', true),
            choice('Katherine Johnson', false),
            choice('Margaret Hamilton', false),
          ],
          explanation:
            'Ada Lovelace wrote what is considered the first algorithm intended for a machine.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which programming language, created by Guido van Rossum and first released in 1991, is known for its readable syntax?',
          choices: [
            choice('Java', false),
            choice('Python', true),
            choice('C++', false),
            choice('Ruby', false),
          ],
          explanation: 'Python was designed to emphasize code readability and simplicity.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "SQL" stand for?',
          choices: [
            choice('Structured Query Language', true),
            choice('Standard Query Logic', false),
            choice('System Query Language', false),
            choice('Sequential Query Language', false),
          ],
          explanation: 'SQL is used to manage and query data in relational databases.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which computer scientist helped develop early compiler concepts and popularized the term "debugging"?',
          choices: [
            choice('Alan Turing', false),
            choice('Grace Hopper', true),
            choice('John von Neumann', false),
            choice('Dennis Ritchie', false),
          ],
          explanation:
            'Grace Hopper was a pioneering computer scientist who worked on some of the earliest compilers.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which company developed the Java programming language, first released in 1995?',
          choices: [
            choice('Microsoft', false),
            choice('Sun Microsystems', true),
            choice('IBM', false),
            choice('Apple', false),
          ],
          explanation: 'Java was developed by Sun Microsystems, later acquired by Oracle.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Who is considered the father of theoretical computer science, known for proposing the "Turing Test"?',
          choices: [
            choice('John von Neumann', false),
            choice('Alan Turing', true),
            choice('Claude Shannon', false),
            choice('Charles Babbage', false),
          ],
          explanation:
            'Alan Turing laid foundational groundwork for computer science and artificial intelligence.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which language, developed at Bell Labs by Dennis Ritchie in the early 1970s, heavily influenced later languages like C++, Java, and Python?',
          choices: [
            choice('Fortran', false),
            choice('C', true),
            choice('BASIC', false),
            choice('Pascal', false),
          ],
          explanation:
            'The C programming language became a foundational influence on modern software development.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "open source" mean for software?',
          choices: [
            choice('Software that costs money to use', false),
            choice(
              'Software whose source code is publicly available to view, modify, and distribute',
              true
            ),
            choice('Software that only runs offline', false),
            choice('Software made by a single company', false),
          ],
          explanation:
            'Open-source software allows anyone to inspect, modify, and share its underlying code.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which markup language, not a programming language, is used to structure content on the web?',
          choices: [
            choice('Python', false),
            choice('HTML', true),
            choice('Java', false),
            choice('SQL', false),
          ],
          explanation:
            'HTML defines the structure of web pages but lacks the logic features of a programming language.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes converting human-readable source code into machine-executable code?',
          choices: [
            choice('Debugging', false),
            choice('Compiling', true),
            choice('Formatting', false),
            choice('Encrypting', false),
          ],
          explanation:
            'A compiler translates source code into a form a computer can directly execute.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── Internet & Web ───────────────────────────────────────────────────────
  {
    categorySlug: 'internet',
    difficulty: 'EASY',
    title: 'Internet Basics: How the Web Works Quiz',
    description:
      'Ever wondered what a URL, IP address, or browser actually does? This quiz breaks down the basic building blocks of the internet in simple terms. Perfect for anyone who wants to understand the web a little better.',
    tags: ['internet', 'web basics', 'how the internet works', 'technology basics', 'beginner'],
    quiz: {
      title: 'Internet Basics: How the Web Works Quiz',
      description: '',
      questions: [
        {
          prompt: 'What does "URL" stand for?',
          choices: [
            choice('Uniform Resource Locator', true),
            choice('Universal Reference Link', false),
            choice('User Response Log', false),
            choice('Unified Resource Language', false),
          ],
          explanation: 'A URL is the address used to locate a specific resource on the internet.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a "web browser"?',
          choices: [
            choice('A type of computer virus', false),
            choice('Software used to access and view websites', true),
            choice('A programming language', false),
            choice('A type of internet cable', false),
          ],
          explanation: 'Browsers like Chrome and Firefox let users navigate and display websites.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "WWW" stand for?',
          choices: [
            choice('World Wide Web', true),
            choice('World Wide Wire', false),
            choice('Web Wide World', false),
            choice('Wide World Web', false),
          ],
          explanation:
            '"WWW" refers to the interconnected system of web pages accessible via the internet.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for the address that identifies a device on a network, such as the internet?',
          choices: [
            choice('URL', false),
            choice('IP address', true),
            choice('HTML tag', false),
            choice('Domain name', false),
          ],
          explanation: 'An IP address uniquely identifies a device connected to a network.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "Wi-Fi" primarily allow devices to do?',
          choices: [
            choice('Charge wirelessly', false),
            choice('Connect to a network wirelessly', true),
            choice('Print documents', false),
            choice('Store data', false),
          ],
          explanation:
            'Wi-Fi lets devices connect to a local network and the internet without cables.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is an "email"?',
          choices: [
            choice('A type of website', false),
            choice('An electronic message sent over the internet', true),
            choice('A web browser', false),
            choice('A type of virus', false),
          ],
          explanation: 'Email is a method of exchanging digital messages over a network.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "www.example.com" represent in a web address?',
          choices: [
            choice('An IP address', false),
            choice('A domain name', true),
            choice('A file path', false),
            choice('A search engine', false),
          ],
          explanation: 'A domain name is the human-readable address used to reach a website.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a "search engine"?',
          choices: [
            choice('A tool used to find information on the web', true),
            choice('A type of computer virus', false),
            choice('A programming language', false),
            choice('A type of internet cable', false),
          ],
          explanation:
            'Search engines like Google index and retrieve web content based on user queries.',
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
          explanation: 'HTTP is the protocol used to transmit web pages across the internet.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the "cloud" in the context of cloud computing?',
          choices: [
            choice('A type of weather-tracking software', false),
            choice(
              'Storing and accessing data or programs over the internet rather than a local computer',
              true
            ),
            choice('A wireless connection type', false),
            choice('A type of malware', false),
          ],
          explanation:
            'Cloud computing lets users store and process data on remote servers accessed via the internet.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'internet',
    difficulty: 'MEDIUM',
    title: 'Web History & Internet Milestones Trivia',
    description:
      "From Tim Berners-Lee's invention of the web to the rise of Google and Facebook, this quiz tests your knowledge of the internet's biggest milestones. Great for anyone curious about how the modern web came to be.",
    tags: ['internet history', 'world wide web', 'tech history', 'internet trivia', 'web'],
    quiz: {
      title: 'Web History & Internet Milestones Trivia',
      description: '',
      questions: [
        {
          prompt: 'Who is credited with inventing the World Wide Web in 1989?',
          choices: [
            choice('Bill Gates', false),
            choice('Tim Berners-Lee', true),
            choice('Vint Cerf', false),
            choice('Marc Andreessen', false),
          ],
          explanation: 'Tim Berners-Lee invented the Web while working at CERN in 1989.',
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
          explanation: 'NCSA Mosaic helped bring the World Wide Web to a mainstream audience.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which protocol, developed in the 1970s, forms the basic communication framework of the internet?',
          choices: [
            choice('HTTP', false),
            choice('TCP/IP', true),
            choice('FTP', false),
            choice('SMTP', false),
          ],
          explanation:
            'TCP/IP defines how data is packaged and routed across networks, including the internet.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which company launched the search engine that came to dominate the market in the late 1990s and 2000s?',
          choices: [
            choice('Yahoo', false),
            choice('Google', true),
            choice('Bing', false),
            choice('AltaVista', false),
          ],
          explanation:
            "Google's search algorithm and simplicity helped it overtake earlier search engines.",
          timeLimitSec: 20,
        },
        {
          prompt: 'In what year was Google founded?',
          choices: [
            choice('1994', false),
            choice('1998', true),
            choice('2001', false),
            choice('2004', false),
          ],
          explanation: 'Google was founded by Larry Page and Sergey Brin in 1998.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which social media platform, launched in 2004 by Mark Zuckerberg, started as a network for college students?',
          choices: [
            choice('Twitter', false),
            choice('Facebook', true),
            choice('MySpace', false),
            choice('LinkedIn', false),
          ],
          explanation:
            'Facebook began at Harvard before expanding to other universities and the public.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What does "ISP" stand for, referring to a company that provides internet access?',
          choices: [
            choice('Internet Service Provider', true),
            choice('Internal System Protocol', false),
            choice('Information Sharing Platform', false),
            choice('Internet Security Protocol', false),
          ],
          explanation: 'An ISP connects homes and businesses to the internet.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which early social networking site, popular in the mid-2000s for customizable profile pages, was eventually overtaken by Facebook?',
          choices: [
            choice('Friendster', false),
            choice('MySpace', true),
            choice('Bebo', false),
            choice('Orkut', false),
          ],
          explanation: "MySpace was the dominant social network before Facebook's rapid growth.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for a malicious attempt to trick users into revealing sensitive information via fake emails or websites?',
          choices: [
            choice('Spam', false),
            choice('Phishing', true),
            choice('Malware', false),
            choice('Firewall', false),
          ],
          explanation:
            'Phishing attacks impersonate trusted sources to steal personal information.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "VPN" stand for?',
          choices: [
            choice('Virtual Private Network', true),
            choice('Verified Public Network', false),
            choice('Virtual Personal Node', false),
            choice('Variable Protocol Network', false),
          ],
          explanation: "A VPN encrypts a user's internet connection and can mask their location.",
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── AI & Machine Learning ────────────────────────────────────────────────
  {
    categorySlug: 'ai',
    difficulty: 'EASY',
    title: 'AI Basics: Key Terms & Concepts Quiz',
    description:
      'AI is everywhere — but do you know your neural networks from your natural language processing? This quiz breaks down the essential terms and concepts behind modern artificial intelligence in plain language.',
    tags: [
      'artificial intelligence',
      'ai basics',
      'machine learning',
      'chatgpt',
      'technology basics',
    ],
    quiz: {
      title: 'AI Basics: Key Terms & Concepts Quiz',
      description: '',
      questions: [
        {
          prompt: 'What does "AI" stand for?',
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
          prompt: 'What is "machine learning"?',
          choices: [
            choice('Manually programming every possible outcome', false),
            choice(
              'A method that allows computers to learn patterns from data without being explicitly programmed',
              true
            ),
            choice('A type of computer hardware', false),
            choice('A programming language', false),
          ],
          explanation:
            'Machine learning systems improve at tasks by learning from data rather than fixed rules.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a "chatbot"?',
          choices: [
            choice('A physical robot', false),
            choice('A computer program designed to simulate conversation with users', true),
            choice('A type of computer virus', false),
            choice('A search engine', false),
          ],
          explanation: 'Chatbots use AI or scripted rules to respond to users in natural language.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes AI systems designed to recognize patterns in images, such as identifying faces or objects?',
          choices: [
            choice('Natural language processing', false),
            choice('Computer vision', true),
            choice('Robotics', false),
            choice('Data mining', false),
          ],
          explanation:
            'Computer vision enables machines to interpret and understand visual information.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes the field of AI focused on understanding and generating human language?',
          choices: [
            choice('Computer vision', false),
            choice('Natural language processing (NLP)', true),
            choice('Robotics', false),
            choice('Cryptography', false),
          ],
          explanation: 'NLP powers tools like chatbots, translators, and text summarizers.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a "neural network" loosely inspired by?',
          choices: [
            choice('The human brain', true),
            choice("A computer's hard drive", false),
            choice('The internet', false),
            choice('A spreadsheet', false),
          ],
          explanation:
            'Neural networks are modeled loosely on how neurons connect and process signals in the brain.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is "training data" used for in machine learning?',
          choices: [
            choice('Testing internet speed', false),
            choice("Teaching a model to recognize patterns before it's used", true),
            choice('Storing user passwords', false),
            choice('Formatting text', false),
          ],
          explanation:
            'Models learn patterns by analyzing large sets of labeled or unlabeled training data.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes an AI generating new content, like text or images, based on patterns it has learned?',
          choices: [
            choice('Generative AI', true),
            choice('Static AI', false),
            choice('Manual AI', false),
            choice('Rule-based AI', false),
          ],
          explanation:
            'Generative AI models produce new outputs rather than just classifying existing data.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which well-known AI chatbot, developed by OpenAI, was released to the public in November 2022?',
          choices: [
            choice('Siri', false),
            choice('ChatGPT', true),
            choice('Alexa', false),
            choice('Cortana', false),
          ],
          explanation: "ChatGPT's public release brought conversational AI to a mass audience.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes an AI confidently generating false or fabricated information?',
          choices: [
            choice('A crash', false),
            choice('A hallucination', true),
            choice('A glitch', false),
            choice('A bug', false),
          ],
          explanation:
            'AI hallucinations occur when a model generates plausible-sounding but incorrect content.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'ai',
    difficulty: 'MEDIUM',
    title: 'AI History & Machine Learning Milestones Trivia',
    description:
      "From Alan Turing's famous test to AlphaGo's historic Go victory and the rise of ChatGPT, this quiz covers the pivotal moments in AI history. Test your knowledge of the breakthroughs that shaped modern machine learning.",
    tags: [
      'artificial intelligence',
      'ai history',
      'machine learning',
      'deep learning',
      'tech trivia',
    ],
    quiz: {
      title: 'AI History & Machine Learning Milestones Trivia',
      description: '',
      questions: [
        {
          prompt:
            'Who proposed the "Turing Test" in 1950 as a way to evaluate a machine\'s ability to exhibit intelligent behavior?',
          choices: [
            choice('John McCarthy', false),
            choice('Alan Turing', true),
            choice('Marvin Minsky', false),
            choice('Claude Shannon', false),
          ],
          explanation:
            'Turing proposed the test in his paper "Computing Machinery and Intelligence."',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Who is credited with coining the term "artificial intelligence" at a 1956 conference at Dartmouth College?',
          choices: [
            choice('Alan Turing', false),
            choice('John McCarthy', true),
            choice('Herbert Simon', false),
            choice('Norbert Wiener', false),
          ],
          explanation:
            'John McCarthy coined the term and helped organize the founding Dartmouth Conference.',
          timeLimitSec: 20,
        },
        {
          prompt: "In 1997, IBM's Deep Blue made history by defeating which world chess champion?",
          choices: [
            choice('Bobby Fischer', false),
            choice('Garry Kasparov', true),
            choice('Magnus Carlsen', false),
            choice('Anatoly Karpov', false),
          ],
          explanation:
            "Deep Blue's 1997 victory over Kasparov was a landmark moment for AI in games.",
          timeLimitSec: 20,
        },
        {
          prompt:
            "In 2016, Google DeepMind's AlphaGo made headlines by defeating a world champion in which board game?",
          choices: [
            choice('Chess', false),
            choice('Go', true),
            choice('Shogi', false),
            choice('Checkers', false),
          ],
          explanation:
            "AlphaGo defeated Lee Sedol, a feat once thought decades away due to Go's complexity.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which influential 2017 research paper introduced the "transformer" architecture underlying most modern large language models?',
          choices: [
            choice('"Attention Is All You Need"', true),
            choice('"A Mathematical Theory of Communication"', false),
            choice('"Learning Representations by Back-Propagating Errors"', false),
            choice('"ImageNet Classification"', false),
          ],
          explanation:
            'The transformer architecture from this Google paper became the foundation for models like GPT.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "GPT" stand for in models like ChatGPT?',
          choices: [
            choice('General Purpose Technology', false),
            choice('Generative Pre-trained Transformer', true),
            choice('Global Processing Tool', false),
            choice('Guided Prediction Technique', false),
          ],
          explanation:
            'GPT models are pre-trained on large amounts of text and generate language based on that training.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which company developed AlphaGo, the program that defeated professional Go player Lee Sedol?',
          choices: [
            choice('OpenAI', false),
            choice('DeepMind', true),
            choice('Meta AI', false),
            choice('Microsoft Research', false),
          ],
          explanation: 'DeepMind, a Google-owned AI research lab, developed AlphaGo.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes a period of reduced funding and interest in AI research, notably in the 1970s and late 1980s?',
          choices: [
            choice('AI summer', false),
            choice('AI winter', true),
            choice('AI freeze', false),
            choice('AI drought', false),
          ],
          explanation:
            '"AI winters" occurred when hyped expectations outpaced actual technical progress.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which company released the AI chatbot ChatGPT in November 2022?',
          choices: [
            choice('Google', false),
            choice('OpenAI', true),
            choice('Microsoft', false),
            choice('Meta', false),
          ],
          explanation: "ChatGPT's release sparked widespread mainstream interest in generative AI.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes training a machine learning model using labeled examples where the correct answer is already known?',
          choices: [
            choice('Unsupervised learning', false),
            choice('Supervised learning', true),
            choice('Reinforcement learning', false),
            choice('Deep learning', false),
          ],
          explanation:
            'Supervised learning trains models on input-output pairs with known correct answers.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── Gadgets & Hardware ───────────────────────────────────────────────────
  {
    categorySlug: 'gadgets',
    difficulty: 'EASY',
    title: 'Gadgets & Hardware Basics Quiz',
    description:
      'From CPUs and RAM to smartphones and Bluetooth, this quiz covers the everyday tech terms and gadgets that power modern life. A friendly, beginner-level primer on how your devices actually work.',
    tags: ['gadgets', 'hardware', 'tech basics', 'smartphones', 'beginner'],
    quiz: {
      title: 'Gadgets & Hardware Basics Quiz',
      description: '',
      questions: [
        {
          prompt: 'What does "CPU" stand for?',
          choices: [
            choice('Central Process Unit', false),
            choice('Central Processing Unit', true),
            choice('Computer Personal Unit', false),
            choice('Central Processor Utility', false),
          ],
          explanation: "The CPU executes the instructions that run a computer's programs.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'What component of a computer is often called its "brain," responsible for executing instructions?',
          choices: [
            choice('Hard drive', false),
            choice('CPU', true),
            choice('Monitor', false),
            choice('Keyboard', false),
          ],
          explanation:
            "The CPU processes instructions and coordinates the rest of the computer's hardware.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "RAM" stand for?',
          choices: [
            choice('Random Access Memory', true),
            choice('Read Access Memory', false),
            choice('Rapid Application Module', false),
            choice('Remote Access Memory', false),
          ],
          explanation: 'RAM lets a computer quickly access data it needs while running programs.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the primary function of RAM in a computer?',
          choices: [
            choice('Permanently storing files', false),
            choice('Temporarily storing data the CPU is actively using', true),
            choice('Displaying images', false),
            choice('Connecting to Wi-Fi', false),
          ],
          explanation:
            'Unlike storage drives, RAM holds data only while the computer is powered on and in use.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What company created the iPhone?',
          choices: [
            choice('Samsung', false),
            choice('Google', false),
            choice('Apple', true),
            choice('Microsoft', false),
          ],
          explanation: 'Apple released the first iPhone in 2007.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "GB" commonly stand for when referring to storage or memory size?',
          choices: [
            choice('Gigabyte', true),
            choice('Global Byte', false),
            choice('General Bit', false),
            choice('Graphics Base', false),
          ],
          explanation: 'A gigabyte is a common unit for measuring digital storage capacity.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What type of cable is commonly used to connect monitors and TVs with high-definition video and audio?',
          choices: [
            choice('USB', false),
            choice('HDMI', true),
            choice('Ethernet', false),
            choice('VGA only', false),
          ],
          explanation:
            'HDMI cables carry both high-definition video and audio over a single connector.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a "smartphone"?',
          choices: [
            choice('A basic phone that can only make calls', false),
            choice(
              'A mobile phone with advanced computing capability, internet access, and apps',
              true
            ),
            choice('A type of landline', false),
            choice('A computer monitor', false),
          ],
          explanation:
            'Smartphones combine phone functions with computing power, apps, and internet connectivity.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "Bluetooth" allow devices to do?',
          choices: [
            choice('Charge wirelessly', false),
            choice('Connect and exchange data over short distances wirelessly', true),
            choice('Access the internet', false),
            choice('Print documents', false),
          ],
          explanation:
            'Bluetooth is a short-range wireless standard used to connect devices like headphones and speakers.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a "touchscreen"?',
          choices: [
            choice('A screen that responds to touch input', true),
            choice('A screen that only displays text', false),
            choice('A type of keyboard', false),
            choice('A wireless charging pad', false),
          ],
          explanation:
            'Touchscreens let users interact directly with a device by tapping or swiping the display.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'gadgets',
    difficulty: 'MEDIUM',
    title: 'Tech Gadgets Through History Trivia',
    description:
      "From the Sony Walkman to the first iPhone, this quiz traces the evolution of the gadgets that changed how we live. Test your knowledge of the devices and companies behind tech's biggest breakthroughs.",
    tags: ['gadgets history', 'tech history', 'iphone', 'consumer electronics', 'tech trivia'],
    quiz: {
      title: 'Tech Gadgets Through History Trivia',
      description: '',
      questions: [
        {
          prompt: 'Which company released the first iPhone in 2007?',
          choices: [
            choice('Samsung', false),
            choice('Apple', true),
            choice('Nokia', false),
            choice('BlackBerry', false),
          ],
          explanation:
            'The original iPhone launched in June 2007, reshaping the smartphone industry.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What was the first portable, commercially successful personal cassette music player, released by Sony in 1979?',
          choices: [
            choice('Discman', false),
            choice('Walkman', true),
            choice('iPod', false),
            choice('Boombox', false),
          ],
          explanation: 'The Sony Walkman popularized portable, personal music listening.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which company released the first widely successful tablet computer, the iPad, in 2010?',
          choices: [
            choice('Microsoft', false),
            choice('Apple', true),
            choice('Samsung', false),
            choice('Amazon', false),
          ],
          explanation: 'The iPad helped popularize the modern tablet form factor.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What was the name of the first commercially available mobile phone, released by Motorola in 1983?',
          choices: [
            choice('Motorola StarTAC', false),
            choice('Motorola DynaTAC 8000X', true),
            choice('Nokia 3310', false),
            choice('Motorola RAZR', false),
          ],
          explanation: 'The DynaTAC 8000X was the first handheld mobile phone sold to consumers.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which company created the Kindle e-reader?',
          choices: [
            choice('Apple', false),
            choice('Amazon', true),
            choice('Barnes & Noble', false),
            choice('Google', false),
          ],
          explanation: 'Amazon released the first Kindle e-reader in 2007.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What was the first Apple product called "iPod," released in 2001?',
          choices: [
            choice('A smartphone', false),
            choice('A portable digital music player', true),
            choice('A tablet', false),
            choice('A laptop', false),
          ],
          explanation: 'The original iPod let users carry a large music library in their pocket.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which company is known for developing PlayStation VR alongside its gaming consoles?',
          choices: [
            choice('Microsoft', false),
            choice('Sony', true),
            choice('Nintendo', false),
            choice('Valve', false),
          ],
          explanation:
            'Sony developed PlayStation VR as a virtual reality accessory for its console line.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes everyday objects (like watches or thermostats) that connect to the internet?',
          choices: [
            choice('Cloud computing', false),
            choice('Internet of Things (IoT)', true),
            choice('Virtual reality', false),
            choice('Cybersecurity', false),
          ],
          explanation:
            'IoT refers to the network of physical devices that collect and exchange data online.',
          timeLimitSec: 20,
        },
        {
          prompt:
            "Which company's smartwatch, first released in 2015, became one of the best-selling wearables in the world?",
          choices: [
            choice('Samsung Galaxy Watch', false),
            choice('Apple Watch', true),
            choice('Fitbit', false),
            choice('Garmin', false),
          ],
          explanation: 'The Apple Watch quickly became a dominant player in the smartwatch market.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What was the nickname for the massive, room-sized computers used in the mid-20th century before miniaturization?',
          choices: [
            choice('Microcomputers', false),
            choice('Mainframes', true),
            choice('Laptops', false),
            choice('Terminals', false),
          ],
          explanation:
            'Early mainframes filled entire rooms and required specialized facilities to operate.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── Gaming Tech ──────────────────────────────────────────────────────────
  {
    categorySlug: 'video-games-tech',
    difficulty: 'EASY',
    title: 'Gaming Tech Basics: Engines & Hardware Quiz',
    description:
      'What actually powers your favorite video games? This quiz covers the basics of game engines, GPUs, frame rates, and other tech behind the games you play. A great primer for aspiring developers and curious gamers.',
    tags: ['gaming tech', 'game engines', 'gpu', 'gaming hardware', 'beginner'],
    quiz: {
      title: 'Gaming Tech Basics: Engines & Hardware Quiz',
      description: '',
      questions: [
        {
          prompt: 'What is a "game engine"?',
          choices: [
            choice('A physical part of a gaming console', false),
            choice('Software framework used to build and run video games', true),
            choice('A type of controller', false),
            choice('An internet connection type', false),
          ],
          explanation:
            'Game engines provide developers with reusable tools for rendering, physics, and more.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What term describes the number of frames displayed per second in a video game?',
          choices: [
            choice('Resolution', false),
            choice('Frame rate (FPS)', true),
            choice('Latency', false),
            choice('Bit rate', false),
          ],
          explanation: 'A higher frame rate generally makes motion look smoother on screen.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "GPU" stand for, a key hardware component for rendering graphics?',
          choices: [
            choice('General Processing Unit', false),
            choice('Graphics Processing Unit', true),
            choice('Game Processing Utility', false),
            choice('Graphic Program Unit', false),
          ],
          explanation:
            'GPUs are specialized processors designed to render images and video efficiently.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is "ray tracing" in gaming graphics?',
          choices: [
            choice('A networking protocol', false),
            choice('A rendering technique that simulates realistic lighting and reflections', true),
            choice('A type of controller input', false),
            choice('A save file format', false),
          ],
          explanation:
            'Ray tracing traces the path of simulated light rays to create realistic lighting effects.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does "VR" stand for in gaming?',
          choices: [
            choice('Video Rendering', false),
            choice('Virtual Reality', true),
            choice('Visual Response', false),
            choice('Variable Resolution', false),
          ],
          explanation: 'VR immerses players in a simulated 3D environment, usually via a headset.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is "input lag" in gaming?',
          choices: [
            choice('A delay between pressing a button and seeing the result on screen', true),
            choice('A type of graphics setting', false),
            choice('A multiplayer connection type', false),
            choice('A save file corruption', false),
          ],
          explanation:
            'Lower input lag means actions register on screen more instantly after a button press.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which company develops the widely-used "Unreal Engine," used in many major video games?',
          choices: [
            choice('Unity Technologies', false),
            choice('Epic Games', true),
            choice('Valve', false),
            choice('id Software', false),
          ],
          explanation: 'Epic Games has developed Unreal Engine since the late 1990s.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In gaming, "FPS" commonly refers to which two different things?',
          choices: [
            choice('Frames Per Second and First-Person Shooter', true),
            choice('Final Player Score', false),
            choice('Fast Processing System', false),
            choice('Full Player Simulation', false),
          ],
          explanation:
            'FPS is both a performance metric (frames per second) and a game genre (first-person shooter).',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is "cloud gaming"?',
          choices: [
            choice(
              'Playing games stored and processed on remote servers, streamed to your device',
              true
            ),
            choice('Playing games only with an internet-connected controller', false),
            choice('A type of game genre', false),
            choice('A gaming chair brand', false),
          ],
          explanation:
            'Cloud gaming runs the game on remote hardware and streams the video to the player.',
          timeLimitSec: 20,
        },
        {
          prompt:
            "What term describes a game's software being updated after release to fix bugs or add content?",
          choices: [
            choice('A patch', true),
            choice('A crash', false),
            choice('A mod', false),
            choice('A port', false),
          ],
          explanation:
            'Patches are updates developers release to fix issues or add new features post-launch.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'video-games-tech',
    difficulty: 'MEDIUM',
    title: 'Game Engines & Gaming Hardware History Trivia',
    description:
      "From Doom's early 3D engine to Unreal Engine and modern ray tracing, this quiz dives into the technology behind video game development. Test your knowledge of the engines, hardware, and innovations that shaped gaming.",
    tags: ['gaming tech', 'game engines', 'gaming hardware', 'ray tracing', 'tech history'],
    quiz: {
      title: 'Game Engines & Gaming Hardware History Trivia',
      description: '',
      questions: [
        {
          prompt:
            'Which game engine, developed by Unity Technologies and first released in 2005, is one of the most widely used engines for indie and mobile development?',
          choices: [
            choice('Unreal Engine', false),
            choice('Unity', true),
            choice('CryEngine', false),
            choice('Godot', false),
          ],
          explanation: 'Unity became especially popular for indie and mobile game development.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which company develops graphics processing technology and GPUs widely used for both gaming and AI computing?',
          choices: [
            choice('Intel', false),
            choice('NVIDIA', true),
            choice('IBM', false),
            choice('Texas Instruments', false),
          ],
          explanation:
            'NVIDIA is a leading maker of GPUs used across gaming and modern AI workloads.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What was the name of the first widely successful home video game console, released by Atari in 1977?',
          choices: [
            choice('Atari 2600', true),
            choice('Magnavox Odyssey', false),
            choice('ColecoVision', false),
            choice('Intellivision', false),
          ],
          explanation: 'The Atari 2600 popularized cartridge-based home gaming consoles.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which game engine, developed by Epic Games, powers many AAA titles and is known for high-fidelity graphics?',
          choices: [
            choice('Unity', false),
            choice('Unreal Engine', true),
            choice('Source Engine', false),
            choice('Frostbite', false),
          ],
          explanation: 'Unreal Engine is widely used across the AAA game development industry.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What technology, popularized in modern GPUs, uses AI to upscale lower-resolution images to look sharper at higher resolutions?',
          choices: [
            choice('Ray tracing', false),
            choice('DLSS (Deep Learning Super Sampling)', true),
            choice('Anti-aliasing', false),
            choice('V-Sync', false),
          ],
          explanation: 'DLSS uses AI models to boost performance while maintaining visual quality.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which company developed the "Source Engine," used in games like Half-Life 2 and Counter-Strike?',
          choices: [
            choice('Epic Games', false),
            choice('Valve', true),
            choice('id Software', false),
            choice('Bethesda', false),
          ],
          explanation:
            'Valve built the Source Engine and has used it across many of its flagship titles.',
          timeLimitSec: 20,
        },
        {
          prompt:
            "What term describes technology designed to reduce screen tearing by syncing frame rate with a monitor's refresh rate?",
          choices: [
            choice('Anti-aliasing', false),
            choice('V-Sync', true),
            choice('Ray tracing', false),
            choice('Overclocking', false),
          ],
          explanation:
            "V-Sync synchronizes a game's frame output with the display's refresh rate to prevent tearing.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which id Software game, released in 1993, is widely credited with popularizing the first-person shooter genre and pioneering early 3D engines?',
          choices: [
            choice('Wolfenstein 3D', false),
            choice('Doom', true),
            choice('Quake', false),
            choice('Half-Life', false),
          ],
          explanation:
            "Doom's engine and design became a template for the FPS genre that followed.",
          timeLimitSec: 20,
        },
        {
          prompt:
            "What term describes increasing a computer component's clock speed beyond its factory setting to boost performance?",
          choices: [
            choice('Underclocking', false),
            choice('Overclocking', true),
            choice('Throttling', false),
            choice('Rendering', false),
          ],
          explanation:
            'Overclocking pushes hardware beyond its default speed, often to improve gaming performance.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes technology that provides physical feedback, like vibration, to a game controller during gameplay?',
          choices: [
            choice('Haptic feedback', true),
            choice('Ray tracing', false),
            choice('Anti-aliasing', false),
            choice('Frame pacing', false),
          ],
          explanation:
            'Haptic feedback lets controllers simulate physical sensations tied to on-screen events.',
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
