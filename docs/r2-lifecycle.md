# R2 image lifecycle

BusQuiz uploads user images under `quiz-images/<userId>/...`. Database rows store public URLs,
so deleting an object merely because it is old can break published quizzes and revisions.

## Recommended bucket rules

- Abort incomplete multipart uploads after 24 hours.
- Do not apply an unconditional age-based deletion rule to `quiz-images/`.
- Retain deleted-object/version history for 7–30 days if R2 versioning is enabled.
- Set a storage-budget alert in Cloudflare.

## Orphan cleanup

Run an inventory-based cleanup periodically:

1. Export R2 keys under `quiz-images/`.
2. Collect every R2 URL referenced by `User.image`, `User.bannerImage`, `Quiz.coverImage`,
   `Question.imageUrl`, `Choice.imageUrl`, quiz revision snapshots, and JSON metadata.
3. Treat only unreferenced objects older than seven days as candidates. The grace period protects
   uploads made while an editor draft is still open.
4. Write candidates to an audit report, review it, then delete them in bounded batches.

Automatic deletion is intentionally not performed in request handlers: the same image can be
referenced by multiple quizzes or historical revisions, and an upload is temporarily unreferenced
while its quiz is being edited.
