-- CreateEnum
CREATE TYPE "CourseVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "visibility" "CourseVisibility" NOT NULL DEFAULT 'UNLISTED';
