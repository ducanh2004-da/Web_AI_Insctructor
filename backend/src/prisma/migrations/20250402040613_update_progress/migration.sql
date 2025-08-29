/*
  Warnings:

  - A unique constraint covering the columns `[userId,courseId]` on the table `Progress` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Progress" ADD COLUMN     "completedLessons" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalLessons" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Progress_percentage_idx" ON "Progress"("percentage");

-- CreateIndex
CREATE UNIQUE INDEX "Progress_userId_courseId_key" ON "Progress"("userId", "courseId");
