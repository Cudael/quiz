-- AlterEnum
BEGIN;
CREATE TYPE "QuestionType_new" AS ENUM ('SINGLE', 'TRUEFALSE', 'FILL_BLANK', 'HOTSPOT', 'ORDER', 'MATCH', 'NUMBER_GUESS', 'GROUPS');
ALTER TABLE "Question" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Question" ALTER COLUMN "type" TYPE "QuestionType_new" USING ("type"::text::"QuestionType_new");
ALTER TYPE "QuestionType" RENAME TO "QuestionType_old";
ALTER TYPE "QuestionType_new" RENAME TO "QuestionType";
DROP TYPE "QuestionType_old";
ALTER TABLE "Question" ALTER COLUMN "type" SET DEFAULT 'SINGLE';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "QuizFormat_new" AS ENUM ('TEXT_CHOICE', 'IMAGE_CHOICE', 'IMAGE_HOTSPOT', 'ORDER', 'MATCH', 'ODD_ONE_OUT', 'TYPE_ANSWER', 'NUMBER_GUESS', 'IMAGE_REVEAL', 'AUDIO_CHOICE', 'VERSUS', 'CONNECTIONS', 'ANAGRAM', 'MEMORY_FLASH');
ALTER TABLE "Quiz" ALTER COLUMN "format" DROP DEFAULT;
ALTER TABLE "Quiz" ALTER COLUMN "format" TYPE "QuizFormat_new" USING ("format"::text::"QuizFormat_new");
ALTER TYPE "QuizFormat" RENAME TO "QuizFormat_old";
ALTER TYPE "QuizFormat_new" RENAME TO "QuizFormat";
DROP TYPE "QuizFormat_old";
ALTER TABLE "Quiz" ALTER COLUMN "format" SET DEFAULT 'TEXT_CHOICE';
COMMIT;

