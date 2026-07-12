# SEO operations

BusQuiz uses the Next.js Metadata API, generated Open Graph images, JSON-LD, `robots.ts`, and a
database-backed sitemap.

## Indexability policy

A published quiz is eligible for indexing when it has:

- at least five questions;
- a description of at least 30 normalized characters; and
- no pending reports.

The quiz remains available when it does not meet these requirements, but its page emits
`noindex,follow` and it is omitted from the sitemap. The shared predicate lives in
`src/lib/seo-metadata.ts`.

Curated collections need three matching indexable quizzes. Public playlists need at least one
published quiz. Search and filtered leaderboard views canonicalize to their base page and are not
indexed.

## Publishing checklist

1. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS production origin without a path.
2. Verify `/robots.txt` and `/sitemap.xml` return the production hostname.
3. Submit `/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
4. Inspect the homepage, one category, one eligible quiz, one ineligible quiz, one blog post, and
   one public playlist with each search engine's URL inspection tool.
5. Validate JSON-LD using Schema.org Validator and Google's Rich Results Test.
6. Test Open Graph previews for the same representative pages.
7. Monitor indexed-versus-submitted counts, duplicate canonical reports, Core Web Vitals, and 404s.

## Content maintenance

- Write unique, descriptive quiz and category copy for visitors rather than keyword lists.
- Keep titles specific and avoid repeating “BusQuiz”; the root title template adds the brand.
- Add relevant editorial links between blog posts, collections, categories, and quizzes.
- Review pending reports promptly because they temporarily remove affected quizzes from indexing.
- Update static legal/content dates when those pages materially change.
