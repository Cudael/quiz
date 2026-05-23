ALTER TABLE "Question" ADD COLUMN "points" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Quiz" ADD COLUMN "tags" TEXT;
ALTER TABLE "User" ADD COLUMN "bannerImage" TEXT;

CREATE TABLE "QuestionAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "chosenIds" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeTakenMs" INTEGER NOT NULL,
    CONSTRAINT "QuestionAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PlaySession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "QuestionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "FavoriteQuiz" (
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("userId", "quizId"),
    CONSTRAINT "FavoriteQuiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FavoriteQuiz_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "QuestionAnswer_sessionId_idx" ON "QuestionAnswer"("sessionId");
CREATE INDEX "QuestionAnswer_questionId_idx" ON "QuestionAnswer"("questionId");
CREATE INDEX "FavoriteQuiz_userId_idx" ON "FavoriteQuiz"("userId");
CREATE INDEX "FavoriteQuiz_quizId_idx" ON "FavoriteQuiz"("quizId");
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");
