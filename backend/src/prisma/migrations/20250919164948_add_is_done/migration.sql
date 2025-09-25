-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "isDone" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "isDone" BOOLEAN NOT NULL DEFAULT false;
