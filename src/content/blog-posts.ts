export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  tags: string[]
  content: string // HTML content
  coverImage?: string
}

const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-create-engaging-quizzes',
    title: 'How to Create Engaging Quizzes That Players Love',
    description:
      'Learn the best practices for crafting quiz questions that keep players coming back for more.',
    date: '2026-06-01',
    author: 'BusQuiz Team',
    tags: ['tutorial', 'quiz-creation', 'tips'],
    content: `
<p>Creating an engaging quiz is both an art and a science. Whether you're building a trivia challenge for friends or crafting educational content, the principles of good quiz design remain the same.</p>

<h2>Start With a Clear Theme</h2>
<p>Every great quiz has a clear, focused theme. Instead of "General Knowledge," try something specific like "80s Movie Soundtracks" or "World Capitals." A narrow theme helps players know what to expect and attracts the right audience.</p>

<h2>Balance Your Difficulty</h2>
<p>The best quizzes have a mix of easy, medium, and hard questions. Start with a few warm-up questions to build confidence, then gradually increase the challenge. Aim for roughly 30% easy, 50% medium, and 20% hard questions.</p>

<h2>Write Clear, Concise Questions</h2>
<p>Avoid ambiguity. Each question should have exactly one correct interpretation. Keep your prompts short — ideally under 100 characters. If you need to provide context, add an explanation that appears after the answer is revealed.</p>

<h2>Craft Believable Wrong Answers</h2>
<p>The best wrong answers (distractors) are plausible but incorrect. They should sound reasonable enough that someone with partial knowledge might choose them. Avoid joke answers — they break immersion and make the quiz feel less professional.</p>

<h2>Add Rich Explanations</h2>
<p>After each question, provide a brief explanation of why the correct answer is right. This turns your quiz from a simple test into a learning experience. Players appreciate understanding their mistakes and often share interesting facts they discover.</p>

<h2>Test Your Quiz</h2>
<p>Before publishing, have at least two people take your quiz. Watch for questions that consistently trip people up for the wrong reasons, unclear wording, or answers that could be argued as correct. Iterate based on feedback.</p>

<h2>Use Images and Media</h2>
<p>Visual questions are more engaging than text-only ones. Add cover images to your quizzes and, where appropriate, include diagrams or photos in individual questions. A well-chosen image can make a question far more memorable.</p>
`,
  },
  {
    slug: 'benefits-of-quiz-based-learning',
    title: '5 Benefits of Quiz-Based Learning',
    description:
      'Discover how regular quizzing improves memory retention, builds confidence, and makes learning fun.',
    date: '2026-05-15',
    author: 'BusQuiz Team',
    tags: ['education', 'learning', 'science'],
    content: `
<p>Quiz-based learning has exploded in popularity — and for good reason. Research shows that active recall through quizzing is one of the most effective ways to learn and retain information.</p>

<h2>1. Active Recall Strengthens Memory</h2>
<p>When you answer a quiz question, you're practicing <em>active recall</em> — pulling information from memory rather than passively reviewing it. Studies show this strengthens neural pathways far more effectively than re-reading notes or watching lectures.</p>

<h2>2. Immediate Feedback Accelerates Learning</h2>
<p>Quizzes provide instant feedback. You know right away whether you got something right or wrong, and good quiz platforms explain the correct answer. This tight feedback loop helps you correct misconceptions immediately rather than reinforcing wrong information.</p>

<h2>3. Spaced Repetition Builds Long-Term Retention</h2>
<p>Taking quizzes on the same topic over time — a technique called spaced repetition — dramatically improves long-term memory. Each time you retrieve information, you strengthen the memory and extend how long you'll retain it.</p>

<h2>4. Low-Stakes Testing Reduces Anxiety</h2>
<p>Unlike high-pressure exams, casual quizzes create a low-stakes environment where mistakes feel safe. This reduces test anxiety and makes learning feel more like a game than a chore. Over time, this builds genuine confidence in your knowledge.</p>

<h2>5. Quizzing Is Genuinely Fun</h2>
<p>Competing on leaderboards, earning badges, and tracking your progress turns learning into an engaging experience. The gamification elements of modern quiz platforms keep you motivated to learn more, day after day.</p>
`,
  },
  {
    slug: 'welcome-to-busquiz',
    title: 'Welcome to BusQuiz — The Ultimate Quiz Platform',
    description:
      'Meet BusQuiz: play hundreds of quizzes across every topic, create your own, and compete on global leaderboards.',
    date: '2026-04-20',
    author: 'BusQuiz Team',
    tags: ['news', 'platform', 'announcement'],
    content: `
<p>We're thrilled to introduce BusQuiz — a new platform built from the ground up for quiz enthusiasts, trivia lovers, and knowledge seekers everywhere.</p>

<h2>What Is BusQuiz?</h2>
<p>BusQuiz is a comprehensive quiz platform where you can play thousands of quizzes across every imaginable category, create and publish your own quizzes, compete in real-time duels against friends, and climb global leaderboards to earn badges and recognition.</p>

<h2>Play Anywhere, Anytime</h2>
<p>Our platform is designed to be fast, responsive, and accessible. Whether you're on a desktop during lunch break or on your phone during your commute, BusQuiz delivers a smooth, engaging experience. No downloads required — just open your browser and start playing.</p>

<h2>Create and Share</h2>
<p>Have a topic you're passionate about? Our intuitive quiz creator lets you build quizzes with multiple question types: single choice, multiple choice, true/false, fill-in-the-blank, ordering, matching, categorization, and label-the-diagram. Publish your quiz and watch players from around the world take on your challenge.</p>

<h2>Compete and Climb</h2>
<p>Every quiz you play earns you XP, levels you up, and contributes to your global ranking. Challenge specific friends in head-to-head duels, or see how you stack up against the worldwide community on our leaderboards. Earn badges for milestones and show off your expertise.</p>

<h2>What's Next</h2>
<p>We're just getting started. Expect regular updates with new features, more quiz formats, seasonal events, and community-driven improvements. We built BusQuiz for the community, and we can't wait to see what you create.</p>
`,
  },
]

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  return getAllBlogPosts()
    .filter((post) => post.slug !== currentSlug)
    .slice(0, limit)
}
