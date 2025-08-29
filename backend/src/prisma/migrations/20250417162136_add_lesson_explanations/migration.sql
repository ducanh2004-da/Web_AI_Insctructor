-- CreateTable
CREATE TABLE "LessonExplanation" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonExplanation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LessonExplanation_lessonId_userId_key" ON "LessonExplanation"("lessonId", "userId");

-- AddForeignKey
ALTER TABLE "LessonExplanation" ADD CONSTRAINT "LessonExplanation_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonExplanation" ADD CONSTRAINT "LessonExplanation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
