-- Convert single url column to urls array
ALTER TABLE "Subject" ADD COLUMN "urls" TEXT[] NOT NULL DEFAULT '{}';
UPDATE "Subject" SET "urls" = ARRAY["url"] WHERE "url" IS NOT NULL;
ALTER TABLE "Subject" DROP COLUMN "url";
