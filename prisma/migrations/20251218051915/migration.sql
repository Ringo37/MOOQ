/*
  Warnings:

  - The values [ASSIGNMENT,EXAM] on the enum `ProblemType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProblemType_new" AS ENUM ('QUIZ', 'FORM');
ALTER TABLE "public"."Problem" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Problem" ALTER COLUMN "type" TYPE "ProblemType_new" USING ("type"::text::"ProblemType_new");
ALTER TYPE "ProblemType" RENAME TO "ProblemType_old";
ALTER TYPE "ProblemType_new" RENAME TO "ProblemType";
DROP TYPE "public"."ProblemType_old";
ALTER TABLE "Problem" ALTER COLUMN "type" SET DEFAULT 'QUIZ';
COMMIT;
