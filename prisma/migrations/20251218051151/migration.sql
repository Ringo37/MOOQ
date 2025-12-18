/*
  Warnings:

  - You are about to drop the column `objectName` on the `File` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[key]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterEnum
ALTER TYPE "ProblemType" ADD VALUE 'FORM';

-- DropIndex
DROP INDEX "File_objectName_key";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "objectName",
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "visibility" "FileVisibility" NOT NULL DEFAULT 'PRIVATE';

-- AlterTable
ALTER TABLE "Problem" ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "startTime" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "File_key_key" ON "File"("key");
