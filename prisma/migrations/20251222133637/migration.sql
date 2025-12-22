/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Lecture` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sectionId,slug]` on the table `Lecture` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sectionId,order]` on the table `Lecture` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sectionId` to the `Lecture` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Lecture" DROP CONSTRAINT "Lecture_categoryId_fkey";

-- DropIndex
DROP INDEX "Lecture_categoryId_order_key";

-- DropIndex
DROP INDEX "Lecture_categoryId_slug_key";

-- AlterTable
ALTER TABLE "Lecture" DROP COLUMN "categoryId",
ADD COLUMN     "sectionId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Category";

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Section_courseId_name_key" ON "Section"("courseId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Section_courseId_order_key" ON "Section"("courseId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Lecture_sectionId_slug_key" ON "Lecture"("sectionId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Lecture_sectionId_order_key" ON "Lecture"("sectionId", "order");

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecture" ADD CONSTRAINT "Lecture_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
