-- This migration intentionally sorts before the PlaySession composite-index
-- migration. Older databases received PlayMode through schema push, but a
-- fresh Prisma shadow database only has the checked-in migration history.

DO $$
BEGIN
  CREATE TYPE "PlayMode" AS ENUM ('STANDARD', 'DAILY', 'PRACTICE', 'BLITZ');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- Keep this safe for databases where the column was previously introduced by
-- `prisma db push` rather than a migration.
ALTER TABLE "PlaySession"
ADD COLUMN IF NOT EXISTS "mode" "PlayMode" NOT NULL DEFAULT 'STANDARD';

CREATE INDEX IF NOT EXISTS "PlaySession_mode_createdAt_idx"
ON "PlaySession"("mode", "createdAt");
