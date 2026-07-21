-- Allow a report raised from quiz results to identify the question under review.
ALTER TABLE "Report" ADD COLUMN "questionId" TEXT;

CREATE INDEX "Report_questionId_idx" ON "Report"("questionId");

ALTER TABLE "Report"
ADD CONSTRAINT "Report_questionId_fkey"
FOREIGN KEY ("questionId") REFERENCES "Question"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
