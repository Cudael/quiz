CREATE TYPE "QuizReviewStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "Quiz"
ADD COLUMN "reviewStatus" "QuizReviewStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "submittedForReviewAt" TIMESTAMP(3),
ADD COLUMN "reviewedAt" TIMESTAMP(3);

ALTER TABLE "Quiz" ALTER COLUMN "isPublished" SET DEFAULT false;

-- Preserve all existing publication decisions. Only newly submitted drafts
-- enter the pending admin-review workflow.
UPDATE "Quiz"
SET "reviewStatus" = CASE
  WHEN "isPublished" THEN 'APPROVED'::"QuizReviewStatus"
  ELSE 'DRAFT'::"QuizReviewStatus"
END,
"reviewedAt" = CASE WHEN "isPublished" THEN "updatedAt" ELSE NULL END;

CREATE INDEX "Quiz_reviewStatus_idx" ON "Quiz"("reviewStatus");
