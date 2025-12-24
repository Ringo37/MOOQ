/*
  Warnings:

  - A unique constraint covering the columns `[courseId,slug]` on the table `Section` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Section" ADD COLUMN     "slug" TEXT NOT NULL DEFAULT 'temp-slug';

-- CreateIndex
CREATE UNIQUE INDEX "Section_courseId_slug_key" ON "Section"("courseId", "slug");
