-- AlterTable
ALTER TABLE "SystemPrompt" ADD COLUMN     "aiId" TEXT;

-- CreateTable
CREATE TABLE "AI" (
    "id" TEXT NOT NULL,
    "emotion" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AI_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SystemPrompt" ADD CONSTRAINT "SystemPrompt_aiId_fkey" FOREIGN KEY ("aiId") REFERENCES "AI"("id") ON DELETE SET NULL ON UPDATE CASCADE;
