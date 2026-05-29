-- Migration: convert legacy text-based JSON columns to native Postgres types
-- Backfills existing rows by casting stored JSON/values to the target type.

-- QuestionAnswer.chosenIds: text (JSON array string) → text[]
ALTER TABLE "QuestionAnswer"
  ALTER COLUMN "chosenIds" TYPE text[]
  USING ARRAY(SELECT json_array_elements_text("chosenIds"::json));

-- Quiz.tags: text (nullable JSON array string) → text[]
-- NULL stays NULL; empty / invalid JSON becomes an empty array.
ALTER TABLE "Quiz"
  ALTER COLUMN "tags" TYPE text[]
  USING CASE
    WHEN "tags" IS NULL THEN ARRAY[]::text[]
    ELSE ARRAY(SELECT json_array_elements_text("tags"::json))
  END;

-- User.preferences: text (nullable JSON object string) → jsonb
ALTER TABLE "User"
  ALTER COLUMN "preferences" TYPE jsonb
  USING CASE
    WHEN "preferences" IS NULL OR trim("preferences") = '' THEN NULL
    ELSE "preferences"::jsonb
  END;

-- Notification.meta: text (nullable JSON object string) → jsonb
ALTER TABLE "Notification"
  ALTER COLUMN "meta" TYPE jsonb
  USING CASE
    WHEN "meta" IS NULL OR trim("meta") = '' THEN NULL
    ELSE "meta"::jsonb
  END;

-- AdminAction.meta: text (non-nullable JSON object string) → jsonb
ALTER TABLE "AdminAction"
  ALTER COLUMN "meta" TYPE jsonb
  USING "meta"::jsonb;

-- Badge.criteria: text (non-nullable JSON object string) → jsonb
ALTER TABLE "Badge"
  ALTER COLUMN "criteria" TYPE jsonb
  USING "criteria"::jsonb;
