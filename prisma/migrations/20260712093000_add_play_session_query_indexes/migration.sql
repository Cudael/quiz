-- Composite indexes matching leaderboard and per-quiz history filters.
-- Keep the existing single-column indexes for other query shapes.
CREATE INDEX "PlaySession_mode_createdAt_userId_idx"
ON "PlaySession"("mode", "createdAt", "userId");

CREATE INDEX "PlaySession_quizId_mode_createdAt_idx"
ON "PlaySession"("quizId", "mode", "createdAt");
