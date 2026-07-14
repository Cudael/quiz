-- Usernames are entered in lowercase by current clients, but this database
-- constraint also protects imports, scripts, older clients, and concurrent
-- requests from creating case-only duplicates.
UPDATE "User"
SET "username" = LOWER("username")
WHERE "username" IS NOT NULL AND "username" <> LOWER("username");

CREATE UNIQUE INDEX "User_username_lower_key"
ON "User" (LOWER("username"))
WHERE "username" IS NOT NULL;
