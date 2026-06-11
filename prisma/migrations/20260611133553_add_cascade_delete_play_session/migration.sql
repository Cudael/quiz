-- DropForeignKey
ALTER TABLE "PlaySession" DROP CONSTRAINT "PlaySession_quizId_fkey";

-- AddForeignKey
ALTER TABLE "PlaySession" ADD CONSTRAINT "PlaySession_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
