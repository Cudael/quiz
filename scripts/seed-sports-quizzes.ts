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
  // ── Football / Soccer ───────────────────────────────────────────────────
  {
    categorySlug: 'football',
    difficulty: 'EASY',
    title: 'Soccer Basics: Rules & Fundamentals Quiz',
    description:
      'New to soccer or want to brush up on the basics? This quiz covers the essential rules of football/soccer — from offside and fouls to how a match is scored and structured. Perfect for beginners, youth players, or fans who want to understand the game better before kickoff.',
    tags: ['soccer', 'football', 'soccer rules', 'sports basics', 'beginner'],
    quiz: {
      title: 'Soccer Basics: Rules & Fundamentals Quiz',
      description: '',
      questions: [
        {
          prompt:
            'How many players from each team are on the field during play, including the goalkeeper?',
          choices: [
            choice('9', false),
            choice('10', false),
            choice('11', true),
            choice('12', false),
          ],
          explanation: 'Each soccer team fields 11 players, one of whom is the goalkeeper.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is it called when an attacking player is caught in an illegal position ahead of the last defender?',
          choices: [
            choice('Foul', false),
            choice('Offside', true),
            choice('Handball', false),
            choice('Corner', false),
          ],
          explanation:
            'An offside violation occurs when an attacker is nearer the goal line than both the ball and the second-last defender when the ball is played to them.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How long is a standard soccer match, excluding stoppage time?',
          choices: [
            choice('60 minutes', false),
            choice('80 minutes', false),
            choice('90 minutes', true),
            choice('120 minutes', false),
          ],
          explanation: 'A standard match consists of two 45-minute halves, totaling 90 minutes.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does a red card mean for a player?',
          choices: [
            choice('A formal warning', false),
            choice('Ejection from the match', true),
            choice('A time-out', false),
            choice('An automatic penalty kick', false),
          ],
          explanation:
            'A red card sends a player off the field, and their team must continue with one fewer player.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is it called when one player scores three goals in a single match?',
          choices: [
            choice('Triple', false),
            choice('Hat-trick', true),
            choice('Treble', false),
            choice('Trio', false),
          ],
          explanation:
            'Scoring three goals in one game by the same player is known as a hat-trick.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which body parts are outfield players not allowed to use to intentionally play the ball?',
          choices: [
            choice('Head', false),
            choice('Chest', false),
            choice('Hands and arms', true),
            choice('Feet', false),
          ],
          explanation:
            'Only the goalkeeper may use their hands, and only within their own penalty area.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is awarded when a defending team commits a foul inside their own penalty area?',
          choices: [
            choice('Corner kick', false),
            choice('Free kick', false),
            choice('Penalty kick', true),
            choice('Throw-in', false),
          ],
          explanation:
            'Fouls committed inside the penalty area result in a penalty kick for the attacking team.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is a "clean sheet" in soccer?',
          choices: [
            choice('Winning by more than 3 goals', false),
            choice('Not conceding any goals in a match', true),
            choice('Scoring a hat-trick', false),
            choice('Playing a full match without fouls', false),
          ],
          explanation:
            "A clean sheet means a team (or goalkeeper) didn't allow the opponent to score.",
          timeLimitSec: 20,
        },
        {
          prompt: 'What object do teams use to play soccer?',
          choices: [
            choice('A puck', false),
            choice('A shuttlecock', false),
            choice('A ball', true),
            choice('A discus', false),
          ],
          explanation: 'Soccer is played with a spherical ball, kicked or headed toward the goal.',
          timeLimitSec: 20,
        },
        {
          prompt:
            "What is the name of soccer's biggest international tournament, held every four years for national teams?",
          choices: [
            choice('The Champions League', false),
            choice('The FIFA World Cup', true),
            choice('The Euro Cup', false),
            choice('The Copa America', false),
          ],
          explanation:
            "The FIFA World Cup is the sport's premier international competition, first held in 1930.",
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'football',
    difficulty: 'MEDIUM',
    title: 'World Cup & Soccer Legends Trivia',
    description:
      "Test your knowledge of soccer's biggest stage with this World Cup and legends trivia quiz. From Pelé and Maradona to Messi's historic 2022 triumph, these questions cover the players, moments, and records that define the world's most popular sport. Great for die-hard football fans.",
    tags: ['soccer', 'world cup', 'football legends', 'fifa', 'sports trivia'],
    quiz: {
      title: 'World Cup & Soccer Legends Trivia',
      description: '',
      questions: [
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
          prompt: "Which player has won the most Ballon d'Or awards in history?",
          choices: [
            choice('Cristiano Ronaldo', false),
            choice('Lionel Messi', true),
            choice('Pelé', false),
            choice('Diego Maradona', false),
          ],
          explanation: "Lionel Messi has won a record eight Ballon d'Or awards.",
          timeLimitSec: 20,
        },
        {
          prompt: 'In which country was the first FIFA World Cup held in 1930?',
          choices: [
            choice('Brazil', false),
            choice('Uruguay', true),
            choice('Italy', false),
            choice('France', false),
          ],
          explanation: 'Uruguay hosted and won the inaugural World Cup in 1930.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which Brazilian legend won three World Cups as a player (1958, 1962, and 1970)?',
          choices: [
            choice('Ronaldinho', false),
            choice('Pelé', true),
            choice('Ronaldo Nazário', false),
            choice('Zico', false),
          ],
          explanation: 'Pelé remains the only player to win three World Cup titles.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the name of the current trophy awarded to the FIFA World Cup champion?',
          choices: [
            choice('The Jules Rimet Trophy', false),
            choice('The FIFA World Cup Trophy', true),
            choice('The Golden Cup', false),
            choice('The Copa Mundial', false),
          ],
          explanation:
            'The current trophy has been awarded since 1974, replacing the retired Jules Rimet Trophy.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which club has won the most UEFA Champions League titles?',
          choices: [
            choice('FC Barcelona', false),
            choice('AC Milan', false),
            choice('Real Madrid', true),
            choice('Bayern Munich', false),
          ],
          explanation:
            'Real Madrid holds the record for the most European Cup/Champions League titles by a wide margin.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Diego Maradona\'s famous "Hand of God" goal occurred at which World Cup?',
          choices: [
            choice('1982', false),
            choice('1986', true),
            choice('1990', false),
            choice('1994', false),
          ],
          explanation:
            "The controversial goal came during Argentina's 1986 quarterfinal match against England.",
          timeLimitSec: 20,
        },
        {
          prompt: 'Which country hosted the 2018 FIFA World Cup?',
          choices: [
            choice('Brazil', false),
            choice('Qatar', false),
            choice('Russia', true),
            choice('South Africa', false),
          ],
          explanation: 'Russia hosted the 2018 World Cup, won by France.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Lionel Messi finally won his first World Cup title with Argentina in which year?',
          choices: [
            choice('2014', false),
            choice('2018', false),
            choice('2022', true),
            choice('2010', false),
          ],
          explanation:
            'Argentina won the 2022 World Cup in Qatar, defeating France in a penalty shootout.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which position is primarily responsible for stopping shots and preventing goals?',
          choices: [
            choice('Striker', false),
            choice('Midfielder', false),
            choice('Goalkeeper', true),
            choice('Winger', false),
          ],
          explanation:
            'The goalkeeper is the last line of defense and the only player allowed to use their hands within the penalty area.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── Basketball ───────────────────────────────────────────────────────────
  {
    categorySlug: 'basketball',
    difficulty: 'EASY',
    title: 'Basketball Rules & Fundamentals Quiz',
    description:
      "Whether you're picking up basketball for the first time or coaching youth players, this quiz covers the core rules — scoring, fouls, violations, and game structure. A quick, friendly way to learn the fundamentals of the game.",
    tags: ['basketball', 'basketball rules', 'nba basics', 'sports basics', 'beginner'],
    quiz: {
      title: 'Basketball Rules & Fundamentals Quiz',
      description: '',
      questions: [
        {
          prompt: 'How many players from each team are on the court at one time in basketball?',
          choices: [choice('4', false), choice('5', true), choice('6', false), choice('7', false)],
          explanation: 'Each basketball team has five players on the court during play.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many points is a shot made from beyond the three-point line worth?',
          choices: [choice('1', false), choice('2', false), choice('3', true), choice('4', false)],
          explanation: 'Shots made from outside the three-point arc are worth three points.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is it called when a player takes too many steps while holding the ball without dribbling?',
          choices: [
            choice('Double dribble', false),
            choice('Traveling', true),
            choice('Carrying', false),
            choice('Charging', false),
          ],
          explanation:
            'Traveling is a violation for moving illegally with the ball without dribbling.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many quarters are in a standard NBA basketball game?',
          choices: [choice('2', false), choice('3', false), choice('4', true), choice('5', false)],
          explanation: 'NBA games are divided into four 12-minute quarters.',
          timeLimitSec: 20,
        },
        {
          prompt:
            "What is the term for legally stopping an opponent's shot attempt by touching the ball?",
          choices: [
            choice('Steal', false),
            choice('Block', true),
            choice('Rebound', false),
            choice('Screen', false),
          ],
          explanation: 'A block occurs when a defender deflects or stops a shot attempt.',
          timeLimitSec: 20,
        },
        {
          prompt: 'A free throw is typically awarded for which of the following?',
          choices: [
            choice('Scoring a three-pointer', false),
            choice('A shooting foul or certain other fouls', true),
            choice('Winning the game', false),
            choice('Calling a timeout', false),
          ],
          explanation:
            'Free throws are unguarded shots awarded after specific fouls, usually shooting fouls.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is it called when a player dribbles, stops, and then starts dribbling again?',
          choices: [
            choice('Traveling', false),
            choice('Double dribble', true),
            choice('Foul', false),
            choice('Backcourt violation', false),
          ],
          explanation:
            'Double dribble is a violation for dribbling, stopping, and dribbling again.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many points is a standard free throw worth?',
          choices: [choice('1', true), choice('2', false), choice('3', false), choice('0', false)],
          explanation: 'A successful free throw is worth one point.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the term for grabbing the ball after a missed shot?',
          choices: [
            choice('Assist', false),
            choice('Rebound', true),
            choice('Steal', false),
            choice('Block', false),
          ],
          explanation: 'A rebound is gaining possession of the ball after a missed shot attempt.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is the object players shoot into the hoop called?',
          choices: [
            choice('A puck', false),
            choice('A basketball', true),
            choice('A shuttlecock', false),
            choice('A disc', false),
          ],
          explanation:
            'Basketball is played with a round, textured ball designed for dribbling and shooting.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'basketball',
    difficulty: 'MEDIUM',
    title: 'NBA Legends & Basketball History Trivia',
    description:
      "From Michael Jordan's six championships to Wilt Chamberlain's 100-point game, this quiz dives into basketball history's biggest legends and records. Test your knowledge of the NBA's greatest players, teams, and milestone moments.",
    tags: ['basketball', 'nba', 'basketball legends', 'sports history', 'trivia'],
    quiz: {
      title: 'NBA Legends & Basketball History Trivia',
      description: '',
      questions: [
        {
          prompt: "Who is the NBA's all-time leading regular season scorer?",
          choices: [
            choice('Kareem Abdul-Jabbar', false),
            choice('LeBron James', true),
            choice('Kobe Bryant', false),
            choice('Michael Jordan', false),
          ],
          explanation:
            'LeBron James passed Kareem Abdul-Jabbar to become the all-time leading scorer in 2023.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many NBA championships did Michael Jordan win with the Chicago Bulls?',
          choices: [choice('4', false), choice('5', false), choice('6', true), choice('7', false)],
          explanation:
            'Jordan led the Bulls to six championships across two three-peats in the 1990s.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which franchise has won the most NBA championships in history?',
          choices: [
            choice('Los Angeles Lakers', false),
            choice('Boston Celtics', true),
            choice('Chicago Bulls', false),
            choice('Golden State Warriors', false),
          ],
          explanation:
            'The Boston Celtics hold the record for the most NBA titles of any franchise.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In what year was the NBA founded?',
          choices: [
            choice('1936', false),
            choice('1946', true),
            choice('1956', false),
            choice('1966', false),
          ],
          explanation:
            'The league was founded in 1946 as the Basketball Association of America, later becoming the NBA.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which player is known by the nickname "The Big Fundamental"?',
          choices: [
            choice('Tim Duncan', true),
            choice("Shaquille O'Neal", false),
            choice('Dwight Howard', false),
            choice('David Robinson', false),
          ],
          explanation:
            'Tim Duncan earned the nickname for his consistent, fundamentally sound play with the Spurs.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Wilt Chamberlain famously scored how many points in a single NBA game in 1962?',
          choices: [
            choice('50', false),
            choice('75', false),
            choice('100', true),
            choice('120', false),
          ],
          explanation: 'Chamberlain scored 100 points in a single game, still an NBA record.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which player has won the most NBA Most Valuable Player (MVP) awards?',
          choices: [
            choice('Michael Jordan', false),
            choice('LeBron James', false),
            choice('Kareem Abdul-Jabbar', true),
            choice('Bill Russell', false),
          ],
          explanation: 'Kareem Abdul-Jabbar won six MVP awards, the most in NBA history.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Stephen Curry is best known for revolutionizing which aspect of basketball?',
          choices: [
            choice('Defense', false),
            choice('Three-point shooting', true),
            choice('Rebounding', false),
            choice('Free throws', false),
          ],
          explanation:
            "Curry's shooting range and volume transformed how the modern game is played.",
          timeLimitSec: 20,
        },
        {
          prompt:
            "What is the Chicago Bulls' 1995-96 record-setting regular season commonly known as?",
          choices: [
            choice('The Dream Team', false),
            choice('The 72-10 season', true),
            choice('The Big Three', false),
            choice('Showtime', false),
          ],
          explanation:
            'The Bulls went 72-10, a regular season win record that stood for two decades.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which country\'s national team was nicknamed "The Dream Team" for its dominant 1992 Olympic roster?',
          choices: [
            choice('Spain', false),
            choice('United States', true),
            choice('Argentina', false),
            choice('Brazil', false),
          ],
          explanation:
            'The 1992 U.S. Olympic team, featuring Jordan, Magic Johnson, and Larry Bird, was dubbed the Dream Team.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── American Football ───────────────────────────────────────────────────
  {
    categorySlug: 'american-football',
    difficulty: 'EASY',
    title: 'American Football Basics: Rules & Positions Quiz',
    description:
      'New to American football? This quiz breaks down the essential rules — downs, scoring, positions, and key terms — in a straightforward, beginner-friendly format. Perfect before your next game day watch party.',
    tags: ['american football', 'nfl basics', 'football rules', 'sports basics', 'beginner'],
    quiz: {
      title: 'American Football Basics: Rules & Positions Quiz',
      description: '',
      questions: [
        {
          prompt: 'How many points is a touchdown worth, before any extra point attempt?',
          choices: [choice('3', false), choice('6', true), choice('7', false), choice('8', false)],
          explanation:
            'A touchdown is worth six points, with a chance to add 1 or 2 more via a conversion attempt.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many players from each team are on the field at one time?',
          choices: [
            choice('9', false),
            choice('10', false),
            choice('11', true),
            choice('12', false),
          ],
          explanation: 'Each team fields 11 players at a time.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many points is a successful field goal worth?',
          choices: [choice('1', false), choice('2', false), choice('3', true), choice('6', false)],
          explanation: 'A field goal, kicked through the uprights, is worth three points.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for the player who throws forward passes and leads the offense?',
          choices: [
            choice('Running back', false),
            choice('Quarterback', true),
            choice('Linebacker', false),
            choice('Tight end', false),
          ],
          explanation:
            'The quarterback directs the offense and is typically responsible for passing plays.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'How many downs does a team get to advance the ball 10 yards before losing possession?',
          choices: [choice('2', false), choice('3', false), choice('4', true), choice('5', false)],
          explanation: 'A team has four downs to gain 10 yards or they must turn the ball over.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is it called when the quarterback is tackled behind the line of scrimmage while attempting to pass?',
          choices: [
            choice('Fumble', false),
            choice('Sack', true),
            choice('Interception', false),
            choice('Safety', false),
          ],
          explanation: 'A sack occurs when the quarterback is tackled before releasing a pass.',
          timeLimitSec: 20,
        },
        {
          prompt: "What is the name of the NFL's championship game?",
          choices: [
            choice('The World Series', false),
            choice('The Super Bowl', true),
            choice('The Stanley Cup', false),
            choice('The World Cup', false),
          ],
          explanation:
            'The Super Bowl has decided the NFL champion each season since the 1966 season.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many points is a safety worth?',
          choices: [choice('1', false), choice('2', true), choice('3', false), choice('6', false)],
          explanation:
            'A safety, earned by tackling an opponent in their own end zone, is worth two points.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is it called when a defensive player catches a forward pass intended for the offense?',
          choices: [
            choice('Fumble', false),
            choice('Sack', false),
            choice('Interception', true),
            choice('Turnover on downs', false),
          ],
          explanation:
            'An interception is a pass caught by the defending team, resulting in a turnover.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many points is the extra point (PAT) typically worth after a touchdown?',
          choices: [choice('1', true), choice('2', false), choice('3', false), choice('0', false)],
          explanation:
            'A standard extra-point kick after a touchdown is worth one point (a two-point conversion is worth two).',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'american-football',
    difficulty: 'MEDIUM',
    title: 'NFL History & Super Bowl Trivia',
    description:
      "Test your knowledge of the NFL's biggest games and greatest players, from Tom Brady's record seven Super Bowl titles to legendary rushers and iconic stadiums. A must-play for serious football fans heading into Super Bowl season.",
    tags: ['nfl', 'super bowl', 'american football', 'sports history', 'trivia'],
    quiz: {
      title: 'NFL History & Super Bowl Trivia',
      description: '',
      questions: [
        {
          prompt: 'Which two franchises are tied for the most Super Bowl titles, with six each?',
          choices: [
            choice('Cowboys and 49ers', false),
            choice('Patriots and Steelers', true),
            choice('Packers and Giants', false),
            choice('Broncos and Raiders', false),
          ],
          explanation:
            'The New England Patriots and Pittsburgh Steelers have each won six Super Bowl titles.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Quarterback Tom Brady won a record how many Super Bowl titles over his career?',
          choices: [choice('5', false), choice('6', false), choice('7', true), choice('8', false)],
          explanation:
            'Brady won six titles with the Patriots and a seventh with the Tampa Bay Buccaneers.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In which U.S. city was the first Super Bowl played in 1967?',
          choices: [
            choice('Miami', false),
            choice('Los Angeles', true),
            choice('New Orleans', false),
            choice('Dallas', false),
          ],
          explanation: 'Super Bowl I was played at the Los Angeles Memorial Coliseum.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for a play where the ball carrier loses possession before being tackled?',
          choices: [
            choice('Interception', false),
            choice('Fumble', true),
            choice('Sack', false),
            choice('Penalty', false),
          ],
          explanation:
            'A fumble is a loss of possession by the ball carrier, recoverable by either team.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which running back holds the NFL record for most career rushing yards?',
          choices: [
            choice('Emmitt Smith', true),
            choice('Walter Payton', false),
            choice('Barry Sanders', false),
            choice('Adrian Peterson', false),
          ],
          explanation:
            'Emmitt Smith retired with 18,355 career rushing yards, still the all-time record.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the total length of an NFL football field in yards, including both end zones?',
          choices: [
            choice('100', false),
            choice('110', false),
            choice('120', true),
            choice('130', false),
          ],
          explanation:
            'The field is 100 yards of play plus two 10-yard end zones, totaling 120 yards.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which position group is primarily responsible for protecting the quarterback and blocking for the run game?',
          choices: [
            choice('Wide receivers', false),
            choice('Offensive linemen', true),
            choice('Cornerbacks', false),
            choice('Safeties', false),
          ],
          explanation:
            'Offensive linemen block for both passing and running plays, protecting the quarterback and ball carriers.',
          timeLimitSec: 20,
        },
        {
          prompt: "What is the name of the Green Bay Packers' historic home stadium?",
          choices: [
            choice('Soldier Field', false),
            choice('Lambeau Field', true),
            choice('Arrowhead Stadium', false),
            choice('FedExField', false),
          ],
          explanation:
            'Lambeau Field, opened in 1957, is one of the oldest stadiums still in use in the NFL.',
          timeLimitSec: 20,
        },
        {
          prompt:
            "What is the NFL's championship game, held annually since the 1966 season, called?",
          choices: [
            choice('The World Series', false),
            choice('The Super Bowl', true),
            choice('The Rose Bowl', false),
            choice('The Pro Bowl', false),
          ],
          explanation:
            'The Super Bowl is one of the most-watched annual television broadcasts in the United States.',
          timeLimitSec: 20,
        },
        {
          prompt:
            "What is the award called that's given annually to the NFL's most outstanding player?",
          choices: [
            choice('The Heisman Trophy', false),
            choice('The NFL Most Valuable Player (MVP) Award', true),
            choice('The Lombardi Trophy', false),
            choice('The Walter Payton Award', false),
          ],
          explanation:
            'The Heisman is a college football award, and the Lombardi Trophy goes to the Super Bowl-winning team, not an individual.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── Tennis ───────────────────────────────────────────────────────────────
  {
    categorySlug: 'tennis',
    difficulty: 'EASY',
    title: 'Tennis Rules & Scoring Basics Quiz',
    description:
      'Tennis scoring can be confusing for newcomers — this quiz breaks down love, deuce, aces, and how sets and games work. A friendly starting point for anyone new to watching or playing tennis.',
    tags: ['tennis', 'tennis rules', 'tennis scoring', 'sports basics', 'beginner'],
    quiz: {
      title: 'Tennis Rules & Scoring Basics Quiz',
      description: '',
      questions: [
        {
          prompt: 'What is a score of zero called in tennis?',
          choices: [
            choice('Deuce', false),
            choice('Love', true),
            choice('Ace', false),
            choice('Fault', false),
          ],
          explanation: 'A score of zero in tennis is called "love."',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many games are typically needed to win a standard tennis set?',
          choices: [choice('4', false), choice('6', true), choice('8', false), choice('10', false)],
          explanation:
            'A player usually needs to win six games (by a margin of two) to take a set.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What is it called when a player wins a point outright with an unreturned serve?',
          choices: [
            choice('Fault', false),
            choice('Let', false),
            choice('Ace', true),
            choice('Volley', false),
          ],
          explanation:
            'An ace is a serve that the opponent fails to touch, winning the point immediately.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What term describes a tied score of 40-40 in a game?',
          choices: [
            choice('Love', false),
            choice('Deuce', true),
            choice('Ad', false),
            choice('Match point', false),
          ],
          explanation: 'Deuce means the game is tied at 40-40, requiring a two-point lead to win.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'How many points must a player win to take a standard game, starting from love (assuming no deuce)?',
          choices: [choice('2', false), choice('3', false), choice('4', true), choice('5', false)],
          explanation:
            'Games are scored 0 (love), 15, 30, 40, then game — four points won in a row wins the game.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is it called when a serve lands in the net or outside the correct service box?',
          choices: [
            choice('Ace', false),
            choice('Let', false),
            choice('Fault', true),
            choice('Deuce', false),
          ],
          explanation:
            'A fault is an improperly served ball; two faults in a row result in a double fault and lost point.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In tennis, what is a "volley"?',
          choices: [
            choice('A serve that lands out', false),
            choice('Hitting the ball before it bounces', true),
            choice('A type of tiebreak', false),
            choice('A doubles-only shot', false),
          ],
          explanation: 'A volley is a shot hit out of the air before the ball touches the ground.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How many players compete in a singles tennis match?',
          choices: [
            choice('1 vs 1', true),
            choice('2 vs 2', false),
            choice('1 vs 2', false),
            choice('3 vs 3', false),
          ],
          explanation: 'Singles matches are one player against one opponent.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What surface is Wimbledon, one of the four Grand Slam tournaments, played on?',
          choices: [
            choice('Clay', false),
            choice('Hard court', false),
            choice('Grass', true),
            choice('Carpet', false),
          ],
          explanation: 'Wimbledon is the only Grand Slam still played on grass courts.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the term for the shot hit after the ball bounces once, the most common stroke in tennis?',
          choices: [
            choice('Volley', false),
            choice('Groundstroke', true),
            choice('Serve', false),
            choice('Smash', false),
          ],
          explanation:
            'A groundstroke is hit after the ball bounces, forming the foundation of most rallies.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'tennis',
    difficulty: 'MEDIUM',
    title: 'Tennis Legends & Grand Slam Trivia',
    description:
      "From Serena Williams' 23 Grand Slam titles to Rafael Nadal's dominance at the French Open, this quiz tests your knowledge of tennis's greatest champions and tournaments. Perfect for fans who follow Wimbledon, the US Open, and beyond.",
    tags: ['tennis', 'grand slam', 'tennis legends', 'wimbledon', 'sports trivia'],
    quiz: {
      title: 'Tennis Legends & Grand Slam Trivia',
      description: '',
      questions: [
        {
          prompt: 'What are the four Grand Slam tournaments in tennis?',
          choices: [
            choice('Wimbledon, US Open, French Open, Australian Open', true),
            choice('Wimbledon, US Open, Italian Open, Miami Open', false),
            choice('French Open, US Open, Madrid Open, Wimbledon', false),
            choice('Australian Open, Miami Open, Wimbledon, US Open', false),
          ],
          explanation:
            'The four Grand Slams are the Australian Open, French Open, Wimbledon, and US Open.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which Grand Slam tournament is played on red clay courts in Paris?',
          choices: [
            choice('Wimbledon', false),
            choice('US Open', false),
            choice('French Open (Roland Garros)', true),
            choice('Australian Open', false),
          ],
          explanation:
            'The French Open, held at Roland Garros, is the only Grand Slam played on clay.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Serena Williams won a total of how many Grand Slam singles titles during her career?',
          choices: [
            choice('19', false),
            choice('21', false),
            choice('23', true),
            choice('25', false),
          ],
          explanation:
            'Serena Williams won 23 Grand Slam singles titles, the most in the Open Era.',
          timeLimitSec: 20,
        },
        {
          prompt:
            "As of the mid-2020s, which player holds the record for most Grand Slam men's singles titles?",
          choices: [
            choice('Roger Federer', false),
            choice('Rafael Nadal', false),
            choice('Novak Djokovic', true),
            choice('Pete Sampras', false),
          ],
          explanation:
            "Novak Djokovic surpassed his rivals to hold the men's record for Grand Slam singles titles.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'Rafael Nadal earned the nickname "King of Clay" largely due to his dominance at which tournament?',
          choices: [
            choice('Wimbledon', false),
            choice('US Open', false),
            choice('French Open', true),
            choice('Australian Open', false),
          ],
          explanation: 'Nadal won a record number of French Open titles on his best surface, clay.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is it called when a player wins all four Grand Slam tournaments plus Olympic gold in the same calendar year?',
          choices: [
            choice('Grand Slam', false),
            choice('Golden Slam', true),
            choice('Career Slam', false),
            choice('Triple Crown', false),
          ],
          explanation: 'Steffi Graf achieved the only Golden Slam in tennis history in 1988.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which is the oldest of the four Grand Slam tournaments, first held in 1877?',
          choices: [
            choice('US Open', false),
            choice('Wimbledon', true),
            choice('French Open', false),
            choice('Australian Open', false),
          ],
          explanation: 'Wimbledon is the oldest tennis tournament in the world.',
          timeLimitSec: 20,
        },
        {
          prompt:
            "In men's Grand Slam tournaments, matches are traditionally played as best of how many sets?",
          choices: [choice('3', false), choice('5', true), choice('7', false), choice('9', false)],
          explanation:
            "Men's Grand Slam singles matches are best-of-five sets, while women's matches are best-of-three.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'Andy Murray became the first British man in 77 years to win Wimbledon in which year?',
          choices: [
            choice('2012', false),
            choice('2013', true),
            choice('2016', false),
            choice('2019', false),
          ],
          explanation: "Murray ended Britain's 77-year wait for a men's singles champion in 2013.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which surface is traditionally considered the fastest among the Grand Slam court types?',
          choices: [
            choice('Clay', false),
            choice('Grass', true),
            choice('Hard court', false),
            choice('Carpet', false),
          ],
          explanation:
            'Grass courts produce lower, faster bounces, traditionally favoring serve-and-volley play.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  // ── Olympics ────────────────────────────────────────────────────────────
  {
    categorySlug: 'olympics',
    difficulty: 'EASY',
    title: 'Olympic Games Basics & Traditions Quiz',
    description:
      'Learn the essentials of the Olympic Games — from the five rings and the torch relay to how often the Games are held and who organizes them. A great primer before the next Olympics kicks off.',
    tags: ['olympics', 'olympic games', 'sports basics', 'olympic history', 'beginner'],
    quiz: {
      title: 'Olympic Games Basics & Traditions Quiz',
      description: '',
      questions: [
        {
          prompt: 'How often are the Summer Olympic Games held?',
          choices: [
            choice('Every 2 years', false),
            choice('Every 3 years', false),
            choice('Every 4 years', true),
            choice('Every 5 years', false),
          ],
          explanation:
            'The Summer Olympics take place once every four years, known as an Olympiad.',
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
          prompt: 'In which country did the ancient Olympic Games originate?',
          choices: [
            choice('Italy', false),
            choice('Greece', true),
            choice('Egypt', false),
            choice('Rome', false),
          ],
          explanation: 'The ancient Olympic Games began in Olympia, Greece, around 776 BC.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What color medal is awarded for first place in an Olympic event?',
          choices: [
            choice('Silver', false),
            choice('Bronze', false),
            choice('Gold', true),
            choice('Platinum', false),
          ],
          explanation:
            'Gold medals are awarded to first-place finishers, silver to second, and bronze to third.',
          timeLimitSec: 20,
        },
        {
          prompt: 'What does the Olympic torch relay traditionally symbolize?',
          choices: [
            choice('Wealth', false),
            choice('The connection to the ancient games and passing of the flame', true),
            choice('A religious ceremony', false),
            choice('A political alliance', false),
          ],
          explanation: 'The torch relay links the modern Games to their ancient Greek origins.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which city hosted the first modern Olympic Games in 1896?',
          choices: [
            choice('Paris', false),
            choice('Athens', true),
            choice('London', false),
            choice('Rome', false),
          ],
          explanation:
            'Athens hosted the first modern Olympics, fittingly the birthplace of the ancient Games.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the Olympic motto, traditionally translated as "Faster, Higher, Stronger"?',
          choices: [
            choice('Citius, Altius, Fortius', true),
            choice('Alea Iacta Est', false),
            choice('Veni Vidi Vici', false),
            choice('Ad Astra', false),
          ],
          explanation:
            'The Latin motto "Citius, Altius, Fortius" has represented the Olympic spirit since 1894.',
          timeLimitSec: 20,
        },
        {
          prompt: 'How often are the Winter Olympic Games held?',
          choices: [
            choice('Every 2 years', false),
            choice('Every 4 years', true),
            choice('Every 6 years', false),
            choice('Every 8 years', false),
          ],
          explanation:
            'The Winter Games occur every four years, staggered two years apart from the Summer Games since 1994.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which organization oversees the modern Olympic Games?',
          choices: [
            choice('FIFA', false),
            choice('The International Olympic Committee (IOC)', true),
            choice('The United Nations', false),
            choice('World Athletics', false),
          ],
          explanation: 'The IOC governs the Olympic Movement and selects host cities.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'What is the name of the Games held for elite athletes with physical, intellectual, and sensory disabilities?',
          choices: [
            choice('The Special Olympics', false),
            choice('The Paralympic Games', true),
            choice('The World Games', false),
            choice('The Invictus Games', false),
          ],
          explanation:
            'The Paralympic Games are held shortly after the Olympics in the same host city.',
          timeLimitSec: 20,
        },
      ],
    },
  },
  {
    categorySlug: 'olympics',
    difficulty: 'MEDIUM',
    title: 'Olympic History & Legendary Athletes Trivia',
    description:
      "Test your knowledge of Olympic history's most unforgettable moments, from Jesse Owens in 1936 Berlin to Michael Phelps' record-breaking medal haul. This quiz covers the athletes and Games that shaped Olympic legend.",
    tags: ['olympics', 'olympic athletes', 'olympic history', 'sports trivia', 'michael phelps'],
    quiz: {
      title: 'Olympic History & Legendary Athletes Trivia',
      description: '',
      questions: [
        {
          prompt:
            'Which swimmer holds the record for the most Olympic medals ever won by an individual?',
          choices: [
            choice('Mark Spitz', false),
            choice('Michael Phelps', true),
            choice('Katie Ledecky', false),
            choice('Ian Thorpe', false),
          ],
          explanation:
            'Michael Phelps won 28 total Olympic medals, the most of any athlete in history.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Sprinter Usain Bolt, considered one of the fastest men in Olympic history, represented which country?',
          choices: [
            choice('United States', false),
            choice('Jamaica', true),
            choice('Trinidad and Tobago', false),
            choice('United Kingdom', false),
          ],
          explanation:
            'Usain Bolt won multiple gold medals representing Jamaica in the 100m and 200m sprints.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which gymnast is widely regarded as one of the greatest of all time, winning numerous Olympic golds for the United States?',
          choices: [
            choice('Simone Biles', true),
            choice('Nadia Comăneci', false),
            choice('Gabby Douglas', false),
            choice('Shawn Johnson', false),
          ],
          explanation:
            'Simone Biles has won multiple Olympic gold medals and is widely considered among the greatest gymnasts ever.',
          timeLimitSec: 20,
        },
        {
          prompt: 'In which year did the Summer Olympics take place in Beijing, China?',
          choices: [
            choice('2004', false),
            choice('2008', true),
            choice('2012', false),
            choice('2016', false),
          ],
          explanation: 'Beijing hosted the 2008 Summer Olympics.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Jesse Owens famously won four gold medals at which controversial Olympic Games?',
          choices: [
            choice('1932 Los Angeles', false),
            choice('1936 Berlin', true),
            choice('1948 London', false),
            choice('1952 Helsinki', false),
          ],
          explanation:
            "Owens' performance at the 1936 Berlin Games directly challenged Nazi ideology of the time.",
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which gymnast scored the first perfect 10 in Olympic history at the 1976 Montreal Games?',
          choices: [
            choice('Olga Korbut', false),
            choice('Nadia Comăneci', true),
            choice('Mary Lou Retton', false),
            choice('Simone Biles', false),
          ],
          explanation:
            'Nadia Comăneci, then just 14, scored the first perfect 10 in Olympic gymnastics history.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'How many times have the modern Summer Olympic Games been cancelled due to World Wars?',
          choices: [choice('0', false), choice('3', true), choice('5', false), choice('7', false)],
          explanation: 'The 1916, 1940, and 1944 Games were all cancelled due to the World Wars.',
          timeLimitSec: 20,
        },
        {
          prompt: 'Which country has hosted the Summer Olympics the most times?',
          choices: [
            choice('France', false),
            choice('United Kingdom', false),
            choice('United States', true),
            choice('Greece', false),
          ],
          explanation:
            'The United States has hosted the Summer Olympics more times than any other country.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'The 2020 Summer Olympics were postponed to 2021 due to which global event, while keeping the original "Tokyo 2020" name?',
          choices: [
            choice('The COVID-19 pandemic', true),
            choice('A major earthquake', false),
            choice('A financial crisis', false),
            choice('A security threat', false),
          ],
          explanation:
            'The Tokyo Games were delayed a year by the COVID-19 pandemic but retained the "2020" branding.',
          timeLimitSec: 20,
        },
        {
          prompt:
            'Which athlete, often called one of the greatest of the 20th century, won gold in both the decathlon and pentathlon at the 1912 Olympics?',
          choices: [
            choice('Paavo Nurmi', false),
            choice('Jim Thorpe', true),
            choice('Carl Lewis', false),
            choice('Al Oerter', false),
          ],
          explanation:
            "Jim Thorpe's dominant 1912 performance made him one of history's most celebrated all-around athletes.",
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
