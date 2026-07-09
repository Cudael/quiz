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
  // ── Video Games ──────────────────────────────────────────────────────────
  {
    categorySlug: 'video-games',
    difficulty: 'EASY',
    title: 'Video Game Basics & Iconic Consoles Quiz',
    description:
      'New to gaming or want to test the basics? This quiz covers iconic consoles, gaming terms, and the characters and companies that shaped the industry — from Mario to PlayStation. A fun starting point for casual and lifelong gamers alike.',
    tags: ['video games', 'gaming basics', 'consoles', 'nintendo', 'playstation'],
    quiz: {
      title: 'Video Game Basics & Iconic Consoles Quiz',
      description: '',
      questions: [
        {
          prompt: "Which Italian plumber is Nintendo's most famous video game character?",
          choices: [
            choice('Luigi', false),
            choice('Mario', true),
            choice('Wario', false),
            choice('Yoshi', false),
          ],
          explanation: "Mario has been Nintendo's flagship mascot since his debut in 1981.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What does the acronym "RPG" stand for in gaming?',
          choices: [
            choice('Real Player Game', false),
            choice('Role-Playing Game', true),
            choice('Rapid Play Grid', false),
            choice('Random Play Generator', false),
          ],
          explanation: 'RPGs let players control characters that grow and develop through a story.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which company created the PlayStation console?',
          choices: [
            choice('Microsoft', false),
            choice('Nintendo', false),
            choice('Sony', true),
            choice('Sega', false),
          ],
          explanation: 'Sony released the original PlayStation in 1994.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the name of the blue hedgehog mascot created by Sega?',
          choices: [
            choice('Tails', false),
            choice('Knuckles', false),
            choice('Sonic', true),
            choice('Shadow', false),
          ],
          explanation: "Sonic the Hedgehog debuted in 1991 as Sega's answer to Mario.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Which company developed and published the Xbox console?',
          choices: [
            choice('Sony', false),
            choice('Nintendo', false),
            choice('Microsoft', true),
            choice('Atari', false),
          ],
          explanation: 'Microsoft entered the console market with the original Xbox in 2001.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What term describes a game genre focused on solving puzzles to progress?',
          choices: [
            choice('Puzzle game', true),
            choice('Platformer', false),
            choice('Shooter', false),
            choice('Simulation', false),
          ],
          explanation:
            'Puzzle games challenge players with logic, pattern, or spatial-reasoning problems.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In Minecraft, what material is used to craft the very first basic tools?',
          choices: [
            choice('Stone', false),
            choice('Wood', true),
            choice('Iron', false),
            choice('Diamond', false),
          ],
          explanation:
            'Players start by crafting wooden tools before progressing to stone and metal.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which company created the long-running "The Legend of Zelda" franchise?',
          choices: [
            choice('Sony', false),
            choice('Nintendo', true),
            choice('Capcom', false),
            choice('Square Enix', false),
          ],
          explanation: 'Nintendo has published the Zelda series since its 1986 debut.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What genre is the "Call of Duty" series primarily known for?',
          choices: [
            choice('Racing', false),
            choice('First-person shooter', true),
            choice('Puzzle', false),
            choice('Sports', false),
          ],
          explanation:
            'Call of Duty is one of the best-selling first-person shooter franchises ever made.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is it called when multiple people play a game together over the internet?',
          choices: [
            choice('Single-player', false),
            choice('Online multiplayer', true),
            choice('Offline co-op', false),
            choice('Sandbox mode', false),
          ],
          explanation:
            'Online multiplayer lets players connect and compete or cooperate over the internet.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'video-games',
    difficulty: 'MEDIUM',
    title: 'Video Game History & Legendary Titles Trivia',
    description:
      "Explore gaming history's biggest milestones, from Pong and Tetris to Fortnite and The Elder Scrolls. This quiz tests your knowledge of the games, studios, and moments that defined video game culture.",
    tags: ['video games', 'gaming history', 'retro games', 'game trivia', 'esports'],
    quiz: {
      title: 'Video Game History & Legendary Titles Trivia',
      description: '',
      questions: [
        {
          prompt:
            'Which 1985 Nintendo game is credited with helping revive the video game industry after the 1983 crash?',
          choices: [
            choice('Pac-Man', false),
            choice('Super Mario Bros.', true),
            choice('The Legend of Zelda', false),
            choice('Donkey Kong', false),
          ],
          explanation:
            'Super Mario Bros. helped restore consumer confidence in home consoles worldwide.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What was the first commercially successful video game, released by Atari in 1972?',
          choices: [
            choice('Space Invaders', false),
            choice('Pong', true),
            choice('Pac-Man', false),
            choice('Tetris', false),
          ],
          explanation:
            'Pong, a simple tennis simulation, launched the commercial video game industry.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which puzzle game, created by Alexey Pajitnov in 1984, remains one of the best-selling video games of all time?',
          choices: [
            choice('Tetris', true),
            choice('Candy Crush', false),
            choice('Bejeweled', false),
            choice('Minesweeper', false),
          ],
          explanation: 'Tetris was created in the Soviet Union and became a worldwide phenomenon.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which game series follows Master Chief in a war against an alien alliance called the Covenant?',
          choices: [
            choice('Gears of War', false),
            choice('Halo', true),
            choice('Call of Duty', false),
            choice('Destiny', false),
          ],
          explanation:
            'Halo, launched in 2001, helped define the first-person shooter genre on consoles.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the name of the massively popular battle royale game released by Epic Games in 2017?',
          choices: [
            choice('PUBG', false),
            choice('Apex Legends', false),
            choice('Fortnite', true),
            choice('Warzone', false),
          ],
          explanation:
            'Fortnite became a cultural phenomenon well beyond gaming after its 2017 release.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which company developed the "Grand Theft Auto" series?',
          choices: [
            choice('Ubisoft', false),
            choice('Rockstar Games', true),
            choice('EA', false),
            choice('Activision', false),
          ],
          explanation: 'Rockstar Games has developed the GTA series since its 1997 debut.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What year was the original PlayStation console released?',
          choices: [
            choice('1992', false),
            choice('1994', true),
            choice('1996', false),
            choice('1998', false),
          ],
          explanation: 'Sony launched the original PlayStation in Japan in December 1994.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which 2011 open-world RPG, part of "The Elder Scrolls" series, is set in the fictional province of Skyrim?',
          choices: [
            choice('Skyrim', true),
            choice('Oblivion', false),
            choice('Morrowind', false),
            choice('Fallout', false),
          ],
          explanation:
            'The Elder Scrolls V: Skyrim became one of the most influential RPGs of its generation.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which esports game, developed by Riot Games, is one of the most-played multiplayer online battle arena (MOBA) titles?',
          choices: [
            choice('Dota 2', false),
            choice('League of Legends', true),
            choice('Overwatch', false),
            choice('Valorant', false),
          ],
          explanation:
            'League of Legends, released in 2009, became one of the biggest esports titles in the world.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Pac-Man, released in 1980, was originally developed in which country?',
          choices: [
            choice('United States', false),
            choice('Japan', true),
            choice('South Korea', false),
            choice('United Kingdom', false),
          ],
          explanation:
            'Pac-Man was created by Namco in Japan and became a global arcade sensation.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── TV Shows ─────────────────────────────────────────────────────────────
  {
    categorySlug: 'tv-shows',
    difficulty: 'EASY',
    title: 'Classic TV Shows Trivia: Sitcoms & Icons',
    description:
      'From Central Perk to Springfield, this quiz covers the beloved sitcoms and classic shows that shaped TV culture. Test your knowledge of Friends, The Simpsons, The Office, and more fan-favorite series.',
    tags: ['tv shows', 'sitcoms', 'classic tv', 'pop culture', 'television'],
    quiz: {
      title: 'Classic TV Shows Trivia: Sitcoms & Icons',
      description: '',
      questions: [
        {
          prompt: '"Friends" is set primarily in which U.S. city?',
          choices: [
            choice('Los Angeles', false),
            choice('Chicago', false),
            choice('New York City', true),
            choice('Boston', false),
          ],
          explanation: 'The show follows six friends living in and around Manhattan.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the name of the coffee shop where the "Friends" characters often hang out?',
          choices: [
            choice('Central Perk', true),
            choice('The Grind', false),
            choice('Java Junction', false),
            choice('The Daily Grind', false),
          ],
          explanation:
            "Central Perk is the fictional coffeehouse that serves as the show's main hangout.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Which animated sitcom follows the Simpson family in the town of Springfield?',
          choices: [
            choice('Family Guy', false),
            choice('The Simpsons', true),
            choice('King of the Hill', false),
            choice('South Park', false),
          ],
          explanation:
            'The Simpsons has aired since 1989, becoming the longest-running American sitcom.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In "The Office" (US version), what type of company does Dunder Mifflin sell?',
          choices: [
            choice('Electronics', false),
            choice('Paper', true),
            choice('Furniture', false),
            choice('Insurance', false),
          ],
          explanation:
            'Dunder Mifflin is a fictional paper company based in Scranton, Pennsylvania.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which sitcom follows friends in New York, one of whom is a physicist working at Caltech?',
          choices: [
            choice('Friends', false),
            choice('The Big Bang Theory', true),
            choice('How I Met Your Mother', false),
            choice('Seinfeld', false),
          ],
          explanation:
            'The Big Bang Theory centers on a group of scientist friends and their neighbor, Penny.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the name of the fictional Pawnee, Indiana parks department featured in a popular mockumentary sitcom?',
          choices: [
            choice('Parks and Recreation', true),
            choice('The Office', false),
            choice('Community', false),
            choice('Brooklyn Nine-Nine', false),
          ],
          explanation:
            'Parks and Recreation follows the local government employees of fictional Pawnee, Indiana.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which classic sitcom is famously described by its creators as being "about nothing"?',
          choices: [
            choice('Friends', false),
            choice('Seinfeld', true),
            choice('Cheers', false),
            choice('Frasier', false),
          ],
          explanation:
            'Seinfeld built its humor around the minutiae of everyday life rather than traditional plots.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What genre of show is "Breaking Bad," following a chemistry teacher who turns to making methamphetamine?',
          choices: [
            choice('Sitcom', false),
            choice('Crime drama', true),
            choice('Game show', false),
            choice('Reality TV', false),
          ],
          explanation:
            'Breaking Bad is a critically acclaimed crime drama that aired from 2008 to 2013.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which long-running animated show follows Homer, Marge, Bart, Lisa, and Maggie?',
          choices: [
            choice('Family Guy', false),
            choice('The Simpsons', true),
            choice('American Dad', false),
            choice("Bob's Burgers", false),
          ],
          explanation: 'The Simpson family has been on air since 1989.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes a TV format that follows fictional characters as if filmed by a documentary crew, often without a laugh track?',
          choices: [
            choice('Sitcom', false),
            choice('Mockumentary', true),
            choice('Soap opera', false),
            choice('Game show', false),
          ],
          explanation:
            'Shows like The Office and Parks and Recreation use a mockumentary style with faux interviews.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'tv-shows',
    difficulty: 'MEDIUM',
    title: 'Modern TV & Streaming Era Trivia',
    description:
      'From Westeros to the world of Breaking Bad, this quiz dives into the prestige dramas and streaming hits that defined modern television. Test your knowledge of Game of Thrones, Stranger Things, Succession, and more.',
    tags: ['tv shows', 'streaming', 'netflix', 'drama series', 'pop culture'],
    quiz: {
      title: 'Modern TV & Streaming Era Trivia',
      description: '',
      questions: [
        {
          prompt: '"Game of Thrones" is based on a book series by which author?',
          choices: [
            choice('J.R.R. Tolkien', false),
            choice('George R.R. Martin', true),
            choice('Brandon Sanderson', false),
            choice('Patrick Rothfuss', false),
          ],
          explanation: 'The show adapts Martin\'s "A Song of Ice and Fire" novel series.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which streaming service originally produced "Stranger Things"?',
          choices: [
            choice('Hulu', false),
            choice('Amazon Prime Video', false),
            choice('Netflix', true),
            choice('Disney+', false),
          ],
          explanation:
            'Stranger Things debuted on Netflix in 2016 and became one of its flagship originals.',
          timeLimitSec: 20,
        },
        {
          prompt: '"Breaking Bad" is set primarily in which U.S. state?',
          choices: [
            choice('Arizona', false),
            choice('New Mexico', true),
            choice('Nevada', false),
            choice('Texas', false),
          ],
          explanation: 'The series is set in and around Albuquerque, New Mexico.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which HBO series follows a dysfunctional media mogul family competing for control of their company?',
          choices: [
            choice('Succession', true),
            choice('Billions', false),
            choice('Ozark', false),
            choice('Empire', false),
          ],
          explanation:
            'Succession follows the Roy family as they battle over who will lead their media empire.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the name of the continent in "Game of Thrones" where most of the political conflict occurs?',
          choices: [
            choice('Essos', false),
            choice('Westeros', true),
            choice('Sothoryos', false),
            choice('Valyria', false),
          ],
          explanation:
            'Westeros is the primary setting where the Seven (later Six) Kingdoms are located.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which prequel series to "Breaking Bad" follows the lawyer Jimmy McGill?',
          choices: [
            choice('Better Call Saul', true),
            choice('El Camino', false),
            choice('Ozark', false),
            choice('Narcos', false),
          ],
          explanation:
            "Better Call Saul traces Jimmy McGill's transformation into the lawyer Saul Goodman.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Which streaming platform produced "The Crown," about the British royal family?',
          choices: [
            choice('Netflix', true),
            choice('Hulu', false),
            choice('Amazon Prime Video', false),
            choice('Apple TV+', false),
          ],
          explanation:
            "The Crown is one of Netflix's most acclaimed and expensive original productions.",
          timeLimitSec: 20,
        },
        {
          prompt: '"The Mandalorian" is set in which fictional universe?',
          choices: [
            choice('Star Trek', false),
            choice('Star Wars', true),
            choice('Marvel', false),
            choice('Dune', false),
          ],
          explanation:
            'The Mandalorian follows a bounty hunter in the Star Wars galaxy after the fall of the Empire.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which dystopian drama, based on a Margaret Atwood novel, follows a woman named Offred living under a totalitarian regime?',
          choices: [
            choice("The Handmaid's Tale", true),
            choice('Westworld', false),
            choice('Black Mirror', false),
            choice('The Leftovers', false),
          ],
          explanation: "The Handmaid's Tale adapts Atwood's 1985 novel of the same name.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes watching many episodes of a show in one sitting, a habit made common by the streaming era?',
          choices: [
            choice('Appointment viewing', false),
            choice('Binge-watching', true),
            choice('Syndication', false),
            choice('Rerun marathon', false),
          ],
          explanation:
            'Streaming services releasing full seasons at once popularized binge-watching.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── Celebrities ──────────────────────────────────────────────────────────
  {
    categorySlug: 'celebrities',
    difficulty: 'EASY',
    title: 'Celebrity Trivia: Pop Culture Icons Quiz',
    description:
      "Test your knowledge of the actors, musicians, and pop culture icons everyone's talking about. From Marvel stars to chart-topping singers, this quiz covers the celebrities who shaped modern entertainment.",
    tags: ['celebrities', 'pop culture', 'actors', 'musicians', 'hollywood'],
    quiz: {
      title: 'Celebrity Trivia: Pop Culture Icons Quiz',
      description: '',
      questions: [
        {
          prompt: 'Which actor played Iron Man / Tony Stark in the Marvel Cinematic Universe?',
          choices: [
            choice('Chris Evans', false),
            choice('Robert Downey Jr.', true),
            choice('Chris Hemsworth', false),
            choice('Mark Ruffalo', false),
          ],
          explanation:
            'Robert Downey Jr. originated the MCU role of Tony Stark starting in 2008\'s "Iron Man."',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which pop star is known as the "Queen of Pop"?',
          choices: [
            choice('Beyoncé', false),
            choice('Madonna', true),
            choice('Lady Gaga', false),
            choice('Rihanna', false),
          ],
          explanation:
            'Madonna earned the nickname through decades of chart-topping influence on pop music.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which actress played Hermione Granger in the "Harry Potter" film series?',
          choices: [
            choice('Emma Watson', true),
            choice('Emma Stone', false),
            choice('Emma Roberts', false),
            choice('Emily Blunt', false),
          ],
          explanation: 'Emma Watson played Hermione across all eight Harry Potter films.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which actor is known for playing Jack Sparrow in the "Pirates of the Caribbean" films?',
          choices: [
            choice('Orlando Bloom', false),
            choice('Johnny Depp', true),
            choice('Geoffrey Rush', false),
            choice('Javier Bardem', false),
          ],
          explanation: 'Johnny Depp originated the role of Captain Jack Sparrow in 2003.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which musician and entrepreneur founded the Fenty Beauty cosmetics line?',
          choices: [
            choice('Beyoncé', false),
            choice('Rihanna', true),
            choice('Ariana Grande', false),
            choice('Selena Gomez', false),
          ],
          explanation:
            'Rihanna launched Fenty Beauty in 2017, praised for its inclusive shade range.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which actor played the title role in the "James Bond" films from 2006 to 2021?',
          choices: [
            choice('Daniel Craig', true),
            choice('Pierce Brosnan', false),
            choice('Sean Connery', false),
            choice('Roger Moore', false),
          ],
          explanation:
            'Daniel Craig played Bond from "Casino Royale" (2006) through "No Time to Die" (2021).',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which actress is known for her role as Katniss Everdeen in "The Hunger Games" series?',
          choices: [
            choice('Emma Stone', false),
            choice('Jennifer Lawrence', true),
            choice('Kristen Stewart', false),
            choice('Shailene Woodley', false),
          ],
          explanation: 'Jennifer Lawrence starred as Katniss across all four Hunger Games films.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which singer is known by the nickname "The King of Pop"?',
          choices: [
            choice('Elvis Presley', false),
            choice('Michael Jackson', true),
            choice('Prince', false),
            choice('Usher', false),
          ],
          explanation:
            'Michael Jackson earned the title through his decades-long influence on pop music.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which actor played the Joker in the 2019 film "Joker," winning an Academy Award for the role?',
          choices: [
            choice('Jared Leto', false),
            choice('Heath Ledger', false),
            choice('Joaquin Phoenix', true),
            choice('Jack Nicholson', false),
          ],
          explanation: 'Joaquin Phoenix won the Academy Award for Best Actor for his performance.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which reality TV family rose to fame through the show "Keeping Up with the Kardashians"?',
          choices: [
            choice('The Jenners', false),
            choice('The Kardashians', true),
            choice('The Hiltons', false),
            choice('The Kennedys', false),
          ],
          explanation:
            'The show, which ran from 2007 to 2021, followed the Kardashian-Jenner family.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'celebrities',
    difficulty: 'MEDIUM',
    title: 'Hollywood Legends & Award Show Trivia',
    description:
      'From Oscar-winning legends to the biggest award shows in entertainment, this quiz tests your knowledge of Hollywood history and the honors that define a career. Perfect for classic film buffs and award-season fans.',
    tags: ['hollywood', 'oscars', 'award shows', 'celebrities', 'film history'],
    quiz: {
      title: 'Hollywood Legends & Award Show Trivia',
      description: '',
      questions: [
        {
          prompt:
            'Which actress holds the record for most Academy Award wins for acting, with four Oscars?',
          choices: [
            choice('Meryl Streep', false),
            choice('Katharine Hepburn', true),
            choice('Bette Davis', false),
            choice('Ingrid Bergman', false),
          ],
          explanation: 'Katharine Hepburn won four Best Actress Oscars across her career.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which actor has received the most Academy Award nominations for acting in history?',
          choices: [
            choice('Jack Nicholson', false),
            choice('Meryl Streep', true),
            choice('Daniel Day-Lewis', false),
            choice('Denzel Washington', false),
          ],
          explanation:
            'Meryl Streep has been nominated more times than any other actor in Oscar history.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which annual awards ceremony honors film achievement with the "Oscar" statuette?',
          choices: [
            choice('The Grammy Awards', false),
            choice('The Academy Awards', true),
            choice('The Emmy Awards', false),
            choice('The Golden Globes', false),
          ],
          explanation:
            "The Academy Awards, first held in 1929, are the film industry's most prestigious honors.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which award recognizes excellence in television, similar to the Oscars for film?',
          choices: [
            choice('The Tony Awards', false),
            choice('The Emmy Awards', true),
            choice('The Grammy Awards', false),
            choice('The Golden Globes', false),
          ],
          explanation: 'The Emmy Awards honor outstanding achievement in American television.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which award ceremony honors achievement in the music industry?',
          choices: [
            choice('The Emmys', false),
            choice('The Grammys', true),
            choice('The Tonys', false),
            choice('The BAFTAs', false),
          ],
          explanation:
            "The Grammy Awards, first held in 1959, are the music industry's top honors.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Which award honors excellence in live theatre and Broadway productions?',
          choices: [
            choice('The Grammys', false),
            choice('The Tony Awards', true),
            choice('The Emmys', false),
            choice('The Oscars', false),
          ],
          explanation: 'The Tony Awards recognize achievement in American Broadway theatre.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which actor won an Academy Award for Best Actor for "The Revenant" (2015), after several previous nominations without a win?',
          choices: [
            choice('Tom Hanks', false),
            choice('Leonardo DiCaprio', true),
            choice('Brad Pitt', false),
            choice('Matt Damon', false),
          ],
          explanation:
            'DiCaprio finally won his first competitive Oscar after years of nominations.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which legendary actress starred in classic films like "Roman Holiday" and "Breakfast at Tiffany\'s"?',
          choices: [
            choice('Grace Kelly', false),
            choice('Audrey Hepburn', true),
            choice('Elizabeth Taylor', false),
            choice('Marilyn Monroe', false),
          ],
          explanation: 'Audrey Hepburn became a defining screen icon of 1950s and 60s Hollywood.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which musician and actor, known as "The King," remains one of the best-selling solo music artists of all time?',
          choices: [
            choice('Elvis Presley', true),
            choice('Frank Sinatra', false),
            choice('Chuck Berry', false),
            choice('Bing Crosby', false),
          ],
          explanation:
            'Elvis Presley\'s cultural impact on music and film earned him the nickname "The King."',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which British awards ceremony, comparable to the Oscars, is presented annually by the British Academy of Film and Television Arts?',
          choices: [
            choice('The BRIT Awards', false),
            choice('The BAFTAs', true),
            choice('The Olivier Awards', false),
            choice('The Ivor Novello Awards', false),
          ],
          explanation:
            "The BAFTAs are Britain's leading honors for film and television achievement.",
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── Internet & Memes ─────────────────────────────────────────────────────
  {
    categorySlug: 'memes',
    difficulty: 'EASY',
    title: 'Internet & Meme Culture Basics Quiz',
    description:
      'From memes and hashtags to emojis and viral trends, this quiz covers the basic vocabulary and concepts of internet culture. A fun, easy quiz for anyone active on social media.',
    tags: ['memes', 'internet culture', 'social media', 'viral', 'pop culture'],
    quiz: {
      title: 'Internet & Meme Culture Basics Quiz',
      description: '',
      questions: [
        {
          prompt: 'What does the acronym "LOL" commonly stand for?',
          choices: [
            choice('Lots of Love', false),
            choice('Laugh Out Loud', true),
            choice('Live Online Long', false),
            choice('Look Out Loud', false),
          ],
          explanation: 'LOL is one of the earliest and most widely used internet abbreviations.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What general term describes an image, video, or piece of text that spreads rapidly online, often humorously altered?',
          choices: [
            choice('A blog', false),
            choice('A meme', true),
            choice('A podcast', false),
            choice('A vlog', false),
          ],
          explanation:
            'Memes are units of culture, often jokes or images, that spread and evolve online.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What term describes content that spreads extremely quickly across the internet?',
          choices: [
            choice('Trending', false),
            choice('Viral', true),
            choice('Streaming', false),
            choice('Syndicated', false),
          ],
          explanation:
            'Viral content spreads rapidly through shares, much like a virus spreads between hosts.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does the abbreviation "GIF" stand for?',
          choices: [
            choice('Graphics Interchange Format', true),
            choice('General Image File', false),
            choice('Graphic Illustration Frame', false),
            choice('Global Internet Format', false),
          ],
          explanation: 'GIF is an image format that supports short, looping animations.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What short-form video app popularized 6-second looping videos in the early 2010s before shutting down?',
          choices: [
            choice('Vine', true),
            choice('Snapchat', false),
            choice('TikTok', false),
            choice('Periscope', false),
          ],
          explanation:
            'Vine, launched in 2013, was an early pioneer of short-form video before its 2017 shutdown.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes an internet user who posts inflammatory messages to provoke reactions?',
          choices: [
            choice('Influencer', false),
            choice('Troll', true),
            choice('Blogger', false),
            choice('Moderator', false),
          ],
          explanation:
            'A troll deliberately posts provocative or off-topic content to upset others.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What short-form video app, known for viral dances and sounds, launched internationally in 2018?',
          choices: [
            choice('Vine', false),
            choice('TikTok', true),
            choice('Snapchat', false),
            choice('Periscope', false),
          ],
          explanation:
            'TikTok became one of the most downloaded apps in the world within a few years of launch.',
          timeLimitSec: 20,
        },
        {
          prompt:
            "What term describes an online username or persona used instead of someone's real name?",
          choices: [
            choice('Avatar', false),
            choice('Handle', true),
            choice('Bio', false),
            choice('Tag', false),
          ],
          explanation: 'A "handle" is a person\'s chosen name or identity on a social platform.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for a symbol like :) or 😂 used to convey emotion in digital text?',
          choices: [
            choice('Emoji/emoticon', true),
            choice('Hashtag', false),
            choice('Meme', false),
            choice('GIF', false),
          ],
          explanation: 'Emoticons and emojis add tone and emotion to otherwise plain text.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What symbol is used to categorize posts by topic on platforms like Twitter/X and Instagram?',
          choices: [
            choice('The @ symbol', false),
            choice('The # symbol (hashtag)', true),
            choice('The & symbol', false),
            choice('The % symbol', false),
          ],
          explanation: 'Hashtags group related posts together and make them discoverable by topic.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'memes',
    difficulty: 'MEDIUM',
    title: 'Viral Internet Moments & Meme History Trivia',
    description:
      'Remember Gangnam Style, Doge, and the Ice Bucket Challenge? This quiz tests your knowledge of the viral videos, memes, and internet moments that defined the 2010s and beyond.',
    tags: ['memes', 'viral videos', 'internet history', 'youtube', 'pop culture'],
    quiz: {
      title: 'Viral Internet Moments & Meme History Trivia',
      description: '',
      questions: [
        {
          prompt:
            'Which 2012 viral music video became the first YouTube video to reach one billion views?',
          choices: [
            choice('"Baby" by Justin Bieber', false),
            choice('"Gangnam Style" by PSY', true),
            choice('"Despacito"', false),
            choice('"Call Me Maybe"', false),
          ],
          explanation:
            '"Gangnam Style" became a global sensation and YouTube\'s first video to hit a billion views.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the name of the meme featuring a man looking at another woman while his girlfriend looks on disapprovingly, originally a stock photo?',
          choices: [
            choice('Distracted Boyfriend', true),
            choice('Woman Yelling at Cat', false),
            choice('Success Kid', false),
            choice('Bad Luck Brian', false),
          ],
          explanation:
            'The "Distracted Boyfriend" stock photo became one of the internet\'s most versatile meme templates.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which social media platform, founded in 2006 and originally limited to 140-character posts, is now known as X?',
          choices: [
            choice('Facebook', false),
            choice('Twitter', true),
            choice('Instagram', false),
            choice('Tumblr', false),
          ],
          explanation: 'Twitter rebranded to X in 2023 after being acquired by Elon Musk.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'The 2014 viral "Ice Bucket Challenge" raised money and awareness for which disease?',
          choices: [
            choice('Cancer', false),
            choice("ALS (Lou Gehrig's disease)", true),
            choice('Diabetes', false),
            choice("Alzheimer's", false),
          ],
          explanation: 'The challenge raised over $100 million for ALS research worldwide.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which 2019 meme format features a cat appearing to sob at a dinner table alongside a photo of women yelling?',
          choices: [
            choice('Woman Yelling at a Cat', true),
            choice('Distracted Boyfriend', false),
            choice('This Is Fine', false),
            choice('Doge', false),
          ],
          explanation:
            "This meme combined two unrelated images into one of 2019's most popular formats.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the name of the popular meme featuring a Shiba Inu dog with colorful comic-sans internal monologue text?',
          choices: [
            choice('Grumpy Cat', false),
            choice('Doge', true),
            choice('Nyan Cat', false),
            choice('Keyboard Cat', false),
          ],
          explanation: '"Doge" became one of the most recognizable memes of the mid-2010s.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which video-sharing platform, founded in 2005, became the dominant platform for hosting viral videos?',
          choices: [
            choice('Vimeo', false),
            choice('YouTube', true),
            choice('Dailymotion', false),
            choice('Twitch', false),
          ],
          explanation:
            "YouTube quickly became the internet's primary home for video content after its 2005 launch.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'What internet slang term describes content that is embarrassing or awkward to watch?',
          choices: [
            choice('Based', false),
            choice('Cringe', true),
            choice('Lit', false),
            choice('Salty', false),
          ],
          explanation: '"Cringe" describes secondhand embarrassment from watching awkward content.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which livestreaming platform, acquired by Amazon in 2014, is primarily used for broadcasting video game play?',
          choices: [
            choice('YouTube Gaming', false),
            choice('Twitch', true),
            choice('Facebook Gaming', false),
            choice('Discord', false),
          ],
          explanation: 'Twitch became the leading livestreaming platform for gaming content.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which meme, based on an image of a dog sitting in a burning room saying "This is fine," became a symbol for downplaying a crisis?',
          choices: [
            choice('This Is Fine', true),
            choice('Doge', false),
            choice('Success Kid', false),
            choice('Ridiculously Photogenic Guy', false),
          ],
          explanation:
            'The "This Is Fine" webcomic panel became shorthand for ignoring an obvious disaster.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── Anime & Manga ────────────────────────────────────────────────────────
  {
    categorySlug: 'anime',
    difficulty: 'EASY',
    title: 'Anime Basics: Genres & Terminology Quiz',
    description:
      'New to anime or want to learn the lingo? This quiz covers essential terms like shonen, isekai, and otaku, along with the genres and vocabulary every anime fan should know.',
    tags: ['anime', 'manga', 'anime basics', 'japanese pop culture', 'beginner'],
    quiz: {
      title: 'Anime Basics: Genres & Terminology Quiz',
      description: '',
      questions: [
        {
          prompt: 'What Japanese term describes animated media, whether TV shows or films?',
          choices: [
            choice('Manga', false),
            choice('Anime', true),
            choice('Kawaii', false),
            choice('Otaku', false),
          ],
          explanation:
            '"Anime" refers to animation, most commonly associated with Japanese productions.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the Japanese term for comic books or graphic novels, often the source material for anime?',
          choices: [
            choice('Anime', false),
            choice('Manga', true),
            choice('Doujin', false),
            choice('Light novel', false),
          ],
          explanation:
            'Manga are Japanese comics, and many anime series are adapted directly from them.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What genre of anime is primarily targeted at young boys, often featuring action and adventure (e.g., "Naruto," "One Piece")?',
          choices: [
            choice('Shoujo', false),
            choice('Shonen', true),
            choice('Seinen', false),
            choice('Josei', false),
          ],
          explanation: 'Shonen anime targets a young male audience with action-driven storylines.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What genre of anime is primarily targeted at young girls, often featuring romance and relationships?',
          choices: [
            choice('Shonen', false),
            choice('Shoujo', true),
            choice('Seinen', false),
            choice('Mecha', false),
          ],
          explanation:
            'Shoujo anime targets a young female audience, often with romance and slice-of-life themes.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes an anime fan passionately, sometimes obsessively, devoted to anime or manga?',
          choices: [
            choice('Otaku', true),
            choice('Senpai', false),
            choice('Kohai', false),
            choice('Sensei', false),
          ],
          explanation:
            '"Otaku" originally described obsessive hobbyists and is now widely used for devoted anime fans.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What genre of anime typically features giant robots piloted by humans?',
          choices: [
            choice('Isekai', false),
            choice('Mecha', true),
            choice('Slice of life', false),
            choice('Sports', false),
          ],
          explanation:
            'Mecha anime, like "Gundam" and "Evangelion," centers on giant piloted robots.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What Japanese term describes stories where a character is transported to or reincarnated in another world?',
          choices: [
            choice('Shonen', false),
            choice('Isekai', true),
            choice('Seinen', false),
            choice('Yonkoma', false),
          ],
          explanation:
            '"Isekai" literally means "different world" and has become one of anime\'s most popular genres.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What term describes a cute, simplified, super-deformed art style sometimes used for comic effect in anime?',
          choices: [
            choice('Chibi', true),
            choice('Bishounen', false),
            choice('Tsundere', false),
            choice('Senpai', false),
          ],
          explanation:
            'Chibi style shrinks characters into small, exaggerated proportions for comedic moments.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What honorific suffix addresses an upperclassman or more experienced peer, common in school-set anime?',
          choices: [
            choice('-sensei', false),
            choice('-senpai', true),
            choice('-chan', false),
            choice('-sama', false),
          ],
          explanation: '"-senpai" is used to address someone with more experience or seniority.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Studio Ghibli, known for films like "Spirited Away" and "My Neighbor Totoro," is based in which country?',
          choices: [
            choice('South Korea', false),
            choice('China', false),
            choice('Japan', true),
            choice('Taiwan', false),
          ],
          explanation: 'Studio Ghibli was founded in Tokyo, Japan, in 1985.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'anime',
    difficulty: 'MEDIUM',
    title: 'Legendary Anime Studios & Icons Trivia',
    description:
      "From Hayao Miyazaki's Studio Ghibli to blockbuster series like Naruto and Attack on Titan, this quiz tests your knowledge of the creators, studios, and stories that shaped anime as a global phenomenon.",
    tags: ['anime', 'studio ghibli', 'manga', 'anime history', 'japanese animation'],
    quiz: {
      title: 'Legendary Anime Studios & Icons Trivia',
      description: '',
      questions: [
        {
          prompt:
            'Which director co-founded Studio Ghibli and directed films such as "Spirited Away" and "Princess Mononoke"?',
          choices: [
            choice('Satoshi Kon', false),
            choice('Hayao Miyazaki', true),
            choice('Mamoru Hosoda', false),
            choice('Makoto Shinkai', false),
          ],
          explanation:
            'Hayao Miyazaki co-founded Studio Ghibli in 1985 and directed many of its most beloved films.',
          timeLimitSec: 20,
        },
        {
          prompt: '"Spirited Away" won which major international award in 2003?',
          choices: [
            choice('A Grammy Award', false),
            choice('The Academy Award for Best Animated Feature', true),
            choice('A Tony Award', false),
            choice('A Pulitzer Prize', false),
          ],
          explanation:
            'Spirited Away became the first hand-drawn and non-English-language film to win the award.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which manga artist created "Dragon Ball," one of the best-selling manga series of all time?',
          choices: [
            choice('Eiichiro Oda', false),
            choice('Akira Toriyama', true),
            choice('Masashi Kishimoto', false),
            choice('Naoko Takeuchi', false),
          ],
          explanation: 'Akira Toriyama created Dragon Ball, which began serialization in 1984.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Who is the creator of "One Piece," one of the best-selling manga series in history?',
          choices: [
            choice('Eiichiro Oda', true),
            choice('Akira Toriyama', false),
            choice('Tite Kubo', false),
            choice('Hiromu Arakawa', false),
          ],
          explanation: 'Eiichiro Oda has written and illustrated One Piece since 1997.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which anime and manga franchise follows Naruto Uzumaki, a young ninja seeking recognition in his village?',
          choices: [
            choice('Naruto', true),
            choice('Bleach', false),
            choice('One Piece', false),
            choice('Attack on Titan', false),
          ],
          explanation:
            'Naruto, created by Masashi Kishimoto, became one of the most popular shonen franchises worldwide.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which studio, known for high-quality action anime like "Demon Slayer" and "Jujutsu Kaisen" adaptations, is celebrated for its animation quality?',
          choices: [
            choice('Studio Ghibli', false),
            choice('Ufotable', true),
            choice('Toei Animation', false),
            choice('Madhouse', false),
          ],
          explanation:
            'Ufotable is widely praised for its cinematic, high-budget animation in modern action anime.',
          timeLimitSec: 20,
        },
        {
          prompt:
            '"Attack on Titan" is set in a world where humanity lives behind walls to protect against what threat?',
          choices: [
            choice('Zombies', false),
            choice('Giant Titans', true),
            choice('Alien invaders', false),
            choice('Dragons', false),
          ],
          explanation:
            "The series follows humanity's struggle to survive against man-eating Titans.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which classic 1988 anime film, directed by Katsuhiro Otomo, is considered a landmark in cyberpunk animation?',
          choices: [
            choice('Ghost in the Shell', false),
            choice('Akira', true),
            choice('Cowboy Bebop', false),
            choice('Neon Genesis Evangelion', false),
          ],
          explanation: 'Akira is widely credited with introducing many Western audiences to anime.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which anime series follows Light Yagami, a student who gains the power to kill anyone by writing their name in a supernatural notebook?',
          choices: [
            choice('Death Note', true),
            choice('Code Geass', false),
            choice('Tokyo Ghoul', false),
            choice('Psycho-Pass', false),
          ],
          explanation:
            "Death Note follows Light Yagami's moral descent after finding the titular notebook.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which long-running franchise, first debuting in 1997, follows "Trainers" including Ash Ketchum?',
          choices: [
            choice('Digimon', false),
            choice('Pokémon', true),
            choice('Yu-Gi-Oh!', false),
            choice('Beyblade', false),
          ],
          explanation:
            'The Pokémon anime debuted in 1997 and remains one of the longest-running anime series ever.',
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
