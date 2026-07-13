-- Persist sanitized duel submissions for finished-match answer review.
ALTER TABLE "DuelParticipant" ADD COLUMN "answers" JSONB;
