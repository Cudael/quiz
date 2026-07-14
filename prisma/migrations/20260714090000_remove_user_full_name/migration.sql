-- Usernames are BusQuiz's only public/display identity. OAuth provider names
-- must not be retained because they may contain a person's legal full name.
ALTER TABLE "User" DROP COLUMN "name";
