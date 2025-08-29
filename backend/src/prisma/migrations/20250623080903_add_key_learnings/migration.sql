-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "keyLearnings" TEXT[] DEFAULT ARRAY[]::TEXT[];
