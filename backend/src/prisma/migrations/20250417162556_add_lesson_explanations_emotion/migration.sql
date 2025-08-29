/*
  Warnings:

  - Added the required column `emotion` to the `LessonExplanation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LessonExplanation" ADD COLUMN     "emotion" TEXT NOT NULL;
